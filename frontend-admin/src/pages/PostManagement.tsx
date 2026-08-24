import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/shared/Toast';
import { usePostManagement } from '../hooks/usePostManagement';
import type { PostResponse, PostStatus } from '../services/admin.service';

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function PostManagement() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    posts,
    isLoading,
    isSaving,
    error,
    fetchPosts,
    togglePostStatus,
    deletePost,
  } = usePostManagement();

  const [deleteTarget, setDeleteTarget] = useState<PostResponse | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openCreate = () => navigate('/content/posts/new');
  const openEdit = (post: PostResponse) => navigate(`/content/posts/${post.postId}`);

  const handleToggle = async (post: PostResponse) => {
    const next: PostStatus = post.status === 'Visible' ? 'Hidden' : 'Visible';
    try {
      await togglePostStatus(post.postId, next);
      showToast(next === 'Visible' ? 'Đã hiện bài viết' : 'Đã ẩn bài viết', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi đổi trạng thái', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost(deleteTarget.postId);
      showToast('Đã xóa bài viết!', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi xóa bài viết', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Quản lý bài viết (tin tức, mẹo, thông báo) hiển thị trên trang chủ khách hàng.
        </p>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Tạo bài viết
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Đang tải...</div>
      ) : error ? (
        <div style={{ padding: '1.5rem', color: 'var(--color-error)' }}>{error}</div>
      ) : posts.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
          Chưa có bài viết nào.
        </div>
      ) : (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.postId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt=""
                          style={{ width: '2.5rem', height: '2.5rem', objectFit: 'cover', borderRadius: '0.25rem', flexShrink: 0 }}
                        />
                      )}
                      <span className="font-body-sm" style={{ fontWeight: 600 }}>{post.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {post.author?.fullName ?? '—'}
                    </span>
                  </td>
                  <td>
                    <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {formatDate(post.createdAt)}
                    </span>
                  </td>
                  <td>
                    <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {formatDate(post.createdAt)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${post.status === 'Visible' ? 'badge-active' : 'badge-info'}`}>
                      {post.status === 'Visible' ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <button
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                        onClick={() => handleToggle(post)}
                        disabled={isSaving}
                      >
                        {post.status === 'Visible' ? 'Ẩn' : 'Đăng'}
                      </button>
                      <button
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                        onClick={() => openEdit(post)}
                        disabled={isSaving}
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                      </button>
                      <button
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                        onClick={() => setDeleteTarget(post)}
                        disabled={isSaving}
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <>
          <div className="side-panel-overlay" onClick={() => setDeleteTarget(null)} />
          <div className="side-panel" style={{ width: '24rem' }}>
            <div style={{ padding: '1.5rem' }}>
              <h2 className="font-title-md" style={{ margin: 0, marginBottom: '0.5rem' }}>Xóa bài viết?</h2>
              <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                Bạn có chắc chắn muốn xóa bài viết <strong>{deleteTarget.title}</strong>? Hành động này không thể hoàn tác.
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