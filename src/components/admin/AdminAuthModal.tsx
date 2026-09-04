import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Sparkles, CheckCircle2, AlertCircle, X, ShieldAlert, Timer } from 'lucide-react';
import { adminStore, playStudioChime } from '../../services/adminStore';
import { getLockoutStatus } from '../../services/security';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutSec, setLockoutSec] = useState<number>(0);

  // Check lockout on open & ticker
  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(false);
      setErrorMessage('');
      setIsSuccess(false);
      setIsVerifying(false);
      return;
    }

    const status = getLockoutStatus();
    setLockoutSec(status.remainingSeconds);

    const interval = setInterval(() => {
      const current = getLockoutStatus();
      setLockoutSec(current.remainingSeconds);
      if (!current.isLocked && lockoutSec > 0) {
        setErrorMessage('');
        setError(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Keyboard input listener
  useEffect(() => {
    if (!isOpen || lockoutSec > 0 || isVerifying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, pin, lockoutSec, isVerifying]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4 && !isSuccess && !isVerifying && lockoutSec === 0) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      setErrorMessage('');
      playStudioChime('click');

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isSuccess && !isVerifying && lockoutSec === 0) {
      setPin(pin.slice(0, -1));
      setError(false);
      setErrorMessage('');
      playStudioChime('click');
    }
  };

  const verifyPin = async (enteredPin: string) => {
    setIsVerifying(true);
    try {
      const isValid = await adminStore.validateOwnerPin(enteredPin);
      if (isValid) {
        setIsSuccess(true);
        setError(false);
        setErrorMessage('');
        playStudioChime('success');
        setTimeout(() => {
          setIsSuccess(false);
          setIsVerifying(false);
          setPin('');
          onAuthenticated();
        }, 450);
      } else {
        const lockout = getLockoutStatus();
        setError(true);
        playStudioChime('alert');

        if (lockout.isLocked) {
          setLockoutSec(lockout.remainingSeconds);
          setErrorMessage(`Security quarantine active: Try again in ${lockout.remainingSeconds}s`);
        } else {
          const attemptsLeft = Math.max(1, 3 - (lockout.attemptCount % 3));
          setErrorMessage(`Incorrect passcode (${lockout.attemptCount} failed attempt${lockout.attemptCount > 1 ? 's' : ''})`);
        }

        setTimeout(() => {
          setPin('');
          setIsVerifying(false);
        }, 600);
      }
    } catch {
      setIsVerifying(false);
    }
  };

  const isLocked = lockoutSec > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Frosted Backdrop with Noise Grain */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="frosted-backdrop"
          />

          {/* Dialog Container with Frosted Glass and Noise Grain */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto frosted-modal-glass rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.18),0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] text-[#202526] z-10 font-sans-clean"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#71717A] hover:text-[#202526] hover:bg-black/[0.05] transition-all z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ambient Lighting */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#D8A9A8]/20 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#CBDCDE]/30 blur-[90px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="text-center mb-7 relative z-10">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-3.5 transition-all duration-300 ${
                isLocked 
                  ? 'bg-rose-50 border-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                  : isSuccess
                  ? 'bg-emerald-50 border-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                  : 'bg-white border-[#E5E7EB] shadow-md'
              }`}>
                {isSuccess ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
                ) : isLocked ? (
                  <ShieldAlert className="w-7 h-7 text-rose-500 animate-pulse" />
                ) : (
                  <Shield className="w-7 h-7 text-[#D8A9A8]" />
                )}
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-label-small uppercase tracking-[0.12em] text-[#202526] font-medium bg-white/90 border border-[#E5E7EB] mb-2.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
                Owner Security Clearance
              </div>
              <h3 className="font-bezoria font-normal text-2xl sm:text-3xl uppercase tracking-wider text-[#202526]">
                Studio Owner Portal
              </h3>
              <p className="text-xs sm:text-[13px] text-[#596769] mt-1.5 max-w-xs mx-auto leading-relaxed">
                {isLocked
                  ? 'Access quarantined due to repeated incorrect passcode attempts.'
                  : 'Enter your 4-digit PIN to authenticate administrative privileges.'}
              </p>
            </div>

            {/* Lockout Countdown Banner */}
            {isLocked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center gap-3 text-rose-700 font-sans-clean text-sm shadow-sm"
              >
                <Timer className="w-5 h-5 text-rose-500 animate-spin" style={{ animationDuration: '3s' }} />
                <span>Quarantined for <strong className="text-[#202526] text-base font-strong font-normal">{lockoutSec}s</strong></span>
              </motion.div>
            ) : (
              /* PIN Indicator Dots */
              <div className="flex items-center justify-center gap-3.5 mb-5 relative z-10">
                {[0, 1, 2, 3].map((index) => {
                  const filled = pin.length > index;
                  return (
                    <motion.div
                      key={index}
                      animate={{
                        scale: filled ? [1, 1.2, 1] : 1,
                        backgroundColor: error
                          ? '#ef4444'
                          : isSuccess
                          ? '#10b981'
                          : filled
                          ? '#D8A9A8'
                          : 'rgba(0, 0, 0, 0.04)',
                      }}
                      className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                        filled
                          ? 'border-[#D8A9A8] shadow-[0_0_14px_rgba(216,169,168,0.8)]'
                          : 'border-[#E5E7EB]'
                      }`}
                    />
                  );
                })}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && !isLocked && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs text-rose-600 mb-4 font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Keypad */}
            <div className={`grid grid-cols-3 gap-3 max-w-[290px] mx-auto mb-6 relative z-10 transition-opacity ${
              isLocked ? 'opacity-30 pointer-events-none' : 'opacity-100'
            }`}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => {
                const isAction = key === 'C' || key === '⌫';
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isLocked || isVerifying}
                    onClick={() => {
                      if (key === 'C') {
                        setPin('');
                        setError(false);
                        setErrorMessage('');
                      } else if (key === '⌫') {
                        handleDelete();
                      } else {
                        handleDigit(key);
                      }
                    }}
                    className={`h-13 rounded-2xl flex items-center justify-center text-lg transition-all duration-200 cursor-pointer select-none ${
                      isAction
                        ? 'bg-black/[0.03] text-[#71717A] hover:bg-black/[0.07] hover:text-[#202526] border border-[#E5E7EB] active:scale-95 text-xs font-label-small uppercase tracking-widest'
                        : 'bg-white text-[#202526] hover:bg-[#F3F4F6] hover:border-[#D8A9A8] border border-[#E5E7EB] active:scale-95 shadow-sm hover:shadow-md font-strong'
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="pt-3.5 border-t border-[#E5E7EB] text-center relative z-10">
              <p className="text-xs text-[#71717A] font-label-small flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#D8A9A8]" />
                <span>Protected by SHA-256 Authentication &amp; Rate-Limiting</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
