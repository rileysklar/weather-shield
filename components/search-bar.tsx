'use client';

import * as React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { searchLocations } from '@/utils/services/location';
import { DialogTitle } from './ui/dialog';
import { Skeleton } from './ui/skeleton';

interface SearchBarProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<Array<{
    name: string;
    lat: number;
    lng: number;
  }>>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearch = React.useCallback(async (value: string) => {
    console.log('Search value:', value);
    setSearch(value);
  }, []);

  React.useEffect(() => {
    const fetchLocations = async () => {
      if (!search) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const locations = await searchLocations(search);
        console.log('Search results:', locations);
        setResults(locations);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchLocations, 300);
    return () => clearTimeout(debounceTimeout);
  }, [search]);

  const handleSelect = React.useCallback((result: { lat: number; lng: number; name: string }) => {
    onLocationSelect(result);
    setOpen(false);
    setSearch('');
    setResults([]);
  }, [onLocationSelect]);

  return (
    <div className="w-full">
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left">Search location...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search for any location..."
          value={search}
          onValueChange={handleSearch}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              
            </div>
          )}
          {!isLoading && results.length === 0 && (
            <CommandGroup>
              <div className="p-2 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-[80%]" />
                <Skeleton className="h-8 w-[60%]" />
              </div>
            </CommandGroup>
          )}
          {!isLoading && results.length > 0 && (
            <CommandGroup heading="Locations">
              {results.map((result) => (
                <CommandItem
                  key={result.name}
                  value={result.name}
                  onSelect={() => handleSelect(result)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {result.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
} 
