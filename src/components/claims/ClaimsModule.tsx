import React, { useState, useMemo } from 'react';
import {
  Claim,
  UserProfile,
  PriorityTier,
  AuditRecord,
  ReviewDecisionPayload,
} from '../../types';
import { validateReviewAction } from '../../utils/rulesEngine';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Info,
  Calendar,
  Lock,
  History,
  FileCheck,
  ClipboardList,
} from 'lucide-react';

interface ClaimsModuleProps {
  claims: Claim[];
  currentUser: UserProfile;
  auditLogs: AuditRecord[];
  onCommitDecision: (payload: ReviewDecisionPayload) => { success: boolean; error?: string; errorCode?: string };
}

export const ClaimsModule: React.FC<ClaimsModuleProps> = ({
  claims,
  currentUser,
  auditLogs,
  onCommitDecision,
}) => {
  const [selectedClaimKey, setSelectedClaimKey] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | PriorityTier>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Review form state
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionCode, setRejectionCode] = useState<'POLICY_EXCLUSION' | 'NON_DISCLOSURE' | 'INSUFFICIENT_DOCS' | 'FRAUD_SUSPECTED'>('POLICY_EXCLUSION');
  const [rejectionText, setRejectionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selected claim object
  const activeClaim = useMemo(() => {
    return claims.find((c) => c.businessKey === selectedClaimKey) || null;
  }, [claims, selectedClaimKey]);

  // Priority sorting & filter implementation (CR-201 Section 9, FR-04)
  const filteredClaims = useMemo(() => {
    return claims
      .filter((c) => {
        // Priority filter
        if (priorityFilter !== 'ALL' && c.computedPriority !== priorityFilter) return false;
        // Search query with parameterized safe check (INC-1043 apostrophe safety)
        if (searchQuery.trim() !== '') {
          const query = searchQuery.trim().toLowerCase();
          const matchKey = c.businessKey.toLowerCase().includes(query);
          const matchName = c.claimantName.toLowerCase().includes(query);
          const matchPolicy = c.policyRef.toLowerCase().includes(query);
          if (!matchKey && !matchName && !matchPolicy) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Priority tier order: P1 < P2 < P3
        const pOrder: Record<PriorityTier, number> = { P1: 1, P2: 2, P3: 3 };
        if (pOrder[a.computedPriority] !== pOrder[b.computedPriority]) {
          return pOrder[a.computedPriority] - pOrder[b.computedPriority];
        }
        // Oldest reported date first (missing dates placed last)
        const dateA = a.reportedDate ? new Date(a.reportedDate).getTime() : Infinity;
        const dateB = b.reportedDate ? new Date(b.reportedDate).getTime() : Infinity;
        if (dateA !== dateB) return dateA - dateB;
        // Alphabetical business key tie-breaker
        return a.businessKey.localeCompare(b.businessKey);
      });
  }, [claims, priorityFilter, searchQuery]);

  // 1-based pagination (Fixes INC-1041!)
  const totalPages = Math.ceil(filteredClaims.length / pageSize) || 1;
  const pagedClaims = useMemo(() => {
    const offset = (Math.max(1, currentPage) - 1) * pageSize;
    return filteredClaims.slice(offset, offset + pageSize);
  }, [filteredClaims, currentPage, pageSize]);

  // Handle filter changes (resets to page 1 as per FR-01)
  const handlePriorityFilterChange = (p: 'ALL' | PriorityTier) => {
    setPriorityFilter(p);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Submit Review Decision
  const handleSubmitDecision = () => {
    if (!activeClaim || !actionType) return;
    setIsSubmitting(true);
    setFormFeedback(null);

    const correlationId = `CORR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload: ReviewDecisionPayload = {
      businessKey: activeClaim.businessKey,
      decision: actionType,
      rejectionReasonCode: actionType === 'REJECT' ? rejectionCode : undefined,
      rejectionReasonText: actionType === 'REJECT' ? rejectionText : undefined,
      reviewerId: currentUser.id,
      reviewerRole: currentUser.role,
      expectedVersion: activeClaim.version,
      correlationId,
    };

    const result = onCommitDecision(payload);

    if (result.success) {
      setFormFeedback({
        type: 'success',
        message: `Decision committed successfully! Claim ${activeClaim.businessKey} is now ${actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED'}. Audit ID: ${correlationId}`,
      });
      setActionType(null);
      setRejectionText('');
    } else {
      setFormFeedback({
        type: 'error',
        message: result.error || 'Execution blocked by security or validation rules.',
      });
    }

    setIsSubmitting(false);
  };

  // Check Four-Eyes authorization for active claim
  const reviewValidation = activeClaim
    ? validateReviewAction(activeClaim, currentUser, { expectedVersion: activeClaim.version })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-[#D8DEE5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-[#25252B]">
              CR-201 Severity Review Queue
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Four-Eyes Rule Active
            </span>
          </div>
          <p className="text-xs text-[#5F6368] mt-1">
            Ordered strictly by Priority (P1 &gt; P2 &gt; P3), Oldest Reported Date, and Business Key. Missing dates last.
          </p>
        </div>

        {/* Priority Filter Pill Bar */}
        <div className="flex items-center space-x-1.5 bg-[#F4F6F9] p-1 rounded-lg border border-[#D8DEE5] self-start md:self-auto">
          {(['ALL', 'P1', 'P2', 'P3'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => handlePriorityFilterChange(tier)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                priorityFilter === tier
                  ? tier === 'P1'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : tier === 'P2'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : tier === 'P3'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-[#24232F] text-white shadow-xs'
                  : 'text-[#5F6368] hover:text-[#25252B] hover:bg-white'
              }`}
            >
              {tier === 'ALL' ? 'All Tiers' : `${tier}`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Queue Table / Right Review Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue Table (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#D8DEE5] shadow-xs overflow-hidden flex flex-col">
          {/* Search and Paging Controls */}
          <div className="p-4 border-b border-[#D8DEE5] bg-[#FAFBFD] flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search claimant (e.g. O'Connor, Oberoi), key, policy..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#D8DEE5] text-xs focus:outline-none focus:ring-2 focus:ring-[#156E85] bg-white"
              />
            </div>
            <div className="text-xs text-zinc-500 whitespace-nowrap">
              {filteredClaims.length} eligible claims
            </div>
          </div>

          {/* Claims Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] text-[#5F6368] font-semibold uppercase tracking-wider border-b border-[#D8DEE5]">
                <tr>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Claim Key</th>
                  <th className="py-2.5 px-3">Claimant &amp; Type</th>
                  <th className="py-2.5 px-3">Amount (INR eq)</th>
                  <th className="py-2.5 px-3">Adjuster</th>
                  <th className="py-2.5 px-3">Reported</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFF4]">
                {pagedClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      No claims matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  pagedClaims.map((claim) => {
                    const isSelected = activeClaim?.businessKey === claim.businessKey;
                    const isOwnAdjuster = claim.adjusterId === currentUser.id;

                    return (
                      <tr
                        key={claim.businessKey}
                        onClick={() => setSelectedClaimKey(claim.businessKey)}
                        className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                          isSelected ? 'bg-amber-50/60 font-medium' : ''
                        }`}
                      >
                        {/* Priority Badge */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black ${
                              claim.computedPriority === 'P1'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : claim.computedPriority === 'P2'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {claim.computedPriority}
                          </span>
                        </td>

                        {/* Business Key */}
                        <td className="py-3 px-3 font-mono text-[#25252B]">
                          {claim.businessKey}
                          <div className="text-[10px] text-zinc-400 font-sans">{claim.policyRef}</div>
                        </td>

                        {/* Claimant & Peril */}
                        <td className="py-3 px-3">
                          <div className="text-[#25252B] font-semibold">{claim.claimantName}</div>
                          <div className="text-[10px] text-[#5F6368] flex items-center space-x-1">
                            <span>{claim.claimType}</span>
                            {claim.injuryFlag && (
                              <span className="text-rose-600 font-bold">• Bodily Injury</span>
                            )}
                          </div>
                        </td>

                        {/* Amount & FX */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#25252B]">
                            ₹{claim.amountInr.toLocaleString('en-IN')}
                          </div>
                          {claim.currency !== 'INR' && (
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {claim.amount.toLocaleString()} {claim.currency}
                            </div>
                          )}
                        </td>

                        {/* Adjuster */}
                        <td className="py-3 px-3">
                          <span className={`text-[11px] ${isOwnAdjuster ? 'text-amber-700 font-bold' : 'text-[#5F6368]'}`}>
                            {claim.adjusterName}
                          </span>
                          {isOwnAdjuster && (
                            <div className="text-[9px] text-amber-600 font-semibold">(Your claim)</div>
                          )}
                        </td>

                        {/* Reported Date */}
                        <td className="py-3 px-3 text-[#5F6368] whitespace-nowrap">
                          {claim.reportedDate || 'Missing'}
                        </td>

                        {/* Select Action */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClaimKey(claim.businessKey);
                            }}
                            className="px-2.5 py-1 rounded bg-[#24232F] hover:bg-[#343343] text-white text-[11px] font-medium transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (INC-1041 Fixed) */}
          <div className="p-3 bg-[#FAFBFD] border-t border-[#D8DEE5] flex items-center justify-between text-xs text-zinc-500">
            <div>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
              {filteredClaims.length} total)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-[#CCD6E0] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 font-medium"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border border-[#CCD6E0] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right: Review Form & Four-Eyes Inspection (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {activeClaim ? (
            <div className="bg-white rounded-xl border border-[#D8DEE5] shadow-xs p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#D8DEE5]">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-[#25252B]">
                      {activeClaim.businessKey}
                    </h3>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded ${
                        activeClaim.computedPriority === 'P1'
                          ? 'bg-rose-100 text-rose-800'
                          : activeClaim.computedPriority === 'P2'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {activeClaim.computedPriority}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono">
                      v{activeClaim.version}
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6368] mt-0.5">{activeClaim.claimantName} • {activeClaim.claimType}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {activeClaim.status}
                </span>
              </div>

              {/* Priority Reasons Computed */}
              <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0] space-y-1.5">
                <div className="text-[11px] font-bold text-[#25252B] flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-[#156E85]" />
                  <span>Computed Priority Justification (CR-201 Rules):</span>
                </div>
                <ul className="text-xs text-[#5F6368] space-y-1 pl-4 list-disc">
                  {activeClaim.priorityReasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Four-Eyes Security Banner */}
              {reviewValidation && !reviewValidation.allowed ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">
                      {reviewValidation.errorCode === 'FOUR_EYES_VIOLATION_403'
                        ? 'Four-Eyes Principle Enforcement:'
                        : 'Role Authorization Restriction:'}
                    </strong>
                    <span>{reviewValidation.error}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    You are authorized as an independent claims-reviewer for this claim.
                  </span>
                </div>
              )}

              {/* Feedback messages */}
              {formFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start space-x-2 ${
                    formFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {formFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{formFeedback.message}</span>
                </div>
              )}

              {/* Action Buttons: Approve / Reject */}
              {activeClaim.status === 'REVIEW' || activeClaim.status === 'PENDING_REVIEW' ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={!reviewValidation?.allowed || isSubmitting}
                      onClick={() => setActionType('APPROVE')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        actionType === 'APPROVE'
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-500'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Claim</span>
                    </button>

                    <button
                      disabled={!reviewValidation?.allowed || isSubmitting}
                      onClick={() => setActionType('REJECT')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        actionType === 'REJECT'
                          ? 'bg-rose-700 text-white ring-2 ring-rose-500'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Claim</span>
                    </button>
                  </div>

                  {/* Rejection Form Fields (FR-06 Strict Validation) */}
                  {actionType === 'REJECT' && (
                    <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-3 text-xs">
                      <div className="font-bold text-rose-900 flex items-center justify-between">
                        <span>Mandatory Rejection Documentation</span>
                        <span className="text-[10px] text-rose-700 font-mono">FR-06 Enforced</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-rose-950 mb-1">
                          Rejection Reason Code (Enum):
                        </label>
                        <select
                          value={rejectionCode}
                          onChange={(e) => setRejectionCode(e.target.value as any)}
                          className="w-full p-2 rounded-lg border border-rose-300 bg-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        >
                          <option value="POLICY_EXCLUSION">POLICY_EXCLUSION (Excluded Peril / Clause)</option>
                          <option value="NON_DISCLOSURE">NON_DISCLOSURE (Material Fact Withheld)</option>
                          <option value="INSUFFICIENT_DOCS">INSUFFICIENT_DOCS (Incomplete Evidence)</option>
                          <option value="FRAUD_SUSPECTED">FRAUD_SUSPECTED (SIU Referral Signal)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-rose-950 mb-1">
                          Rejection Rationale Text (1-500 chars, trimmed):
                        </label>
                        <textarea
                          rows={3}
                          value={rejectionText}
                          onChange={(e) => setRejectionText(e.target.value)}
                          placeholder="Provide detailed, auditable justification for rejection..."
                          className="w-full p-2 rounded-lg border border-rose-300 bg-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                          <span>Must be non-empty after trimming</span>
                          <span>{rejectionText.trim().length} / 500 chars</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Commit Button */}
                  {actionType && (
                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        disabled={isSubmitting || (actionType === 'REJECT' && rejectionText.trim().length === 0)}
                        onClick={handleSubmitDecision}
                        className="flex-1 py-2 px-4 rounded-lg bg-[#24232F] hover:bg-[#323140] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <FileCheck className="w-4 h-4 text-[#FFE000]" />
                        <span>Commit {actionType} Decision &amp; Write Audit Row</span>
                      </button>
                      <button
                        onClick={() => setActionType(null)}
                        className="py-2 px-3 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-xs font-semibold text-zinc-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600">
                  This claim has already completed review (Status: <strong>{activeClaim.status}</strong>).
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#D8DEE5] p-8 text-center text-zinc-400 text-xs">
              <ClipboardList className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
              Select a claim from the queue to inspect details and execute review.
            </div>
          )}

          {/* Atomic Audit Trail Panel */}
          <div className="bg-white rounded-xl border border-[#D8DEE5] shadow-xs p-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE5] mb-3">
              <div className="flex items-center space-x-1.5 font-bold text-xs text-[#25252B]">
                <History className="w-4 h-4 text-[#156E85]" />
                <span>Recent Atomic Audit Records (FR-14)</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Immutable Log</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-zinc-400 text-center py-4">No review decisions logged in this session.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#25252B]">{log.businessKey}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          log.decision === 'APPROVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.decision}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5F6368]">
                      Transition: <span className="font-mono">{log.oldStatus}</span> → <span className="font-mono">{log.newStatus}</span> by <strong>{log.actorId}</strong> ({log.actorRole})
                    </div>
                    {log.rejectionReasonCode && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                        <strong>{log.rejectionReasonCode}</strong>: {log.rejectionReasonText}
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                      <span>{log.utcTimestamp}</span>
                      <span>{log.correlationId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
