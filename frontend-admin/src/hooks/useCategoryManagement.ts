import { useState, useEffect, useCallback } from 'react';
import { adminCategoriesApi } from '../services/admin.service';
import type { CategoryResponse, PaginatedList } from '../services/admin.service';

export interface CategoriesFilter {
  search: string;
}

export function useCategoryManagement() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<CategoriesFilter>({
    search: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail/Edit category state
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // Fetch categories list with current page and filters
  const fetchCategories = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiParams = {
        page: targetPage,
        limit,
        search: filters.search || undefined,
      };

      const result: PaginatedList<CategoryResponse> = await adminCategoriesApi.list(apiParams);
      setCategories(result.list);
      setTotal(result.total);
      setPage(result.page);
      setLimit(result.limit);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Không thể tải danh sách danh mục. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, limit]);

  // Fetch category details
  const fetchCategoryDetail = useCallback(async (categoryId: number) => {
    setIsFetchingDetail(true);
    setError(null);
    try {
      const category = await adminCategoriesApi.getById(categoryId);
      setSelectedCategory(category);
      return category;
    } catch (err: any) {
      console.error('Failed to fetch category details:', err);
      setError(err.message || 'Không thể tải chi tiết danh mục.');
      throw err;
    } finally {
      setIsFetchingDetail(false);
    }
  }, []);

  // Create a new category
  const createCategory = useCallback(async (body: { categoryName: string; description?: string }) => {
    setError(null);
    try {
      const newCategory = await adminCategoriesApi.create(body);
      
      // Refresh list to show new item
      await fetchCategories(1);
      return newCategory;
    } catch (err: any) {
      console.error('Failed to create category:', err);
      setError(err.message || 'Tạo danh mục thất bại.');
      throw err;
    }
  }, [fetchCategories]);

  // Update a category
  const updateCategory = useCallback(async (categoryId: number, body: { categoryName?: string; description?: string | null }) => {
    setError(null);
    try {
      const updatedCategory = await adminCategoriesApi.update(categoryId, body);
      
      // Update local state list
      setCategories((prevCategories) =>
        prevCategories.map((c) => (c.categoryId === categoryId ? updatedCategory : c))
      );

      // Update selected detail category if applicable
      if (selectedCategory?.categoryId === categoryId) {
        setSelectedCategory(updatedCategory);
      }
      return updatedCategory;
    } catch (err: any) {
      console.error('Failed to update category:', err);
      setError(err.message || 'Cập nhật danh mục thất bại.');
      throw err;
    }
  }, [selectedCategory]);

  // Delete a category
  const deleteCategory = useCallback(async (categoryId: number) => {
    setError(null);
    try {
      await adminCategoriesApi.delete(categoryId);
      
      // Remove from local list
      setCategories((prevCategories) =>
        prevCategories.filter((c) => c.categoryId !== categoryId)
      );

      if (selectedCategory?.categoryId === categoryId) {
        setSelectedCategory(null);
      }
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      setError(err.message || 'Xóa danh mục thất bại.');
      throw err;
    }
  }, [selectedCategory]);

  // Helper to update filters
  const updateFilters = useCallback((newFilters: Partial<CategoriesFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
    });
  }, []);

  // Auto-fetch list when filters or page parameters trigger (initial load)
  useEffect(() => {
    fetchCategories(1);
  }, [fetchCategories]);

  return {
    categories,
    total,
    page,
    limit,
    totalPages,
    filters,
    isLoading,
    error,
    selectedCategory,
    isFetchingDetail,
    fetchCategories,
    fetchCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFilters,
    resetFilters,
    setSelectedCategory,
  };
}
