import { Input } from '../ui/input';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { LibraryFilter } from '../../hooks/useLibrary';

interface LibraryControlsProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: LibraryFilter;
  onFilterChange: (val: LibraryFilter) => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalCount: number;
  filteredCount: number;
}

export function LibraryControls({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onRefresh,
  isLoading,
  totalCount,
  filteredCount,
}: LibraryControlsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-surface-2 p-4 rounded-xl border border-border">
      <div className="flex flex-1 gap-4 w-full md:w-auto">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search library..."
            className="pl-9 bg-surface-3 border-border"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[160px] bg-surface-3 border-border">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="monitored">Monitored Only</SelectItem>
            <SelectItem value="missing">Missing Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredCount}</span> of {totalCount}
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading} className="bg-surface-3 border-border">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
        </Button>
      </div>
    </div>
  );
}
