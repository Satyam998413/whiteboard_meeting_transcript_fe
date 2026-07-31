import React, { useId } from 'react';

export default function Input({ label, error, hint, className = '', id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded border bg-transparent px-3.5 py-2.5 text-text-primary placeholder:text-text-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          error ? 'border-red-500/60' : 'border-border focus:border-primary'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-text-secondary">
          {hint}
        </p>
      )}
    </div>
  );
}
