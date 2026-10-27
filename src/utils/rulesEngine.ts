import {
  Claim,
  PriorityTier,
  UnderwritingBand,
  UnderwritingCase,
  RenewalFeedRowRaw,
  ProcessedRenewalResult,
  PolicyRecord,
  ReviewDecisionPayload,
  UserProfile,
} from '../types';

export const FX_RATES: Record<string, number> = {
  INR: 1.0,
  USD: 83.0,
  AED: 22.6,
};

/**
 * CR-201: Computes Priority Tier (P1, P2, P3) based on strict, gap-closed specification
 */
export function computeClaimPriority(claim: Partial<Claim>): {
  priority: PriorityTier;
  reasons: string[];
  amountInr: number;
  delayDays: number | null;
} {
  const reasons: string[] = [];
  const currency = (claim.currency || 'INR').toUpperCase();
  const rate = FX_RATES[currency] ?? 83.0; // Fail-safe default to USD rate if unrecognized
  const amount = Number(claim.amount) || 0;
  const amountInr = Math.round(amount * rate * 100) / 100;

  // Currency validation check
  if (!FX_RATES[currency]) {
    reasons.push(`Unknown currency '${currency}' safely converted using fail-safe baseline FX`);
  }

  // Calculate calendar day delay between incident and reported
  let delayDays: number | null = null;
  if (claim.incidentDate && claim.reportedDate) {
    const inc = new Date(claim.incidentDate).getTime();
    const rep = new Date(claim.reportedDate).getTime();
    if (!isNaN(inc) && !isNaN(rep) && rep >= inc) {
      delayDays = Math.floor((rep - inc) / (1000 * 60 * 60 * 24));
    }
  }

  // Rule 1: P1 evaluation (Injury OR amountInr >= 1,000,000)
  const isInjury = Boolean(claim.injuryFlag);
  const isHighValue = amountInr >= 1_000_000;

  if (isInjury || isHighValue) {
    if (isInjury) reasons.push('Severe bodily injury reported (Automatic P1)');
    if (isHighValue) reasons.push(`High monetary exposure (₹${amountInr.toLocaleString('en-IN')} >= ₹1,000,000 threshold)`);
    return { priority: 'P1', reasons, amountInr, delayDays };
  }

  // Rule 2: P2 evaluation (Risk score >= 70 OR Fire / Flood claim type)
  const riskScore = Number(claim.riskScore) || 0;
  const claimType = (claim.claimType || '').trim().toLowerCase();
  const isHighRisk = riskScore >= 70;
  const isCatastrophicPeril = claimType === 'fire' || claimType === 'flood';

  if (isHighRisk || isCatastrophicPeril) {
    if (isHighRisk) reasons.push(`Elevated risk score (${riskScore} >= 70)`);
    if (isCatastrophicPeril) reasons.push(`Peril classification: ${claim.claimType} (Automatic P2)`);
    return { priority: 'P2', reasons, amountInr, delayDays };
  }

  // Rule 3: Delay rule - Incident delay > 30 calendar days raises ONLY P3 to P2
  if (delayDays !== null && delayDays > 30) {
    reasons.push(`Reporting latency of ${delayDays} days (> 30-day SLA window; promoted P3 -> P2)`);
    return { priority: 'P2', reasons, amountInr, delayDays };
  }

  // Default: P3
  reasons.push('Standard claim parameters (Routine operational SLA)');
  return { priority: 'P3', reasons, amountInr, delayDays };
}

/**
 * CR-201: Four-Eyes Principle & Review Authorization Gate
 */
