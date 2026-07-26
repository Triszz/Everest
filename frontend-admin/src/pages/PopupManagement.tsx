import { useState, useEffect } from 'react';
import { useToast } from '../components/shared/Toast';
import { usePopupManagement, type CreatePopupPayload } from '../hooks/usePopupManagement';
import type { PopupResponse, PopupStatus } from '../services/admin.service';

export default function PopupManagement() {
  const { showToast } = useToast();
  const {
    popups,
    isLoading,
    isSaving,
    error,
    fetchPopups,
    createPopup,
    updatePopup,
    togglePopupStatus,
    deletePopup,
  } = usePopupManagement();

  const [showModal, setShowModal] = useState(false);
  const [editPopup, setEditPopup] = useState<PopupResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PopupResponse | null>(null);
  const [form, setForm] = useState<CreatePopupPayload>({
    title: '',
    body: '',
    imageUrl: '',
    ctaLabel: '',
    ctaTargetUrl: '',
    status: 'Hidden',
  });

  useEffect(() => {
    fetchPopups();
  }, [fetchPopups]);

  const openCreate = () => {
    setEditPopup(null);
    setForm({ title: '', body: '', imageUrl: '', ctaLabel: '', ctaTargetUrl: '', status: 'Hidden' });
    setShowModal(true);
  };

  const openEdit = (popup: PopupResponse) => {
    setEditPopup(popup);
    setForm({
      title: popup.title,
      body: popup.body,
      imageUrl: popup.imageUrl ?? '',
      ctaLabel: popup.ctaLabel ?? '',
      ctaTargetUrl: popup.ctaTargetUrl ?? '',
      status: popup.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('Tiêu đề popup không được để trống', 'error'); return; }
    if (!form.body.trim()) { showToast('Nội dung popup không được để trống', 'error'); return; }
    try {
      if (editPopup) {
        await updatePopup(editPopup.popupId, {
          title: form.title.trim(),
          body: form.body.trim(),
          imageUrl: form.imageUrl?.trim() || null,
          ctaLabel: form.ctaLabel?.trim() || null,
          ctaTargetUrl: form.ctaTargetUrl?.trim() || null,
        });
        showToast('Đã cập nhật popup!', 'success');
      } else {
        await createPopup({
          title: form.title.trim(),
          body: form.body.trim(),
          imageUrl: form.imageUrl?.trim() || null,
          ctaLabel: form.ctaLabel?.trim() || null,
          ctaTargetUrl: form.ctaTargetUrl?.trim() || null,
          status: form.status,
        });
        showToast('Đã tạo popup mới!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi lưu popup', 'error');
    }
  };

  const handleToggle = async (popup: PopupResponse) => {
    const next: PopupStatus = popup.status === 'Visible' ? 'Hidden' : 'Visible';
    try {
      await togglePopupStatus(popup.popupId, next);
      showToast(next === 'Visible' ? 'Đã hiển thị popup (các popup khác đã được ẩn)' : 'Đã ẩn popup', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi đổi trạng thái', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePopup(deleteTarget.popupId);
      showToast('Đã xóa popup!', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi xóa popup', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Quản lý popup marketing hiển thị nổi bật trên trang chủ.
          <strong> Chỉ một popup ở trạng thái "Hiển thị"</strong> tại một thời điểm — bật popup này sẽ tự động ẩn các popup còn lại.
        </p>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Thêm popup
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Đang tải...</div>
      ) : error ? (
        <div style={{ padding: '1.5rem', color: 'var(--color-error)' }}>{error}</div>
      ) : popups.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
          Chưa có popup nào.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {popups.map((popup) => (
            <div key={popup.popupId} className="admin-card" style={{ overflow: 'hidden' }}>
              <div style={{
                height: '6rem',
                background: popup.imageUrl
                  ? `url(${popup.imageUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg, var(--color-tertiary-container) 0%, var(--color-secondary-container) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!popup.imageUrl && (
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--color-on-tertiary-container, var(--color-on-surface))' }}>campaign</span>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 className="font-body-md" style={{ fontWeight: 600, margin: 0 }}>{popup.title}</h3>
                  <span className={`badge ${popup.status === 'Visible' ? 'badge-active' : 'badge-info'}`} style={{ flexShrink: 0 }}>
                    {popup.status === 'Visible' ? 'Đang hiển thị' : 'Đã ẩn'}
                  </span>
                </div>
                <p className="font-body-sm" style={{
                  color: 'var(--color-on-surface-variant)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: 0,
                  minHeight: '2.5em',
                }}>
                  {popup.body}
                </p>
                {popup.ctaLabel && (
                  <div className="font-label-sm" style={{ color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                    CTA: <strong>{popup.ctaLabel}</strong>
                    {popup.ctaTargetUrl ? ` → ${popup.ctaTargetUrl}` : ''}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.75rem' }}>
                  <button
                    className="admin-btn admin-btn-ghost"
                    style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                    onClick={() => handleToggle(popup)}
                    disabled={isSaving}
                  >
                    {popup.status === 'Visible' ? 'Ẩn' : 'Hiển thị'}
                  </button>
                  <button
                    className="admin-btn admin-btn-ghost"
                    style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                    onClick={() => openEdit(popup)}
                    disabled={isSaving}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                    Sửa
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                    onClick={() => setDeleteTarget(popup)}
                    disabled={isSaving}
                    title="Xóa popup"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <>
          <div className="side-panel-overlay" onClick={() => setShowModal(false)} />
          <div className="side-panel" style={{ width: '32rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="font-title-md" style={{ margin: 0 }}>{editPopup ? 'Sửa popup' : 'Thêm popup mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Tiêu đề *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Ưu đãi hè 30%!"
                  maxLength={150}
                />
              </div>
              <div>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Nội dung *</label>
                <textarea
                  className="admin-input"
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Mô tả ngắn cho popup..."
                  maxLength={500}
                />
                <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '0.25rem', textAlign: 'right' }}>
                  {form.body.length}/500
                </div>
              </div>
              <div>
                <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>URL ảnh (tuỳ chọn)</label>
                <input
                  type="url"
                  className="admin-input"
                  value={form.imageUrl ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>CTA Label</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.ctaLabel ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                    placeholder="Nhận ngay"
                    maxLength={40}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>CTA URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={form.ctaTargetUrl ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, ctaTargetUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              {!editPopup && (
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Trạng thái</label>
                  <select
                    className="admin-input"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PopupStatus }))}
                  >
                    <option value="Hidden">Ẩn (mặc định)</option>
                    <option value="Visible">Hiển thị</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.5rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Hủy</button>
              <button
                className="admin-btn admin-btn-primary"
                style={{ flex: 2 }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {editPopup ? 'Lưu thay đổi' : 'Tạo popup'}
              </button>
            </div>
          </div>
        </>
      )}

      {deleteTarget && (
        <>
          <div className="side-panel-overlay" onClick={() => setDeleteTarget(null)} />
          <div className="side-panel" style={{ width: '24rem' }}>
            <div style={{ padding: '1.5rem' }}>
              <h2 className="font-title-md" style={{ margin: 0, marginBottom: '0.5rem' }}>Xóa popup?</h2>
              <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                Bạn có chắc chắn muốn xóa popup <strong>{deleteTarget.title}</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.5rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Hủy</button>
              <button className="admin-btn admin-btn-danger" style={{ flex: 1 }} onClick={handleDelete} disabled={isSaving}>Xóa</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}