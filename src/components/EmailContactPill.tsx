/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Mail, Check, Copy, ExternalLink, ArrowUpRight, Inbox } from 'lucide-react';
const DEFAULT_STUDIO_EMAIL = 'aibuild1629@gmail.com';

function cleanContactEmail(email?: string | null): string {
  if (!email || typeof email !== 'string') return DEFAULT_STUDIO_EMAIL;
  const clean = email.trim().toLowerCase();
  if (
    clean.includes('garv@aibuild.studio') ||
    clean.includes('aibuild.studio') ||
    clean.includes('garv@') ||
    clean.includes('aibuld') ||
    clean.includes('2026') ||
    !clean.includes('@')
  ) {
    return DEFAULT_STUDIO_EMAIL;
  }
  return email.trim();
}

interface EmailContactPillProps {
  email?: string;
  className?: string;
  variant?: 'hero' | 'footer' | 'modal';
}

export const EmailContactPill: React.FC<EmailContactPillProps> = ({
  email,
  className = '',
  variant = 'hero',
}) => {
  const targetEmail = cleanContactEmail(email);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const subject = encodeURIComponent('Inquiry for AI Build Studio');
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    targetEmail
  )}&su=${subject}`;
  const mailtoUrl = `mailto:${targetEmail}?subject=${subject}`;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToastMessage(null);
      setCopied(false);
    }, 2800);
  };

  const copyEmailToClipboard = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetEmail);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = targetEmail;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      triggerToast('Copied email to clipboard! ✓');
    } catch (err) {
      console.warn('Failed to copy email:', err);
      triggerToast('Copied: aibuild1629@gmail.com');
    }
  };

  const handleMainEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If mobile device, let mailto launch the phone's native mail app directly
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (isMobile) {
      e.preventDefault();
      window.location.href = mailtoUrl;
      triggerToast('Opening Mail App...');
      return;
    }

    // On desktop, the anchor default action will open Gmail web compose in a new tab.
    // Also copy to clipboard for convenience
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(targetEmail);
      }
    } catch (err) {}

    triggerToast('Opening Gmail Mailbox... ✉️');
  };

  const handleNativeMailtoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    triggerToast('Opening Default Mail App...');
  };

  const isHero = variant === 'hero';

  return (
    <div className={`relative inline-flex flex-col items-center z-30 ${className}`}>
      {/* Toast Notification badge */}
      {toastMessage && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-2xs font-mono font-medium shadow-lg backdrop-blur-sm animate-fade-in pointer-events-none z-40 border border-emerald-400/40">
          {toastMessage}
        </div>
      )}

      {/* Main Interactive Capsule */}
      <div className="inline-flex items-center rounded-full liquid-glass-pill transition-all duration-200 border border-white/20 hover:border-sky-400/60 shadow-lg bg-black/40 hover:bg-black/60 group">
        {/* 1. Main Clickable Mail ID: Opens the Mailbox directly */}
        <a
          href={gmailComposeUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleMainEmailClick}
          className="inline-flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 text-white/90 hover:text-white cursor-pointer select-none rounded-l-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors"
          title={`Click to open mailbox and email ${targetEmail}`}
          aria-label={`Open mailbox to email ${targetEmail}`}
        >
          <Mail className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
          <span
            className={`font-mono tracking-wide font-medium ${
              isHero ? 'text-2xs sm:text-xs' : 'text-xs'
            }`}
          >
            {targetEmail}
          </span>
          <span className="text-2xs text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" title="Opens mailbox in new tab">
            ↗
          </span>
        </a>

        {/* Vertical divider */}
        <div className="w-[1px] h-3.5 bg-white/20 self-center" />

        {/* 2. Direct Mail Client App (mailto:) icon */}
        <a
          href={mailtoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleNativeMailtoClick}
          className="p-1.5 text-white/50 hover:text-sky-300 hover:bg-white/10 transition-colors cursor-pointer focus:outline-none"
          title="Open in your computer's default Mail app (Outlook / Windows Mail / Apple Mail)"
          aria-label="Open in default mail client"
        >
          <Inbox className="w-3.5 h-3.5 shrink-0" />
        </a>

        {/* Vertical divider */}
        <div className="w-[1px] h-3.5 bg-white/20 self-center" />

        {/* 3. 1-Click Copy Icon Button */}
        <button
          type="button"
          onClick={copyEmailToClipboard}
          className="pl-2 pr-3 py-1.5 text-white/50 hover:text-emerald-300 hover:bg-white/10 transition-colors rounded-r-full cursor-pointer focus:outline-none inline-flex items-center gap-1"
          title="Copy email address to clipboard"
          aria-label="Copy email address"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale-up shrink-0" />
          ) : (
            <Copy className="w-3 h-3 text-white/60 group-hover:text-sky-300 shrink-0" />
          )}
          <span className="text-2xs font-mono text-white/50 hover:text-white hidden xs:inline">
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>
    </div>
  );
};
