import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { useToast } from '../components/shared/Toast';
import { adminPoliciesApi } from '../services/admin.service';
import type { PolicyResponse } from '../services/admin.service';

const EDITOR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

const getPlainText = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

export default function PolicyEditor() {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(policyId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [original, setOriginal] = useState<PolicyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => title !== (original?.title ?? '') || content !== (original?.content ?? ''),
    [title, content, original],
  );

  useEffect(() => {
    if (!isEdit || !policyId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const policy = await adminPoliciesApi.getById(Number(policyId));
        if (cancelled) return;
        setOriginal(policy);
        setTitle(policy.title);
        setContent(policy.content);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải chính sách.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, policyId]);

  const goBack = () => navigate('/content?tab=policies');

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('Tiêu đề không được để trống', 'error');
      return;
    }
    if (!getPlainText(content)) {
      showToast('Nội dung không được để trống', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await adminPoliciesApi.upsert({
        ...(isEdit && policyId ? { policyId: Number(policyId) } : {}),
        title: trimmedTitle,
        content,
      });
      showToast(isEdit ? 'Đã cập nhật chính sách!' : 'Đã tạo chính sách!', 'success');
      goBack();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lưu chính sách thất bại', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Đang tải chính sách...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <button className="admin-btn admin-btn-ghost" onClick={goBack}>Quay lại</button>
        <p style={{ marginTop: '1rem', color: 'var(--color-error)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 2rem)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-outline-variant)', background: 'var(--color-surface)' }}>
        <button className="admin-btn admin-btn-ghost" onClick={goBack} disabled={isSaving}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Quay lại
        </button>
        <div style={{ flex: 1 }}>
          <div className="font-title-md">{isEdit ? 'Chỉnh sửa chính sách' : 'Tạo chính sách mới'}</div>
          <div className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {isEdit ? `Chính sách #${policyId}` : 'Soạn nội dung HTML'}{dirty && ' · Có thay đổi chưa lưu'}
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={isSaving}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
          {isSaving ? 'Đang lưu...' : 'Lưu chính sách'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(20rem, 0.8fr)', gap: '1.5rem', padding: '1.5rem', alignItems: 'start' }}>
        <main className="admin-card policy-editor-page" style={{ padding: '1.5rem' }}>
          <input
            className="policy-title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={255}
            placeholder="Tiêu đề chính sách..."
          />
          <div className="font-label-sm" style={{ textAlign: 'right', color: 'var(--color-on-surface-variant)', marginBottom: '1rem' }}>
            {title.length}/255
          </div>
          <ReactQuill
            className="policy-editor"
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Soạn chính sách như một tài liệu rich-text..."
            modules={EDITOR_MODULES}
          />
        </main>

        <aside className="admin-card" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <div className="font-title-sm" style={{ marginBottom: '1rem' }}>Xem trước</div>
          <article className="policy-preview" dangerouslySetInnerHTML={{ __html: content || '<p>Chưa có nội dung xem trước.</p>' }} />
        </aside>
      </div>
    </div>
  );
}
