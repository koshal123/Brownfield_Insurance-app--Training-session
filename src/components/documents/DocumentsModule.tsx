import React, { useState } from 'react';
import { DocumentRecord, UserProfile } from '../../types';
import { FolderOpen, FileCheck, Lock, AlertCircle, ShieldCheck, Eye, CheckCircle2 } from 'lucide-react';

interface DocumentsModuleProps {
  documents: DocumentRecord[];
  currentUser: UserProfile;
}

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({ documents, currentUser }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const canMutate = currentUser.role === 'claims-handler' || currentUser.role === 'claims-reviewer' || currentUser.role === 'ops-admin';

  const handleAttemptMutation = (doc: DocumentRecord) => {
    if (!canMutate) {
      setFeedback(`INC-1045 Security Guard Blocked: Role '${currentUser.role}' is strictly READ-ONLY. Document mutation (PUT/PATCH/DELETE) rejected with HTTP 403 Forbidden.`);
    } else {
      setFeedback(`Authorized: Role '${currentUser.role}' holds write permissions to verify document ${doc.id}.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#D8DEE5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-[#25252B]">
              Document Vault &amp; Evidence Repository
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              INC-1045 RBAC Enforced
            </span>
          </div>
          <p className="text-xs text-[#5F6368] mt-1">
            Read-only enforcement for viewer roles. OCR confidence validation telemetry recorded for evidentiary integrity.
          </p>
        </div>

        <div className="text-xs flex items-center space-x-2">
          <span className="text-zinc-500">Access Mode:</span>
          {canMutate ? (
            <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Read &amp; Verify
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-700 font-bold">
              <Lock className="w-3.5 h-3.5 mr-1" /> Strict Read-Only ({currentUser.role})
            </span>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-start space-x-2 ${
          feedback.includes('Blocked')
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          {feedback.includes('Blocked') ? (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{feedback}</span>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-[#D8DEE5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#D8DEE5] bg-[#FAFBFD] flex items-center justify-between">
          <h3 className="font-bold text-xs text-[#25252B]">Attached Claim Evidence Records</h3>
          <span className="text-xs text-zinc-500 font-mono">{documents.length} Evidence Artifacts</span>
        </div>

        <div className="divide-y divide-[#EAEFF4] text-xs">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#25252B]">{doc.fileName}</span>
                  <span className="text-zinc-500 font-mono">• {doc.claimRef}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[10px]">
                    {doc.docType}
                  </span>
                </div>
                <div className="text-[#5F6368] text-[11px] flex items-center space-x-3">
                  <span>{doc.pages} Pages</span>
                  <span>•</span>
                  <span>OCR Confidence: <strong className="text-emerald-700">{doc.ocrConfidence}%</strong></span>
                  <span>•</span>
                  <span>Uploaded: {doc.uploadedAt}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={() => setFeedback(`Viewing artifact ${doc.fileName} in read-only sandbox preview mode.`)}
                  className="px-3 py-1.5 rounded-lg border border-[#CCD6E0] hover:bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => handleAttemptMutation(doc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                    canMutate
                      ? 'bg-[#24232F] hover:bg-[#343343] text-white'
                      : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300'
                  }`}
                  title={canMutate ? 'Verify document' : 'Test INC-1045 role block'}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{canMutate ? 'Verify Document' : 'Attempt Status Edit (RBAC Test)'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
