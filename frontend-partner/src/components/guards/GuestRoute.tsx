import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../config/navigation';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for guest-only pages (login, register).
 * If already logged in → redirect to the user's default route.
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { user, isLoading } = useAuth();

  // Still hydrating
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: '#94A3B8',
        }}>Đang tải...</div>
      </div>
    );
  }

  // Already logged in → redirect to dashboard/validate
  if (user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <>{children}</>;
}
