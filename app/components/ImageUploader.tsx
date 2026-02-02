'use client';

import React, { useCallback, useState } from 'react';
import { compressImage, validateImageFile, formatFileSize } from '../lib/images';

interface ImageUploaderProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  placeholder?: string;
}

export default function ImageUploader({
  value,
  onChange,
  placeholder = 'Bild hinzufügen',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (file: File | null) => {
      if (!file) return;

      setError(null);

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Ungültige Datei');
        return;
      }

      setIsCompressing(true);

      try {
        // Compress image
        const compressedBase64 = await compressImage(file);
        onChange(compressedBase64);
      } catch (err) {
        console.error('[ImageUploader] Compression failed:', err);
        setError('Bild konnte nicht verarbeitet werden');
      } finally {
        setIsCompressing(false);
      }
    },
    [onChange]
  );

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

  if (value) {
    return (
      <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden group">
        <img
          src={value}
          alt="Vorschau"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
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
              disabled={isCompressing}
            />
          </label>
          
          <button
            onClick={handleRemove}
            className="p-2 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors"
            disabled={isCompressing}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

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
          ${isCompressing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          {isCompressing ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <span className="text-sm text-white/50">Komprimiere...</span>
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
          disabled={isCompressing}
        />
      </label>
      
      {error && (
        <p className="mt-2 text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
