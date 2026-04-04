import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-light hover:shadow-[0_0_20px_rgba(255,77,0,0.4)]",
    secondary: "bg-surface border-2 border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "bg-transparent border-2 border-white/20 text-white hover:border-white hover:bg-white/5",
    accent: "bg-accent-gold text-background hover:bg-yellow-400"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
