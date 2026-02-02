'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Strain } from '../types/strain';

interface StrainDetailProps {
  strain: Strain;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function StrainDetail({ strain, onEdit, onDelete }: StrainDetailProps) {
  // Sort effects by frequency
  const sortedEffects = useMemo(() => {
    return [...strain.effects].sort((a: { frequency: number }, b: { frequency: number }) => b.frequency - a.frequency);
  }, [strain.effects]);

  // Sort medical uses by frequency
  const sortedMedical = useMemo(() => {
    return [...strain.medicalUses].sort((a: { frequency: number }, b: { frequency: number }) => b.frequency - a.frequency);
  }, [strain.medicalUses]);

  // Get max frequency for bar scaling
  const maxEffectFreq = Math.max(...strain.effects.map((e: { frequency: number }) => e.frequency), 1);
  const maxMedicalFreq = Math.max(...strain.medicalUses.map((m: { frequency: number }) => m.frequency), 1);

  return (
    <div className="min-h-screen bg-black animate-page-in">
      {/* Header with Image */}
      <div className="relative">
        {/* Background Image or Gradient */}
        <div className="h-64 sm:h-80 relative overflow-hidden">
          {strain.images && strain.images.length > 0 ? (
            <img
              src={strain.images.find((i: { isPrimary: boolean }) => i.isPrimary)?.dataUrl || strain.images[0].dataUrl}
              alt={strain.name}
              className="w-full h-full object-cover"
            />
          ) : strain.image ? (
            <img
              src={strain.image}
              alt={strain.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-900/60 via-green-800/40 to-black flex items-center justify-center">
              <svg className="w-24 h-24 text-green-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Back Button */}
          <Link
            href="/"
            className="absolute top-4 left-4 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Title Section */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{strain.name}</h1>
              <span className="badge-green text-sm mb-1">{strain.thcContent} THC</span>
            </div>
            <p className="text-white/60 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {strain.origin}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-8">
        {/* Effect Description */}
        {strain.effectDescription && (
          <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold text-white mb-3">Beschreibung</h2>
            <p className="text-white/70 leading-relaxed">{strain.effectDescription}</p>
          </section>
        )}

        {/* Effects */}
        <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Wirkungen</h2>
          <div className="space-y-3">
            {sortedEffects.map((effect: { name: string; frequency: number }, index: number) => (
              <div key={effect.name} className="flex items-center gap-3">
                <span className="w-24 text-sm text-white/60 truncate">{effect.name}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${(effect.frequency / maxEffectFreq) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-medium text-green-400">{effect.frequency}×</span>
              </div>
            ))}
          </div>
        </section>

        {/* Medical Focus */}
        {strain.medicalFocus && (
          <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-semibold text-white mb-3">Medizinischer Fokus</h2>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-purple-200">{strain.medicalFocus}</p>
            </div>
          </section>
        )}

        {/* Medical Uses */}
        <section className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Medizinische Anwendungen</h2>
          <div className="space-y-3">
            {sortedMedical.map((med: { condition: string; frequency: number; isHighlighted?: boolean }, index: number) => (
              <div key={med.condition} className="flex items-center gap-3">
                <span className={`w-32 text-sm truncate ${med.isHighlighted ? 'text-purple-300' : 'text-white/60'}`}>
                  {med.condition}
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      med.isHighlighted
                        ? 'bg-gradient-to-r from-purple-600 to-purple-400'
                        : 'bg-white/30'
                    }`}
                    style={{ width: `${(med.frequency / maxMedicalFreq) * 100}%` }}
                  />
                </div>
                <span className={`w-10 text-right text-sm font-medium ${med.isHighlighted ? 'text-purple-400' : 'text-white/50'}`}>
                  {med.frequency}×
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Tags */}
        {strain.tags && strain.tags.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-semibold text-white mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {strain.tags.map((tag: string) => (
                <span key={tag} className="badge-neutral">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Metadata */}
        <section className="pt-6 border-t border-white/10 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            <span>Erstellt: {strain.createdAt.toLocaleDateString('de-DE')}</span>
            <span>Aktualisiert: {strain.updatedAt.toLocaleDateString('de-DE')}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
