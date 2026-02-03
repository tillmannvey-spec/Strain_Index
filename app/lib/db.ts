// IndexedDB Database Layer for Strain Index PWA
// Uses idb library for easier IndexedDB management

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Strain } from '../types/strain';
// NEU: Importiere die Blob-Funktionen für Cloud-Speicher
import { deleteImageFromBlob } from './images';

const DB_NAME = 'strain-index-db';
const DB_VERSION = 1;

// Database schema definition
// WICHTIG: Dieses Schema wurde aktualisiert für Vercel Blob Support!
interface StrainIndexDB extends DBSchema {
  strains: {
    key: string;
    value: Strain;
    indexes: {
      'by-name': string;
      'by-updated': Date;
    };
  };
  images: {
    key: string;
    value: {
      id: string;
      dataUrl?: string;    // Optional: Base64 (legacy)
      blobUrl?: string;    // Optional: Vercel Blob URL (neu)
      createdAt: Date;
    };
  };
}

let db: IDBPDatabase<StrainIndexDB> | null = null;

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<StrainIndexDB>> {
  if (db) {
    return db;
  }

  db = await openDB<StrainIndexDB>(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      console.log(`[DB] Upgrading database from v${oldVersion} to v${newVersion}`);

      // Create strains store
      if (!database.objectStoreNames.contains('strains')) {
        const strainStore = database.createObjectStore('strains', {
          keyPath: 'id',
        });
        // Create indexes for efficient querying
        strainStore.createIndex('by-name', 'name', { unique: false });
        strainStore.createIndex('by-updated', 'updatedAt', { unique: false });
        console.log('[DB] Created strains store');
      }

      // Create images store
      if (!database.objectStoreNames.contains('images')) {
        const imageStore = database.createObjectStore('images', {
          keyPath: 'id',
        });
        console.log('[DB] Created images store');
      }
    },
  });

  console.log('[DB] Database initialized');
  return db;
}

// Strain CRUD Operations

export async function addStrain(strain: Strain): Promise<string> {
  const database = await initDB();
  await database.put('strains', strain);
  console.log('[DB] Added strain:', strain.id);
  return strain.id;
}

export async function updateStrain(id: string, strainUpdate: Partial<Strain>): Promise<void> {
  const database = await initDB();
  const existing = await database.get('strains', id);
  if (!existing) {
    throw new Error(`Strain with id ${id} not found`);
  }
  
  const updated = {
    ...existing,
    ...strainUpdate,
    id, // Ensure ID doesn't change
    updatedAt: new Date(), // Always update the timestamp
  };
  
  await database.put('strains', updated);
  console.log('[DB] Updated strain:', id);
}

export async function deleteStrain(id: string): Promise<void> {
  const database = await initDB();
  
  // Zuerst zugehörige Bilder löschen
  const strain = await database.get('strains', id);
  if (strain?.images) {
    for (const image of strain.images) {
      // NEU: Auch aus Vercel Blob löschen wenn es eine Blob URL ist
      const imageUrl = image.url || image.dataUrl;
      if (imageUrl) {
        await deleteImage(image.id, imageUrl);
      } else {
        await database.delete('images', image.id);
      }
    }
  }
  
  // Auch das legacy 'image' Feld prüfen (Base64)
  if (strain?.image) {
    // Legacy Base64 Bild - nichts in Blob zu löschen
    console.log('[DB] Legacy image field detected, skipping Blob delete');
  }
  
  // Dann den Strain löschen
  await database.delete('strains', id);
  console.log('[DB] Deleted strain:', id);
}

