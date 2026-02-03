'use client';

import React from 'react';
import Link from 'next/link';
import { Strain, getImageDisplayUrl } from '../types/strain';

interface StrainCardProps {
  strain: Strain;
  index?: number;
}

export default function StrainCard({ strain, index = 0 }: StrainCardProps) {
  // Get top 3 effects by frequency
  const topEffects = strain.effects
    .slice()
    .sort((a: { frequency: number }, b: { frequency: number }) => b.frequency - a.frequency)
    .slice(0, 3);

  // Get highlighted medical uses
  const highlightedMedical = strain.medicalUses
    .filter((m: { isHighlighted?: boolean }) => m.isHighlighted)
    .slice(0, 2);

  // Animation delay for stagger effect
  const animationDelay = `${index * 50}ms`;

  return (
    <Link href={`/strain/${strain.id}`}>
      <article
        className="card card-pressable overflow-hidden animate-fade-in"
        style={{ animationDelay }}
      >
        <div className="flex gap-4 p-4">
          {/* Image Placeholder or Actual Image */}
          <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/20">
            {/* 
              Bildanzeige mit Abwärtskompatibilität
              Unterstützt sowohl neue Blob URLs als auch alte Base64 Bilder
            */}
            {strain.images && strain.images.length > 0 ? (
              <img
                src={getImageDisplayUrl(
                  strain.images.find((i) => i.isPrimary) || strain.images[0]
                )}
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
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            )}
            
            {/* THC Badge */}
            <div className="absolute top-1 right-1">
              <span className="badge-green text-[10px] px-1.5 py-0.5">
                {strain.thcContent}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-white truncate leading-tight">
                {strain.name}
              </h3>
            </div>

            {/* Origin */}
            <p className="text-xs text-white/50 mb-2 truncate">{strain.origin}</p>

            {/* Top Effects */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {topEffects.map((effect: { name: string; frequency: number }) => (
                <span
                  key={effect.name}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-white/5 text-white/70"
                >
                  {effect.name}
                  <span className="text-green-400">{effect.frequency}×</span>
                </span>
              ))}
            </div>

            {/* Highlighted Medical Uses */}
            {highlightedMedical.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {highlightedMedical.map((medical: { condition: string; frequency: number }) => (
                  <span
                    key={medical.condition}
                    className="badge-purple text-[10px]"
                  >
                    {medical.condition}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Chevron */}
          <div className="flex-shrink-0 self-center">
            <svg
              className="w-5 h-5 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
