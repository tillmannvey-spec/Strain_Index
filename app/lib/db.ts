// IndexedDB Database Layer for Strain Index PWA
// Uses idb library for easier IndexedDB management

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Strain } from '../types/strain';

const DB_NAME = 'strain-index-db';
const DB_VERSION = 1;

// Database schema definition
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
      dataUrl: string;
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
  
  // First delete associated images
  const strain = await database.get('strains', id);
  if (strain?.images) {
    for (const image of strain.images) {
      await database.delete('images', image.id);
    }
  }
  
  // Then delete the strain
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

// Image Operations

export async function saveImage(id: string, base64: string): Promise<void> {
  const database = await initDB();
  await database.put('images', {
    id,
    dataUrl: base64,
    createdAt: new Date(),
  });
  console.log('[DB] Saved image:', id);
}

export async function getImage(id: string): Promise<string | undefined> {
  const database = await initDB();
  const record = await database.get('images', id);
  return record?.dataUrl;
}

export async function deleteImage(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('images', id);
  console.log('[DB] Deleted image:', id);
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
    totalBytes += image.dataUrl.length * 2;
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