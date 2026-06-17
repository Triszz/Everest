import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccess, getDefaultRoute } from '../../config/navigation';
import type { PartnerRole } from '../../types/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: PartnerRole[];
}

/**
 * Route guard that ensures:
 * 1. User is authenticated → otherwise redirect to /login
 * 2. User's role is in allowedRoles (if specified) → otherwise redirect to their default route
 * 3. User's role can access the current path → otherwise redirect to their default route
 */
export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Still hydrating from localStorage
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

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (explicit allowedRoles)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  // Path-level access check (from navigation config)
  if (!canAccess(user.role, location.pathname)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <>{children}</>;
}
