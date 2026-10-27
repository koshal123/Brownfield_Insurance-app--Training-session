import React, { useState } from 'react';
import { PRD_GAP_CLOSURES, INCIDENT_RESOLUTIONS } from '../../data/mockData';
import { PrdGapClosureItem } from '../../types';
import {
  BookOpenCheck,
  CheckCircle2,
  Download,
  Filter,
  Search,
  Sparkles,
  FileCode,
  Shield,
  Layers,
  CheckCheck,
} from 'lucide-react';

export const PrdViewerModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'fullPrd' | 'incidents'>('matrix');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const categories = [
    'ALL',
    'Governance & Roles',
    'CR-201 Claims',
    'CR-202 Underwriting',
    'CR-203 ETL Renewals',
    'Security & RBAC',
    'NFRs & SLA',
  ];

  const filteredGaps = PRD_GAP_CLOSURES.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      return (
        item.draftPrdText.toLowerCase().includes(q) ||
        item.closedSpecification.toLowerCase().includes(q) ||
        item.authoritativeOwner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownloadPrd = () => {
    // Trigger download of the deployable PRD
    const link = document.createElement('a');
    link.href = '/public/assets/aistudio/PRD_b3f23a41.md';
    link.download = 'PRD_Contoso_Insurance_Operations_Deployable_v1.0.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8DEE5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-[#25252B] flex items-center space-x-2">
              <BookOpenCheck className="w-5 h-5 text-emerald-600" />
              <span>Contoso Deployable PRD Specification &amp; Gap Closure Matrix</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              100% Deployable Ready
            </span>
          </div>
          <p className="text-xs text-[#5F6368] mt-1">
            Every single TBD resolved with authoritative formulas, exact schemas, atomic audit guarantees, and production sign-offs.
          </p>
        </div>

        <button
          onClick={handleDownloadPrd}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#24232F] hover:bg-[#343343] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#FFE000]" />
          <span>Download Deployable PRD (Markdown)</span>
        </button>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center space-x-2 border-b border-[#D8DEE5]">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-[#156E85] text-[#156E85]'
              : 'border-transparent text-[#5F6368] hover:text-[#25252B]'
          }`}
        >
          Gap-Closure Matrix ({PRD_GAP_CLOSURES.length} Closed Items)
        </button>
        <button
          onClick={() => setActiveTab('fullPrd')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'fullPrd'
              ? 'border-[#156E85] text-[#156E85]'
              : 'border-transparent text-[#5F6368] hover:text-[#25252B]'
          }`}
        >
          Full Deployable PRD Text (20 Sections)
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'incidents'
              ? 'border-[#156E85] text-[#156E85]'
              : 'border-transparent text-[#5F6368] hover:text-[#25252B]'
          }`}
        >
          Historical Incident Resolutions ({INCIDENT_RESOLUTIONS.length} Fixes)
        </button>
      </div>

      {/* TAB 1: Gap Closure Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-[#D8DEE5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#24232F] text-white'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search gap or owner..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-lg border border-[#D8DEE5] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#156E85]"
              />
            </div>
          </div>

          {/* Matrix Cards */}
          <div className="space-y-3">
            {filteredGaps.map((gap) => (
              <div
                key={gap.id}
                className="bg-white rounded-xl border border-[#D8DEE5] p-5 shadow-xs space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#156E85] text-xs">
                      {gap.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold text-[10px]">
                      {gap.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="text-zinc-400">Accountable:</span>
                    <strong className="text-zinc-800">{gap.authoritativeOwner}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Draft Gap */}
                  <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-rose-800 flex items-center justify-between">
                      <span>Draft PRD Baseline (Unresolved)</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-mono">
                        {gap.draftStatus}
                      </span>
                    </div>
                    <p className="text-rose-900 font-serif italic text-[11px] leading-relaxed">
                      "{gap.draftPrdText}"
                    </p>
                  </div>

                  {/* Right: Authoritative Closed Spec */}
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center justify-between">
                      <span>100% Deployable Approved Specification</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-bold">
                        CLOSED &amp; VERIFIED
                      </span>
                    </div>
                    <p className="text-emerald-950 font-medium text-[11px] leading-relaxed">
                      {gap.closedSpecification}
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-zinc-500 gap-1 border-t border-zinc-100">
                  <div>
                    <strong>Engine Implementation:</strong> {gap.implementationDetail}
                  </div>
                  <div className="text-emerald-700 font-semibold whitespace-nowrap">
                    ✓ Test Evidence: {gap.testEvidence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Full Deployable PRD Text */}
      {activeTab === 'fullPrd' && (
        <div className="bg-white rounded-xl border border-[#D8DEE5] p-6 shadow-xs space-y-6 text-xs text-[#25252B] leading-relaxed">
          <div className="border-b border-[#D8DEE5] pb-4">
            <h1 className="text-xl font-black text-[#24232F]">
              Contoso General Insurance — Core Operations Platform PRD
            </h1>
            <div className="text-zinc-500 mt-1 flex flex-wrap gap-4 text-[11px]">
              <span><strong>Document Version:</strong> 1.0 (Deployable Final Approved)</span>
              <span><strong>Effective Date:</strong> 2026-10-27</span>
              <span><strong>Owner:</strong> Head of Core Insurance Platforms</span>
              <span><strong>Status:</strong> Release Gate Passed</span>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#24232F] uppercase tracking-wider">
              1. Document Control &amp; Authority
            </h3>
            <p>
              This document represents the 100% gap-closed, authoritative Product Requirements Document (PRD) governing Contoso General Insurance's modernization of Claim Prioritization (CR-201), Underwriting Risk Rating (CR-202), and Policy Renewal ETL Feeds (CR-203). All previous historical TBDs, ambiguous tolerances, and draft markers are formally resolved with verified production semantics.
            </p>
          </div>

          {/* Section 4 & 5 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#24232F] uppercase tracking-wider">
              5. Finalized Success Metrics &amp; Operational SLAs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <strong className="block text-zinc-800">Queue API Latency:</strong>
                <span>p95 &lt; 350ms under 5,000 active claims. Verified at 288ms via SQL index tuning.</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <strong className="block text-zinc-800">Contact SLA Attainment:</strong>
                <span>98.5% of P1 severe injury or high-value claims contacted within 24 hours.</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <strong className="block text-zinc-800">ETL Reconciliation Tolerance:</strong>
                <span>0.00% penny variance permitted between control total and accepted + quarantined sum.</span>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#24232F] uppercase tracking-wider">
              6. Strict Role-Based Access Control (RBAC) &amp; Four-Eyes Principle
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-zinc-200">
                <thead className="bg-zinc-100 font-bold text-zinc-700">
                  <tr>
                    <th className="p-2 border-b">Role</th>
                    <th className="p-2 border-b">Read Domain</th>
                    <th className="p-2 border-b">Write/Triage</th>
                    <th className="p-2 border-b">CR-201 Decision</th>
                    <th className="p-2 border-b">CR-202 UW Override</th>
                    <th className="p-2 border-b">Export Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr>
                    <td className="p-2 font-mono font-bold">viewer</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-rose-600 font-bold">No (INC-1045 Fixed)</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold">claims-handler</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-rose-600 font-bold">No (403 Forbidden)</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold">claims-reviewer</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-emerald-700 font-bold">Independent only (Four-Eyes)</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold">underwriter</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                    <td className="p-2 text-emerald-700 font-bold">Yes (Reasoned + Audit)</td>
                    <td className="p-2 text-rose-600 font-bold">No</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold">ops-admin</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-emerald-700">Yes</td>
                    <td className="p-2 text-rose-600 font-bold">No (Requires reviewer cert)</td>
                    <td className="p-2 text-rose-600 font-bold">No (Requires UW cert)</td>
                    <td className="p-2 text-emerald-700 font-bold">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 9 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#24232F] uppercase tracking-wider">
              9. CR-201, CR-202, &amp; CR-203 Concrete Functional Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-700">
              <li>
                <strong>CR-201 Priority Calculation:</strong> P1 assigned if bodily injury is true OR converted amount in INR &gt;= 1,000,000 (rates: INR 1.0, USD 83.0, AED 22.6). P2 assigned if risk score &gt;= 70 OR peril is Fire/Flood. Incident reporting latency &gt; 30 calendar days raises P3 to P2 only.
              </li>
              <li>
                <strong>CR-201 Atomic Audit Trail:</strong> Every accepted approval or rejection writes an immutable row containing old_status, new_status, actor_id, actor_role, UTC timestamp, correlation_id, and mandatory reason code/trimmed text.
              </li>
              <li>
                <strong>CR-202 Underwriting Points:</strong> Age 18-35 (0), 36-50 (10), 51-65 (25), &gt;65 (40). Smoker (+20). BMI 30-34.9 (+10), &gt;=35 (+20, mutually exclusive). Occ Class 3 (+10), Class 4 (+25). Bands: A (&lt;10), B (10-24), C (25-39), D (40-59), E (&gt;=60). Band E triggers automatic referral.
              </li>
              <li>
                <strong>CR-203 ETL Renewal Transformation:</strong> Feeds in v2.0 transmit amount_minor in paise. Output amount = round(amount_minor / 100.0, 2). Target destination is `policies` table. ncb_percent (0-50%) persisted in lineage.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: Incident Resolutions */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#D8DEE5] text-xs">
            <h3 className="font-bold text-sm text-[#25252B]">
              Historical Incident Remediation Log (INC-1041 to INC-1048)
            </h3>
            <p className="text-[#5F6368] mt-0.5">
              Every defect identified during discovery has been addressed, root-caused, and verified with regression tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INCIDENT_RESOLUTIONS.map((inc) => (
              <div
                key={inc.id}
                className="bg-white rounded-xl border border-[#D8DEE5] p-4 shadow-xs space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="font-mono font-bold text-[#156E85]">{inc.id}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {inc.status}
                  </span>
                </div>

                <div className="font-bold text-zinc-900 text-sm">{inc.title}</div>

                <div className="space-y-1 text-zinc-600">
                  <div>
                    <strong className="text-rose-700">Root Cause:</strong> {inc.rootCause}
                  </div>
                  <div>
                    <strong className="text-emerald-700">Closed Fix:</strong> {inc.closedFix}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono pt-1">
                    Regression Proof: {inc.regressionProof}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
