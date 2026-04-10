import { useState, useCallback } from 'react';

export function useBulkSelection<T = number | string>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  const toggleId = useCallback((id: T) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = (id: T) => selectedIds.has(id);
  const selectionCount = selectedIds.size;
  const isSelectionMode = selectedIds.size > 0;

  return {
    selectedIds: Array.from(selectedIds),
    isSelected,
    selectionCount,
    isSelectionMode,
    toggleId,
    selectAll,
    clearSelection
  };
}
