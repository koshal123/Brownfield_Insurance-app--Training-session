import React from 'react';
import { Home, ShieldCheck, UserCheck, ChevronDown, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onGoHome: () => void;
  activeModule: string;
}

const ROLE_BADGE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  'viewer': { bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' },
  'claims-handler': { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-700' },
  'claims-reviewer': { bg: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-600' },
  'underwriter': { bg: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-700' },
  'siu-investigator': { bg: 'bg-purple-950', text: 'text-purple-300', border: 'border-purple-700' },
  'auditor': { bg: 'bg-indigo-950', text: 'text-indigo-300', border: 'border-indigo-700' },
  'ops-admin': { bg: 'bg-rose-950', text: 'text-rose-300', border: 'border-rose-700' },
};

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  onGoHome,
  activeModule,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const badgeStyle = ROLE_BADGE_COLORS[currentUser.role] || ROLE_BADGE_COLORS.viewer;

  return (
    <header className="w-full bg-[#24232F] text-white border-b border-[#363544] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Home Icon & Approved Contoso Brand Mark */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onGoHome}
            aria-label="Return to module launcher"
            title="Return to module launcher"
            className="p-2 rounded-lg bg-[#2E2D3B] hover:bg-[#3B3A4A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFE000] text-[#FFE000] flex items-center justify-center cursor-pointer"
          >
            <Home className="w-5 h-5 fill-[#FFE000]/20 stroke-[#FFE000]" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#FFE000] flex items-center justify-center text-[#24232F] font-black text-sm tracking-tighter">
              CGI
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide text-white">CONTOSO GENERAL INSURANCE</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PRD v1.0 Deployable
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal leading-tight">
                Operations Platform • CR-201 • CR-202 • CR-203
              </p>
            </div>
          </div>
        </div>

        {/* Center: Four-Eyes Principle & SLA Status */}
        <div className="hidden lg:flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#2C2B38] text-zinc-300 border border-[#3D3C4C]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFE000]" />
            <span>Four-Eyes Guard: <strong className="text-white">Active</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#2C2B38] text-zinc-300 border border-[#3D3C4C]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SLA Standard: <strong className="text-white">p95 &lt; 350ms</strong></span>
          </div>
        </div>

        {/* Right: Active Identity & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 bg-[#2E2D3B] hover:bg-[#383749] px-3 py-1.5 rounded-lg border border-[#3E3D4F] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFE000]"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFE000] text-[#24232F] flex items-center justify-center font-bold text-xs shadow-inner">
              {currentUser.avatarInitials}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Role switcher dropdown modal */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#1E1D27] border border-[#3A394B] shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#2C2B3A]">
                <p className="font-semibold text-zinc-200">Switch Operational Persona</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Test Four-Eyes security, role gates, and decision permissions:
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto py-1 divide-y divide-[#2C2B3A]/40">
                {users.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  const uBadge = ROLE_BADGE_COLORS[u.role];
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#2C2B3A] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#282736]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-700 text-zinc-200 flex items-center justify-center text-[11px] font-bold">
                          {u.avatarInitials}
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isSelected && <span className="text-[10px] text-[#FFE000]">● Active</span>}
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-block mt-0.5 ${uBadge.bg} ${uBadge.text} ${uBadge.border}`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-[#FFE000]" />}
                    </button>
                  );
                })}
              </div>

              <div className="px-3 py-2 bg-[#17161F] border-t border-[#2C2B3A] text-[10px] text-zinc-400">
                Tip: Switch to <strong>Ananya Roy</strong> (Reviewer) to test reviewing her assigned claim and see Four-Eyes enforcement in action.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
