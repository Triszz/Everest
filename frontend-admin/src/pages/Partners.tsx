import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/shared/Toast';
import { usePartnerManagement } from '../hooks/usePartnerManagement';
import type { PartnerStatus } from '../services/admin.service';
import { useIsMobile } from '../hooks/useIsMobile';

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
  const isMobile = useIsMobile();

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth >= 640 && windowWidth < 1024;

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

  const getStatsGridClass = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-4';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '0.25rem' }}>Quản lý đối tác</h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Duyệt hồ sơ, quản lý chi nhánh và trạng thái đối tác.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid ${getStatsGridClass()} gap-3 mb-4`}>
        <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.125rem', fontSize: isMobile ? '0.6rem' : undefined }}>Tổng đối tác</p>
          <p className="font-headline-md" style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 700, color: '#3B82F6' }}>{total}</p>
        </div>
        <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.125rem', fontSize: isMobile ? '0.6rem' : undefined }}>Chờ duyệt</p>
          <p className="font-headline-md" style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 700, color: '#F59E0B' }}>{pendingCount}</p>
        </div>
        <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.125rem', fontSize: isMobile ? '0.6rem' : undefined }}>Đã duyệt</p>
          <p className="font-headline-md" style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 700, color: '#10B981' }}>{approvedCount}</p>
        </div>
        <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1.25rem', textAlign: 'center' }}>
          <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.125rem', fontSize: isMobile ? '0.6rem' : undefined }}>Bị khóa</p>
          <p className="font-headline-md" style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 700, color: '#EF4444' }}>{lockedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1rem', marginBottom: '1rem' }}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          <select
            className="admin-input"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as SearchField)}
          >
            <option value="companyName">Tên doanh nghiệp</option>
            <option value="partnerId">Mã đối tác</option>
            <option value="phoneNumber">Số điện thoại</option>
            <option value="email">Email</option>
          </select>
          <div style={{ position: 'relative' }}>
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
            value={isLockedFilter}
            onChange={(e) => setIsLockedFilter(e.target.value as '' | 'true' | 'false')}
          >
            <option value="">Tất cả trạng thái khóa</option>
            <option value="true">Bị khóa</option>
            <option value="false">Hoạt động</option>
          </select>
          <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            {isMobile ? '' : 'Lọc'}
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Đang tải...</div>
      ) : error ? (
        <div style={{ padding: '1.5rem', color: 'var(--color-error)' }}>{error}</div>
      ) : partners.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)', background: 'var(--color-surface-container-lowest)', borderRadius: '0.75rem', border: '1px solid var(--color-outline-variant)' }}>Chưa có đối tác nào.</div>
      ) : isMobile || isTablet ? (
        /* Mobile/Tablet Cards List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {partners.map((partner) => {
            const sc = statusConfig[partner.status] ?? { label: partner.status, cls: 'badge-info' };
            return (
              <div key={partner.partnerId} className="admin-card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                    <div style={{
                      width: isMobile ? '2rem' : '2.25rem', height: isMobile ? '2rem' : '2.25rem', borderRadius: '0.5rem',
                      background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: isMobile ? '0.7rem' : '0.8rem', flexShrink: 0,
                    }}>
                      {partner.companyName[0]}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p className="font-body-sm" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: isMobile ? '0.8rem' : undefined }}>{partner.companyName}</p>
                      <p className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: isMobile ? '0.6rem' : '0.65rem' }}>MST: {partner.taxCode}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                    <span className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: isMobile ? '0.6rem' : '0.65rem' }}>#{partner.partnerId}</span>
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
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(191, 199, 208, 0.1)', paddingTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: isMobile ? '0.6rem' : '0.7rem' }}>
                    Đăng ký: {fmtDate(partner.createdAt)}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {partner.status !== 'Pending' && (
                      <>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: isMobile ? '1.5rem' : '1.75rem' }}
                          onClick={() => navigate(`/partners/${partner.partnerId}/branches`)}
                          title="Chi nhánh"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>store</span>
                        </button>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: isMobile ? '1.5rem' : '1.75rem' }}
                          onClick={() => navigate(`/vouchers?partnerId=${partner.partnerId}`)}
                          title="Voucher"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>confirmation_number</span>
                        </button>
                      </>
                    )}

                    {partner.status === 'Pending' && (
                      <>
                        <button
                          className="admin-btn admin-btn-success"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: isMobile ? '1.5rem' : '1.75rem' }}
                          onClick={() => handleApprove(partner.partnerId)}
                        >
                          Duyệt
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: isMobile ? '1.5rem' : '1.75rem' }}
                          onClick={() => handleReject(partner.partnerId, 'Đối tác không đáp ứng yêu cầu')}
                        >
                          Từ chối
                        </button>
                      </>
                    )}

                    {(partner.status === 'Approved') && !partner.isLocked && (
                      <button
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: isMobile ? '1.5rem' : '1.75rem' }}
                        onClick={() => handleToggleLock(partner.partnerId, false)}
                        disabled={isLocking}
                      >
                        Khóa
                      </button>
                    )}

                    {partner.isLocked && (
                      <button
                        className="admin-btn admin-btn-success"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: isMobile ? '1.5rem' : '1.75rem' }}
                        onClick={() => handleToggleLock(partner.partnerId, true)}
                        disabled={isLocking}
                      >
                        Mở khóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table */
        <div className="admin-card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '80px' }}>Mã số</th>
                  <th style={{ minWidth: '200px' }}>Tên doanh nghiệp</th>
                  <th style={{ minWidth: '140px' }}>MST</th>
                  <th style={{ minWidth: '120px' }}>Trạng thái</th>
                  <th style={{ minWidth: '120px' }}>Ngày đăng ký</th>
                  <th style={{ textAlign: 'right', minWidth: '280px' }}>Thao tác</th>
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
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {partner.status !== 'Pending' && (
                            <>
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
                            </>
                          )}

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
        </div>
      )}

      {/* Pagination (Common) */}
      {!isLoading && partners.length > 0 && totalPages > 1 && (
        <div className="admin-card" style={{ padding: isMobile ? '0.75rem' : '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
  )
}
