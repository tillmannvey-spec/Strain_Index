'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { Strain, StrainFilters } from '../types/strain';
import { searchAndFilterStrains, createSearchIndex, extractFilterOptions } from '../lib/search';

// Main hook for strain management
export function useStrains() {
  // Get state from store
  const store = useAppStore();
  const strains = store.strains;
  const isLoading = store.isLoading;
  const error = store.error;
  const filters = store.filters;
  const searchQuery = store.searchQuery;
  
  const initialize = store.initialize;
  const loadStrains = store.loadStrains;
  const addStrain = store.addStrain;
  const updateStrain = store.updateStrain;
  const deleteStrain = store.deleteStrain;
  const setFilters = store.setFilters;
  const setSearchQuery = store.setSearchQuery;
  const resetFilters = store.resetFilters;
  const clearError = store.clearError;

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Create search index
  const searchIndex = useMemo(() => {
    return createSearchIndex(strains);
  }, [strains]);

  // Get filtered and searched strains
  const filteredStrains = useMemo(() => {
    return searchAndFilterStrains(strains, searchQuery, filters, searchIndex);
  }, [strains, searchQuery, filters, searchIndex]);

  // Get filter options
  const { availableEffects, availableMedicalConditions, availableOrigins } = useMemo(() => {
    const options = extractFilterOptions(strains);
    return {
      availableEffects: options.effects,
      availableMedicalConditions: options.medicalConditions,
      availableOrigins: options.origins,
    };
  }, [strains]);

  // Get strain by ID
  const getStrainById = useCallback((id: string): Strain | undefined => {
    return strains.find(strain => strain.id === id);
  }, [strains]);

  // Refresh strains
  const refresh = useCallback(async () => {
    await loadStrains();
  }, [loadStrains]);

  return {
    // Data
    strains: filteredStrains,
    allStrains: strains,
    isLoading,
    error,
    
    // Filters
    filters,
    searchQuery,
    availableEffects,
    availableMedicalConditions,
    availableOrigins,
    
    // Actions
    addStrain,
    updateStrain,
    deleteStrain,
    setFilters,
    setSearchQuery,
    resetFilters,
    getStrainById,
    refresh,
    clearError,
  };
}

// Hook for single strain operations
export function useStrain(id: string) {
  const store = useAppStore();
  const strains = store.strains;
  const isLoading = store.isLoading;
  const error = store.error;
  
  const updateStrain = store.updateStrain;
  const deleteStrain = store.deleteStrain;
  const clearError = store.clearError;

  const strain = useMemo(() => {
    return strains.find(s => s.id === id);
  }, [strains, id]);

  return {
    strain,
    isLoading,
    error,
    updateStrain,
    deleteStrain,
    clearError,
  };
}

// Hook for filter management
export function useFilterManagement() {
  const store = useAppStore();
  const filters = store.filters;
  const strains = store.strains;
  const setFilters = store.setFilters;
  const resetFilters = store.resetFilters;

  const filterOptions = useMemo(() => {
    return extractFilterOptions(strains);
  }, [strains]);

  const toggleEffect = useCallback((effect: string) => {
    const currentEffects = filters.effects;
    const newEffects = currentEffects.includes(effect)
      ? currentEffects.filter(e => e !== effect)
      : [...currentEffects, effect];
    setFilters({ effects: newEffects });
  }, [filters.effects, setFilters]);

  const toggleMedicalCondition = useCallback((condition: string) => {
    const currentConditions = filters.medicalConditions;
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    setFilters({ medicalConditions: newConditions });
  }, [filters.medicalConditions, setFilters]);

  const toggleOrigin = useCallback((origin: string) => {
    const currentOrigins = filters.origin;
    const newOrigins = currentOrigins.includes(origin)
      ? currentOrigins.filter(o => o !== origin)
      : [...currentOrigins, origin];
    setFilters({ origin: newOrigins });
  }, [filters.origin, setFilters]);

  const setTHCRange = useCallback((range: { min: number; max: number } | null) => {
    setFilters({ thcRange: range });
  }, [setFilters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.effects.length > 0) count += filters.effects.length;
    if (filters.medicalConditions.length > 0) count += filters.medicalConditions.length;
    if (filters.origin.length > 0) count += filters.origin.length;
    if (filters.thcRange) count += 1;
    return count;
  }, [filters]);

  return {
    filters,
    filterOptions,
    activeFilterCount,
    toggleEffect,
    toggleMedicalCondition,
    toggleOrigin,
    setTHCRange,
    resetFilters,
    setFilters,
  };
}
