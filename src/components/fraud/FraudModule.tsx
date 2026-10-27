import React from 'react';
import { FraudSignal, UserProfile } from '../../types';
import { Search, AlertOctagon, ShieldCheck, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

interface FraudModuleProps {
  signals: FraudSignal[];
  currentUser: UserProfile;
}

export const FraudModule: React.FC<FraudModuleProps> = ({ signals, currentUser }) => {
  const isInvestigator = currentUser.role === 'siu-investigator' || currentUser.role === 'ops-admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#D8DEE5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-[#25252B]">
              Special Investigation Unit (SIU) Fraud Triage
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              INC-1046 Boundary Fixed
            </span>
          </div>
          <p className="text-xs text-[#5F6368] mt-1">
            Standardized inclusive rule: risk score &gt;= 85 triggers both underwriting senior referral and SIU investigation lock.
          </p>
        </div>

        <div className="text-xs flex items-center space-x-2">
          <span className="text-zinc-500">SIU Authority:</span>
          {isInvestigator ? (
            <span className="inline-flex items-center px-2 py-1 rounded bg-purple-100 text-purple-800 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Investigator
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-600 font-medium">
              View Only ({currentUser.role})
            </span>
          )}
        </div>
      </div>

      {/* Callout on INC-1046 boundary fix */}
      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 text-xs text-purple-900 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-sm">INC-1046 Score 85 Mismatch Resolved</div>
          <p className="leading-relaxed">
            In legacy systems, underwriting flagged risk at <code>score &gt; 85</code> while SIU flagged at <code>score &gt;= 85</code>, leaving claims with score exactly 85 in a dead-zone. The deployable PRD enforces unified inclusive logic: <code>score &gt;= 85</code> across both modules.
          </p>
        </div>
      </div>

      {/* Signals Table */}
      <div className="bg-white rounded-xl border border-[#D8DEE5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#D8DEE5] bg-[#FAFBFD] flex items-center justify-between">
          <h3 className="font-bold text-xs text-[#25252B]">Active Fraud Investigation Referrals</h3>
          <span className="text-xs text-zinc-500 font-mono">{signals.length} Signals Monitored</span>
        </div>

        <div className="divide-y divide-[#EAEFF4]">
          {signals.map((sig) => (
            <div key={sig.id} className="p-4 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#25252B] font-mono">{sig.claimRef}</span>
                  <span className="text-zinc-500">• {sig.claimantName}</span>
                  <span className={`px-2 py-0.2 rounded font-bold text-[10px] ${
                    sig.riskScore >= 80 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Risk Score: {sig.riskScore} / 100
                  </span>
                </div>
                <div className="text-zinc-600">
                  <strong>Triggered Indicators:</strong> {sig.signals.join(' • ')}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Detected: {sig.detectedAt} • Assigned Investigator: {sig.investigatorId || 'Unassigned'}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-[11px]">
                  {sig.status}
                </span>
                <button
                  disabled={!isInvestigator}
                  className="px-3 py-1.5 rounded-lg bg-[#24232F] hover:bg-[#343343] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Inspect Case
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
