/**
 * PostDetail.tsx
 * ------------------------------------------------------------------
 * Trang chi tiết 1 bài viết: hiển thị ảnh cover, tiêu đề, tác giả,
 * ngày đăng, nội dung HTML (rendered), và danh sách bài viết liên quan.
 * ------------------------------------------------------------------
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Eye, BookOpen, ChevronRight } from 'lucide-react';
import { postApi } from '../services';
import type { Post } from '../services';
import { formatDate } from '../utils';
import Loading from '../components/Loading';
import { Breadcrumb } from '../components/Breadcrumb';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      postApi.getById(Number(id)),
      postApi.list({ page: 1, limit: 6 }),
    ])
      .then(([detailRes, listRes]) => {
        if (detailRes.success && detailRes.data) {
          setPost(detailRes.data);
        }
        if (listRes.success && listRes.data) {
          setRelated(listRes.data.items.filter((p) => p.postId !== Number(id)).slice(0, 3));
        }
      })
      .catch((err) => setError(err.message || 'Cannot load post'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Loading message="Loading post..." />;
  }

  if (error || !post) {
    return (
      <div
        style={{
          background: '#F8FAFC',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
        }}
      >
        <BookOpen size={56} color="#CBD5E1" />
        <p style={{ color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>
          {error || 'Post not found'}
        </p>
        <Link
          to="/posts"
          style={{
            padding: '10px 24px',
            background: '#0E76A8',
            color: 'white',
            borderRadius: 10,
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Back to posts
        </Link>
      </div>
    );
  }

  const imageUrl =
    post.imageUrl ||
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop';

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Posts', href: '/posts' },
          { label: post.title },
        ]}
      />

      <article style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
          {/* Main content */}
          <div>
            {/* Header card */}
            <header
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                marginBottom: 24,
              }}
            >
              <h1
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#1E293B',
                  margin: '0 0 18px',
                  lineHeight: 1.3,
                }}
              >
                {post.title}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                  paddingTop: 16,
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {post.author?.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.fullName}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#0E76A8',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {(post.author?.fullName || 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#1E293B',
                      }}
                    >
                      {post.author?.fullName || 'Admin'}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 11,
                        color: '#94A3B8',
                      }}
                    >
                      Author
                    </div>
                  </div>
                </div>

                <div style={{ width: 1, height: 28, background: '#E2E8F0' }} />

                {/* Published date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B' }}>
                  <CalendarIcon size={14} />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {`Published on ${formatDate(post.createdAt)}`}
                  </span>
                </div>
              </div>
            </header>

            {/* Cover image */}
            {post.imageUrl && (
              <div
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: 24,
                  background: '#E2E8F0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <img
                  src={imageUrl}
                  alt={post.title}
                  style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Content */}
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <PostContent html={post.content} />
            </div>

            {/* Footer navigation */}
            <div
              style={{
                marginTop: 24,
                background: 'white',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <Link
                to="/posts"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 10,
                  color: '#1E293B',
                  textDecoration: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0E76A8';
                  e.currentTarget.style.color = '#0E76A8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.color = '#1E293B';
                }}
              >
                <BookOpen size={14} />
                All posts
              </Link>

              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  color: '#94A3B8',
                  fontWeight: 600,
                }}
              >
                Thanks for reading!
              </span>
            </div>
          </div>

          {/* Sidebar — Related posts */}
          <aside style={{ position: 'sticky', top: 120 }}>
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#1E293B',
                  margin: '0 0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Eye size={16} color="#0E76A8" />
                Related posts
              </h3>

              {related.length === 0 ? (
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#94A3B8',
                    textAlign: 'center',
                    padding: '20px 0',
                    margin: 0,
                  }}
                >
                  No related posts yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {related.map((p) => (
                    <RelatedPostItem key={p.postId} post={p} />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      <style>{`
        .post-content {
          font-family: 'Inter, sans-serif';
          font-size: 16px;
          line-height: 1.8;
          color: #334155;
        }
        .post-content h1, .post-content h2, .post-content h3 {
          font-family: 'Manrope, sans-serif';
          font-weight: 800;
          color: #1E293B;
          margin: 24px 0 12px;
        }
        .post-content h1 { font-size: 26px; }
        .post-content h2 { font-size: 22px; }
        .post-content h3 { font-size: 18px; }
        .post-content p { margin: 0 0 16px; }
        .post-content a {
          color: #0E76A8;
          text-decoration: underline;
        }
        .post-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 16px 0;
        }
        .post-content ul, .post-content ol {
          padding-left: 24px;
          margin: 0 0 16px;
        }
        .post-content li { margin-bottom: 6px; }
        .post-content blockquote {
          margin: 16px 0;
          padding: 12px 18px;
          background: #F8FAFC;
          border-left: 4px solid #0E76A8;
          border-radius: 0 8px 8px 0;
          color: #475569;
          font-style: italic;
        }
        .post-content code {
          background: #F1F5F9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 14px;
          font-family: 'Monaco', 'Menlo', monospace;
          color: #0E76A8;
        }
        .post-content pre {
          background: #1E293B;
          color: #E2E8F0;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

function PostContent({ html }: { html: string }) {
  return <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

function RelatedPostItem({ post }: { post: Post }) {
  const imageUrl =
    post.imageUrl ||
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=150&fit=crop';

  return (
    <Link
      to={`/posts/${post.postId}`}
      style={{
        display: 'flex',
        gap: 12,
        textDecoration: 'none',
        padding: 8,
        borderRadius: 10,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 8,
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#1E293B',
            margin: '0 0 4px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </h4>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <CalendarIcon size={10} />
          {formatDate(post.createdAt)}
          <ChevronRight size={10} style={{ marginLeft: 'auto' }} />
        </div>
      </div>
    </Link>
  );
}