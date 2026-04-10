import { useState } from 'react';
import { useMediaSearch } from '../hooks/useMediaSearch';
import { SearchResultCard } from '../components/search/SearchResultCard';
import { Input } from '../components/ui/input';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { results, isLoading } = useMediaSearch(query);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Search</h1>
        <p className="text-muted-foreground">
          Find movies and TV shows to add to your library
        </p>
      </div>

      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          className="pl-10 h-12 bg-surface-2 border-border focus-visible:ring-accent"
          placeholder="Search for movies or series..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        )}
      </div>

      {query.length >= 2 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Results ({results.length})</h2>
          </div>
          
          {results.length === 0 && !isLoading ? (
            <div className="py-20 text-center text-muted-foreground">
              No matches found for "{query}".
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((result) => (
                <SearchResultCard key={`${result.service}-${result.id}`} result={result} />
              ))}
            </div>
          )}
        </div>
      ) : query.length > 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          Type at least 2 characters to search...
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
           <SearchIcon size={64} className="text-muted-foreground" />
           <p className="text-xl font-medium">Global Media Lookup</p>
           <p className="max-w-sm text-sm">
             Your search queries will be checked against both Sonarr and Radarr databases simultaneously.
           </p>
        </div>
      )}
    </div>
  );
}
