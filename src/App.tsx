/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_USERS,
  INITIAL_CLAIMS,
  INITIAL_UNDERWRITING_CASES,
  INITIAL_DOCUMENTS,
  INITIAL_FRAUD_SIGNALS,
} from './data/mockData';
import {
  UserProfile,
  Claim,
  UnderwritingCase,
  AuditRecord,
  ReviewDecisionPayload,
} from './types';
import { validateReviewAction } from './utils/rulesEngine';
import { Header } from './components/Header';
import { WelcomeBand } from './components/WelcomeBand';
import { ModuleLauncher } from './components/ModuleLauncher';
import { ClaimsModule } from './components/claims/ClaimsModule';
import { UnderwritingModule } from './components/underwriting/UnderwritingModule';
import { PoliciesModule } from './components/policies/PoliciesModule';
import { FraudModule } from './components/fraud/FraudModule';
import { DocumentsModule } from './components/documents/DocumentsModule';
import { PrdViewerModule } from './components/prd/PrdViewerModule';
import { IncidentLabModule } from './components/incidents/IncidentLabModule';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // Vikram Sen (claims-reviewer)
  const [activeModule, setActiveModule] = useState<string>('home');
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [underwritingCases, setUnderwritingCases] = useState<UnderwritingCase[]>(INITIAL_UNDERWRITING_CASES);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    {
      id: 'AUD-INIT-01',
      businessKey: 'CLM-2026-8790',
      oldStatus: 'REVIEW',
      newStatus: 'APPROVED',
      actorId: 'USR-REV-01',
      actorRole: 'claims-reviewer',
      utcTimestamp: '2026-10-06T14:32:00Z',
      correlationId: 'CORR-SYS-INIT',
      decision: 'APPROVE',
    },
  ]);

  // Handle Review Decision Commit (CR-201 Section 8 & 9)
  const handleCommitDecision = (
    payload: ReviewDecisionPayload
  ): { success: boolean; error?: string; errorCode?: string } => {
    const claim = claims.find((c) => c.businessKey === payload.businessKey);
    if (!claim) {
      return { success: false, error: 'Claim not found (404)', errorCode: 'NOT_FOUND_404' };
    }

    // Server-side / Engine Validation Gate
    const validation = validateReviewAction(claim, currentUser, payload);
    if (!validation.allowed) {
      return { success: false, error: validation.error, errorCode: validation.errorCode };
    }

    // Atomic State Mutation & Audit Insertion
    const newStatus = payload.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updatedClaim: Claim = {
      ...claim,
      status: newStatus,
      reviewedBy: currentUser.name,
      reviewedAt: new Date().toISOString(),
      rejectionReasonCode: payload.rejectionReasonCode,
      rejectionReasonText: payload.rejectionReasonText,
      version: claim.version + 1,
    };

    const newAuditRecord: AuditRecord = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessKey: claim.businessKey,
      oldStatus: claim.status,
      newStatus,
      actorId: currentUser.id,
      actorRole: currentUser.role,
      utcTimestamp: new Date().toISOString(),
      correlationId: payload.correlationId,
      decision: payload.decision,
      rejectionReasonCode: payload.rejectionReasonCode,
      rejectionReasonText: payload.rejectionReasonText,
    };

    setClaims((prev) =>
      prev.map((c) => (c.businessKey === claim.businessKey ? updatedClaim : c))
    );
    setAuditLogs((prev) => [newAuditRecord, ...prev]);

    return { success: true };
  };

  // Handle Underwriting Case Update (CR-202)
  const handleUpdateCase = (updated: UnderwritingCase) => {
    setUnderwritingCases((prev) =>
      prev.map((c) => (c.businessKey === updated.businessKey ? updated : c))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-[#25252B]">
      {/* VREF-01 Charcoal Header with Yellow glyphs */}
      <Header
        currentUser={currentUser}
        users={INITIAL_USERS}
        onSelectUser={setCurrentUser}
        onGoHome={() => setActiveModule('home')}
        activeModule={activeModule}
      />

      {/* VREF-01 Pale cyan/blue Welcome Band */}
      <WelcomeBand
        currentUser={currentUser}
        activeModule={activeModule}
        onGoHome={() => setActiveModule('home')}
        onOpenPrd={() => setActiveModule('prd')}
      />

      {/* Workspace Area */}
      <main className="flex-1">
        {activeModule === 'home' && (
          <ModuleLauncher
            currentUser={currentUser}
            onSelectModule={setActiveModule}
          />
        )}

        {activeModule === 'claims' && (
          <ClaimsModule
            claims={claims}
            currentUser={currentUser}
            auditLogs={auditLogs}
            onCommitDecision={handleCommitDecision}
          />
        )}

        {activeModule === 'underwriting' && (
          <UnderwritingModule
            cases={underwritingCases}
            currentUser={currentUser}
            onUpdateCase={handleUpdateCase}
          />
        )}

        {activeModule === 'policies' && (
          <PoliciesModule
            policies={[]}
            currentUser={currentUser}
          />
        )}

        {activeModule === 'fraud' && (
          <FraudModule
            signals={INITIAL_FRAUD_SIGNALS}
            currentUser={currentUser}
          />
        )}

        {activeModule === 'documents' && (
          <DocumentsModule
            documents={INITIAL_DOCUMENTS}
            currentUser={currentUser}
          />
        )}

        {activeModule === 'prd' && (
          <PrdViewerModule />
        )}

        {activeModule === 'incidents' && (
          <IncidentLabModule />
        )}
      </main>

      {/* Compact Standard Footer */}
      <footer className="w-full bg-[#24232F] text-zinc-400 py-4 px-4 sm:px-6 lg:px-8 border-t border-[#363544] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-200">Contoso General Insurance</span>
            <span>•</span>
            <span>Core Operations Console</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Deployable PRD v1.0 Release Compliant</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-zinc-400">
            <span>Anchor Date: 2026-10-27</span>
            <span>•</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>Four-Eyes Guard: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
