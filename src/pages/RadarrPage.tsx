import { useState } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { LibraryControls } from '../components/library/LibraryControls';
import { MediaCard } from '../components/library/MediaCard';
import { MediaDetailSheet } from '../components/library/MediaDetailSheet';
import { MediaGridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/common/States';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { BulkCommandBar } from '../components/library/BulkCommandBar';
import { radarrService } from '../services/radarr.service';
import { useSettingsStore } from '../stores/settings.store';
import { toast } from 'sonner';

export function RadarrPage() {
  const { radarr: radarrSettings } = useSettingsStore();
  const { 
    items, isLoading, isError, totalCount, filteredCount,
    search, setSearch, filter, setFilter, refetch 
  } = useLibrary('radarr');

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { 
    selectedIds, 
    isSelected, 
    isSelectionMode, 
    toggleId, 
    clearSelection 
  } = useBulkSelection();

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setSheetOpen(true);
  };

  const handleBulkMonitor = async (monitored: boolean) => {
    if (!radarrSettings.enabled) return;
    setIsUpdating(true);
    try {
      await radarrService.bulkUpdateMovies(
        radarrSettings.baseUrl,
        radarrSettings.apiKey,
        selectedIds,
        { monitored }
      );
      toast.success(`Updated ${selectedIds.length} movies`);
      refetch();
    } catch (err) {
      toast.error('Failed to update movies');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!radarrSettings.enabled) return;
    setIsUpdating(true);
    try {
      await radarrService.bulkDeleteMovies(
        radarrSettings.baseUrl,
        radarrSettings.apiKey,
        selectedIds,
        true
      );
      toast.success(`Deleted ${selectedIds.length} movies`);
      clearSelection();
      refetch();
    } catch (err) {
      toast.error('Failed to delete movies');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Movie <span className="text-radarr underline decoration-4 underline-offset-4">Fleet</span>
        </h1>
        <p className="text-white/60 font-medium tracking-tight italic uppercase text-[11px]">
          Global theatrical inventory and quality profile management
        </p>
      </div>

      <LibraryControls 
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={refetch}
        isLoading={isLoading}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {isError && (
        <ErrorState 
          message="Failed to load movie library. Please verify your Radarr connection and API key in settings." 
          onRetry={refetch} 
        />
      )}

      {isLoading && items.length === 0 ? (
        <MediaGridSkeleton />
      ) : items.length === 0 && !isError ? (
        <EmptyState 
          message="No movies found matching your criteria. Try adjusting your filters or search term." 
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {items.map((movie: any) => (
            <MediaCard 
              key={movie.id} 
              item={movie} 
              service="radarr" 
              isSelected={isSelected(movie.id)}
              isSelectionMode={isSelectionMode}
              onToggleSelection={toggleId}
              onClick={() => handleItemClick(movie)} 
            />
          ))}
        </div>
      )}


      <MediaDetailSheet 
        item={selectedItem}
        service="radarr"
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <BulkCommandBar 
        count={selectedIds.length}
        onClear={clearSelection}
        onMonitor={handleBulkMonitor}
        onDelete={handleBulkDelete}
        isUpdating={isUpdating}
      />
    </div>
  );
}
