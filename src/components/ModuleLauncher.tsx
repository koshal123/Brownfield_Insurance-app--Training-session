import React from 'react';
import {
  FileText,
  ClipboardList,
  ShieldAlert,
  Search,
  FolderOpen,
  BookOpenCheck,
  Bug,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ModuleLauncherProps {
  currentUser: UserProfile;
  onSelectModule: (moduleId: string) => void;
}

interface ModuleDef {
  id: string;
  name: string;
  category: string;
  crTag?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  minRoleNotice?: string;
  statusBadge: string;
}

export const ModuleLauncher: React.FC<ModuleLauncherProps> = ({
  currentUser,
  onSelectModule,
}) => {
  const primaryModules: ModuleDef[] = [
    {
      id: 'policies',
      name: 'Policies',
      category: 'Policy Admin',
      crTag: 'CR-203',
      description: 'Renewal feed v2.0 transformation, 100x minor-unit paise scaling fix, and penny reconciliation.',
      icon: FileText,
      statusBadge: 'v2.0 Reconciled',
    },
    {
      id: 'claims',
      name: 'Claims',
      category: 'Claims Operations',
      crTag: 'CR-201',
      description: 'Severity P1-P3 priority queue, Four-Eyes independent review authorization, and atomic audit logging.',
      icon: ClipboardList,
      statusBadge: 'P1-P3 Ordered',
    },
    {
      id: 'underwriting',
      name: 'Underwriting',
      category: 'Risk Assessment',
      crTag: 'CR-202',
      description: 'Deterministic risk bands A-E, age/smoker/BMI/occupation scoring, Band E referral, and overrides.',
      icon: ShieldAlert,
      statusBadge: 'Bands A-E Active',
    },
    {
      id: 'fraud',
      name: 'Fraud',
      category: 'Special Investigation (SIU)',
      description: 'Referral inspection, risk score 85 unified boundary triage, and cross-claim pattern analysis.',
      icon: Search,
      statusBadge: 'SIU Active',
    },
    {
      id: 'documents',
      name: 'Documents',
      category: 'Document Management',
      description: 'Secure document vault with OCR confidence telemetry and strict read-only RBAC protection.',
      icon: FolderOpen,
      statusBadge: 'RBAC Locked',
    },
  ];

  const specModules: ModuleDef[] = [
    {
      id: 'prd',
      name: 'Deployable PRD Spec',
      category: 'Specification & Gap Closure Hub',
      description: 'Complete 100% gap-closed authoritative PRD v1.0. All 38 TBDs resolved with formulas, APIs & schemas.',
      icon: BookOpenCheck,
      statusBadge: '100% Gaps Closed',
    },
    {
      id: 'incidents',
      name: 'Incident Bug Lab',
      category: 'Regression & Defect Verification',
      description: 'Interactive verification tests for INC-1041 through INC-1048 (SQL injection, 100x scaling, N+1 fix).',
      icon: Bug,
      statusBadge: '8/8 Bugs Verified',
    },
  ];

  return (
    <div className="w-full bg-[#FFFFFF] py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section 1: Core Operations Modules (VREF-01 Clean Launcher Row) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#25252B] tracking-tight uppercase">
                Core Insurance Modules
              </h2>
              <p className="text-xs text-[#5F6368]">
                Standard Contoso module launcher based on VREF-01 layout with dark square tiles and yellow domain glyphs.
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              Layout: VREF-01 Clean
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {primaryModules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => onSelectModule(mod.id)}
                  className="group flex flex-col items-center text-center p-4 rounded-xl border border-transparent hover:border-[#D8DEE5] hover:bg-[#F9FAFB] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#156E85]"
                >
                  {/* Square Dark Tile with Yellow Icon */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#24232F] group-hover:bg-[#2C2B3A] group-hover:scale-105 transition-all shadow-md flex items-center justify-center relative mb-3">
                    <IconComp className="w-9 h-9 text-[#FFE000] stroke-[2]" />
                    {mod.crTag && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#FFE000] text-[#24232F] text-[9px] font-black px-1.5 py-0.2 rounded shadow">
                        {mod.crTag}
                      </span>
                    )}
                  </div>

                  {/* Title and Category */}
                  <span className="font-bold text-sm text-[#25252B] group-hover:text-[#156E85] transition-colors">
                    {mod.name}
                  </span>
                  <span className="text-[11px] text-[#5F6368] mt-0.5 font-medium line-clamp-1">
                    {mod.category}
                  </span>

                  {/* Badge */}
                  <span className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {mod.statusBadge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Deep Spec & Bug Fix Verification Suites */}
        <div className="pt-6 border-t border-[#D8DEE5]">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#25252B] tracking-tight uppercase">
              PRD Gap Closure &amp; Engineering Verification Suites
            </h2>
            <p className="text-xs text-[#5F6368]">
              Authoritative documentation and interactive simulation tooling proving that every gap is closed and all bugs are resolved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specModules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => onSelectModule(mod.id)}
                  className="group p-5 rounded-2xl border border-[#D8DEE5] hover:border-[#156E85] hover:shadow-md transition-all cursor-pointer bg-white flex items-start space-x-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#24232F] flex-shrink-0 flex items-center justify-center group-hover:bg-[#2C2B3A] transition-colors shadow">
                    <IconComp className="w-7 h-7 text-[#FFE000]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#25252B] group-hover:text-[#156E85] transition-colors flex items-center space-x-2">
                        <span>{mod.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {mod.statusBadge}
                        </span>
                      </h3>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#156E85] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-[#5F6368] mt-1.5 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Live Role Guidance Banner */}
        <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-[#25252B]">
                Active Persona: {currentUser.name} ({currentUser.role})
              </div>
              <div className="text-[#5F6368]">
                {currentUser.role === 'claims-reviewer' && 'Authorized for independent claim review. Four-Eyes check prevents deciding assigned claims.'}
                {currentUser.role === 'claims-handler' && 'Authorized to triage claims. Independent decision controls are hidden/locked.'}
                {currentUser.role === 'underwriter' && 'Authorized to calculate underwriting bands and execute reasoned overrides with audit trail.'}
                {currentUser.role === 'siu-investigator' && 'Authorized to inspect fraud referrals, Score 85 signals, and claim cross-references.'}
                {currentUser.role === 'viewer' && 'Read-only access. Write endpoints and approval buttons are strictly disabled.'}
                {currentUser.role === 'auditor' && 'Authorized to inspect complete audit logs, reconciliation hashes, and compliance exports.'}
                {currentUser.role === 'ops-admin' && 'Operational authority across ETL batches, queue oversight, and incident testing.'}
              </div>
            </div>
          </div>
          <span className="text-zinc-500 font-mono text-[11px] self-end sm:self-center">
            User ID: {currentUser.id}
          </span>
        </div>
      </div>
    </div>
  );
};
