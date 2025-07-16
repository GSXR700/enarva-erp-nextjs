// app/administration/components/search/GlobalSearch.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchResults } from './SearchResults';
import { useDebounce } from '@/hooks/useDebounce'; // Nous allons créer ce hook

const SearchIcon = () => <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.16667 3.33333C5.945 3.33333 3.33333 5.945 3.33333 9.16667C3.33333 12.3883 5.945 15 9.16667 15C12.3883 15 15 12.3883 15 9.16667C15 5.945 12.3883 3.33333 9.16667 3.33333ZM1.66667 9.16667C1.66667 5.02452 5.02452 1.66667 9.16667 1.66667C13.3088 1.66667 16.6667 5.02452 16.6667 9.16667C16.6667 13.3088 13.3088 16.6667 9.16667 16.6667C5.02452 16.6667 1.66667 13.3088 1.66667 9.16667Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4643 13.2857L18.0893 16.9107C18.4147 17.2362 18.4147 17.7638 18.0893 18.0893C17.7638 18.4147 17.2362 18.4147 16.9107 18.0893L13.2857 14.4643C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill="currentColor"/></svg>;

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ clients: [], quotes: [], invoices: [], orders: [], deliveryNotes: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300); // Délai de 300ms
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults({ clients: [], quotes: [], invoices: [], orders: [], deliveryNotes: [] });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleCloseResults = () => {
    setIsFocused(false);
    setQuery('');
  }

  return (
    <div className="relative hidden md:block" ref={searchContainerRef}>
      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-dark-subtle">
        <SearchIcon />
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="Rechercher..."
        // CORRECTION : Augmentation de la hauteur (py-2.5) et du padding gauche (pl-11)
        className="w-full rounded-full border border-gray-200 bg-gray-100 py-2.5 pr-4 pl-11 focus:outline-none dark:bg-dark-background dark:border-dark-border text-gray-700 dark:text-dark-text"
      />
      {isFocused && query && (
        <SearchResults results={results} isLoading={isLoading} onClose={handleCloseResults} />
      )}
    </div>
  );
};