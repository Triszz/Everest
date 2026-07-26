import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { useToast } from '../components/shared/Toast';
import { adminPostsApi } from '../services/admin.service';
import type { PostResponse, PostStatus } from '../services/admin.service';

const STATUS_OPTIONS: { value: PostStatus; label: string; hint: string }[] = [
  { value: 'Hidden', label: 'Bản nháp', hint: 'Chỉ admin thấy, chưa hiển thị cho khách' },
  { value: 'Visible', label: 'Đăng ngay', hint: 'Hiển thị công khai trên trang chủ khách hàng' },
];

export default function PostEditor() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isEdit = Boolean(postId);

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PostStatus>('Hidden');

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [original, setOriginal] = useState<PostResponse | null>(null);

  const dirty = useMemo(
    () =>
      title.trim() !== (original?.title ?? '') ||
      content !== (original?.content ?? '') ||
      (imageUrl.trim() || '') !== (original?.imageUrl ?? ''),
    [title, content, imageUrl, original],
  );

  useEffect(() => {
    if (!isEdit || !postId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const post = await adminPostsApi.getById(Number(postId));
        if (cancelled) return;
        setOriginal(post);
        setTitle(post.title);
        setImageUrl(post.imageUrl ?? '');
        setContent(post.content);
        setStatus(post.status);
      } catch (err: unknown) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Không thể tải bài viết.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, postId]);

  const goBack = () => navigate('/content?tab=posts');

  const handleSave = async (publish?: PostStatus) => {
    if (!title.trim()) {
      showToast('Tiêu đề không được để trống', 'error');
      return;
    }
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (!plainText) {
      showToast('Nội dung không được để trống', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const finalStatus = publish ?? status;
      if (isEdit && postId) {
        await adminPostsApi.update(Number(postId), {
          title: title.trim(),
          content,
          imageUrl: imageUrl.trim() || null,
        });
        if (publish && publish !== original?.status) {
          await adminPostsApi.updateStatus(Number(postId), { status: finalStatus });
        }
        showToast('Đã lưu thay đổi!', 'success');
      } else {
        await adminPostsApi.create({
          title: title.trim(),
          content,
          imageUrl: imageUrl.trim() || null,
          status: finalStatus,
        });
        showToast('Đã tạo bài viết!', 'success');
      }
      goBack();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lưu thất bại', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
        Đang tải bài viết...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <button className="admin-btn admin-btn-ghost" onClick={goBack}>← Quay lại</button>
        <div style={{ marginTop: '1rem', color: 'var(--color-error)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--color-outline-variant)',
          background: 'var(--color-surface)',
        }}
      >
        <button className="admin-btn admin-btn-ghost" onClick={goBack} disabled={isSaving}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Quay lại
        </button>
        <div style={{ flex: 1 }}>
          <div className="font-title-md" style={{ margin: 0 }}>
            {isEdit ? 'Sửa bài viết' : 'Tạo bài viết mới'}
          </div>
          <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {isEdit ? `Bài viết #${postId}` : 'Bản nháp'}
            {dirty && ' · Có thay đổi chưa lưu'}
          </div>
        </div>
        <button
          className="admin-btn admin-btn-ghost"
          onClick={() => handleSave('Hidden')}
          disabled={isSaving}
        >
          Lưu nháp
        </button>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => handleSave('Visible')}
          disabled={isSaving}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>publish</span>
          {isSaving ? 'Đang lưu...' : status === 'Visible' && isEdit ? 'Cập nhật & đăng' : 'Đăng'}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 22rem',
          gap: '1.5rem',
          padding: '1.5rem',
          minHeight: 0,
        }}
      >
        {/* Editor column */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề bài viết..."
              maxLength={200}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'transparent',
                color: 'var(--color-on-surface)',
                padding: 0,
              }}
            />
            <div
              className="font-label-sm"
              style={{
                color: 'var(--color-on-surface-variant)',
                marginTop: '0.5rem',
                textAlign: 'right',
              }}
            >
              {title.length}/200
            </div>
          </div>

          <div className="admin-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: '24rem' }}>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                placeholder="Viết nội dung bài viết tại đây..."
                style={{ height: '100%' }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    ['blockquote', 'code-block'],
                    ['link', 'image'],
                    ['clean'],
                  ],
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="admin-card" style={{ padding: '1.25rem' }}>
            <div className="font-title-sm" style={{ margin: 0, marginBottom: '1rem' }}>
              Cài đặt
            </div>
            <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Trạng thái
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    border:
                      status === opt.value
                        ? '1.5px solid var(--color-primary)'
                        : '1px solid var(--color-outline-variant)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    background:
                      status === opt.value
                        ? 'var(--color-primary-container, transparent)'
                        : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="post-status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                    style={{ marginTop: '0.15rem' }}
                  />
                  <div>
                    <div className="font-body-sm" style={{ fontWeight: 600 }}>{opt.label}</div>
                    <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {opt.hint}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="admin-card" style={{ padding: '1.25rem' }}>
            <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Ảnh bìa (URL)
            </label>
            <input
              type="url"
              className="admin-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
            {imageUrl.trim() && (
              <img
                src={imageUrl}
                alt="preview"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  borderRadius: '0.5rem',
                  objectFit: 'cover',
                  maxHeight: '10rem',
                }}
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            )}
          </div>

          {isEdit && original && (
            <div className="admin-card" style={{ padding: '1.25rem' }}>
              <div className="font-title-sm" style={{ margin: 0, marginBottom: '0.5rem' }}>
                Thông tin
              </div>
              <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', display: 'grid', gap: '0.25rem' }}>
                <div>Tác giả: {original.author?.fullName ?? '—'}</div>
                <div>Tạo lúc: {new Date(original.createdAt).toLocaleString('vi-VN')}</div>
                <div>Đăng lúc: {original.publishedAt ? new Date(original.publishedAt).toLocaleString('vi-VN') : '—'}</div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}