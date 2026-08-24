/**
 * Posts.tsx
 * ------------------------------------------------------------------
 * Trang danh sách bài viết (blog/tin tức) cho customer.
 * Layout đồng bộ với Marketplace/MyVouchers:
 *  - Breadcrumb + header trắng (title lớn + subtitle)
 *  - Grid card các bài viết đã published
 *  - Mỗi card hiển thị ảnh, tiêu đề, tác giả, ngày đăng, preview nội dung
 *  - Click vào card → mở trang chi tiết /posts/:id
 *  - Có phân trang
 * ------------------------------------------------------------------
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar as CalendarIcon, User as UserIcon, ArrowRight } from 'lucide-react';
import { postApi } from '../services';
import type { Post } from '../services';
import { formatDate } from '../utils';
import Loading from '../components/Loading';
import { Breadcrumb } from '../components/Breadcrumb';

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    postApi
      .list({ page, limit: 12 })
      .then((res) => {
        if (res.success && res.data) {
          setPosts(res.data.items);
          setTotalPages(res.data.totalPages);
          setTotal(res.data.total);
        }
      })
      .catch((err) => setError(err.message || 'Cannot load posts'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && posts.length === 0) {
    return <Loading message="Loading posts..." />;
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Posts' },
        ]}
      />

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#E8F4FA',
                color: '#0E76A8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={18} />
            </span>
            <h1
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 26,
                fontWeight: 800,
                color: '#1E293B',
                margin: 0,
              }}
            >
              Posts & News
            </h1>
          </div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#64748B',
              margin: 0,
              maxWidth: 720,
            }}
          >
            Discover tips, guides and the latest updates from Everest.
          </p>
          {!loading && !error && (
            <div
              style={{
                marginTop: 12,
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: '#94A3B8',
              }}
            >
              {total} {total === 1 ? 'post' : 'posts'} available
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        {/* Error */}
        {!loading && error && (
          <div
            style={{
              textAlign: 'center',
              padding: 60,
              background: 'white',
              borderRadius: 16,
              border: '1px solid #F1F5F9',
            }}
          >
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                color: '#EF4444',
                marginBottom: 16,
              }}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                background: '#0E76A8',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 60,
              background: 'white',
              borderRadius: 16,
              border: '1px solid #F1F5F9',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>
              <BookOpen size={56} color="#94A3B8" />
            </div>
            <h3
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 18,
                fontWeight: 800,
                color: '#1E293B',
                marginBottom: 8,
              }}
            >
              No posts yet
            </h3>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: '#64748B',
                margin: 0,
              }}
            >
              Come back later to read the latest articles.
            </p>
          </div>
        )}

        {/* Featured post (first item, large) */}
        {!loading && !error && posts.length > 0 && (
          <>
            {posts[0] && page === 1 && (
              <FeaturedPost post={posts[0]} />
            )}

            {/* Grid các bài còn lại */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 18,
                marginTop: page === 1 ? 20 : 0,
              }}
            >
              {(page === 1 ? posts.slice(1) : posts).map((post) => (
                <PostCard key={post.postId} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  const preview = stripHtml(post.content).slice(0, 280);
  const imageUrl =
    post.imageUrl ||
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop';

  return (
    <Link
      to={`/posts/${post.postId}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        textDecoration: 'none',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,118,168,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          minHeight: 320,
          background: '#E2E8F0',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageUrl}
          alt={post.title}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 320,
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: '#0E76A8',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: 999,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Featured
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 14,
            fontSize: 12,
            color: '#64748B',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <UserIcon size={13} />
            {post.author?.fullName || 'Admin'}
          </span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CalendarIcon size={13} />
            {formatDate(post.createdAt)}
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 24,
            fontWeight: 800,
            color: '#1E293B',
            margin: '0 0 12px',
            lineHeight: 1.3,
          }}
        >
          {post.title}
        </h2>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#475569',
            lineHeight: 1.7,
            margin: '0 0 20px',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {preview}
        </p>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#0E76A8',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Read more
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  const preview = stripHtml(post.content).slice(0, 120);
  const imageUrl =
    post.imageUrl ||
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop';

  return (
    <Link
      to={`/posts/${post.postId}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        textDecoration: 'none',
        border: '1px solid #F1F5F9',
        transition: 'all 0.25s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,118,168,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          height: 160,
          overflow: 'hidden',
          background: '#E2E8F0',
          flexShrink: 0,
        }}
      >
        <img
          src={imageUrl}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          padding: '14px 16px 16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 11,
            color: '#94A3B8',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserIcon size={11} />
            {post.author?.fullName || 'Admin'}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#CBD5E1' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CalendarIcon size={11} />
            {formatDate(post.createdAt)}
          </span>
        </div>

        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#1E293B',
            margin: 0,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </h3>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#64748B',
            lineHeight: 1.6,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {preview}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: '#0E76A8',
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Read more
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages: number[] = [];
  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 32,
      }}
    >
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: '1.5px solid #E2E8F0',
          background: 'white',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          opacity: page === 1 ? 0.4 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {start > 1 && (
        <>
          <PageBtn n={1} active={page === 1} onClick={() => onPageChange(1)} />
          {start > 2 && <span style={{ color: '#94A3B8' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <PageBtn
          key={p}
          n={p}
          active={page === p}
          onClick={() => onPageChange(p)}
        />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: '#94A3B8' }}>…</span>}
          <PageBtn n={totalPages} active={page === totalPages} onClick={() => onPageChange(totalPages)} />
        </>
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: '1.5px solid #E2E8F0',
          background: 'white',
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          opacity: page === totalPages ? 0.4 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

function PageBtn({
  n,
  active,
  onClick,
}: {
  n: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        minWidth: 36,
        height: 36,
        padding: '0 12px',
        borderRadius: 8,
        border: '1.5px solid ' + (active ? '#0E76A8' : '#E2E8F0'),
        background: active ? '#0E76A8' : 'white',
        color: active ? 'white' : '#1E293B',
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {n}
    </button>
  );
}

/** Loại bỏ tag HTML, ký tự xuống dòng để lấy text thuần. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}