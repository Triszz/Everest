import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function NotificationsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to settings page where notifications are now managed
    navigate('/settings', { replace: true });
  }, [navigate]);

  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
      Đang chuyển hướng...
    </div>
  );
}
