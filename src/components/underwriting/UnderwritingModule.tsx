import React, { useState } from 'react';
import {
  UnderwritingCase,
  UnderwritingBand,
  UserProfile,
} from '../../types';
import { calculateUnderwritingBand } from '../../utils/rulesEngine';
import {
  ShieldAlert,
  ShieldCheck,
  Calculator,
  UserCheck,
  AlertCircle,
  FileEdit,
  History,
  Lock,
  CheckCircle,
} from 'lucide-react';

interface UnderwritingModuleProps {
  cases: UnderwritingCase[];
  currentUser: UserProfile;
  onUpdateCase: (updatedCase: UnderwritingCase) => void;
}

export const UnderwritingModule: React.FC<UnderwritingModuleProps> = ({
  cases,
  currentUser,
  onUpdateCase,
}) => {
  // Active interactive calculator state
  const [applicantAge, setApplicantAge] = useState<number>(45);
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [bmi, setBmi] = useState<number>(31.5);
  const [occupationClass, setOccupationClass] = useState<1 | 2 | 3 | 4>(3);

  // Selected existing case for override modal
  const [selectedCase, setSelectedCase] = useState<UnderwritingCase | null>(null);
  const [overrideBand, setOverrideBand] = useState<UnderwritingBand>('C');
  const [overrideCode, setOverrideCode] = useState<'MEDICAL_CLEARANCE' | 'RESTRICTIVE_POLICY_TERMS' | 'SENIOR_COMMITTEE_APPROVAL' | 'PREMIUM_LOADING_AGREED'>('MEDICAL_CLEARANCE');
  const [overrideText, setOverrideText] = useState<string>('');
  const [overrideFeedback, setOverrideFeedback] = useState<string | null>(null);

  // Live calculation results from CR-202 rules
  const liveResult = calculateUnderwritingBand({
    applicantAge,
    isSmoker,
    bmi,
    occupationClass,
  });

  const isUnderwriter = currentUser.role === 'underwriter';

  const handleApplyOverride = () => {
    if (!selectedCase) return;
    if (!isUnderwriter) {
      setOverrideFeedback('Permission Denied: Only users with the "underwriter" role can override risk bands.');
      return;
    }
    if (overrideText.trim().length < 20) {
      setOverrideFeedback('Validation Error: Override justification must be at least 20 characters explaining clinical/actuarial rationale.');
      return;
    }

    const updated: UnderwritingCase = {
      ...selectedCase,
      isOverridden: true,
      effectiveBand: overrideBand,
      overrideReasonCode: overrideCode,
      overrideReasonText: overrideText.trim(),
      overriddenBy: currentUser.name,
      overriddenAt: new Date().toISOString(),
    };

    onUpdateCase(updated);
    setSelectedCase(updated);
    setOverrideFeedback('Override successfully applied and persisted in immutable underwriting audit log.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#D8DEE5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-[#25252B]">
              CR-202 Deterministic Underwriting Risk Bands
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Deterministic Matrix Active
            </span>
          </div>
          <p className="text-xs text-[#5F6368] mt-1">
            Points rating table: Age (0-40), Smoker (+20), BMI 30-34 (+10) or &gt;=35 (+20, not both), Occupation Class 3 (+10) / 4 (+25). Bands A to E.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-zinc-500">Underwriter Authority:</span>
          {isUnderwriter ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Override Authorized
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 font-medium">
              <Lock className="w-3.5 h-3.5 mr-1" /> View Only (Switch to Underwriter)
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Live Calculator & Existing Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive CR-202 Live Rating Sandbox (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8DEE5] shadow-xs p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE5]">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-[#156E85]" />
              <h3 className="font-bold text-sm text-[#25252B]">Interactive Rating Sandbox</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
              Pure Rule Engine
            </span>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4 text-xs">
            {/* Age */}
            <div>
              <div className="flex justify-between font-semibold text-[#25252B] mb-1">
                <label>Applicant Age:</label>
                <span className="font-mono text-[#156E85] font-bold">{applicantAge} years</span>
              </div>
              <input
                type="range"
                min={18}
                max={80}
                value={applicantAge}
                onChange={(e) => setApplicantAge(Number(e.target.value))}
                className="w-full accent-[#156E85] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
                <span>18-35 (0 pts)</span>
                <span>36-50 (10 pts)</span>
                <span>51-65 (25 pts)</span>
                <span>&gt;65 (40 pts)</span>
              </div>
            </div>

            {/* Smoker Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <div className="font-semibold text-[#25252B]">Tobacco / Nicotine Use</div>
                <div className="text-[11px] text-[#5F6368]">Adds 20 rating points if positive</div>
              </div>
              <button
                onClick={() => setIsSmoker(!isSmoker)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  isSmoker
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                {isSmoker ? 'Smoker (+20)' : 'Non-Smoker (0)'}
              </button>
            </div>

            {/* BMI Slider */}
            <div>
              <div className="flex justify-between font-semibold text-[#25252B] mb-1">
                <label>Body Mass Index (BMI):</label>
                <span className="font-mono text-[#156E85] font-bold">{bmi.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={18}
                max={45}
                step={0.5}
                value={bmi}
                onChange={(e) => setBmi(Number(e.target.value))}
                className="w-full accent-[#156E85] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
                <span>&lt;30 (0 pts)</span>
                <span>30-34.9 (+10 pts)</span>
                <span>&gt;=35 (+20 pts, not both)</span>
              </div>
            </div>

            {/* Occupation Class */}
            <div>
              <label className="block font-semibold text-[#25252B] mb-1.5">
                Occupation Risk Classification:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { cls: 1, label: 'Class 1: Sedentary / Office', pts: '0 pts' },
                  { cls: 2, label: 'Class 2: Retail / Non-manual', pts: '0 pts' },
                  { cls: 3, label: 'Class 3: Light Manual', pts: '+10 pts' },
                  { cls: 4, label: 'Class 4: Hazardous / Heavy', pts: '+25 pts' },
                ].map((item) => (
                  <button
                    key={item.cls}
                    onClick={() => setOccupationClass(item.cls as any)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      occupationClass === item.cls
                        ? 'bg-[#24232F] text-white border-[#24232F]'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{item.label}</div>
                    <div className="text-[10px] opacity-80">{item.pts}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Computed Score & Band Result Card */}
          <div className="pt-3 border-t border-[#D8DEE5]">
            <div className="bg-[#24232F] text-white p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    Computed Rating Score
                  </div>
                  <div className="text-2xl font-black text-[#FFE000]">
                    {liveResult.calculatedPoints} <span className="text-xs font-normal text-zinc-300">points</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    Assigned Band
                  </div>
                  <div className="text-2xl font-black text-white flex items-center justify-end space-x-1">
                    <span>Band {liveResult.calculatedBand}</span>
                  </div>
                </div>
              </div>

              {/* Point breakdown line */}
              <div className="grid grid-cols-4 gap-1 text-[10px] text-zinc-300 bg-[#1B1A24] p-2 rounded-lg text-center">
                <div>Age: +{liveResult.pointBreakdown.agePoints}</div>
                <div>Smoker: +{liveResult.pointBreakdown.smokerPoints}</div>
                <div>BMI: +{liveResult.pointBreakdown.bmiPoints}</div>
                <div>Occ: +{liveResult.pointBreakdown.occupationPoints}</div>
              </div>

              {/* Band E Auto-referral notice */}
              {liveResult.isAutoReferred ? (
                <div className="bg-rose-950/80 border border-rose-600/50 p-2 rounded-lg text-[11px] text-rose-200 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Band E Auto-Referral (FR-08):</strong> Extreme risk points ({liveResult.calculatedPoints} &gt;= 60). Automated approval blocked; routed to Senior UW Committee.
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-zinc-400 text-center">
                  Standard underwriting terms applicable for Band {liveResult.calculatedBand}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Existing Underwriting Cases & Override Workflow (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#D8DEE5] shadow-xs p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE5]">
            <div>
              <h3 className="font-bold text-sm text-[#25252B]">Underwriting Case Portfolio</h3>
              <p className="text-xs text-[#5F6368]">
                Inspect live cases and execute reasoned overrides with audit preservation.
              </p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {cases.length} Active Cases
            </span>
          </div>

          {/* Cases List */}
          <div className="space-y-3">
            {cases.map((uwCase) => {
              const isSelected = selectedCase?.businessKey === uwCase.businessKey;

              return (
                <div
                  key={uwCase.businessKey}
                  onClick={() => {
                    setSelectedCase(uwCase);
                    setOverrideBand(uwCase.effectiveBand);
                    setOverrideText(uwCase.overrideReasonText || '');
                    setOverrideFeedback(null);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#156E85] bg-cyan-50/40 shadow-xs ring-1 ring-[#156E85]'
                      : 'border-[#D8DEE5] hover:border-zinc-400 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#25252B]">{uwCase.businessKey}</span>
                        <span className="text-xs text-zinc-500">• {uwCase.applicantName} ({uwCase.applicantAge}y)</span>
                        {uwCase.isOverridden && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            Overridden
                          </span>
                        )}
                        {uwCase.isAutoReferred && !uwCase.isOverridden && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            Referral Required
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5F6368] mt-1">
                        Product: {uwCase.policyProduct} • BMI: {uwCase.bmi} • Occ Class {uwCase.occupationClass}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#5F6368]">
                        Calc: Band <strong>{uwCase.calculatedBand}</strong> ({uwCase.calculatedPoints} pts)
                      </div>
                      <div className="text-sm font-extrabold text-[#25252B]">
                        Effective: <span className="text-[#156E85]">Band {uwCase.effectiveBand}</span>
                      </div>
                    </div>
                  </div>

                  {uwCase.isOverridden && (
                    <div className="mt-2.5 pt-2 border-t border-purple-100 bg-purple-50/60 p-2 rounded-lg text-xs text-purple-900">
                      <div className="font-semibold flex items-center justify-between">
                        <span>Override Reason: {uwCase.overrideReasonCode}</span>
                        <span className="text-[10px] text-purple-700">{uwCase.overriddenBy}</span>
                      </div>
                      <p className="text-[11px] text-purple-800 mt-0.5 italic">
                        "{uwCase.overrideReasonText}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Override Drawer / Modal for Selected Case */}
          {selectedCase && (
            <div className="mt-5 p-4 rounded-xl border border-[#CCD6E0] bg-[#FAFBFD] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE5]">
                <div className="flex items-center space-x-2">
                  <FileEdit className="w-4 h-4 text-[#156E85]" />
                  <h4 className="font-bold text-xs text-[#25252B]">
                    Underwriter Override Console for {selectedCase.businessKey}
                  </h4>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Preserves Original Calc Band {selectedCase.calculatedBand}
                </span>
              </div>

              {!isUnderwriter && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Your active role is <strong>{currentUser.role}</strong>. Only the <strong>underwriter</strong> role may apply overrides. Use the identity switcher in the top bar to test.
                  </span>
                </div>
              )}

              {overrideFeedback && (
                <div className={`p-3 rounded-lg text-xs ${
                  overrideFeedback.includes('successfully')
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {overrideFeedback}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#25252B] mb-1">
                    Select New Effective Band:
                  </label>
                  <select
                    disabled={!isUnderwriter}
                    value={overrideBand}
                    onChange={(e) => setOverrideBand(e.target.value as UnderwritingBand)}
                    className="w-full p-2 rounded-lg border border-[#CCD6E0] bg-white text-xs disabled:opacity-50"
                  >
                    <option value="A">Band A (Standard Terms)</option>
                    <option value="B">Band B (Mild Terms)</option>
                    <option value="C">Band C (Rated + Loading)</option>
                    <option value="D">Band D (Special Terms)</option>
                    <option value="E">Band E (Referral Required)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#25252B] mb-1">
                    Override Justification Code:
                  </label>
                  <select
                    disabled={!isUnderwriter}
                    value={overrideCode}
                    onChange={(e) => setOverrideCode(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-[#CCD6E0] bg-white text-xs disabled:opacity-50"
                  >
                    <option value="MEDICAL_CLEARANCE">MEDICAL_CLEARANCE (Attending Physician Statement)</option>
                    <option value="RESTRICTIVE_POLICY_TERMS">RESTRICTIVE_POLICY_TERMS (Exclusions Added)</option>
                    <option value="SENIOR_COMMITTEE_APPROVAL">SENIOR_COMMITTEE_APPROVAL (Executive Exception)</option>
                    <option value="PREMIUM_LOADING_AGREED">PREMIUM_LOADING_AGREED (Actuarial 35% Surcharge)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#25252B] mb-1 text-xs">
                  Detailed Underwriter Rationale (min 20 characters):
                </label>
                <textarea
                  disabled={!isUnderwriter}
                  rows={2}
                  value={overrideText}
                  onChange={(e) => setOverrideText(e.target.value)}
                  placeholder="Explain why this applicant qualifies for a revised risk band contrary to the deterministic rating..."
                  className="w-full p-2 rounded-lg border border-[#CCD6E0] bg-white text-xs disabled:opacity-50"
                />
                <div className="text-[10px] text-zinc-500 mt-1 flex justify-between">
                  <span>Audit row preserves actor, timestamp &amp; original calculated band</span>
                  <span>{overrideText.trim().length} chars</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  disabled={!isUnderwriter || overrideText.trim().length < 20}
                  onClick={handleApplyOverride}
                  className="py-1.5 px-4 rounded-lg bg-[#24232F] hover:bg-[#343343] text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Save Reasoned Override &amp; Record Audit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
