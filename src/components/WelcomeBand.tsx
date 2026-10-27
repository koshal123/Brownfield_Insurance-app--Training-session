import React from 'react';
import { ArrowLeft, Sparkles, Shield, Clock, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';

interface WelcomeBandProps {
  currentUser: UserProfile;
  activeModule: string;
  onGoHome: () => void;
  onOpenPrd: () => void;
}

export const WelcomeBand: React.FC<WelcomeBandProps> = ({
  currentUser,
  activeModule,
  onGoHome,
  onOpenPrd,
}) => {
  const isHome = activeModule === 'home';

  return (
    <div className="w-full bg-gradient-to-r from-[#E0F7FA] via-[#E8F5FD] to-[#DDEFFC] border-b border-[#D8DEE5] py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Greeting or Back navigation */}
        <div>
          {isHome ? (
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#25252B] tracking-tight">
                  Welcome back, {currentUser.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-700/10 text-cyan-800 border border-cyan-800/20">
                  <Sparkles className="w-3 h-3 mr-1 text-cyan-700" /> Operational Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5F6368] mt-0.5">
                Select an operational workspace below. All Change Requests (CR-201, CR-202, CR-203) are fully specified and live.
              </p>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={onGoHome}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#60666D] hover:bg-[#4E545B] text-white text-xs font-medium transition-colors shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#156E85]"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Return to Launcher
              </button>
              <div>
                <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider">
                  Contoso Operations Console
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-[#25252B] tracking-tight">
                  {activeModule === 'claims' && 'Claims Priority Routing & Four-Eyes Review (CR-201)'}
                  {activeModule === 'underwriting' && 'Underwriting Risk Bands & Overrides (CR-202)'}
                  {activeModule === 'policies' && 'Policy Renewal Feed ETL & Money Scaling (CR-203)'}
                  {activeModule === 'fraud' && 'SIU Fraud Investigation & Risk Score 85 Referral'}
                  {activeModule === 'documents' && 'Document Vault & Read-Only RBAC Lockdown (INC-1045)'}
                  {activeModule === 'prd' && '100% Deployable PRD Specification & Gap Closure Hub'}
                  {activeModule === 'incidents' && 'Incident Bug Fix Sandbox & Regression Suite (INC-1041 to INC-1048)'}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Spec Anchors & Status Highlights */}
        <div className="flex items-center space-x-2.5 text-xs">
          <button
            onClick={onOpenPrd}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#25252B] border border-[#CCD6E0] shadow-xs font-medium cursor-pointer transition-all hover:border-[#156E85]"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#156E85]" />
            <span>Deployable PRD Spec</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              100% Ready
            </span>
          </button>

          <div className="hidden sm:flex items-center space-x-2 bg-white/80 px-2.5 py-1.5 rounded-lg border border-[#CCD6E0] text-[11px] text-[#5F6368]">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role: <strong className="text-[#25252B]">{currentUser.role}</strong></span>
          </div>

          <div className="hidden md:flex items-center space-x-1 bg-white/80 px-2.5 py-1.5 rounded-lg border border-[#CCD6E0] text-[11px] text-[#5F6368]">
            <Clock className="w-3.5 h-3.5 text-cyan-700" />
            <span>2026-10-27</span>
          </div>
        </div>
      </div>
    </div>
  );
};
