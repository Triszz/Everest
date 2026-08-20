import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/shared/Toast';
import { usePartnerManagement } from '../hooks/usePartnerManagement';
import type { PartnerStatus, PartnerResponse } from '../services/admin.service';

const statusConfig: Record<PartnerStatus, { label: string; cls: string }> = {
  Pending: { label: 'Chờ duyệt', cls: 'badge-pending' },
  Approved: { label: 'Đã duyệt', cls: 'badge-active' },
  Rejected: { label: 'Từ chối', cls: 'badge-locked' },
  Inactive: { label: 'Không hoạt động', cls: 'badge-info' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

type LockAction = 'LOCK' | 'UNLOCK';

export default function Partners() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    partners,
    page,
    total,
    totalPages,
    isLoading,
    error,
    fetchPartners,
    approvePartner,
    rejectPartner,
    togglePartnerLock,
  } = usePartnerManagement();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | ''>('');
  const [selectedPartner, setSelectedPartner] = useState<PartnerResponse | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [lockTarget, setLockTarget] = useState<{ id: number; action: LockAction } | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleSearch = () => {
    fetchPartners(1, { search: search || undefined, status: statusFilter || undefined });
  };

  const openLock = (partnerId: number, action: LockAction) => {
    setLockTarget({ id: partnerId, action });
    setLockReason('');
    setShowLockModal(true);
  };

  const handleLock = async () => {
    if (!lockTarget || !lockReason.trim()) return;
    setIsLocking(true);
    try {
      const result = await togglePartnerLock(lockTarget.id, lockTarget.action === 'LOCK', lockReason.trim());
      showToast(
        `Đã ${lockTarget.action === 'LOCK' ? 'khóa' : 'mở khóa'} đối tác — ${result.affected.branches} chi nhánh, ${result.affected.cashiers} nhân viên bị ảnh hưởng`,
        'success',
      );
      setShowLockModal(false);
      setLockTarget(null);
      setLockReason('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi khóa/mở khóa', 'error');
    } finally {
      setIsLocking(false);
    }
  };

  const handleApprove = async (partnerId: number) => {
    try {
      await approvePartner(partnerId);
      showToast('Đã phê duyệt đối tác!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi phê duyệt', 'error');
    }
  };

  const handleReject = async (partnerId: number, reason: string) => {
    try {
      await rejectPartner(partnerId, reason);
      showToast('Đã từ chối đối tác', 'warning');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi từ chối', 'error');
    }
  };

  const pendingCount = partners.filter((p) => p.status === 'Pending').length;
  const approvedCount = partners.filter((p) => p.status === 'Approved').length;
  const lockedCount = partners.filter((p) => p.status === 'Inactive').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Quản lý đối tác</h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Duyệt hồ sơ, quản lý chi nhánh và trạng thái đối tác.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Tổng đối tác</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#3B82F6' }}>{total}</p>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Chờ duyệt</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F59E0B' }}>{pendingCount}</p>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>Đã duyệt</p>
          <p className="font-headline-md" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981' }}>{approvedCount}</p>
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
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '18px' }}>
              search
            </span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder="Tìm kiếm tên doanh nghiệp, MST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
          <select
            className="admin-input"
            style={{ width: 'auto', minWidth: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PartnerStatus | '')}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Từ chối</option>
            <option value="Inactive">Không hoạt động</option>
          </select>
          <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            Lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Đang tải...</div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: 'var(--color-error)' }}>{error}</div>
        ) : partners.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Chưa có đối tác nào.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã số</th>
                  <th>Tên doanh nghiệp</th>
                  <th>MST</th>
                  <th>Trạng thái</th>
                  <th>Ngày đăng ký</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => {
                  const sc = statusConfig[partner.status] ?? statusConfig.Inactive;
                  return (
                    <tr key={partner.partnerId}>
                      <td><span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.7rem' }}>#{partner.partnerId}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
                            background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                          }}>
                            {partner.companyName[0]}
                          </div>
                          <p className="font-body-sm" style={{ fontWeight: 600 }}>{partner.companyName}</p>
                        </div>
                      </td>
                      <td><span className="font-label-sm">{partner.taxCode}</span></td>
                      <td>
                        <span className={`badge ${sc.cls}`}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                          {sc.label}
                        </span>
                      </td>
                      <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{fmtDate(partner.createdAt)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                            onClick={() => setSelectedPartner(partner)}
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                            Chi tiết
                          </button>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                            onClick={() => navigate(`/partners/${partner.partnerId}/branches`)}
                            title="Xem chi nhánh"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>store</span>
                            Chi nhánh
                          </button>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                            onClick={() => navigate(`/vouchers?partnerId=${partner.partnerId}`)}
                            title="Xem voucher của đối tác"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>confirmation_number</span>
                            Voucher
                          </button>

                          {partner.status === 'Pending' && (
                            <>
                              <button
                                className="admin-btn admin-btn-success"
                                style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                                onClick={() => handleApprove(partner.partnerId)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                                Duyệt
                              </button>
                              <button
                                className="admin-btn admin-btn-ghost"
                                style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                                onClick={() => openLock(partner.partnerId, 'LOCK')}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                              </button>
                            </>
                          )}

                          {(partner.status === 'Approved') && (
                            <button
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                              onClick={() => openLock(partner.partnerId, 'LOCK')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>block</span>
                              Khóa
                            </button>
                          )}

                          {partner.status === 'Inactive' && (
                            <button
                              className="admin-btn admin-btn-success"
                              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                              onClick={() => openLock(partner.partnerId, 'UNLOCK')}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_open</span>
                              Mở khóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Hiển thị {partners.length} / {total} đối tác
            </p>
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => fetchPartners(page - 1)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
              </button>
              <span className="pagination-btn active">{page}</span>
              <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => fetchPartners(page + 1)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Partner Detail Panel */}
      {selectedPartner && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedPartner(null)} />
          <div className="side-panel">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: '0.5rem',
                  background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1.25rem',
                }}>
                  {selectedPartner.companyName[0]}
                </div>
                <div>
                  <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>{selectedPartner.companyName}</h3>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Đăng ký {fmtDate(selectedPartner.createdAt)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${statusConfig[selectedPartner.status]?.cls ?? 'badge-info'}`}>
                  {statusConfig[selectedPartner.status]?.label ?? selectedPartner.status}
                </span>
                <button onClick={() => setSelectedPartner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>MÃ SỐ</p>
                  <p className="font-body-md" style={{ fontWeight: 600 }}>#{selectedPartner.partnerId}</p>
                </div>
                <div>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>MST</p>
                  <p className="font-body-md">{selectedPartner.taxCode}</p>
                </div>
              </div>

              {selectedPartner.businessLicenseUrl && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>GIẤY PHÉP KD</p>
                  <a
                    href={selectedPartner.businessLicenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                    Mở liên kết
                  </a>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.65rem' }}>TRẠNG THÁI TÀI KHOẢN</p>
                <span className="badge">
                  {selectedPartner.isLocked ? '🔒 Bị khóa' : '✅ Hoạt động'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              {selectedPartner.status === 'Pending' && (
                <>
                  <button
                    className="admin-btn admin-btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => openLock(selectedPartner.partnerId, 'LOCK')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>block</span>
                    Từ chối
                  </button>
                  <button
                    className="admin-btn admin-btn-success"
                    style={{ flex: 2 }}
                    onClick={() => { handleApprove(selectedPartner.partnerId); setSelectedPartner(null) }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    Phê duyệt đối tác
                  </button>
                </>
              )}
              {selectedPartner.status === 'Approved' && (
                <button
                  className="admin-btn admin-btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => { setSelectedPartner(null); openLock(selectedPartner.partnerId, 'LOCK') }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>block</span>
                  Khóa đối tác
                </button>
              )}
              {selectedPartner.status === 'Inactive' && (
                <button
                  className="admin-btn admin-btn-success"
                  style={{ flex: 1 }}
                  onClick={() => { setSelectedPartner(null); openLock(selectedPartner.partnerId, 'UNLOCK') }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_open</span>
                  Mở khóa đối tác
                </button>
              )}
              <button
                className="admin-btn admin-btn-ghost"
                style={{ flex: 1 }}
                onClick={() => { setSelectedPartner(null); navigate(`/partners/${selectedPartner.partnerId}/branches`) }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>store</span>
                Xem chi nhánh
              </button>
            </div>
          </div>
        </>
      )}

      {/* Lock/Unlock Modal */}
      {showLockModal && lockTarget && (
        <>
          <div className="side-panel-overlay" onClick={() => { setShowLockModal(false); setLockTarget(null) }} />
          <div className="side-panel" style={{ width: '28rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>
                {lockTarget.action === 'LOCK' ? 'Khóa đối tác' : 'Mở khóa đối tác'}
              </h3>
              <button onClick={() => { setShowLockModal(false); setLockTarget(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '1.5rem', flex: 1 }}>
              {lockTarget.action === 'LOCK' ? (
                <div style={{ padding: '0.75rem', background: 'var(--color-error-container, #fee2e2)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    ⚠️ Khóa đối tác sẽ đồng thời:
                    <br />• Khóa tất cả <strong>chi nhánh</strong> thuộc đối tác này
                    <br />• Khóa tất cả tài khoản <strong>nhân viên Cashier</strong> của đối tác
                    <br />• Khách hàng <strong>không thể mua</strong> voucher của đối tác này
                  </p>
                </div>
              ) : (
                <div style={{ padding: '0.75rem', background: 'var(--color-primary-container, #c9e6ff)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    🔓 Mở khóa sẽ đồng thời:
                    <br />• Mở khóa tất cả <strong>chi nhánh</strong>
                    <br />• Mở khóa tất cả tài khoản <strong>nhân viên Cashier</strong>
                    <br />• Đối tác quay lại hoạt động bình thường
                  </p>
                </div>
              )}

              <div>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                  Lý do <span style={{ color: 'var(--color-error-danger)' }}>*</span>
                </label>
                <textarea
                  className="admin-input"
                  style={{ resize: 'vertical', minHeight: '100px', width: '100%' }}
                  placeholder={lockTarget.action === 'LOCK' ? 'Nhập lý do khóa đối tác...' : 'Nhập lý do mở khóa đối tác...'}
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                />
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button
                className="admin-btn admin-btn-ghost"
                style={{ flex: 1 }}
                onClick={() => { setShowLockModal(false); setLockTarget(null) }}
              >
                Hủy
              </button>
              <button
                className={`admin-btn ${lockTarget.action === 'LOCK' ? 'admin-btn-danger' : 'admin-btn-success'}`}
                style={{ flex: 2 }}
                onClick={handleLock}
                disabled={!lockReason.trim() || isLocking}
              >
                {isLocking
                  ? 'Đang xử lý...'
                  : `Xác nhận ${lockTarget.action === 'LOCK' ? 'khóa' : 'mở khóa'}`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}