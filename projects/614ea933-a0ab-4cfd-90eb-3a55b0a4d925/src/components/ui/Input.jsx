import React from 'react';

const Input = ({ label, error, ...props }) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-surface border-2 ${error ? 'border-accent-crimson' : 'border-white/10'} 
          focus:border-primary focus:outline-none px-4 py-3 rounded-xl text-white transition-colors`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-accent-crimson">{error}</p>}
    </div>
  );
};

export default Input;