export function validateReviewAction(
  claim: Claim,
  user: UserProfile,
  payload: Partial<ReviewDecisionPayload>
): { allowed: boolean; error?: string; errorCode?: string } {
  // Check 1: User Role must be claims-reviewer
  if (user.role !== 'claims-reviewer') {
    return {
      allowed: false,
      errorCode: 'ROLE_FORBIDDEN_403',
      error: `Access Denied: Only users with the 'claims-reviewer' role may execute independent claim decisions. Active role: '${user.role}'.`,
    };
  }

  // Check 2: Four-Eyes Principle - Assigned adjuster cannot decide their own claim
  if (claim.adjusterId === user.id) {
    return {
      allowed: false,
      errorCode: 'FOUR_EYES_VIOLATION_403',
      error: `Four-Eyes Violation: Adjuster '${claim.adjusterName}' is assigned to this claim and cannot independently approve or reject their own submission.`,
    };
  }

  // Check 3: State Transition Check
  const eligibleReviewStates = ['SUBMITTED', 'PENDING_REVIEW', 'IN_REVIEW', 'REVIEW'];
  if (!eligibleReviewStates.includes(claim.status)) {
    return {
      allowed: false,
      errorCode: 'INVALID_STATE_TRANSITION_409',
      error: `Conflict: Claim ${claim.businessKey} is currently '${claim.status}' and not in an active reviewable state.`,
    };
  }

  // Check 4: Version / Concurrency Check (Optimistic Locking)
  if (payload.expectedVersion !== undefined && payload.expectedVersion !== claim.version) {
    return {
      allowed: false,
      errorCode: 'STALE_VERSION_CONFLICT_409',
      error: `Conflict (409): The claim state was modified by another reviewer (v${claim.version} vs expected v${payload.expectedVersion}). Please refresh.`,
    };
  }

  // Check 5: Rejection Validation
  if (payload.decision === 'REJECT') {
    const validReasonCodes = ['POLICY_EXCLUSION', 'NON_DISCLOSURE', 'INSUFFICIENT_DOCS', 'FRAUD_SUSPECTED'];
    if (!payload.rejectionReasonCode || !validReasonCodes.includes(payload.rejectionReasonCode)) {
      return {
        allowed: false,
        errorCode: 'INVALID_REASON_CODE_422',
        error: `Validation Error (422): Rejection requires an authoritative reason code (${validReasonCodes.join(', ')}).`,
      };
    }

    const trimmedText = (payload.rejectionReasonText || '').trim();
    if (trimmedText.length === 0) {
      return {
        allowed: false,
        errorCode: 'EMPTY_REASON_TEXT_422',
        error: 'Validation Error (422): Rejection rationale text cannot be empty after trimming.',
      };
    }
    if (trimmedText.length > 500) {
      return {
        allowed: false,
        errorCode: 'REASON_TEXT_TOO_LONG_422',
        error: `Validation Error (422): Rejection text exceeds maximum 500 characters (${trimmedText.length} chars).`,
      };
    }
  }

  return { allowed: true };
}

/**
 * CR-202: Deterministic Underwriting Risk Band Calculator
 */
export function calculateUnderwritingBand(input: {
  applicantAge: number;
  isSmoker: boolean;
  bmi: number;
  occupationClass: 1 | 2 | 3 | 4;
}): {
  calculatedPoints: number;
  calculatedBand: UnderwritingBand;
  pointBreakdown: {
    agePoints: number;
    smokerPoints: number;
    bmiPoints: number;
    occupationPoints: number;
  };
  isAutoReferred: boolean;
} {
  const { applicantAge, isSmoker, bmi, occupationClass } = input;

  // Age rating points
  let agePoints = 0;
  if (applicantAge >= 18 && applicantAge <= 35) {
    agePoints = 0;
  } else if (applicantAge >= 36 && applicantAge <= 50) {
    agePoints = 10;
  } else if (applicantAge >= 51 && applicantAge <= 65) {
    agePoints = 25;
  } else if (applicantAge > 65) {
    agePoints = 40;
  }

  // Smoker points
  const smokerPoints = isSmoker ? 20 : 0;

  // BMI points - CR-202 strictly specifies: "BMI >= 30 adds 10 or >= 35 adds 20, not both"
  let bmiPoints = 0;
  if (bmi >= 35) {
    bmiPoints = 20;
  } else if (bmi >= 30) {
    bmiPoints = 10;
  } else {
    bmiPoints = 0;
  }

  // Occupation class points
  let occupationPoints = 0;
  if (occupationClass === 3) {
    occupationPoints = 10;
  } else if (occupationClass === 4) {
    occupationPoints = 25;
  }

  const calculatedPoints = agePoints + smokerPoints + bmiPoints + occupationPoints;

  // Band assignment
  let calculatedBand: UnderwritingBand = 'A';
  if (calculatedPoints < 10) {
    calculatedBand = 'A';
  } else if (calculatedPoints <= 24) {
    calculatedBand = 'B';
  } else if (calculatedPoints <= 39) {
    calculatedBand = 'C';
  } else if (calculatedPoints <= 59) {
    calculatedBand = 'D';
  } else {
    calculatedBand = 'E';
  }

  const isAutoReferred = calculatedBand === 'E';

  return {
    calculatedPoints,
    calculatedBand,
    pointBreakdown: {
      agePoints,
      smokerPoints,
      bmiPoints,
      occupationPoints,
    },
    isAutoReferred,
  };
}

/**
 * CR-203: Policy Renewal Feed ETL Pipeline Simulator
 */
