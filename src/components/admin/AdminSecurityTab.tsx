import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
  History,
  Trash2,
  Check,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Info,
} from 'lucide-react';
import {
  getAuditLogs,
  clearAuditLogs,
  updateOwnerPasscode,
  SecurityAuditLog,
  terminateSession,
} from '../../services/security';
import { playStudioChime } from '../../services/adminStore';

interface AdminSecurityTabProps {
  onLockSession: () => void;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({ onLockSession }) => {
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    refreshLogs();
  }, []);

  const refreshLogs = () => {
    setLogs(getAuditLogs());
  };

  const handleClearLogs = () => {
    if (window.confirm('Clear all security audit logs from local storage?')) {
      clearAuditLogs();
      refreshLogs();
      playStudioChime('click');
    }
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPin) {
      setStatusMessage({ text: 'Please enter your current passcode.', type: 'error' });
      playStudioChime('alert');
      return;
    }

    if (!newPin || newPin.length < 4) {
      setStatusMessage({ text: 'New passcode must be at least 4 digits.', type: 'error' });
      playStudioChime('alert');
      return;
    }

    if (newPin !== confirmPin) {
      setStatusMessage({ text: 'New passcodes do not match.', type: 'error' });
      playStudioChime('alert');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateOwnerPasscode(currentPin, newPin);
      if (result.success) {
        setStatusMessage({ text: 'Owner passcode successfully updated and hashed (SHA-256).', type: 'success' });
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        refreshLogs();
        playStudioChime('success');
      } else {
        setStatusMessage({ text: result.message, type: 'error' });
        playStudioChime('alert');
      }
    } catch {
      setStatusMessage({ text: 'An error occurred while updating passcode.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLockNow = () => {
    terminateSession();
    playStudioChime('click');
    onLockSession();
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans-clean">
      {/* Top Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Hashing Status */}
        <div className="p-6 rounded-[28px] border border-[#E5E7EB] relative overflow-hidden bg-white/85 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-strong text-[#202526] text-base">SHA-256 Crypto</h3>
              <p className="text-xs text-emerald-600 font-label-small uppercase tracking-wider">Salted Hash Active</p>
            </div>
          </div>
          <p className="text-xs text-[#596769] leading-relaxed">
            Passcodes are never stored or transmitted in plain text. Hashed client-side with salted WebCrypto SHA-256.
          </p>
        </div>

        {/* Card 2: Brute-Force Shield */}
        <div className="p-6 rounded-[28px] border border-[#E5E7EB] relative overflow-hidden bg-white/85 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D8A9A8]/20 border border-[#D8A9A8] flex items-center justify-center text-[#202526]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-strong text-[#202526] text-base">Brute-Force Shield</h3>
              <p className="text-xs text-[#D8A9A8] font-label-small uppercase tracking-wider font-medium">3-Tier Progressive Lockout</p>
            </div>
          </div>
          <p className="text-xs text-[#596769] leading-relaxed">
            Automatic exponential rate-limiting (30s at 3 attempts, 3m at 5 attempts, 15m quarantine at 8 attempts).
          </p>
        </div>

        {/* Card 3: Session Security */}
        <div className="p-6 rounded-[28px] border border-[#E5E7EB] relative overflow-hidden bg-white/85 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] border border-[#E5E7EB] flex items-center justify-center text-[#202526]">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-strong text-[#202526] text-base">Active Session</h3>
              <p className="text-xs text-[#596769] font-label-small uppercase tracking-wider">Auto-Lock Protection</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1">
            <span className="text-xs text-[#596769]">Sign out &amp; lock CMS:</span>
            <button
              type="button"
              onClick={handleLockNow}
              className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-btn uppercase tracking-wider border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Row: Update Passcode + Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Update Passcode Form (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-[32px] border border-[#E5E7EB] bg-white/85 backdrop-blur-2xl h-fit shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E7EB]">
            <div className="w-10 h-10 rounded-2xl bg-[#D8A9A8]/20 border border-[#D8A9A8] flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#202526]" />
            </div>
            <div>
              <h2 className="text-xl font-elegant font-normal text-[#202526]">Update Owner Passcode</h2>
              <p className="text-xs text-[#596769]">Change your secret owner authentication PIN</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePasscode} className="space-y-4 font-sans-clean">
            <div>
              <label className="block text-xs uppercase font-label-small tracking-wider text-[#596769] mb-1.5">
                Current Passcode:
              </label>
              <input
                type="password"
                maxLength={8}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="Enter current PIN"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#202526] font-mono text-sm tracking-wider focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-label-small tracking-wider text-[#596769] mb-1.5">
                New Passcode (4-8 Digits):
              </label>
              <input
                type="password"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new PIN"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#202526] font-mono text-sm tracking-wider focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-label-small tracking-wider text-[#596769] mb-1.5">
                Confirm New Passcode:
              </label>
              <input
                type="password"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm new PIN"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#202526] font-mono text-sm tracking-wider focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
              />
            </div>

            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-label-small uppercase tracking-wider flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white font-btn font-medium text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isUpdating ? 'Encrypting & Saving...' : 'Save New Passcode'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-start gap-2 text-xs text-[#596769] font-sans-clean">
            <Info className="w-4 h-4 text-[#D8A9A8] shrink-0 mt-0.5" />
            <span>Passcodes are hashed with SHA-256 and salted. Never share your passcode.</span>
          </div>
        </div>

        {/* Right Column: Security Audit Logs (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-[32px] border border-[#E5E7EB] bg-white/85 backdrop-blur-2xl flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black/[0.04] border border-[#E5E7EB] flex items-center justify-center">
                <History className="w-5 h-5 text-[#202526]" />
              </div>
              <div>
                <h2 className="text-xl font-elegant font-normal text-[#202526]">Security Audit Trail</h2>
                <p className="text-xs text-[#596769]">Real-time log of authentication &amp; security events</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshLogs}
                className="p-2.5 rounded-xl bg-black/[0.03] hover:bg-black/[0.07] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] transition-colors cursor-pointer"
                title="Refresh Logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                  title="Clear Audit Logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Logs List */}
          {logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-[#596769]">
              <Shield className="w-10 h-10 mb-3 opacity-30 text-[#596769]" />
              <p className="text-sm font-strong text-[#202526]">No Security Incidents</p>
              <p className="text-xs mt-1">Authentication and security events will be logged here.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 font-sans-clean">
              {logs.map((log) => {
                const isCritical = log.severity === 'critical';
                const isWarning = log.severity === 'warning';
                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                      isCritical
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : isWarning
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#202526]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isCritical ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-label-small tracking-wider font-medium ${
                              isCritical
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : isWarning
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {log.event}
                          </span>
                        </div>
                        <p className="mt-1 text-[#202526] text-xs leading-relaxed">{log.details}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#596769] font-strong shrink-0">{log.dateString}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
