import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DashboardLayouts {
  lg: WidgetLayout[];
  md: WidgetLayout[];
  sm: WidgetLayout[];
  xs: WidgetLayout[];
  xxs: WidgetLayout[]; // Missing xxs was causing the grid engine to crash
}

interface DashboardState {
  layouts: DashboardLayouts;
  visibleWidgets: string[];
  isEditMode: boolean;
  
  // Actions
  setLayouts: (layouts: any) => void;
  toggleWidget: (id: string) => void;
  setEditMode: (enabled: boolean) => void;
  resetLayout: () => void;
}

const DEFAULT_LG: WidgetLayout[] = [
  { i: 'downlink', x: 0, y: 0, w: 3, h: 4, minH: 3 },
  { i: 'uplink', x: 3, y: 0, w: 3, h: 4, minH: 3 },
  { i: 'storage', x: 6, y: 0, w: 3, h: 4, minH: 3 },
  { i: 'fleet', x: 9, y: 0, w: 3, h: 4, minH: 3 },
  { i: 'activity', x: 0, y: 4, w: 8, h: 12, minH: 8, minW: 4 },
  { i: 'efficiency', x: 0, y: 16, w: 4, h: 5, minH: 4 },
  { i: 'security', x: 4, y: 16, w: 4, h: 5, minH: 4 },
  { i: 'storage_dist', x: 8, y: 4, w: 4, h: 10, minH: 6 },
  { i: 'quality_dist', x: 8, y: 14, w: 4, h: 8, minH: 5 },
  { i: 'health_dist', x: 8, y: 22, w: 4, h: 8, minH: 5 },
];

const DEFAULT_MD: WidgetLayout[] = [
  { i: 'downlink', x: 0, y: 0, w: 5, h: 4 },
  { i: 'uplink', x: 5, y: 0, w: 5, h: 4 },
  { i: 'storage', x: 0, y: 4, w: 5, h: 4 },
  { i: 'fleet', x: 5, y: 4, w: 5, h: 4 },
  { i: 'activity', x: 0, y: 8, w: 10, h: 10 },
  { i: 'efficiency', x: 0, y: 18, w: 5, h: 5 },
  { i: 'security', x: 5, y: 18, w: 5, h: 5 },
  { i: 'storage_dist', x: 0, y: 23, w: 5, h: 8 },
  { i: 'quality_dist', x: 5, y: 23, w: 5, h: 8 },
  { i: 'health_dist', x: 0, y: 31, w: 10, h: 8 },
];

const DEFAULT_SM: WidgetLayout[] = [
  { i: 'downlink', x: 0, y: 0, w: 6, h: 4 },
  { i: 'uplink', x: 0, y: 4, w: 6, h: 4 },
  { i: 'storage', x: 0, y: 8, w: 6, h: 4 },
  { i: 'fleet', x: 0, y: 12, w: 6, h: 4 },
  { i: 'activity', x: 0, y: 16, w: 6, h: 10 },
  { i: 'efficiency', x: 0, y: 26, w: 3, h: 5 },
  { i: 'security', x: 3, y: 26, w: 3, h: 5 },
  { i: 'storage_dist', x: 0, y: 31, w: 6, h: 8 },
  { i: 'quality_dist', x: 0, y: 39, w: 6, h: 8 },
  { i: 'health_dist', x: 0, y: 47, w: 6, h: 8 },
];

const DEFAULT_XS: WidgetLayout[] = [
  { i: 'downlink', x: 0, y: 0, w: 4, h: 4 },
  { i: 'uplink', x: 0, y: 4, w: 4, h: 4 },
  { i: 'storage', x: 0, y: 8, w: 4, h: 4 },
  { i: 'fleet', x: 0, y: 12, w: 4, h: 4 },
  { i: 'activity', x: 0, y: 16, w: 4, h: 8 },
  { i: 'efficiency', x: 0, y: 24, w: 4, h: 4 },
  { i: 'security', x: 0, y: 28, w: 4, h: 4 },
  { i: 'storage_dist', x: 0, y: 32, w: 4, h: 8 },
  { i: 'quality_dist', x: 0, y: 40, w: 4, h: 8 },
  { i: 'health_dist', x: 0, y: 48, w: 4, h: 8 },
];

const DEFAULT_LAYOUTS: DashboardLayouts = {
  lg: DEFAULT_LG,
  md: DEFAULT_MD,
  sm: DEFAULT_SM,
  xs: DEFAULT_XS,
  xxs: DEFAULT_XS,
};

const DEFAULT_VISIBLE = [
  'downlink', 'uplink', 'storage', 'fleet', 
  'activity', 'efficiency', 'security', 
  'storage_dist', 'quality_dist', 'health_dist'
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      layouts: DEFAULT_LAYOUTS,
      visibleWidgets: DEFAULT_VISIBLE,
      isEditMode: false,

      setLayouts: (layouts) => set({ layouts }),
      
      toggleWidget: (id) => set((state) => ({
        visibleWidgets: state.visibleWidgets.includes(id)
          ? state.visibleWidgets.filter(w => w !== id)
          : [...state.visibleWidgets, id]
      })),

      setEditMode: (isEditMode) => set({ isEditMode }),

      resetLayout: () => set({ 
        layouts: DEFAULT_LAYOUTS, 
        visibleWidgets: DEFAULT_VISIBLE 
      }),
    }),
    {
      name: 'arrdeck-dashboard-storage-v2',
      version: 2, // Explicit version to force migration/reset from array format
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // If the old state was an array or old schema, purge and return defaults
          return {
            layouts: DEFAULT_LAYOUTS,
            visibleWidgets: DEFAULT_VISIBLE,
            isEditMode: false
          };
        }
        return persistedState;
      }
    }
  )
);
