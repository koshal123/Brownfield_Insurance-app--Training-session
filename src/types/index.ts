export type UserRole =
  | 'viewer'
  | 'claims-handler'
  | 'claims-reviewer'
  | 'underwriter'
  | 'siu-investigator'
  | 'auditor'
  | 'ops-admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

export type PriorityTier = 'P1' | 'P2' | 'P3';

export type ClaimStatus =
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CLOSED';

export type CurrencyCode = 'INR' | 'USD' | 'AED' | string;

export interface Claim {
  businessKey: string;
  policyRef: string;
  claimantName: string;
  claimType: 'Auto' | 'Property' | 'Health' | 'Fire' | 'Flood' | 'Liability' | string;
  amount: number;
  currency: CurrencyCode;
  amountInr: number;
  riskScore: number;
  injuryFlag: boolean;
  incidentDate: string;
  reportedDate: string;
  status: ClaimStatus;
  adjusterId: string;
  adjusterName: string;
  computedPriority: PriorityTier;
  priorityReasons: string[];
  rejectionReasonCode?: 'POLICY_EXCLUSION' | 'NON_DISCLOSURE' | 'INSUFFICIENT_DOCS' | 'FRAUD_SUSPECTED';
  rejectionReasonText?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  version: number;
}

export interface ReviewDecisionPayload {
  businessKey: string;
  decision: 'APPROVE' | 'REJECT';
  rejectionReasonCode?: 'POLICY_EXCLUSION' | 'NON_DISCLOSURE' | 'INSUFFICIENT_DOCS' | 'FRAUD_SUSPECTED';
  rejectionReasonText?: string;
  reviewerId: string;
  reviewerRole: UserRole;
  expectedVersion: number;
  correlationId: string;
}

export interface AuditRecord {
  id: string;
  businessKey: string;
  oldStatus: string;
  newStatus: string;
  actorId: string;
  actorRole: string;
  utcTimestamp: string;
  correlationId: string;
  decision: string;
  rejectionReasonCode?: string;
  rejectionReasonText?: string;
  metadata?: Record<string, unknown>;
}

export type UnderwritingBand = 'A' | 'B' | 'C' | 'D' | 'E';

export interface UnderwritingCase {
  businessKey: string;
  applicantName: string;
  applicantAge: number;
  isSmoker: boolean;
  bmi: number;
  occupationClass: 1 | 2 | 3 | 4;
  policyProduct: string;
  calculatedPoints: number;
  calculatedBand: UnderwritingBand;
  pointBreakdown: {
    agePoints: number;
    smokerPoints: number;
    bmiPoints: number;
    occupationPoints: number;
  };
  isAutoReferred: boolean;
  isOverridden: boolean;
  effectiveBand: UnderwritingBand;
  overrideReasonCode?: 'MEDICAL_CLEARANCE' | 'RESTRICTIVE_POLICY_TERMS' | 'SENIOR_COMMITTEE_APPROVAL' | 'PREMIUM_LOADING_AGREED';
  overrideReasonText?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

export interface PolicyRecord {
  businessKey: string;
  policyNumber: string;
  holderName: string;
  product: string;
  channel: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING_RENEWAL' | 'LAPSED';
  amount: number;
  currency: string;
  effectiveDate: string;
  renewalDate: string;
  ncbPercent: number;
}

export interface RenewalFeedRowRaw {
  feedVersion: '1.1' | '2.0';
  line: number;
  businessKey: string;
  holderName: string;
  product: string;
  distributionChannel?: string;
  channel?: string;
  amountMinor?: number;
  amount?: number;
  currency: string;
  renewalDate: string;
  ncbPercent?: number;
  checksum: string;
}

export interface ProcessedRenewalResult {
  accepted: PolicyRecord[];
  quarantined: {
    line: number;
    businessKey: string;
    rawContent: string;
    reasonCode: string;
    diagnosticMessage: string;
  }[];
  stats: {
    totalRows: number;
    acceptedCount: number;
    quarantinedCount: number;
    totalPremiumAccepted: number;
    totalPremiumQuarantined: number;
    expectedControlCount: number;
    expectedControlPremium: number;
    reconciliationVarianceCount: number;
    reconciliationVariancePremium: number;
    feedVersion: string;
    isReplaySafe: boolean;
  };
}

export interface FraudSignal {
  id: string;
  claimRef: string;
  claimantName: string;
  riskScore: number;
  signals: string[];
  status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'ESCALATED' | 'CLEARED' | 'CONFIRMED_FRAUD';
  investigatorId?: string;
  detectedAt: string;
}

export interface DocumentRecord {
  id: string;
  claimRef: string;
  docType: 'Police Report' | 'Medical Assessment' | 'Repair Estimate' | 'Identity Verification' | 'Policy Schedule';
  fileName: string;
  pages: number;
  ocrConfidence: number;
  uploadedAt: string;
  isReadOnly: boolean;
  restrictedRoles: UserRole[];
}

export interface PrdGapClosureItem {
  id: string;
  category: 'Governance & Roles' | 'CR-201 Claims' | 'CR-202 Underwriting' | 'CR-203 ETL Renewals' | 'Security & RBAC' | 'NFRs & SLA' | 'Incidents';
  draftPrdText: string;
  draftStatus: 'TBD' | 'Unverified' | 'Draft' | 'Historical Gaps';
  closedSpecification: string;
  implementationDetail: string;
  authoritativeOwner: string;
  testEvidence: string;
}

export interface IncidentResolution {
  id: string;
  title: string;
  rootCause: string;
  legacySymptom: string;
  closedFix: string;
  regressionProof: string;
  status: 'VERIFIED_FIXED';
}
