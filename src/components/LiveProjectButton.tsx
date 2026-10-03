import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LiveProjectButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
  showIcon?: boolean;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

export const LiveProjectButton: React.FC<LiveProjectButtonProps> = ({
  href,
  onClick,
  className = '',
  label = 'Live Case Study',
  showIcon = true,
  target = '_blank',
  rel = 'noopener noreferrer',
  ariaLabel,
}) => {
  const commonClasses = `btn-secondary !bg-white/80 hover:!bg-[#E7EBE9]/80 !text-[#596769] hover:!text-[#202526] !border-[#B8C1C0]/60 !min-h-[44px] text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full inline-flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202526]/40 cursor-pointer shadow-2xs hover:shadow-xs ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel || `${label} (opens in new tab)`}
        className={commonClasses}
      >
        <span>{label}</span>
        {showIcon && <ExternalLink className="w-3.5 h-3.5 opacity-75 text-[#596769]" aria-hidden="true" />}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={commonClasses}
    >
      <span>{label}</span>
      {showIcon && <ExternalLink className="w-3.5 h-3.5 opacity-75 text-[#596769]" aria-hidden="true" />}
    </button>
  );
};
