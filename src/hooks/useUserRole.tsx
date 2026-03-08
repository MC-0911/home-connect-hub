import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'buyer' | 'seller' | 'agent' | 'admin' | 'moderator' | 'user';

export function useUserRole() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRoles([]);
          setPrimaryRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
          setPrimaryRole(null);
        } else {
          const userRoles = (data || []).map(r => r.role as UserRole);
          setRoles(userRoles);
          // Priority: admin > agent > seller > buyer
          const priority: UserRole[] = ['admin', 'agent', 'seller', 'buyer', 'moderator', 'user'];
          const primary = priority.find(r => userRoles.includes(r)) || null;
          setPrimaryRole(primary);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
        setPrimaryRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRoles();
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole('admin');

  const getDashboardPath = (): string => {
    if (isAdmin) return '/admin';
    if (hasRole('agent')) return '/agent-dashboard';
    if (hasRole('seller')) return '/dashboard';
    if (hasRole('buyer')) return '/buyer-dashboard';
    return '/';
  };

  return { roles, primaryRole, loading, hasRole, isAdmin, getDashboardPath };
}
