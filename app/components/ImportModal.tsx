'use client';

import { useState, useCallback } from 'react';
import { Upload, X, AlertCircle, CheckCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { parseMultipleStrains, validateStrain, createStrainFromParsed } from '@/app/lib/import';
import { Strain } from '@/app/types/strain';
import { useStrains } from '@/app/hooks/useStrains';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [text, setText] = useState('');
  const [previewStrains, setPreviewStrains] = useState<Partial<Strain>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [imported, setImported] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { addStrain } = useStrains();

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    setImported(false);
    
    if (value.trim()) {
      const parsed = parseMultipleStrains(value);
      setPreviewStrains(parsed);
      
      // Validate all strains
      const allErrors: string[] = [];
      parsed.forEach((strain, index) => {
        const validation = validateStrain(strain);
        if (!validation.valid) {
          allErrors.push(`Strain ${index + 1} (${strain.name || 'Unbenannt'}): ${validation.errors.join(', ')}`);
        }
      });
      setErrors(allErrors);
    } else {
      setPreviewStrains([]);
      setErrors([]);
    }
  }, []);

  const handleImport = useCallback(async () => {
    let successCount = 0;
    
    for (const parsed of previewStrains) {
      const validation = validateStrain(parsed);
      if (validation.valid) {
        const strain = createStrainFromParsed(parsed);
        await addStrain(strain);
        successCount++;
      }
    }

    if (successCount > 0) {
      setImported(true);
      setTimeout(() => {
        onClose();
        setText('');
        setPreviewStrains([]);
        setImported(false);
      }, 1500);
    }
  }, [previewStrains, addStrain, onClose]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!isOpen) return null;

  const validStrains = previewStrains.filter(s => validateStrain(s).valid);
  const invalidCount = previewStrains.length - validStrains.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-zinc-900 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Strains importieren</h2>
              <p className="text-sm text-zinc-400">Füge deine Text-Daten ein</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Strain-Daten (Text format)
            </label>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Beispiel Format:
Alien Mints Huala (27% THC, Kanada)
A) Wirkungen
Basierend auf 127 analysierten Reviews
• Entspannend: 47×
• Glücklich: 32×
• Euphorisch: 28×
B) Medizinische Anwendungen
• Angststörungen: 52×
• Chronische Schmerzen: 41×`}
              className="w-full h-48 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 resize-none font-mono text-sm"
            />
          </div>

          {/* Stats */}
          {previewStrains.length > 0 && (
            <div className="flex items-center gap-4 px-4 py-3 bg-zinc-950 rounded-xl">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">
                  {previewStrains.length} Strain{previewStrains.length !== 1 ? 's' : ''} erkannt
                </span>
              </div>
              {validStrains.length > 0 && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{validStrains.length} gültig</span>
                </div>
              )}
              {invalidCount > 0 && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{invalidCount} unvollständig</span>
                </div>
              )}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Validierungsfehler</span>
              </div>
              <ul className="space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-300/80">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {previewStrains.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-300">Vorschau</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {previewStrains.map((strain, index) => {
                  const validation = validateStrain(strain);
                  const isExpanded = expandedIndex === index;
                  
                  return (
                    <div
                      key={index}
                      className={`border rounded-xl overflow-hidden transition-colors ${
                        validation.valid 
                          ? 'border-zinc-800 bg-zinc-950' 
                          : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      <button
                        onClick={() => toggleExpand(index)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          {validation.valid ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="font-medium text-white">{strain.name}</span>
                          {strain.thcContent && (
                            <span className="text-sm text-zinc-500">{strain.thcContent}</span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 space-y-2 border-t border-zinc-800/50">
                          {strain.origin && (
                            <p className="text-sm text-zinc-400">Herkunft: {strain.origin}</p>
                          )}
                          {strain.effects && strain.effects.length > 0 && (
                            <div>
                              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Wirkungen ({strain.effects.length})</p>
                              <div className="flex flex-wrap gap-1">
                                {strain.effects.slice(0, 5).map((e, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-300">
                                    {e.name} ({e.frequency}×)
                                  </span>
                                ))}
                                {strain.effects.length > 5 && (
                                  <span className="px-2 py-0.5 text-xs text-zinc-500">+{strain.effects.length - 5}</span>
                                )}
                              </div>
                            </div>
                          )}
                          {strain.medicalUses && strain.medicalUses.length > 0 && (
                            <div>
                              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Medizinisch ({strain.medicalUses.length})</p>
                              <div className="flex flex-wrap gap-1">
                                {strain.medicalUses.slice(0, 5).map((m, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-green-500/10 rounded text-xs text-green-400">
                                    {m.condition} ({m.frequency}×)
                                  </span>
                                ))}
                                {strain.medicalUses.length > 5 && (
                                  <span className="px-2 py-0.5 text-xs text-zinc-500">+{strain.medicalUses.length - 5}</span>
                                )}
                              </div>
                            </div>
                          )}
                          {!validation.valid && (
                            <div className="pt-2">
                              <p className="text-xs text-red-400">{validation.errors.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="p-4 bg-zinc-800/50 rounded-xl text-sm text-zinc-400">
            <p className="font-medium text-zinc-300 mb-2">Unterstützte Formate:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Name (THC%, Herkunft)</li>
              <li>A) Wirkungen → Bullet-Points mit Häufigkeit</li>
              <li>B) Medizinische Anwendungen → Bullet-Points mit Häufigkeit</li>
              <li>Mehrere Strains durch Leerzeilen trennen</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={() => {
              setText('');
              setPreviewStrains([]);
              setErrors([]);
            }}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Zurücksetzen
          </button>
          
          {imported ? (
            <div className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black font-medium rounded-xl">
              <CheckCircle className="w-4 h-4" />
              Importiert!
            </div>
          ) : (
            <button
              onClick={handleImport}
              disabled={validStrains.length === 0}
              className="px-6 py-2 bg-green-500 text-black font-medium rounded-xl hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {validStrains.length} importieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}