export async function getAllStrains(): Promise<Strain[]> {
  const database = await initDB();
  const strains = await database.getAll('strains');
  // Sort by updatedAt desc (newest first)
  return strains.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getStrainById(id: string): Promise<Strain | undefined> {
  const database = await initDB();
  return database.get('strains', id);
}

// ============================================================================
// Image Operations - MIT VERCEL BLOB SUPPORT
// ============================================================================
// Diese Funktionen unterstützen jetzt beide Speicherarten:
// 1. NEU: Vercel Blob URLs (Cloud-Speicher)
// 2. ALT: Base64 in IndexedDB (lokaler Speicher)
// ============================================================================

/**
 * Speichert ein Bild in der Datenbank
 * 
 * WICHTIG: Diese Funktion wird jetzt anders verwendet!
 * 
 * ALT (Base64):
 *   await saveImage('id-123', 'data:image/jpeg;base64,/9j/4AAQ...');
 * 
 * NEU (Blob URL):
 *   await saveImage('id-123', 'https://xxx.blob.vercel-storage.com/bild.jpg');
 * 
 * @param id - Eindeutige ID des Bildes
 * @param imageUrl - Entweder Base64-String oder Vercel Blob URL
 */
export async function saveImage(id: string, imageUrl: string): Promise<void> {
  const database = await initDB();
  
  // Prüfen ob es eine Blob URL oder Base64 ist
  const isBlobUrl = imageUrl.startsWith('http') && imageUrl.includes('blob.vercel-storage.com');
  
  if (isBlobUrl) {
    // NEU: Blob URLs werden nur als Referenz gespeichert
    // Das eigentliche Bild ist in der Cloud
    await database.put('images', {
      id,
      dataUrl: undefined, // Kein Base64 mehr nötig!
      blobUrl: imageUrl,  // Die Blob URL wird gespeichert
      createdAt: new Date(),
    });
    console.log('[DB] Saved Blob URL reference:', id);
  } else {
    // ALT: Base64 wird weiterhin unterstützt (Abwärtskompatibilität)
    await database.put('images', {
      id,
      dataUrl: imageUrl,  // Base64 String
      blobUrl: undefined,
      createdAt: new Date(),
    });
    console.log('[DB] Saved Base64 image (legacy):', id);
  }
}

/**
 * Holt ein Bild aus der Datenbank
 * 
 * @param id - ID des gesuchten Bildes
 * @returns Die Bild-URL (Blob URL oder Base64) oder undefined
 * 
 * HINWEIS: Diese Funktion gibt jetzt beide Formate zurück:
 * - Blob URLs (neu, bevorzugt)
 * - Base64 (legacy, für alte Bilder)
 */
export async function getImage(id: string): Promise<string | undefined> {
  const database = await initDB();
  const record = await database.get('images', id);
  
  if (!record) {
    return undefined;
  }
  
  // NEU: Wenn es eine Blob URL gibt, die zurückgeben
  if (record.blobUrl) {
    return record.blobUrl;
  }
  
  // ALT: Sonst Base64 zurückgeben (Abwärtskompatibilität)
  return record.dataUrl;
}

/**
 * Löscht ein Bild aus der Datenbank UND aus Vercel Blob
 * 
 * WICHTIG: Bei Blob URLs wird das Bild auch aus der Cloud gelöscht!
 * Bei Base64 wird nur der lokale Eintrag entfernt.
 * 
 * @param id - ID des zu löschenden Bildes
 * @param imageUrl - Optional: Die URL um zu prüfen ob es ein Blob ist
 */
export async function deleteImage(id: string, imageUrl?: string): Promise<void> {
  const database = await initDB();
  
  // Wenn eine URL übergeben wurde, prüfen ob es ein Blob ist
  if (imageUrl) {
    const isBlobUrl = imageUrl.includes('blob.vercel-storage.com');
    
    if (isBlobUrl) {
      try {
        // Aus Vercel Blob löschen
        await deleteImageFromBlob(imageUrl);
        console.log('[DB] Deleted from Vercel Blob:', imageUrl);
      } catch (error) {
        // Fehler beim Blob-Löschen protokollieren, aber fortsetzen
        // (Bild könnte schon gelöscht sein)
        console.warn('[DB] Could not delete from Blob (may already be deleted):', error);
      }
    }
  }
  
  // Aus IndexedDB löschen
  await database.delete('images', id);
  console.log('[DB] Deleted image from IndexedDB:', id);
}

/**
 * Löscht ALLE Bilder eines Strains (inkl. aus Vercel Blob)
 * 
 * Diese Funktion wird beim Löschen eines Strains verwendet,
 * um alle zugehörigen Bilder zu bereinigen.
 * 
 * @param imageUrls - Array von Bild-URLs (können Blob oder Base64 sein)
 */
export async function deleteImages(imageUrls: string[]): Promise<void> {
  for (const url of imageUrls) {
    // Prüfen ob es eine Blob URL ist
    const isBlobUrl = url.includes('blob.vercel-storage.com');
    
    if (isBlobUrl) {
      try {
        await deleteImageFromBlob(url);
        console.log('[DB] Deleted from Blob:', url);
      } catch (error) {
        console.warn('[DB] Blob delete error (continuing):', error);
      }
    }
    // Base64 Bilder werden nur aus dem Strain entfernt,
    // da sie direkt im Strain-Objekt gespeichert sind
  }
}

// Database utilities

export async function clearAllData(): Promise<void> {
  const database = await initDB();
  await database.clear('strains');
  await database.clear('images');
  console.log('[DB] Cleared all data');
}

export async function exportData(): Promise<{ strains: Strain[]; exportDate: string }> {
  const strains = await getAllStrains();
  return {
    strains,
    exportDate: new Date().toISOString(),
  };
}

export async function importData(data: { strains: Strain[] }): Promise<void> {
  const database = await initDB();
  const tx = database.transaction('strains', 'readwrite');
  
  for (const strain of data.strains) {
    await tx.store.put(strain);
  }
  
  await tx.done;
  console.log('[DB] Imported', data.strains.length, 'strains');
}

// Get database stats
export async function getDBStats(): Promise<{
  strainCount: number;
  imageCount: number;
  estimatedSize: string;
}> {
  const database = await initDB();
  const strains = await database.getAll('strains');
  const images = await database.getAll('images');
  
  // Rough estimate of storage size
  let totalBytes = 0;
  for (const strain of strains) {
    totalBytes += JSON.stringify(strain).length * 2; // UTF-16
  }
  for (const image of images) {
    // NEU: Unterstützt sowohl Base64 als auch Blob URLs
    // Blob URLs sind kurze Strings, Base64 sind lange Strings
    const imageData = image.dataUrl || image.blobUrl || '';
    totalBytes += imageData.length * 2;
  }
  
  const estimatedSize = totalBytes > 1024 * 1024 
    ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(totalBytes / 1024).toFixed(2)} KB`;
  
  return {
    strainCount: strains.length,
    imageCount: images.length,
    estimatedSize,
  };
}