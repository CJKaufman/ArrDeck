import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + , (Settings)
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
      }

      // Ctrl + R (Refresh) - This is tricky because browser refreshes page. 
      // We want to trigger the TanStack Query refetch if possible.
      // For now, we'll let it refresh the whole app or we could preventDefault and do nothing.
      // But standard "Refresh" is fine for now unless we want a scoped refresh.

      // Ctrl + F (Focus Search)
      if (e.ctrlKey && e.key === 'f') {
        const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="Filter"]') as HTMLInputElement;
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location]);
}