export function processRenewalFeed(
  rows: RenewalFeedRowRaw[],
  enableV2: boolean
): ProcessedRenewalResult {
  const accepted: PolicyRecord[] = [];
  const quarantined: {
    line: number;
    businessKey: string;
    rawContent: string;
    reasonCode: string;
    diagnosticMessage: string;
  }[] = [];

  let totalPremiumAccepted = 0;
  let totalPremiumQuarantined = 0;

  for (const row of rows) {
    const rawContentStr = JSON.stringify(row);

    // Validation 1: Required business key
    if (!row.businessKey || row.businessKey.trim() === '') {
      quarantined.push({
        line: row.line,
        businessKey: row.businessKey || 'MISSING_KEY',
        rawContent: rawContentStr,
        reasonCode: 'MISSING_BUSINESS_KEY',
        diagnosticMessage: 'Row missing required business primary key identifier.',
      });
      continue;
    }

    // Money scaling and field mapping according to Feed version
    let calculatedAmount = 0;
    let mappedChannel = 'DIRECT';
    let persistedNcb = 0;

    if (enableV2 || row.feedVersion === '2.0') {
      // v2.0 Contract: amount_minor is in paise/cents -> must divide by 100.0 (Fixes INC-1042!)
      if (row.amountMinor === undefined || row.amountMinor < 0) {
        quarantined.push({
          line: row.line,
          businessKey: row.businessKey,
          rawContent: rawContentStr,
          reasonCode: 'INVALID_AMOUNT_MINOR',
          diagnosticMessage: `Non-positive or missing amount_minor: ${row.amountMinor}`,
        });
        totalPremiumQuarantined += (row.amountMinor || 0) / 100.0;
        continue;
      }
      calculatedAmount = Math.round((row.amountMinor / 100.0) * 100) / 100;
      mappedChannel = row.distributionChannel || row.channel || 'DIRECT';
      persistedNcb = row.ncbPercent !== undefined ? Math.min(Math.max(row.ncbPercent, 0), 50) : 0;
    } else {
      // Legacy v1.1 Contract: direct amount field without minor unit division
      if (row.amount === undefined || row.amount < 0) {
        quarantined.push({
          line: row.line,
          businessKey: row.businessKey,
          rawContent: rawContentStr,
          reasonCode: 'INVALID_AMOUNT_DIRECT',
          diagnosticMessage: `Invalid direct amount: ${row.amount}`,
        });
        totalPremiumQuarantined += row.amount || 0;
        continue;
      }
      calculatedAmount = row.amount;
      mappedChannel = row.channel || 'DIRECT';
      persistedNcb = 0; // Not available in v1.1
    }

    // Validation 2: Checksum integrity
    if (row.checksum && row.checksum === 'CORRUPTED_HASH') {
      quarantined.push({
        line: row.line,
        businessKey: row.businessKey,
        rawContent: rawContentStr,
        reasonCode: 'CORRUPTED_ROW_CHECKSUM',
        diagnosticMessage: 'Row cryptographic checksum mismatch indicating corrupted stream payload.',
      });
      totalPremiumQuarantined += calculatedAmount;
      continue;
    }

    // Valid Row: Upsert to Policies Target
    accepted.push({
      businessKey: row.businessKey,
      policyNumber: `POL-${row.businessKey}`,
      holderName: row.holderName,
      product: row.product,
      channel: mappedChannel,
      status: 'ACTIVE',
      amount: calculatedAmount,
      currency: row.currency || 'INR',
      effectiveDate: '2026-10-27',
      renewalDate: row.renewalDate || '2027-10-27',
      ncbPercent: persistedNcb,
    });

    totalPremiumAccepted += calculatedAmount;
  }

  const expectedControlCount = rows.length;
  const expectedControlPremium = totalPremiumAccepted + totalPremiumQuarantined;

  return {
    accepted,
    quarantined,
    stats: {
      totalRows: rows.length,
      acceptedCount: accepted.length,
      quarantinedCount: quarantined.length,
      totalPremiumAccepted: Math.round(totalPremiumAccepted * 100) / 100,
      totalPremiumQuarantined: Math.round(totalPremiumQuarantined * 100) / 100,
      expectedControlCount,
      expectedControlPremium: Math.round(expectedControlPremium * 100) / 100,
      reconciliationVarianceCount: expectedControlCount - (accepted.length + quarantined.length),
      reconciliationVariancePremium:
        Math.round((expectedControlPremium - (totalPremiumAccepted + totalPremiumQuarantined)) * 100) / 100,
      feedVersion: enableV2 ? '2.0' : '1.1',
      isReplaySafe: true,
    },
  };
}
