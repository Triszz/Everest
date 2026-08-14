import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi, reviewApi } from '../services';
import type { IssuedVoucher } from '../services';
import { formatDate, ISSUED_STATUS_LABELS } from '../utils';
import { QRImage } from '../utils/QRImage';
import { Breadcrumb } from '../components/Breadcrumb';
import {
  Ticket, Copy, Check, QrCode, Clock, MapPin, Star, Eye,
  Loader2, RefreshCw, ShoppingBag, ChevronRight,
} from 'lucide-react';

// ── Mock data ────────────────────────────────────────────────────────────────

const now = new Date();
const d = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86400000).toISOString();

const MOCK_VOUCHERS: IssuedVoucher[] = [
  {
    issuedVoucherId: 1,
    voucherCode: 'EVR-KAFF-7291',
    status: 'Unused',
    validFrom: d(0),
    validTo: d(30),
    usedAt: null,
    usedAtBranchId: null,
    voucher: {
      title: 'Voucher Ưu Đãi Giảm 30% Tại Highlands Coffee',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
      expiryDays: 30,
      partner: { companyName: 'Highlands Coffee Việt Nam' },
    },
  },
  {
    issuedVoucherId: 2,
    voucherCode: 'EVR-PHUC-3847',
    status: 'Unused',
    validFrom: d(0),
    validTo: d(15),
    usedAt: null,
    usedAtBranchId: null,
    voucher: {
      title: 'Free Ship Cho Đơn Từ 99K Tại Phúc Long',
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
      expiryDays: 15,
      partner: { companyName: 'Phúc Long Coffee & Tea' },
    },
  },
  {
    issuedVoucherId: 3,
    voucherCode: 'EVR-PAPA-5510',
    status: 'Unused',
    validFrom: d(0),
    validTo: d(45),
    usedAt: null,
    usedAtBranchId: null,
    voucher: {
      title: 'Giảm 50K Cho Đơn Từ 200K Tại PapaJohns',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      expiryDays: 45,
      partner: { companyName: "Papa John's Pizza" },
    },
  },
  {
    issuedVoucherId: 4,
    voucherCode: 'EVR-BRUN-9823',
    status: 'Used',
    validFrom: d(-10),
    validTo: d(20),
    usedAt: d(-2),
    usedAtBranchId: 5,
    voucher: {
      title: 'Voucher 2 Ly Smoothie Miễn Phí Tại Brun',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
      expiryDays: 30,
      partner: { companyName: 'Brun - Cơ Thực Vật' },
    },
  },
  {
    issuedVoucherId: 5,
    voucherCode: 'EVR-STARB-2231',
    status: 'Used',
    validFrom: d(-20),
    validTo: d(10),
    usedAt: d(-5),
    usedAtBranchId: 8,
    voucher: {
      title: 'Buy 1 Get 1 Free Tại Starbucks',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      expiryDays: 30,
      partner: { companyName: 'Starbucks Việt Nam' },
    },
  },
  {
    issuedVoucherId: 6,
    voucherCode: 'EVR-TEA1-7762',
    status: 'Expired',
    validFrom: d(-40),
    validTo: d(-5),
    usedAt: null,
    usedAtBranchId: null,
    voucher: {
      title: 'Giảm 20% Cho Đơn Từ 50K Tại Gong Cha',
      imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=300&fit=crop',
      expiryDays: 30,
      partner: { companyName: 'Gong Cha Việt Nam' },
    },
  },
  {
    issuedVoucherId: 7,
    voucherCode: 'EVR-LOTUS-1144',
    status: 'Locked',
    validFrom: d(-5),
    validTo: d(25),
    usedAt: null,
    usedAtBranchId: null,
    voucher: {
      title: 'Giảm 15% Toàn Menu Tại Lotteria',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      expiryDays: 30,
      partner: { companyName: 'Lotteria Việt Nam' },
    },
  },
];

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = 'all' | 'unused' | 'used' | 'expired';

