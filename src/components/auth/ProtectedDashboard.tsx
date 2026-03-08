import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, type UserRole } from '@/hooks/useUserRole';

interface ProtectedDashboardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedDashboard({ allowedRoles, children }: ProtectedDashboardProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading, isAdmin, getDashboardPath } = useUserRole();
  const navigate = useNavigate();

  const loading = authLoading || roleLoading;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    // Admins can access everything
    if (isAdmin) return;

    // Check if user has any of the allowed roles
    const hasAccess = allowedRoles.some(role => roles.includes(role));
    if (!hasAccess) {
      // Redirect to their correct dashboard
      navigate(getDashboardPath(), { replace: true });
    }
  }, [user, roles, loading, isAdmin, allowedRoles, navigate, getDashboardPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  // Allow admins or users with correct roles
  if (!isAdmin && !allowedRoles.some(role => roles.includes(role))) return null;

  return <>{children}</>;
}
