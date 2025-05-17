
import React from 'react';
import { Input } from './input';

interface InputFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function InputField({
  name,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled = false,
  autoFocus = false
}: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}