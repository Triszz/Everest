import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/shared/Toast';
import { useBranchManagement } from '../hooks/useBranchManagement';
import { usePartnerManagement } from '../hooks/usePartnerManagement';
import type { BranchDetailResponse } from '../services/admin.service';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface EditForm {
  branchName: string;
  address: string;
  phoneNumber: string;
}

function BranchDetailPanel({
  branch,
  partnerId,
  onClose,
  onLock,
  onDelete,
  onUpdate,
  isSaving,
}: {
  branch: BranchDetailResponse;
  partnerId: number;
  onClose: () => void;
  onLock: (locked: boolean) => Promise<void>;
  onDelete: () => Promise<void>;
  onUpdate: (data: EditForm) => Promise<void>;
  isSaving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    branchName: branch.branchName,
    address: branch.address,
    phoneNumber: branch.phoneNumber ?? '',
  });

  const handleSave = async () => {
    await onUpdate(form);
    setEditing(false);
  };

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose} />
      <div className="side-panel" style={{ width: '32rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="font-label-sm" style={{ color: 'var(--color-outline)', marginBottom: '0.25rem' }}>CHI NHÁNH</p>
            <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>{branch.branchName}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge ${branch.isLocked ? 'badge-locked' : 'badge-active'}`}>
              {branch.isLocked ? '🔒 Đã khóa' : '✅ Hoạt động'}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>MÃ SỐ</p>
              <p className="font-body-md" style={{ fontWeight: 600 }}>#{branch.branchId}</p>
            </div>
            <div>
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>ĐỐI TÁC</p>
              <p className="font-body-md">{branch.partner?.companyName ?? '—'}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>ĐỊA CHỈ</p>
              <p className="font-body-sm">{branch.address}</p>
            </div>
            {branch.phoneNumber && (
              <div>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>SĐT</p>
                <p className="font-body-sm">{branch.phoneNumber}</p>
              </div>
            )}
            <div>
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>NGÀY TẠO</p>
              <p className="font-body-sm">{fmtDate(branch.createdAt)}</p>
            </div>
          </div>

          {/* Cashier */}
          {branch.cashier && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                NHÂN VIÊN QUẢN LÝ
              </h4>
              <div style={{ background: 'var(--color-surface-container-low)', padding: '1rem', borderRadius: '0.75rem' }}>
                <p className="font-body-md" style={{ fontWeight: 600 }}>{branch.cashier.fullName}</p>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>{branch.cashier.email}</p>
                <span className={`badge ${branch.cashier.status === 'Active' ? 'badge-active' : 'badge-locked'}`} style={{ marginTop: '0.5rem' }}>
                  {branch.cashier.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
                </span>
              </div>
            </div>
          )}

          {/* Edit form */}
          {editing ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 className="font-label-md" style={{ marginBottom: '0.75rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(0,92,134,0.2)', paddingBottom: '0.5rem' }}>
                CHỈNH SỬA CHI NHÁNH
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-on-surface-variant)' }}>Tên chi nhánh</label>
                  <input
                    className="admin-input"
                    value={form.branchName}
                    onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-on-surface-variant)' }}>Địa chỉ</label>
                  <input
                    className="admin-input"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-on-surface-variant)' }}>SĐT (tùy chọn)</label>
                  <input
                    className="admin-input"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="0xxxxxxxxx"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
          {editing ? (
            <>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>
                Hủy
              </button>
              <button className="admin-btn admin-btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          ) : (
            <>
              <button
                className="admin-btn admin-btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setEditing(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                Sửa
              </button>
              <button
                className={`admin-btn ${branch.isLocked ? 'admin-btn-success' : 'admin-btn-danger'}`}
                style={{ flex: 1 }}
                onClick={() => onLock(!branch.isLocked)}
                disabled={isSaving}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{branch.isLocked ? 'lock_open' : 'lock'}</span>
                {branch.isLocked ? 'Mở khóa' : 'Khóa'}
              </button>
              <button
                className="admin-btn admin-btn-danger"
                style={{ flex: 1 }}
                onClick={onDelete}
                disabled={isSaving}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                Xóa
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Branches() {
  const { partnerId: partnerIdParam } = useParams<{ partnerId?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const partnerId = partnerIdParam ? Number(partnerIdParam) : undefined;
  const isSinglePartnerMode = partnerId !== undefined && !isNaN(partnerId);

  const {
    branches,
    selectedBranch,
    filters,
    isLoading,
    isSaving,
    error,
    fetchBranches,
    fetchBranchDetail,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchLock,
    updateFilters,
    resetFilters,
    setSelectedBranch,
  } = useBranchManagement();

  const { partners } = usePartnerManagement();

  const [search, setSearch] = useState('');
  const [lockFilter, setLockFilter] = useState<'all' | 'active' | 'locked'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<EditForm>({ branchName: '', address: '', phoneNumber: '' });
  const [createError, setCreateError] = useState('');

  const activePartnerName = isSinglePartnerMode
    ? partners.find((p) => p.partnerId === partnerId)?.companyName ?? `Partner #${partnerId}`
    : null;

  useEffect(() => {
    const isLocked = lockFilter === 'active' ? false : lockFilter === 'locked' ? true : undefined;
    fetchBranches(1, { search, isLocked, partnerId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  const handleSearch = () => {
    const isLocked = lockFilter === 'active' ? false : lockFilter === 'locked' ? true : undefined;
    fetchBranches(1, { search, isLocked, partnerId });
  };

  const handleLockFilter = (val: 'all' | 'active' | 'locked') => {
    setLockFilter(val);
    const isLocked = val === 'active' ? false : val === 'locked' ? true : undefined;
    fetchBranches(1, { search, isLocked, partnerId });
  };

  const openDetail = async (branchId: number) => {
    await fetchBranchDetail(branchId);
  };

  const handleLock = async (locked: boolean) => {
    if (!selectedBranch) return;
    try {
      await toggleBranchLock(selectedBranch.partnerId, selectedBranch.branchId, locked);
      showToast(locked ? 'Đã khóa chi nhánh' : 'Đã mở khóa chi nhánh', 'success');
      setSelectedBranch(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi khóa/mở khóa';
      showToast(msg, 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedBranch) return;
    if (!confirm(`Xóa chi nhánh "${selectedBranch.branchName}"?`)) return;
    try {
      await deleteBranch(selectedBranch.partnerId, selectedBranch.branchId);
      showToast('Đã xóa chi nhánh', 'success');
      setSelectedBranch(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi xóa chi nhánh', 'error');
    }
  };

  const handleUpdate = async (data: EditForm) => {
    if (!selectedBranch) return;
    try {
      await updateBranch(selectedBranch.partnerId, selectedBranch.branchId, data);
      showToast('Cập nhật chi nhánh thành công', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi cập nhật', 'error');
    }
  };

  const handleCreate = async () => {
    if (!partnerId) return;
    if (!createForm.branchName.trim() || !createForm.address.trim()) {
      setCreateError('Tên và địa chỉ là bắt buộc.');
      return;
    }
    try {
      await createBranch(partnerId, {
        branchName: createForm.branchName.trim(),
        address: createForm.address.trim(),
        phoneNumber: createForm.phoneNumber.trim() || undefined,
      });
      showToast('Thêm chi nhánh thành công!', 'success');
      setShowCreateModal(false);
      setCreateForm({ branchName: '', address: '', phoneNumber: '' });
      setCreateError('');
      fetchBranches(1, { search, partnerId });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi tạo chi nhánh', 'error');
    }
  };

  const lockedCount = branches.filter((b) => b.isLocked).length;
  const activeCount = branches.filter((b) => !b.isLocked).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isSinglePartnerMode && (
            <button
              onClick={() => navigate('/partners')}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            </button>
          )}
          <div>
            <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {isSinglePartnerMode ? `Chi nhánh — ${activePartnerName}` : 'Quản lý chi nhánh'}
            </h1>
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              {isSinglePartnerMode
                ? `Danh sách chi nhánh thuộc đối tác #${partnerId}`
                : 'Xem, quản lý và sửa chi nhánh của tất cả đối tác.'}
            </p>
          </div>
        </div>
        {isSinglePartnerMode && (
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Thêm chi nhánh
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Tổng chi nhánh</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#3B82F6' }}>{branches.length}</p>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Đang hoạt động</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981' }}>{activeCount}</p>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Bị khóa</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#EF4444' }}>{lockedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '18px' }}>search</span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder="Tìm chi nhánh, địa chỉ, đối tác..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
          <select
            className="admin-input"
            style={{ width: 'auto', minWidth: '160px' }}
            value={lockFilter}
            onChange={(e) => handleLockFilter(e.target.value as 'all' | 'active' | 'locked')}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Bị khóa</option>
          </select>
          <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            Lọc
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={() => { setSearch(''); resetFilters(); }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Đang tải...</div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: 'var(--color-error)' }}>{error}</div>
        ) : branches.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            {isSinglePartnerMode ? 'Chưa có chi nhánh nào cho đối tác này.' : 'Chưa có chi nhánh nào.'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {isSinglePartnerMode ? null : <th>Đối tác</th>}
                <th>Tên chi nhánh</th>
                <th>Địa chỉ</th>
                <th>SĐT</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.branchId}>
                  {isSinglePartnerMode ? null : (
                    <td>
                      <span className="font-body-sm" style={{ fontWeight: 600 }}>{branch.partner?.companyName ?? `P#${branch.partnerId}`}</span>
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '2rem', height: '2rem', borderRadius: '0.375rem',
                        background: 'var(--color-secondary-container)',
                        color: 'var(--color-on-secondary-container)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                      }}>
                        {branch.branchName[0]}
                      </div>
                      <span className="font-body-sm" style={{ fontWeight: 600 }}>{branch.branchName}</span>
                    </div>
                  </td>
                  <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{branch.address}</span></td>
                  <td><span className="font-label-sm">{branch.phoneNumber ?? '—'}</span></td>
                  <td>
                    <span className={`badge ${branch.isLocked ? 'badge-locked' : 'badge-active'}`}>
                      {branch.isLocked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{fmtDate(branch.createdAt)}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <button
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                        onClick={() => openDetail(branch.branchId)}
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                      </button>
                      <button
                        className={`admin-btn ${branch.isLocked ? 'admin-btn-success' : 'admin-btn-ghost'}`}
                        style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                        onClick={() => toggleBranchLock(branch.partnerId, branch.branchId, !branch.isLocked)}
                        disabled={isSaving}
                        title={branch.isLocked ? 'Mở khóa' : 'Khóa'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{branch.isLocked ? 'lock_open' : 'lock'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Panel */}
      {selectedBranch && (
        <BranchDetailPanel
          branch={selectedBranch}
          partnerId={selectedBranch.partnerId}
          onClose={() => setSelectedBranch(null)}
          onLock={handleLock}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          isSaving={isSaving}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div className="side-panel-overlay" onClick={() => setShowCreateModal(false)} />
          <div className="side-panel" style={{ width: '28rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Thêm chi nhánh mới</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              {createError && (
                <div style={{ padding: '0.75rem', background: 'var(--color-error-container, #fee2e2)', borderRadius: '0.5rem', marginBottom: '1rem', color: 'var(--color-error)' }} className="font-label-sm">
                  {createError}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-on-surface-variant)' }}>
                    Tên chi nhánh <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                  </label>
                  <input
                    className="admin-input"
                    placeholder="VD: Chi nhánh Quận 7"
                    value={createForm.branchName}
                    onChange={(e) => setCreateForm((f) => ({ ...f, branchName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-on-surface-variant)' }}>
                    Địa chỉ <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                  </label>
                  <input
                    className="admin-input"
                    placeholder="VD: 469 Nguyễn Hữu Thọ, Q.7, TP.HCM"
                    value={createForm.address}
                    onChange={(e) => setCreateForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-on-surface-variant)' }}>
                    SĐT (tùy chọn)
                  </label>
                  <input
                    className="admin-input"
                    placeholder="0xxxxxxxxx"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
                Hủy
              </button>
              <button className="admin-btn admin-btn-primary" style={{ flex: 2 }} onClick={handleCreate}>
                Tạo chi nhánh
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}