import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          color: '#94a3b8',
        }}>Đang xác thực thông tin...</div>
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
