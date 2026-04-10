import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTree, 
  Search, 
  Tv, 
  Film, 
  Link as LinkIcon, 
  Settings,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUnifiedQueue } from '../../hooks/useUnifiedQueue';
import { useUIStore } from '../../stores/ui.store';

export function Sidebar() {
  const { count } = useUnifiedQueue();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/queue', icon: ListTree, label: 'Queue', count },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/qbittorrent', icon: Download, label: 'qBittorrent', color: 'text-qbittorrent' },
  ];

  const appItems = [
    { to: '/sonarr', icon: Tv, label: 'Sonarr', color: 'text-sonarr' },
    { to: '/radarr', icon: Film, label: 'Radarr', color: 'text-radarr' },
    { to: '/prowlarr', icon: LinkIcon, label: 'Prowlarr', color: 'text-prowlarr' },
  ];

  return (
    <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-sidebar border-r border-border h-full flex flex-col transition-all duration-300 ease-in-out supports-[height:100vh]:h-[100vh] relative z-50 shadow-2xl overflow-hidden`}>
      {/* Brand Header */}
      <div className={`p-4 border-b border-border font-semibold text-lg flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
        <Tv className="text-sonarr flex-shrink-0" />
        {!isSidebarCollapsed && (
          <span className="text-foreground animate-in fade-in slide-in-from-left-2 duration-300">ArrDeck</span>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to} className="relative group">
              <NavLink 
                to={item.to} 
                title={isSidebarCollapsed ? item.label : undefined}
                className={({isActive}) => `
                  flex items-center rounded-lg transition-all duration-200
                  ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
                  ${isActive ? 'text-white font-semibold' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
                `}
                style={({isActive}: {isActive: boolean}) => isActive ? { backgroundColor: 'var(--accent-color)' } : {}}
              >
                <item.icon size={20} className={`flex-shrink-0 ${item.color || ''}`} />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="truncate">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="bg-accent text-accent-foreground text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[1.25rem] text-center shadow-lg">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
                {/* Collapsed Badge Dot */}
                {isSidebarCollapsed && item.count !== undefined && item.count > 0 && (
                   <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-surface-2" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Deployment Section */}
        <div className="px-3">
           <div className={`h-[1px] w-full bg-white/5 ${isSidebarCollapsed ? '' : 'mb-6'}`} />
           {!isSidebarCollapsed && (
             <span className="text-[11px] uppercase font-black tracking-widest text-white/50 mb-4 block italic animate-in fade-in duration-500">Deployment</span>
           )}
        </div>

        <ul className="space-y-1">
          {appItems.map((item) => (
            <li key={item.to}>
              <NavLink 
                to={item.to} 
                title={isSidebarCollapsed ? item.label : undefined}
                className={({isActive}) => `
                  flex items-center rounded-lg transition-all duration-200 group
                  ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
                  ${isActive ? `bg-white/5 ${item.color} shadow-sm border border-white/5` : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border space-y-2">
        <NavLink 
          to="/settings" 
          title={isSidebarCollapsed ? 'Settings' : undefined}
          className={({isActive}) => `
            flex items-center rounded-lg transition-all duration-200
            ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
            ${isActive ? 'bg-white/5 text-foreground shadow-sm border border-white/5' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
          `}
        >
          <Settings size={20} className="flex-shrink-0" />
          {!isSidebarCollapsed && <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">Settings</span>}
        </NavLink>

        <button
          onClick={toggleSidebar}
          className={`
            w-full flex items-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all group
            ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
          `}
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isSidebarCollapsed && (
            <span className="truncate font-black text-[11px] uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">Collapse Bay</span>
          )}
        </button>
      </div>
    </aside>
  );
}
