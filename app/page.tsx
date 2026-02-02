'use client';

import React, { useState, useCallback } from 'react';
import { useStrains } from './hooks/useStrains';
import StrainCard from './components/StrainCard';
import SearchBar from './components/SearchBar';
import FilterModal from './components/FilterModal';
import EmptyState from './components/EmptyState';
import AddStrainForm from './components/AddStrainForm';
import { ImportModal } from './components/ImportModal';
import { Strain, StrainFilters } from './types/strain';

export default function Home() {
  const {
    strains,
    isLoading,
    filters,
    setFilters,
    availableEffects,
    availableMedicalConditions,
    availableOrigins,
    addStrain,
    refresh,
  } = useStrains();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSearchChange = useCallback((query: string) => {
    setFilters({ searchQuery: query });
  }, [setFilters]);

  const handleApplyFilters = useCallback((newFilters: StrainFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleAddStrain = useCallback((strainData: Omit<Strain, 'id' | 'createdAt' | 'updatedAt'>) => {
    addStrain(strainData);
    setIsAddFormOpen(false);
  }, [addStrain]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  // Calculate active filter count
  const activeFilterCount =
    filters.effects.length +
    filters.medicalConditions.length +
    filters.origin.length +
    (filters.thcRange ? 1 : 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Strain Index</h1>
                <p className="text-xs text-white/50">{strains.length} Strains</p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              aria-label="Aktualisieren"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar
            value={filters.searchQuery}
            onChange={handleSearchChange}
            onFilterClick={() => setIsFilterOpen(true)}
            filterCount={activeFilterCount}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24">
        {/* Results Count */}
        {(filters.searchQuery || activeFilterCount > 0) && (
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <p className="text-sm text-white/50">
              {strains.length} Ergebnis{strains.length !== 1 ? 'se' : ''}
            </p>
            {(filters.searchQuery || activeFilterCount > 0) && (
              <button
                onClick={() => {
                  setFilters({
                    searchQuery: '',
                    effects: [],
                    medicalConditions: [],
                    thcRange: null,
                    origin: [],
                  });
                }}
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}

        {/* Strain List */}
        {isLoading ? (
          // Loading Skeleton
          <div className="space-y-3">
            {[...Array(4)].map((_: unknown, i: number) => (
              <div
                key={i}
                className="card h-28 animate-shimmer"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : strains.length > 0 ? (
          <div className="space-y-3 stagger-children">
            {strains.map((strain: Strain, index: number) => (
              <StrainCard key={strain.id} strain={strain} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={filters.searchQuery || activeFilterCount > 0 ? 'search' : 'leaf'}
            title={
              filters.searchQuery || activeFilterCount > 0
                ? 'Keine Ergebnisse gefunden'
                : 'Noch keine Strains'
            }
            description={
              filters.searchQuery || activeFilterCount > 0
                ? 'Versuche andere Suchbegriffe oder Filter'
                : 'Füge deinen ersten Strain hinzu, um loszulegen'
            }
            action={
              !(filters.searchQuery || activeFilterCount > 0)
                ? {
                    label: 'Strain hinzufügen',
                    onClick: () => setIsAddFormOpen(true),
                  }
                : undefined
            }
          />
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed right-4 bottom-8 z-40 flex items-center gap-3 safe-bottom">
        {/* Import Button */}
        <button
          onClick={() => setIsImportOpen(true)}
          className="w-12 h-12 rounded-full bg-zinc-800 text-white shadow-lg border border-zinc-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Strains importieren"
          title="Strains importieren"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
        
        {/* Add Button */}
        <button
          onClick={() => setIsAddFormOpen(true)}
          className="w-14 h-14 rounded-full bg-green-500 text-black shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Neuen Strain hinzufügen"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        availableEffects={availableEffects}
        availableMedicalConditions={availableMedicalConditions}
        availableOrigins={availableOrigins}
      />

      {/* Add Strain Form */}
      {isAddFormOpen && (
        <AddStrainForm
          onSubmit={handleAddStrain}
          onCancel={() => setIsAddFormOpen(false)}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}
