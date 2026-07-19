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
  
  // Detail user viewing state
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // Fetch users list with current page and filters
  const fetchUsers = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiParams = {
        page: targetPage,
        limit,
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
      };

      const result: PaginatedList<UserResponse> = await adminUsersApi.list(apiParams);
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

  // Fetch user detail by ID
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

  // Update user status (Active / Inactive / Banned)
  const updateUserStatus = useCallback(async (userId: string, newStatus: AccountStatus) => {
    setError(null);
    try {
      const updatedUser = await adminUsersApi.updateStatus(userId, newStatus);
      
      // Update local state lists
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.userId === userId ? updatedUser : user))
      );
      
      // Update selected detail user if applicable
      if (selectedUser?.userId === userId) {
        setSelectedUser(updatedUser);
      }
      return updatedUser;
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      setError(err.message || 'Không thể cập nhật trạng thái tài khoản.');
      throw err;
    }
  }, [selectedUser]);

  // Toggle user lock/unlock (Active <-> Banned)
  const toggleUserLock = useCallback(async (userId: string, currentStatus: AccountStatus) => {
    const targetStatus: AccountStatus = currentStatus === 'Banned' ? 'Active' : 'Banned';
    return updateUserStatus(userId, targetStatus);
  }, [updateUserStatus]);

  // Assign role to user
  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    setError(null);
    try {
      const updatedUser = await adminUsersApi.updateRole(userId, newRole);
      
      // Update local state lists
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.userId === userId ? updatedUser : user))
      );
      
      // Update selected detail user if applicable
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

  // Helper function to update filters
  const updateFilters = useCallback((newFilters: Partial<UsersFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      role: '',
      status: '',
    });
  }, []);

  // Auto-fetch users when filter changes or page triggers (initial load)
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
    updateUserStatus,
    toggleUserLock,
    updateUserRole,
    updateFilters,
    resetFilters,
    setSelectedUser,
  };
}
