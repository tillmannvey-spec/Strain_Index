// Search and Filter Logic using Fuse.js

import Fuse, { IFuseOptions } from 'fuse.js';
import { Strain, StrainFilters } from '../types/strain';

// Fuse.js options for fuzzy search
const fuseOptions: IFuseOptions<Strain> = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'effects.name', weight: 0.2 },
    { name: 'medicalUses.condition', weight: 0.2 },
    { name: 'origin', weight: 0.1 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  useExtendedSearch: true,
};

// Create a Fuse search index
export function createSearchIndex(strains: Strain[]): Fuse<Strain> {
  return new Fuse(strains, fuseOptions);
}

// Search strains using Fuse.js
export function searchStrains(fuse: Fuse<Strain>, query: string): Strain[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const results = fuse.search(query.trim());
  return results.map(result => result.item);
}

// Parse THC content string (e.g., "27%", "20-25%") to numeric range
function parseTHCContent(thcContent: string): { min: number; max: number } | null {
  if (!thcContent) return null;
  
  // Remove % and whitespace
  const clean = thcContent.replace(/%/g, '').trim();
  
  // Handle range format (e.g., "20-25")
  if (clean.includes('-')) {
    const [min, max] = clean.split('-').map(s => parseFloat(s.trim()));
    if (!isNaN(min) && !isNaN(max)) {
      return { min: Math.min(min, max), max: Math.max(min, max) };
    }
  }
  
  // Handle single value
  const value = parseFloat(clean);
  if (!isNaN(value)) {
    return { min: value, max: value };
  }
  
  return null;
}

// Filter strains based on filter criteria
export function filterStrains(
  strains: Strain[],
  filters: StrainFilters
): Strain[] {
  return strains.filter(strain => {
    // Filter by effects
    if (filters.effects.length > 0) {
      const strainEffectNames = strain.effects.map(e => e.name);
      const hasMatchingEffect = filters.effects.some(effect => 
        strainEffectNames.includes(effect)
      );
      if (!hasMatchingEffect) return false;
    }

    // Filter by medical conditions
    if (filters.medicalConditions.length > 0) {
      const strainMedicalConditions = strain.medicalUses.map(m => m.condition);
      const hasMatchingMedical = filters.medicalConditions.some(condition => 
        strainMedicalConditions.includes(condition)
      );
      if (!hasMatchingMedical) return false;
    }

    // Filter by origin
    if (filters.origin.length > 0) {
      if (!filters.origin.includes(strain.origin)) return false;
    }

    // Filter by THC range
    if (filters.thcRange) {
      const strainTHC = parseTHCContent(strain.thcContent);
      if (strainTHC) {
        // Check if ranges overlap
        const overlaps = !(
          strainTHC.max < filters.thcRange.min || 
          strainTHC.min > filters.thcRange.max
        );
        if (!overlaps) return false;
      }
    }

    return true;
  });
}

// Combined search and filter
export function searchAndFilterStrains(
  strains: Strain[],
  searchQuery: string,
  filters: StrainFilters,
  fuse?: Fuse<Strain>
): Strain[] {
  let results = strains;

  // Apply search if query exists
  if (searchQuery && searchQuery.trim().length > 0) {
    const searchIndex = fuse || createSearchIndex(strains);
    results = searchStrains(searchIndex, searchQuery);
  }

  // Apply filters
  results = filterStrains(results, filters);

  return results;
}

// Sort strains
export function sortStrains(
  strains: Strain[],
  sortBy: 'name' | 'thc' | 'updatedAt' | 'createdAt' = 'updatedAt',
  direction: 'asc' | 'desc' = 'desc'
): Strain[] {
  const sorted = [...strains];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'thc':
        const aTHC = parseTHCContent(a.thcContent)?.max || 0;
        const bTHC = parseTHCContent(b.thcContent)?.max || 0;
        comparison = aTHC - bTHC;
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

// Get active filter count
export function getActiveFilterCount(filters: StrainFilters): number {
  let count = 0;
  if (filters.effects.length > 0) count += filters.effects.length;
  if (filters.medicalConditions.length > 0) count += filters.medicalConditions.length;
  if (filters.origin.length > 0) count += filters.origin.length;
  if (filters.thcRange) count += 1;
  return count;
}

// Extract all unique values for filter options
export function extractFilterOptions(strains: Strain[]) {
  const effects = new Set<string>();
  const medicalConditions = new Set<string>();
  const origins = new Set<string>();
  const thcValues: number[] = [];

  strains.forEach(strain => {
    // Effects
    strain.effects.forEach(effect => effects.add(effect.name));
    
    // Medical conditions
    strain.medicalUses.forEach(use => medicalConditions.add(use.condition));
    
    // Origins
    if (strain.origin) origins.add(strain.origin);
    
    // THC values for range calculation
    const thc = parseTHCContent(strain.thcContent);
    if (thc) {
      thcValues.push(thc.min, thc.max);
    }
  });

  // Calculate THC range
  const minTHC = thcValues.length > 0 ? Math.min(...thcValues) : 0;
  const maxTHC = thcValues.length > 0 ? Math.max(...thcValues) : 30;

  return {
    effects: Array.from(effects).sort(),
    medicalConditions: Array.from(medicalConditions).sort(),
    origins: Array.from(origins).sort(),
    thcRange: { min: Math.floor(minTHC), max: Math.ceil(maxTHC) },
  };
}