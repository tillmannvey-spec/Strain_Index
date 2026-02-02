'use client';

import React, { useState, useCallback } from 'react';
import { StrainFilters } from '../types/strain';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: StrainFilters;
  onApplyFilters: (filters: StrainFilters) => void;
  availableEffects: string[];
  availableMedicalConditions: string[];
  availableOrigins: string[];
}

const THC_RANGES = [
  { label: 'Niedrig (<15%)', min: 0, max: 14 },
  { label: 'Mittel (15-20%)', min: 15, max: 20 },
  { label: 'Hoch (21-25%)', min: 21, max: 25 },
  { label: 'Sehr hoch (>25%)', min: 26, max: 35 },
];

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableEffects,
  availableMedicalConditions,
  availableOrigins,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<StrainFilters>(filters);

  const handleEffectToggle = useCallback((effect: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      effects: prev.effects.includes(effect)
        ? prev.effects.filter((e: string) => e !== effect)
        : [...prev.effects, effect],
    }));
  }, []);

  const handleMedicalToggle = useCallback((condition: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter((c: string) => c !== condition)
        : [...prev.medicalConditions, condition],
    }));
  }, []);

  const handleOriginToggle = useCallback((origin: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      origin: prev.origin.includes(origin)
        ? prev.origin.filter((o: string) => o !== origin)
        : [...prev.origin, origin],
    }));
  }, []);

  const handleTHCRangeToggle = useCallback((range: { min: number; max: number } | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      thcRange: range,
    }));
  }, []);

  const handleApply = useCallback(() => {
    onApplyFilters(localFilters);
    onClose();
  }, [localFilters, onApplyFilters, onClose]);

  const handleReset = useCallback(() => {
    const resetFilters: StrainFilters = {
      searchQuery: filters.searchQuery,
      effects: [],
      medicalConditions: [],
      thcRange: null,
      origin: [],
    };
    setLocalFilters(resetFilters);
  }, [filters.searchQuery]);

  const activeFilterCount =
    localFilters.effects.length +
    localFilters.medicalConditions.length +
    localFilters.origin.length +
    (localFilters.thcRange ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[85vh] bg-[#1c1c1e] rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Filter</h2>
            <p className="text-sm text-white/50">
              {activeFilterCount > 0 ? `${activeFilterCount} aktiv` : 'Keine Filter ausgewählt'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-6 py-4 space-y-6">
          {/* THC Content */}
          <section>
            <h3 className="text-sm font-medium text-white/70 mb-3 uppercase tracking-wide">
              THC Gehalt
            </h3>
            <div className="flex flex-wrap gap-2">
              {THC_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() =>
                    handleTHCRangeToggle(
                      localFilters.thcRange?.min === range.min ? null : range
                    )
                  }
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      localFilters.thcRange?.min === range.min
                        ? 'bg-green-500 text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }
                  `}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </section>

          {/* Effects */}
          {availableEffects.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-white/70 mb-3 uppercase tracking-wide">
                Wirkungen
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableEffects.map((effect: string) => (
                  <button
                    key={effect}
                    onClick={() => handleEffectToggle(effect)}
                    className={`
                      px-3 py-2 rounded-lg text-sm transition-all
                      ${
                        localFilters.effects.includes(effect)
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
                      }
                    `}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Medical Conditions */}
          {availableMedicalConditions.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-white/70 mb-3 uppercase tracking-wide">
                Medizinische Anwendungen
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableMedicalConditions.map((condition: string) => (
                  <button
                    key={condition}
                    onClick={() => handleMedicalToggle(condition)}
                    className={`
                      px-3 py-2 rounded-lg text-sm transition-all
                      ${
                        localFilters.medicalConditions.includes(condition)
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
                      }
                    `}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Origin */}
          {availableOrigins.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-white/70 mb-3 uppercase tracking-wide">
                Herkunft
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableOrigins.map((origin: string) => (
                  <button
                    key={origin}
                    onClick={() => handleOriginToggle(origin)}
                    className={`
                      px-3 py-2 rounded-lg text-sm transition-all
                      ${
                        localFilters.origin.includes(origin)
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
                      }
                    `}
                  >
                    {origin}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 bg-[#141414]">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors"
          >
            Zurücksetzen
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-xl bg-green-500 text-black font-semibold hover:bg-green-400 transition-colors"
          >
            Anwenden
          </button>
        </div>
      </div>
    </div>
  );
}
