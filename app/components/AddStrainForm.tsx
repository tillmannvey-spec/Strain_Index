'use client';

import React, { useState, useCallback } from 'react';
import { Strain, Effect, MedicalUse } from '../types/strain';
import ImageUploader from './ImageUploader';

interface AddStrainFormProps {
  onSubmit: (strain: Omit<Strain, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Strain>;
}

const COMMON_EFFECTS = [
  'Entspannend', 'Glücklich', 'Euphorisch', 'Schläfrig', 'Fokussiert',
  'Energetisch', 'Kreativ', 'Hungrig', 'Gesprächig', 'Aufgedreht',
];

const COMMON_MEDICAL = [
  'Angststörungen', 'Chronische Schmerzen', 'Depression', 'Schlafstörungen',
  'Stress', 'Übelkeit', 'Appetitlosigkeit', 'PTBS', 'Müdigkeit',
];

export default function AddStrainForm({ onSubmit, onCancel, initialData }: AddStrainFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [thcContent, setThcContent] = useState(initialData?.thcContent || '');
  const [origin, setOrigin] = useState(initialData?.origin || '');
  const [effectDescription, setEffectDescription] = useState(initialData?.effectDescription || '');
  const [medicalFocus, setMedicalFocus] = useState(initialData?.medicalFocus || '');
  const [image, setImage] = useState<string | undefined>(initialData?.image);
  
  const [effects, setEffects] = useState<Effect[]>(initialData?.effects || []);
  const [medicalUses, setMedicalUses] = useState<MedicalUse[]>(initialData?.medicalUses || []);
  
  const [newEffectName, setNewEffectName] = useState('');
  const [newEffectFreq, setNewEffectFreq] = useState(50);
  const [newMedicalName, setNewMedicalName] = useState('');
  const [newMedicalFreq, setNewMedicalFreq] = useState(50);

  const handleAddEffect = useCallback(() => {
    if (!newEffectName.trim()) return;
    setEffects((prev) => [...prev, { name: newEffectName.trim(), frequency: newEffectFreq }]);
    setNewEffectName('');
    setNewEffectFreq(50);
  }, [newEffectName, newEffectFreq]);

  const handleRemoveEffect = useCallback((index: number) => {
    setEffects((prev) => prev.filter((_: Effect, i: number) => i !== index));
  }, []);

  const handleAddMedical = useCallback(() => {
    if (!newMedicalName.trim()) return;
    setMedicalUses((prev) => [...prev, { 
      condition: newMedicalName.trim(), 
      frequency: newMedicalFreq,
      isHighlighted: newMedicalFreq >= 45
    }]);
    setNewMedicalName('');
    setNewMedicalFreq(50);
  }, [newMedicalName, newMedicalFreq]);

  const handleRemoveMedical = useCallback((index: number) => {
    setMedicalUses((prev) => prev.filter((_: MedicalUse, i: number) => i !== index));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      thcContent,
      origin,
      effects,
      medicalUses,
      effectDescription,
      medicalFocus,
      image,
      tags: [],
    });
  }, [name, thcContent, origin, effects, medicalUses, effectDescription, medicalFocus, image, onSubmit]);

  const isValid = name.trim() && thcContent.trim() && origin.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg max-h-[90vh] bg-[#1c1c1e] rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? 'Strain bearbeiten' : 'Neuer Strain'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-4 space-y-6">
          {/* Image */}
          <section>
            <label className="block text-sm font-medium text-white/70 mb-2">Bild</label>
            <ImageUploader value={image} onChange={setImage} />
          </section>

          {/* Basic Info */}
          <section className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="z.B. Alien Mints Huala"
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">THC Gehalt *</label>
                <input
                  type="text"
                  value={thcContent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThcContent(e.target.value)}
                  placeholder="z.B. 27%"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Herkunft *</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrigin(e.target.value)}
                  placeholder="z.B. Kanada"
                  className="input"
                  required
                />
              </div>
            </div>
          </section>

          {/* Effects */}
          <section>
            <label className="block text-sm font-medium text-white/70 mb-2">Wirkungen</label>
            
            {/* Add Effect */}
            <div className="flex gap-2 mb-3">
              <select
                value={newEffectName}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewEffectName(e.target.value)}
                className="flex-1 input text-sm"
              >
                <option value="">Wirkung auswählen...</option>
                {COMMON_EFFECTS.map((effect) => (
                  <option key={effect} value={effect}>{effect}</option>
                ))}
              </select>
              <input
                type="number"
                value={newEffectFreq}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEffectFreq(parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                className="w-20 input text-sm text-center"
              />
              <button
                type="button"
                onClick={handleAddEffect}
                disabled={!newEffectName}
                className="btn-primary px-3"
              >
                +
              </button>
            </div>

            {/* Effect List */}
            <div className="flex flex-wrap gap-2">
              {effects.map((effect: Effect, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm"
                >
                  {effect.name} ({effect.frequency}×)
                  <button
                    type="button"
                    onClick={() => handleRemoveEffect(index)}
                    className="text-green-400/60 hover:text-green-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Medical Uses */}
          <section>
            <label className="block text-sm font-medium text-white/70 mb-2">Medizinische Anwendungen</label>
            
            {/* Add Medical */}
            <div className="flex gap-2 mb-3">
              <select
                value={newMedicalName}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewMedicalName(e.target.value)}
                className="flex-1 input text-sm"
              >
                <option value="">Beschwerde auswählen...</option>
                {COMMON_MEDICAL.map((med) => (
                  <option key={med} value={med}>{med}</option>
                ))}
              </select>
              <input
                type="number"
                value={newMedicalFreq}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMedicalFreq(parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                className="w-20 input text-sm text-center"
              />
              <button
                type="button"
                onClick={handleAddMedical}
                disabled={!newMedicalName}
                className="btn-primary px-3"
              >
                +
              </button>
            </div>

            {/* Medical List */}
            <div className="flex flex-wrap gap-2">
              {medicalUses.map((med: MedicalUse, index: number) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                    med.isHighlighted
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-white/5 text-white/70'
                  }`}
                >
                  {med.condition} ({med.frequency}×)
                  <button
                    type="button"
                    onClick={() => handleRemoveMedical(index)}
                    className={med.isHighlighted ? 'text-purple-400/60 hover:text-purple-400' : 'text-white/40 hover:text-white/60'}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Descriptions */}
          <section className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Wirkungsbeschreibung</label>
              <textarea
                value={effectDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEffectDescription(e.target.value)}
                placeholder="Beschreibe die charakteristischen Wirkungen..."
                rows={3}
                className="input resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Medizinischer Fokus</label>
              <textarea
                value={medicalFocus}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMedicalFocus(e.target.value)}
                placeholder="Für welche Beschwerden ist dieser Strain besonders geeignet?"
                rows={2}
                className="input resize-none"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 bg-[#141414]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 py-3 px-4 rounded-xl bg-green-500 text-black font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </form>
    </div>
  );
}
