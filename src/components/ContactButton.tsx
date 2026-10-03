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
      className={`btn-primary px-4 xs:px-6 py-2.5 sm:px-8 sm:py-3.5 text-xs sm:text-sm shadow-md ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children || label}</span>
    </motion.button>
  );
};

