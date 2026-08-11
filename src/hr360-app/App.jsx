import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '@/hr360-app/components/shared/layout/Sidebar';
import Topbar from '@/hr360-app/components/shared/layout/Topbar';
import { useMediaQuery } from '@/hr360-app/hooks/useMediaQuery';
import { useAuth } from '@/hr360-app/context/AuthContext';

/**
 * Root layout shell — Sidebar + Topbar + page content (Outlet).
 * This wraps all authenticated routes.
 */
export default function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const { isAuthenticated, isInitializing } = useAuth();

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  if (isInitializing) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--color-bg)',
    }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'hidden',
      }}>
        <Topbar onMenuClick={toggleSidebar} />

        <div style={{
          flex: 1,
          overflow: 'auto',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
