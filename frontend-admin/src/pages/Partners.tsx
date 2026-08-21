import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/shared/Toast';
import { usePartnerManagement } from '../hooks/usePartnerManagement';
import type { PartnerStatus } from '../services/admin.service';

const statusConfig: Record<PartnerStatus, { label: string; cls: string }> = {
  Pending: { label: 'Chờ duyệt', cls: 'badge-pending' },
  Approved: { label: 'Đã duyệt', cls: 'badge-active' },
  Rejected: { label: 'Từ chối', cls: 'badge-locked' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

type SearchField = 'companyName' | 'partnerId' | 'phoneNumber' | 'email';

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
  const [searchField, setSearchField] = useState<SearchField>('companyName');
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | ''>('');
  const [isLockedFilter, setIsLockedFilter] = useState<'' | 'true' | 'false'>('');
  const [isLocking, setIsLocking] = useState(false);

  const handleSearch = () => {
    fetchPartners(1, {
      search: search || undefined,
      searchField,
      status: statusFilter || undefined,
      isLocked: isLockedFilter === '' ? undefined : isLockedFilter === 'true',
    });
  };

  const handleToggleLock = async (partnerId: number, currentLocked: boolean) => {
    setIsLocking(true);
    try {
      const result = await togglePartnerLock(partnerId, currentLocked);
      showToast(
        `Đã ${currentLocked ? 'mở khóa' : 'khóa'} đối tác — ${result.affected.branches} chi nhánh, ${result.affected.cashiers} nhân viên bị ảnh hưởng`,
        'success',
      );
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
  const lockedCount = partners.filter((p) => p.isLocked).length;

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
          <select
            className="admin-input"
            style={{ width: 'auto', minWidth: '180px' }}
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as SearchField)}
          >
            <option value="companyName">Tên doanh nghiệp</option>
            <option value="partnerId">Mã đối tác</option>
            <option value="phoneNumber">Số điện thoại</option>
            <option value="email">Email</option>
          </select>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)', fontSize: '18px' }}>
              search
            </span>
            <input
              className="admin-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder={
                searchField === 'partnerId'
                  ? 'Nhập mã đối tác (số)...'
                  : searchField === 'phoneNumber'
                    ? 'Nhập số điện thoại...'
                    : searchField === 'email'
                      ? 'Nhập email...'
                      : 'Nhập tên doanh nghiệp...'
              }
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
          </select>
          <select
            className="admin-input"
            style={{ width: 'auto', minWidth: '160px' }}
            value={isLockedFilter}
            onChange={(e) => setIsLockedFilter(e.target.value as '' | 'true' | 'false')}
          >
            <option value="">Tất cả trạng thái khóa</option>
            <option value="true">Bị khóa</option>
            <option value="false">Hoạt động</option>
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
                  const sc = statusConfig[partner.status] ?? { label: partner.status, cls: 'badge-info' };
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {partner.isLocked ? (
                            <span className="badge badge-locked">
                              <span className="material-symbols-outlined" style={{ fontSize: '12px', marginRight: '0.125rem' }}>lock</span>
                              Bị khóa
                            </span>
                          ) : (
                            <span className={`badge ${sc.cls}`}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                              {sc.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{fmtDate(partner.createdAt)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
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
                                onClick={() => handleReject(partner.partnerId, 'Đối tác không đáp ứng yêu cầu')}
                                title="Từ chối"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                              </button>
                            </>
                          )}

                          {(partner.status === 'Approved') && !partner.isLocked && (
                            <button
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                              onClick={() => handleToggleLock(partner.partnerId, false)}
                              disabled={isLocking}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>block</span>
                              Khóa
                            </button>
                          )}

                          {partner.isLocked && (
                            <button
                              className="admin-btn admin-btn-success"
                              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                              onClick={() => handleToggleLock(partner.partnerId, true)}
                              disabled={isLocking}
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
    </div>
  )
}