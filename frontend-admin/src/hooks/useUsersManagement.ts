import { useState, useEffect, useCallback } from 'react';
import { adminUsersApi } from '../services/admin.service';
import type { UserResponse, UserRole, AccountStatus, PaginatedList } from '../services/admin.service';

export interface UsersFilter {
  search: string;
  role: UserRole | '';
  status: AccountStatus | '';
}

export function useUsersManagement() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<UsersFilter>({
    search: '',
    role: '',
    status: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // Fetch users list
  const fetchUsers = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiParams: Parameters<typeof adminUsersApi.list>[0] = {
        page: targetPage,
        limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role as UserRole }),
        ...(filters.status && { status: filters.status as AccountStatus }),
      };

      const result = await adminUsersApi.list(apiParams);
      console.log(result.list);
      setUsers(result.list);
      setTotal(result.total);
      setPage(result.page);
      setLimit(result.limit);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Không thể tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, limit]);

  // Fetch single user detail
  const fetchUserDetail = useCallback(async (userId: string) => {
    setIsFetchingDetail(true);
    setError(null);
    try {
      const user = await adminUsersApi.getById(userId);
      setSelectedUser(user);
      return user;
    } catch (err: any) {
      console.error('Failed to fetch user details:', err);
      setError(err.message || 'Không thể tải chi tiết người dùng.');
      throw err;
    } finally {
      setIsFetchingDetail(false);
    }
  }, []);

  // Toggle lock/unlock — no reason required
  const toggleUserLock = useCallback(async (userId: string, currentStatus: AccountStatus) => {
    const targetStatus: AccountStatus = currentStatus === 'Banned' ? 'Active' : 'Banned';
    setError(null);
    try {
      const updatedUser = await adminUsersApi.updateStatus(userId, targetStatus);

      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? updatedUser : u)),
      );

      if (selectedUser?.userId === userId) {
        setSelectedUser(updatedUser);
      }

      return updatedUser;
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      setError(err.message || 'Không thể thay đổi trạng thái tài khoản.');
      throw err;
    }
  }, [selectedUser]);

  // Update user role
  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    setError(null);
    try {
      const updatedUser = await adminUsersApi.updateRole(userId, newRole);

      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role: newRole } : u)),
      );

      if (selectedUser?.userId === userId) {
        setSelectedUser(updatedUser);
      }

      return updatedUser;
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      setError(err.message || 'Không thể cập nhật vai trò người dùng.');
      throw err;
    }
  }, [selectedUser]);

  // Update filters (triggers auto-fetch via useEffect)
  const updateFilters = useCallback((newFilters: Partial<UsersFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', role: '', status: '' });
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  return {
    users,
    total,
    page,
    limit,
    totalPages,
    filters,
    isLoading,
    error,
    selectedUser,
    isFetchingDetail,
    fetchUsers,
    fetchUserDetail,
    toggleUserLock,
    updateUserRole,
    updateFilters,
    resetFilters,
    setSelectedUser,
  };
}
