'use client';

import React, { useCallback, useState } from 'react';
// NEU: uploadImageToBlob importiert für Cloud-Speicher
import { 
  validateImageFile, 
  formatFileSize,
  uploadImageToBlob,
  isBlobUrl 
} from '../lib/images';

interface ImageUploaderProps {
  value?: string;                    // Kann Base64 oder Blob URL sein
  onChange: (imageUrl: string | undefined) => void;
  placeholder?: string;
  onUploadStart?: () => void;        // Optional: Callback wenn Upload startet
  onUploadComplete?: () => void;     // Optional: Callback wenn Upload fertig ist
}

/**
 * ImageUploader Komponente - Jetzt mit Vercel Blob Support!
 * 
 * Diese Komponente unterstützt beide Speicherarten:
 * 1. NEU: Vercel Blob URLs (werden zu Cloud hochgeladen)
 * 2. ALT: Base64 (werden lokal gespeichert)
 * 
 * Der Upload-Status wird dem Nutzer angezeigt:
 * - "Komprimiere..." - Bild wird vor Upload optimiert
 * - "Lade hoch..." - Bild wird zu Vercel Blob übertragen
 * 
 * Abwärtskompatibilität:
 * - Alte Base64-Bilder werden weiterhin angezeigt
 * - Neue Bilder werden als Blob URL gespeichert
 */
export default function ImageUploader({
  value,
  onChange,
  placeholder = 'Bild hinzufügen',
  onUploadStart,
  onUploadComplete,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'compressing' | 'uploading'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (file: File | null) => {
      if (!file) return;

      setError(null);

      // === Schritt 1: Datei validieren ===
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Ungültige Datei');
        return;
      }

      // Upload-Start Callback auslösen
      onUploadStart?.();
      
      // === Schritt 2: Bild komprimieren ===
      // Das ist WICHTIG! Komprimierte Bilder laden schneller hoch
      setUploadState('compressing');

      try {
        // NEU: Direkt zu Vercel Blob hochladen
        // Die uploadImageToBlob Funktion komprimiert das Bild automatisch
        setUploadState('uploading');
        
        console.log('[ImageUploader] Starte Upload zu Vercel Blob:', file.name);
        const blobUrl = await uploadImageToBlob(file);
        
        console.log('[ImageUploader] Upload erfolgreich:', blobUrl);
        onChange(blobUrl);
        
        // Upload-Complete Callback auslösen
        onUploadComplete?.();
      } catch (err) {
        console.error('[ImageUploader] Upload fehlgeschlagen:', err);
        setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
        onUploadComplete?.();
      } finally {
        setUploadState('idle');
      }
    },
    [onChange, onUploadStart, onUploadComplete]
  );

  // Hilfsfunktion: Zeigt den aktuellen Upload-Status an
  const getUploadLabel = () => {
    switch (uploadState) {
      case 'compressing':
        return 'Komprimiere...';
      case 'uploading':
        return 'Lade hoch...';
      default:
        return placeholder;
    }
  };

  // Prüft ob das aktuelle Bild eine Blob URL ist (für Debug-Zwecke)
  const isCurrentImageBlob = value ? isBlobUrl(value) : false;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFileChange(file);
    },
    [handleFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange(undefined);
    setError(null);
  }, [onChange]);

  // Wenn bereits ein Bild vorhanden ist, zeige es mit Overlay an
  if (value) {
    return (
      <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden group">
        {/* 
          Das Bild wird angezeigt - egal ob Blob URL oder Base64
          Der Browser kann beides direkt im src Attribut anzeigen
        */}
        <img
          src={value}
          alt="Vorschau"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay mit Aktionen (erscheint bei Hover) */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <label className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              disabled={uploadState !== 'idle'} // Deaktiviert während Upload
            />
          </label>
          
          <button
            onClick={handleRemove}
            className="p-2 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors"
            disabled={uploadState !== 'idle'} // Deaktiviert während Upload
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* 
          Optional: Zeige an wenn es ein Blob-Bild ist (für Debug)
          Dies kann später entfernt oder durch ein Icon ersetzt werden
        {isCurrentImageBlob && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            Cloud
          </div>
        )} 
        */}
      </div>
    );
  }

  // Upload-Bereich (wenn noch kein Bild vorhanden)
  return (
    <div className="w-full max-w-[200px]">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center
          w-full aspect-square
          rounded-xl border-2 border-dashed
          cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-green-500 bg-green-500/10'
            : 'border-white/20 bg-[#141414] hover:border-white/40 hover:bg-[#1c1c1e]'
          }
          ${uploadState !== 'idle' ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          {uploadState !== 'idle' ? (
            <>
              {/* 
                NEU: Zeige Upload-Status mit animiertem Spinner
                - "Komprimiere..." während der Bildoptimierung
                - "Lade hoch..." während des Cloud-Uploads
              */}
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <span className="text-sm text-white/50">{getUploadLabel()}</span>
            </>
          ) : (
            <>
              <div className={`
                p-3 rounded-full transition-colors
                ${isDragging ? 'bg-green-500/20' : 'bg-white/5'}
              `}>
                <svg
                  className={`w-6 h-6 ${isDragging ? 'text-green-400' : 'text-white/40'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              
              <span className="text-sm text-white/50">{placeholder}</span>
              <span className="text-xs text-white/30">Tap oder ziehen</span>
            </>
          )}
        </div>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploadState !== 'idle'} // Deaktiviert während Upload
        />
      </label>
      
      {error && (
        <p className="mt-2 text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
