import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

interface LiveProjectButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export const LiveProjectButton: React.FC<LiveProjectButtonProps> = ({
  onClick,
  className = '',
  label = 'Live Project',
  showIcon = false,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-[#B8C1C0] bg-[#E7EBE9] text-[#202526] hover:text-[#202526] hover:border-[#202526] hover:bg-[#CBDCDE] font-btn font-medium uppercase tracking-[0.08em] cursor-pointer px-3.5 xs:px-6 py-1.5 xs:py-2 sm:px-8 sm:py-2.5 text-[10px] xs:text-xs sm:text-sm transition-all duration-300 shadow-sm ${className}`}
    >
      <span>{label}</span>
      {showIcon && <ExternalLink className="w-3.5 h-3.5 opacity-80 text-[#596769]" />}
    </motion.button>
  );
};