// ── QR rendering ─────────────────────────────────────────────────────────────
// QR chuẩn ISO/IEC 18004 do <QRImage /> sinh ra — quét được bằng camera.
// Trước đây dùng fake pattern ngẫu nhiên (không scan được) — đã thay bằng thư viện `qrcode`.

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map trạng thái IssuedVoucher → UI config (label + màu). */
function statusConfig(status: string) {
  const cfg = ISSUED_STATUS_LABELS[status as keyof typeof ISSUED_STATUS_LABELS];
  if (cfg) return { label: cfg.label, bg: cfg.bg, text: cfg.color, dot: cfg.color };
  return { label: status, bg: '#F1F5F9', text: '#64748B', dot: '#64748B' };
}

function daysLeft(validTo: string) {
  const diff = new Date(validTo).getTime() - now.getTime();
  if (diff < 0) return 0;
  return Math.ceil(diff / 86400000);
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch { const el = document.createElement('textarea'); el.value = code; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 12px',
        background: copied ? '#ECFDF5' : '#0E76A8',
        color: copied ? '#10B981' : 'white',
        border: 'none', borderRadius: 8,
        fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      {copied ? <><Check size={12} /> Đã copy</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}

// ── Voucher Card ─────────────────────────────────────────────────────────────

function VoucherCard({ v, onClick }: { v: IssuedVoucher; onClick: (v: IssuedVoucher) => void }) {
  const sc = statusConfig(v.status);
  const left = daysLeft(v.validTo);
  const isExpired = left === 0 && v.status !== 'Used';

  return (
    <div
      onClick={() => onClick(v)}
      style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(14,118,168,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      {/* Image + overlay */}
      <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
        <img
          src={v.voucher?.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'}
          alt={v.voucher?.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
        }} />

        {/* Badge top-right */}
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 6,
          background: sc.bg, color: sc.text,
        }}>
          {sc.label}
        </span>

        {/* Partner name bottom-left */}
        <span style={{
          position: 'absolute', bottom: 10, left: 12,
          fontSize: 11, fontWeight: 600,
          padding: '3px 8px', borderRadius: 6,
          background: 'rgba(0,0,0,0.55)', color: 'white',
        }}>
          {(typeof v.voucher?.partner === 'string' ? v.voucher.partner : v.voucher?.partner?.companyName) || ''}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
          color: '#1E293B', marginBottom: 10,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', lineHeight: 1.4,
        }}>
          {v.voucher?.title}
        </h3>

        {/* Code row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, marginBottom: 10,
          padding: '8px 10px',
          background: '#F8FAFC', borderRadius: 8, border: '1px dashed #E2E8F0',
        }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: '#1E293B', letterSpacing: 1 }}>
            {v.voucherCode}
          </span>
          <CopyButton code={v.voucherCode} />
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} style={{ color: '#94A3B8' }} />
            <span style={{ fontSize: 12, color: isExpired || v.status === 'Expired' ? '#EF4444' : '#64748B', fontWeight: 600 }}>
              {isExpired || v.status === 'Expired'
                ? `Hết hạn ${formatDate(v.validTo)}`
                : v.status === 'Used'
                ? `Đã dùng ${formatDate(v.usedAt || v.validTo)}`
                : `Còn ${left} ngày`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {v.voucher?.voucherId && (
              <Link
                to={`/voucher/${v.voucher.voucherId}`}
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  fontSize: 12, fontWeight: 600, color: '#0E76A8',
                  textDecoration: 'none',
                }}
              >
                <Eye size={13} />
                Chi tiết
              </Link>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0E76A8' }}>
              <QrCode size={13} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Xem QR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Voucher Modal ─────────────────────────────────────────────────────────────

function VoucherModal({ v, onClose }: { v: IssuedVoucher; onClose: () => void }) {
  const sc = statusConfig(v.status);
  const left = daysLeft(v.validTo);
  const isExpired = left === 0 && v.status !== 'Used';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20,
          maxWidth: 480, width: '100%',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        {/* Header image */}
        <div style={{ position: 'relative', height: 120, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={v.voucher?.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop'}
            alt={v.voucher?.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)', border: 'none',
              cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Status badge */}
          <span style={{
            position: 'absolute', top: 10, left: 10,
            fontSize: 11, fontWeight: 700,
            padding: '4px 10px', borderRadius: 8,
            background: sc.bg, color: sc.text,
          }}>
            {sc.label}
          </span>

          {/* Title */}
          <div style={{ position: 'absolute', bottom: 10, left: 14, right: 14 }}>
            <h3 style={{
              fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800,
              color: 'white', margin: 0,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              {v.voucher?.title}
            </h3>
          </div>
        </div>

        {/* QR + Code section */}
        <div style={{ padding: '16px 16px 0', display: 'flex', gap: 14, alignItems: 'center' }}>
          {/* QR */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <QRImage code={v.voucherCode} size={90} style={{ marginBottom: 4 }} />
            <span style={{ fontSize: 10, color: '#94A3B8' }}>Quét tại quán</span>
          </div>

          {/* Code */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>Mã voucher</p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              padding: '8px 10px', background: '#F8FAFC',
              borderRadius: 10, border: '2px dashed #0E76A8', marginBottom: 8,
            }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#0E76A8', letterSpacing: 1 }}>
                {v.voucherCode}
              </span>
              <CopyButton code={v.voucherCode} />
            </div>
            <p style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
              Hạn: <strong>{formatDate(v.validTo)}</strong>
              {!isExpired && v.status !== 'Used' && <span style={{ color: '#10B981', fontWeight: 700 }}> · {left} ngày</span>}
            </p>
          </div>
        </div>

        {/* Meta info */}
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Valid period */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#F8FAFC', borderRadius: 10 }}>
            <Clock size={16} style={{ color: '#0E76A8', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 1 }}>Hiệu lực</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>
                {formatDate(v.validFrom)} → {formatDate(v.validTo)}
              </p>
            </div>
          </div>

          {/* Partner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#F8FAFC', borderRadius: 10 }}>
            <MapPin size={16} style={{ color: '#0E76A8', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 1 }}>Đối tác</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{(typeof v.voucher?.partner === 'string' ? v.voucher.partner : v.voucher?.partner?.companyName) || ''}</p>
            </div>
          </div>

          {/* Used info */}
          {v.status === 'Used' && v.usedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#FEF3C7', borderRadius: 10 }}>
              <Star size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 11, color: '#92400E', marginBottom: 1 }}>Đã sử dụng</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#78350F' }}>Ngày {formatDate(v.usedAt)}</p>
              </div>
            </div>
          )}

          {/* Review section - only show for Used vouchers */}
          {v.status === 'Used' && v.voucher && (
            <ReviewSection
              voucherId={v.voucher.voucherId}
              issuedVoucherId={v.issuedVoucherId}
              hasReviewed={v.hasReviewed}
            />
          )}

          {/* View detail button — chỉ hiện khi voucher vẫn khả dụng */}
          {v.voucher?.voucherId && v.isAvailable !== false && (
            <Link
              to={`/voucher/${v.voucher.voucherId}`}
              onClick={onClose}
              style={{
                marginTop: 4, padding: '10px 14px',
                background: '#0E76A8', color: 'white',
                border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: 'Manrope, sans-serif',
                textDecoration: 'none',
              }}
            >
              <Eye size={14} />
              Xem chi tiết voucher
            </Link>
          )}

          {/* Notice khi voucher không còn khả dụng */}
          {v.isAvailable === false && (
            <div style={{
              marginTop: 4, padding: '10px 14px',
              background: '#FEF3C7', borderRadius: 10,
              fontSize: 12, color: '#92400E', fontFamily: 'Inter, sans-serif',
              textAlign: 'center', lineHeight: 1.4,
            }}>
              Voucher này hiện không khả dụng trên hệ thống. Vui lòng liên hệ đối tác để được hỗ trợ.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Review Section Component ──────────────────────────────────────────────────

interface ReviewSectionProps {
  voucherId: number;
  issuedVoucherId: number;
  hasReviewed?: boolean;
}

function ReviewSection({ voucherId, issuedVoucherId, hasReviewed }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      setError('Nhận xét cần ít nhất 10 ký tự.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await reviewApi.create(voucherId, {
        rating,
        comment: comment.trim(),
        issuedVoucherId,
      });

      if (res.success) {
        setSuccess(true);
        setComment('');
        setRating(5);
        setShowForm(false);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(res.error?.message || 'Gửi đánh giá thất bại.');
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{
        padding: '12px 14px',
        background: '#ECFDF5',
        border: '1px solid #A7F3D0',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#065F46', fontWeight: 600 }}>
          Cảm ơn bạn! Đánh giá đã được gửi thành công.
        </span>
      </div>
    );
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubmit} style={{
        padding: '12px 14px',
        background: '#F8FAFC',
        border: '1.5px solid #BAE6FD',
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
            {hasReviewed ? 'Cập nhật đánh giá' : 'Đánh giá voucher'}
          </span>
          <button type="button" onClick={() => setShowForm(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748B', fontSize: 20, lineHeight: 1, padding: 0,
          }}>×</button>
        </div>

        {/* Star rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 24, lineHeight: 1, padding: '2px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24"
                fill={star <= rating ? '#F59E0B' : 'none'}
                stroke={star <= rating ? '#F59E0B' : '#CBD5E1'}
                strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          ))}
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, color: '#F59E0B', marginLeft: 4 }}>
            {rating}/5
          </span>
        </div>

        {/* Comment textarea */}
        <textarea
          value={comment}
          onChange={(e) => { setComment(e.target.value); setError(''); }}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          maxLength={500}
          rows={2}
          style={{
            width: '100%', padding: '8px 10px',
            border: '1.5px solid #E2E8F0', borderRadius: 8,
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            resize: 'vertical', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ marginTop: 4, fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          Tối thiểu 10 ký tự. {comment.length}/500
        </p>

        {error && (
          <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={() => setShowForm(false)} style={{
            flex: 1, padding: '8px 12px', background: 'white', color: '#64748B',
            border: '1.5px solid #E2E8F0', borderRadius: 8,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}>Hủy</button>
          <button type="submit" disabled={submitting || comment.trim().length < 10} style={{
            flex: 1, padding: '8px 12px',
            background: submitting || comment.trim().length < 10 ? '#E2E8F0' : '#10B981',
            color: 'white', border: 'none', borderRadius: 8,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
            cursor: submitting || comment.trim().length < 10 ? 'not-allowed' : 'pointer',
          }}>
            {submitting ? 'Đang gửi...' : (hasReviewed ? 'Cập nhật' : 'Gửi đánh giá')}
          </button>
        </div>
      </form>
    );
  }

  // Show review button
  return (
    <button
      onClick={() => setShowForm(true)}
      style={{
        marginTop: 4,
        width: '100%',
        padding: '10px 14px',
        background: hasReviewed ? '#F0FDF4' : '#FEF3C7',
        border: `1.5px solid ${hasReviewed ? '#A7F3D0' : '#FDE68A'}`,
        borderRadius: 10,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill={hasReviewed ? '#10B981' : 'none'}
        stroke={hasReviewed ? '#10B981' : '#F59E0B'}
        strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 700,
        color: hasReviewed ? '#10B981' : '#92400E',
      }}>
        {hasReviewed ? 'Xem lại đánh giá của bạn' : 'Đánh giá voucher này'}
      </span>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function MyVoucher() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [vouchers, setVouchers] = useState<IssuedVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<IssuedVoucher | null>(null);

  // Fetch from API on mount; fallback to mock only on network/server error
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await orderApi.listIssuedVouchers();
      if (res.success) {
        setVouchers(res.data ?? []);
      } else {
        setApiError(res.error?.message || 'Không thể tải danh sách voucher.');
        setVouchers(MOCK_VOUCHERS);
      }
    } catch {
      setApiError('Không thể kết nối server. Hiển thị dữ liệu mẫu.');
      setVouchers(MOCK_VOUCHERS);
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = vouchers.filter(v => {
    if (activeTab === 'all')     return true;
    if (activeTab === 'unused')  return v.status === 'Unused';
    if (activeTab === 'used')    return v.status === 'Used';
    if (activeTab === 'expired') return v.status === 'Expired' || v.status === 'Locked';
    return true;
  });

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all',     label: 'Tất cả',       count: vouchers.length },
    { key: 'unused',  label: 'Có thể dùng',  count: vouchers.filter(v => v.status === 'Unused').length },
    { key: 'used',    label: 'Đã sử dụng',   count: vouchers.filter(v => v.status === 'Used').length },
    { key: 'expired', label: 'Hết hạn',       count: vouchers.filter(v => v.status === 'Expired' || v.status === 'Locked').length },
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Voucher của tôi' },
        ]}
        maxWidth={1280}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: Voucher grid ── */}
          <div>
            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1E293B', marginBottom: 2 }}>
                  Voucher của tôi
                </h1>
                <p style={{ fontSize: 13, color: '#64748B' }}>
                  {vouchers.length} voucher đã mua · {vouchers.filter(v => v.status === 'Unused').length} có thể sử dụng
                </p>
              </div>
              <button
                onClick={fetchVouchers}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px',
                  background: apiError ? '#FEF9C3' : '#F0F9FF',
                  color: apiError ? '#92400E' : '#0E76A8',
                  border: `1.5px solid ${apiError ? '#FDE047' : '#BAE6FD'}`,
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                {apiError ? 'Tải lại' : 'Tải lại'}
              </button>
            </div>

            {/* Mock notice — chỉ hiện khi API lỗi */}
            {apiError && (
              <div style={{ background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <RefreshCw size={14} style={{ color: '#CA8A04', flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#92400E', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                  {apiError} — Đang hiển thị dữ liệu mẫu.
                </p>
              </div>
            )}

            {/* Tab filter */}
            <div style={{
              display: 'flex', gap: 4, background: 'white',
              padding: 4, borderRadius: 12, border: '1px solid #E2E8F0',
              marginBottom: 20, overflowX: 'auto',
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === tab.key ? '#0E76A8' : 'transparent',
                    color: activeTab === tab.key ? 'white' : '#64748B',
                    border: 'none', borderRadius: 8,
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {tab.label}
                  <span style={{
                    marginLeft: 6, padding: '1px 7px',
                    background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: activeTab === tab.key ? 'white' : '#94A3B8',
                    borderRadius: 99, fontSize: 11, fontWeight: 700,
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Voucher grid */}
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#0E76A8' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <Ticket size={48} style={{ color: '#E2E8F0', marginBottom: 12 }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>Không có voucher nào</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>Hãy mua voucher để xem tại đây</p>
                <Link to="/" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', background: '#0E76A8', color: 'white',
                  textDecoration: 'none', borderRadius: 10,
                  fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
                }}>
                  <ShoppingBag size={16} />
                  Khám phá voucher
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16,
              }}>
                {filtered.map(v => (
                  <VoucherCard key={v.issuedVoucherId} v={v} onClick={setSelectedVoucher} />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div>
            {/* User summary card */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #F1F5F9', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#1E293B', marginBottom: 16 }}>
                Tổng quan
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Tổng voucher', value: vouchers.length, color: '#0E76A8', bg: '#E8F4FA' },
                  { label: 'Có thể dùng',  value: vouchers.filter(v => v.status === 'Unused').length, color: '#10B981', bg: '#ECFDF5' },
                  { label: 'Đã sử dụng',   value: vouchers.filter(v => v.status === 'Used').length, color: '#F59E0B', bg: '#FEF3C7' },
                  { label: 'Hết hạn/Khóa', value: vouchers.filter(v => v.status === 'Expired' || v.status === 'Locked').length, color: '#EF4444', bg: '#FEE2E2' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '12px 10px', background: item.bg, borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: item.color, marginBottom: 2 }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', background: '#0E76A8', color: 'white',
                  textDecoration: 'none', borderRadius: 10,
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0E76A8')}
              >
                <ShoppingBag size={15} />
                Mua thêm voucher
              </Link>
            </div>

            {/* Order history stub */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#1E293B', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} style={{ color: '#0E76A8' }} />
                Đơn hàng gần đây
              </h3>

              <Link
                to="/orders"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#F8FAFC', borderRadius: 10,
                  textDecoration: 'none',
                  border: '1px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FA'; e.currentTarget.style.borderColor = '#BAE6FD'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 2 }}>
                    Xem tất cả đơn hàng
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>
                    Theo dõi trạng thái đơn hàng
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: '#0E76A8' }} />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {selectedVoucher && (
        <VoucherModal v={selectedVoucher} onClose={() => setSelectedVoucher(null)} />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
