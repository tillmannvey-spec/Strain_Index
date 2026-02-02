'use client';

import React, { useState, useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
  filterCount?: number;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onFilterClick,
  filterCount = 0,
  placeholder = 'Suche nach Strains, Effekten...',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div
        className={`
          flex-1 flex items-center gap-3
          bg-[#141414] rounded-xl
          border transition-all duration-200
          ${isFocused ? 'border-green-500 ring-2 ring-green-500/20' : 'border-white/10'}
        `}
      >
        {/* Search Icon */}
        <div className="pl-4">
          <svg
            className={`w-5 h-5 transition-colors ${isFocused ? 'text-green-400' : 'text-white/40'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder:text-white/30 py-3.5 text-base focus:outline-none"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="pr-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Suche löschen"
          >
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {!value && <div className="pr-4 w-8" />}
      </div>

      {/* Filter Button */}
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className={`
            relative flex items-center justify-center
            w-12 h-12 rounded-xl
            bg-[#141414] border border-white/10
            transition-all duration-200
            active:scale-95
            ${filterCount > 0 ? 'border-green-500/50 bg-green-500/10' : ''}
          `}
          aria-label="Filter öffnen"
        >
          <svg
            className={`w-5 h-5 ${filterCount > 0 ? 'text-green-400' : 'text-white/60'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>

          {/* Filter Count Badge */}
          {filterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-green-500 text-black text-xs font-bold rounded-full">
              {filterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
