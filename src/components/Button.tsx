/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from 'react';

/**
 * AI Build Design System - Button Component
 * Consolidated 3-variant core button system:
 * 1. 'primary' - High-contrast solid CTA (e.g., 'See Works')
 * 2. 'glass'   - Signature Apple visionOS liquid glass action button (e.g., 'Reach out', 'Start Conversation', 'Leave a Review', 'Say hi')
 * 3. 'ghost'   - Subtle translucent/outline button (e.g., 'Skip intro', 'Open Live Demo', 'Admin Studio')
 *
 * Backwards-compatible aliases:
 * - 'secondary' -> 'glass'
 * - 'outline' / 'pill' -> pill styling with active/inactive states
 * - 'icon' -> circular glass button
 */
export type ButtonVariant = 'primary' | 'glass' | 'ghost' | 'secondary' | 'outline' | 'pill' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonVariantOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  className?: string;
}

export function buttonVariants({
  variant = 'glass',
  size = 'md',
  active = false,
  className = '',
}: ButtonVariantOptions = {}): string {
  // Base classes applied to all button variants with focus & accessibility states
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-300 cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

  let variantClasses = '';
  let sizeClasses = '';

  const normalizedVariant =
    variant === 'secondary' ? 'glass' : variant === 'pill' ? 'outline' : variant;

  switch (normalizedVariant) {
    case 'primary':
      variantClasses =
        'bg-white text-black hover:bg-white/90 shadow-[0_12px_28px_-6px_rgba(255,255,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-full';
      if (size === 'sm') sizeClasses = 'text-xs px-4 py-2 gap-1.5';
      else if (size === 'lg') sizeClasses = 'text-sm sm:text-base px-7 sm:px-9 py-3 sm:py-4 gap-2.5 min-h-[46px]';
      else sizeClasses = 'text-xs sm:text-sm px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 gap-2 min-h-[42px] sm:min-h-0';
      break;

    case 'glass':
      variantClasses = 'liquid-glass-button text-white rounded-full';
      if (size === 'sm') sizeClasses = 'text-xs sm:text-sm px-2.5 xs:px-3 sm:px-3.5 py-1 sm:py-1.5 gap-1 shrink-0';
      else if (size === 'lg') sizeClasses = 'text-xs sm:text-sm md:text-base px-6 sm:px-9 py-3 sm:py-4 gap-2.5 sm:gap-3 min-h-[46px]';
      else sizeClasses = 'text-xs sm:text-sm px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 gap-2 min-h-[42px] sm:min-h-0';
      break;

    case 'outline':
      if (active) {
        variantClasses =
          'liquid-glass-pill-active text-white border border-accent/50 shadow-[0_0_16px_rgba(56,189,248,0.35)] rounded-full font-medium';
      } else {
        variantClasses =
          'liquid-glass-pill text-muted hover:text-white hover:border-white/30 rounded-full';
      }
      if (size === 'sm') sizeClasses = 'text-xs px-2.5 xs:px-3 sm:px-3.5 py-1 sm:py-1.5 gap-1.5 shrink-0';
      else if (size === 'lg') sizeClasses = 'text-xs sm:text-sm font-mono px-4 sm:px-5 py-2 sm:py-2.5 gap-2';
      else sizeClasses = 'text-xs font-mono px-3.5 sm:px-4 py-1.5 sm:py-2 gap-2 shrink-0';
      break;

    case 'ghost':
      variantClasses =
        'text-muted hover:text-white border border-stroke hover:border-white/30 rounded-full bg-white/[0.03] hover:bg-white/[0.08]';
      if (size === 'sm') sizeClasses = 'text-xs px-3 py-1 gap-1.5';
      else if (size === 'lg') sizeClasses = 'text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-4 gap-2 min-h-[46px]';
      else sizeClasses = 'text-xs font-mono px-4 sm:px-5 py-2.5 gap-2 min-h-[42px]';
      break;

    case 'icon':
      variantClasses =
        'liquid-glass-pill hover:bg-white/20 text-muted hover:text-white rounded-full shrink-0 flex items-center justify-center';
      if (size === 'sm') sizeClasses = 'w-7 h-7 xs:w-8 xs:h-8 p-1 text-xs';
      else if (size === 'lg') sizeClasses = 'w-11 h-11 sm:w-12 sm:h-12 p-2.5 text-base';
      else sizeClasses = 'w-9 h-9 sm:w-10 sm:h-10 p-2 text-sm';
      break;
  }

  return [base, variantClasses, sizeClasses, className].filter(Boolean).join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'glass', size = 'md', active = false, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type || 'button'}
        className={buttonVariants({ variant, size, active, className })}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
