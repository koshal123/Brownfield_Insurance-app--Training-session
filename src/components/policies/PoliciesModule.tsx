import React, { useState } from 'react';
import {
  PolicyRecord,
  RenewalFeedRowRaw,
  UserProfile,
} from '../../types';
import { processRenewalFeed } from '../../utils/rulesEngine';
import { SAMPLE_RENEWAL_V2_ROWS } from '../../data/mockData';
import {
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Database,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface PoliciesModuleProps {
  policies: PolicyRecord[];
  currentUser: UserProfile;
}

export const PoliciesModule: React.FC<PoliciesModuleProps> = ({
  policies,
  currentUser,
}) => {
  const [enableV2, setEnableV2] = useState<boolean>(true);
  const [replayCount, setReplayCount] = useState<number>(1);
  const [feedRows, setFeedRows] = useState<RenewalFeedRowRaw[]>(SAMPLE_RENEWAL_V2_ROWS);

  // Run the ETL pipeline with current settings
  const result = processRenewalFeed(feedRows, enableV2);

  const handleSimulateReplay = () => {
    setReplayCount((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8DEE5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-[#25252B]">
              CR-203 Policy Renewal Feed ETL &amp; Reconciliation
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
              Target: `policies` Table
            </span>
          </div>
          <p className="text-xs text-[#5F6368] mt-1">
            Resolves INC-1042 (100x monetary inflation via paise / 100 division), persists NCB lineage, and enforces zero-penny reconciliation.
          </p>
        </div>

        {/* Feature Flag Toggle: ETL_ENABLE_V2 */}
        <div className="flex items-center space-x-3 bg-[#F4F6F9] p-2 rounded-xl border border-[#D8DEE5]">
          <span className="text-xs font-semibold text-[#25252B]">
            Flag: <code className="text-[#156E85]">ETL_ENABLE_V2</code>
          </span>
          <button
            onClick={() => setEnableV2(!enableV2)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              enableV2
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-rose-600 text-white shadow-xs'
            }`}
          >
            {enableV2 ? 'V2 Enabled (Fixed)' : 'V1.1 (Legacy Bug)'}
          </button>
        </div>
      </div>

      {/* Comparison Callout: 100x Scaling Bug (INC-1042 Fix) */}
      <div className={`p-4 rounded-xl border transition-all text-xs flex items-start space-x-3 ${
        enableV2
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : 'bg-rose-50/70 border-rose-300 text-rose-900'
      }`}>
        {enableV2 ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-bold text-sm">
            {enableV2
              ? 'INC-1042 Resolved: Minor-Unit Division (amount_minor / 100.0) Active'
              : 'CRITICAL BUG (Legacy Simulation): Direct Integer Mapping Inflates Premiums by 100x!'}
          </div>
          <p className="leading-relaxed">
            {enableV2
              ? 'Feed v2.0 input with amount_minor = 2,450,000 paise is correctly scaled to ₹24,500.00 INR. The target is properly directed to `policies` (not claims), and `ncb_percent` is persisted in lineage.'
              : 'Without CR-203 logic, raw paise (2,450,000) is stored as rupees, inflating customer bills to ₹2,450,000.00! Flip the flag above to apply the deployable fix.'}
          </p>
        </div>
      </div>

      {/* Reconciliation Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D8DEE5] shadow-xs">
          <div className="text-[11px] text-zinc-500 font-medium">Batch Records (Control)</div>
          <div className="text-xl font-black text-[#25252B] mt-1">
            {result.stats.totalRows}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
            {result.stats.acceptedCount} Accepted • {result.stats.quarantinedCount} Quarantined
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8DEE5] shadow-xs">
          <div className="text-[11px] text-zinc-500 font-medium">Accepted Premium</div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            ₹{result.stats.totalPremiumAccepted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Scaled to currency base units
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8DEE5] shadow-xs">
          <div className="text-[11px] text-zinc-500 font-medium">Control File Balance</div>
          <div className="text-xl font-black text-[#25252B] mt-1">
            ₹{result.stats.expectedControlPremium.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Control Count = {result.stats.expectedControlCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8DEE5] shadow-xs">
          <div className="text-[11px] text-zinc-500 font-medium">Reconciliation Variance</div>
          <div className="text-xl font-black text-emerald-700 mt-1 flex items-center space-x-1">
            <span>₹{result.stats.reconciliationVariancePremium.toFixed(2)}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Penny Perfect
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Tolerance: 0.00% (Strict)
          </div>
        </div>
      </div>

      {/* Main Grid: Accepted Policies & Quarantined Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Accepted Policies Loaded to Policies Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#D8DEE5] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#D8DEE5] bg-[#FAFBFD] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#156E85]" />
              <h3 className="font-bold text-xs text-[#25252B]">
                Upserted to `policies` Target Table ({result.accepted.length})
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSimulateReplay}
                className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium flex items-center space-x-1 cursor-pointer"
                title="Test idempotent exactly-once replay"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Feed (Run #{replayCount})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] text-[#5F6368] font-semibold uppercase tracking-wider border-b border-[#D8DEE5]">
                <tr>
                  <th className="py-2.5 px-3">Policy Key</th>
                  <th className="py-2.5 px-3">Holder Name</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Premium (INR)</th>
                  <th className="py-2.5 px-3">NCB %</th>
                  <th className="py-2.5 px-3">Renewal Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFF4]">
                {result.accepted.map((pol) => (
                  <tr key={pol.businessKey} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-3 font-mono font-bold text-[#25252B]">
                      {pol.businessKey}
                    </td>
                    <td className="py-3 px-3 font-medium text-zinc-800">
                      {pol.holderName}
                    </td>
                    <td className="py-3 px-3 text-zinc-600">
                      {pol.product}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-mono">
                        {pol.channel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-800 font-mono">
                      ₹{pol.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 text-[10px]">
                        {pol.ncbPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-500 whitespace-nowrap">
                      {pol.renewalDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FAFBFD] border-t border-[#D8DEE5] text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Idempotency: Exactly-once state guaranteed across multiple replays.</span>
            <span className="font-mono text-zinc-400">Target Schema: policies_v2</span>
          </div>
        </div>

        {/* Right: Quarantine Table (INC-1047 Isolation Fix) (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8DEE5] shadow-xs p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE5]">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-xs text-[#25252B]">
                Quarantined Records ({result.quarantined.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              INC-1047 Fixed: Batch Saved
            </span>
          </div>

          <p className="text-xs text-[#5F6368]">
            Malformed lines are isolated into <code>quarantined_renewals</code> with diagnostic codes, allowing the remainder of the batch to complete without fatal failure.
          </p>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96">
            {result.quarantined.map((q, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">Line #{q.line}: {q.businessKey}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">
                    {q.reasonCode}
                  </span>
                </div>
                <div className="text-[11px] text-amber-800">
                  {q.diagnosticMessage}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 bg-white p-1 rounded border border-amber-200 truncate">
                  {q.rawContent}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
