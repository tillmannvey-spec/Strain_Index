'use client';

import { useMemo, useCallback } from 'react';
import { useAppStore } from '../lib/store';
import { createSearchIndex, searchStrains } from '../lib/search';

export function useSearch() {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const strains = useAppStore((state) => state.strains);

  // Create search index
  const searchIndex = useMemo(() => {
    return createSearchIndex(strains);
  }, [strains]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return strains;
    }
    return searchStrains(searchIndex, searchQuery);
  }, [searchQuery, searchIndex, strains]);

  // Set search query
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  // Check if search is active
  const isSearching = searchQuery.trim().length > 0;

  return {
    searchQuery,
    searchResults,
    handleSearch,
    clearSearch,
    isSearching,
    resultCount: searchResults.length,
  };
}