import { useState, useCallback } from 'react';
import { adminPoliciesApi } from '../services/admin.service';
import type { PolicyResponse } from '../services/admin.service';

export type PolicyFormData = {
  title: string;
  content: string;
};

export function usePolicyManagement() {
  const [policies, setPolicies] = useState<PolicyResponse[]>([]);
  const [currentPolicy, setCurrentPolicy] = useState<PolicyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminPoliciesApi.list();
      setPolicies(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách chính sách.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPolicyById = useCallback(async (policyId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const policy = await adminPoliciesApi.getById(policyId);
      setCurrentPolicy(policy);
      return policy;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải chi tiết chính sách.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePolicy = useCallback(async (body: { title: string; content: string }) => {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await adminPoliciesApi.upsert(body);
      setCurrentPolicy(saved);
      setPolicies((prev) => {
        const idx = prev.findIndex((p) => p.policyId === saved.policyId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });
      return saved;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lưu chính sách thất bại.';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    policies,
    currentPolicy,
    isLoading,
    isSaving,
    error,
    fetchPolicies,
    fetchPolicyById,
    savePolicy,
    setCurrentPolicy,
    setError,
  };
}
