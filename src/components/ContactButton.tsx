import React from 'react';
import { motion } from 'motion/react';

interface ContactButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ContactButton: React.FC<ContactButtonProps> = ({
  onClick,
  className = '',
  label = 'Contact Studio',
  type = 'button',
  disabled = false,
  children,
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative inline-flex items-center justify-center rounded-full text-[#E7EBE9] bg-[#202526] hover:bg-[#596769] border border-[#202526] font-btn font-medium uppercase tracking-[0.08em] whitespace-nowrap transition-all duration-300 px-3.5 xs:px-5 py-2 xs:py-2.5 sm:px-9 sm:py-3.5 md:px-11 md:py-3.5 text-[11px] xs:text-xs sm:text-sm overflow-hidden shadow-md shadow-[#202526]/10 ${
        disabled ? 'opacity-60 cursor-not-allowed hover:bg-[#202526]' : 'cursor-pointer'
      } ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children || label}</span>
    </motion.button>
  );
};

