import { useState } from 'react';
import { Link } from 'react-router-dom';

interface RewardTier {
  id: number;
  name: string;
  minPoints: number;
  maxPoints: number | null;
  color: string;
  bgColor: string;
  icon: string;
  benefits: string[];
}

interface RewardItem {
  id: number;
  name: string;
  description: string;
  points: number;
  image: string;
}

interface Transaction {
  id: number;
  type: 'earn' | 'redeem';
  description: string;
  points: number;
  date: string;
}

export function Rewards() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history'>('overview');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  const userPoints = 1250;
  const userTier: RewardTier = {
    id: 2,
    name: 'Silver Member',
    minPoints: 1000,
    maxPoints: 5000,
    color: '#94A3B8',
    bgColor: '#F1F5F9',
    icon: '🏅',
    benefits: [
      'Tích điểm 1.5x khi mua hàng',
      'Miễn phí vận chuyển cho đơn từ 200K',
      'Ưu tiên hỗ trợ khách hàng',
    ],
  };

  const tiers: RewardTier[] = [
    {
      id: 1,
      name: 'Bronze Member',
      minPoints: 0,
      maxPoints: 1000,
      color: '#CD7F32',
      bgColor: '#FEF3C7',
      icon: '🥉',
      benefits: ['Tích điểm 1x khi mua hàng', 'Nhận quà sinh nhật'],
    },
    userTier,
    {
      id: 3,
      name: 'Gold Member',
      minPoints: 5000,
      maxPoints: 15000,
      color: '#FFD700',
      bgColor: '#FEF9C3',
      icon: '🥇',
      benefits: ['Tích điểm 2x khi mua hàng', 'Miễn phí vận chuyển', 'Quà tặng độc quyền'],
    },
    {
      id: 4,
      name: 'Platinum Member',
      minPoints: 15000,
      maxPoints: null,
      color: '#E5E4E2',
      bgColor: '#F8FAFC',
      icon: '💎',
      benefits: ['Tích điểm 3x khi mua hàng', 'Voucher VIP', 'Truy cập sự kiện độc quyền'],
    },
  ];

  const rewards: RewardItem[] = [
    {
      id: 1,
      name: 'Voucher Giảm 50K',
      description: 'Áp dụng cho đơn hàng từ 300K trở lên',
      points: 500,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Voucher Freeship',
      description: 'Miễn phí vận chuyển cho tất cả đơn hàng',
      points: 300,
      image: 'https://images.unsplash.com/photo-1523281027677-43afc5f3fb39?w=300&h=200&fit=crop',
    },
    {
      id: 3,
      name: 'Voucher 15% Off',
      description: 'Giảm 15% cho mọi sản phẩm',
      points: 1000,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&h=200&fit=crop',
    },
    {
      id: 4,
      name: 'Set Quà Tặng Premium',
      description: 'Bộ sản phẩm cao cấp trị giá 500K',
      points: 2500,
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=300&h=200&fit=crop',
    },
  ];

  const transactions: Transaction[] = [
    { id: 1, type: 'earn', description: 'Mua Voucher Buffet Sheraton', points: 178, date: '15/06/2026' },
    { id: 2, type: 'earn', description: 'Đánh giá sản phẩm', points: 50, date: '14/06/2026' },
    { id: 3, type: 'redeem', description: 'Đổi Voucher 10K', points: -200, date: '12/06/2026' },
    { id: 4, type: 'earn', description: 'Mua Combo Á-Âu', points: 89, date: '10/06/2026' },
  ];

  const progressToNextTier = (userPoints / (userTier.maxPoints || 15000)) * 100;
  const pointsToNextTier = (userTier.maxPoints || 15000) - userPoints;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <Link to="/" style={{ color: '#0E76A8', textDecoration: 'none' }}>Trang chủ</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Rewards</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0E76A8 0%, #0A5C87 100%)',
          borderRadius: 20,
          padding: '32px 40px',
          color: 'white',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -30,
            right: 100,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 48 }}>{userTier.icon}</span>
                <div>
                  <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>Xin chào!</div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>
                    {userTier.name}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>
                  {userPoints.toLocaleString('vi-VN')}
                </span>
                <span style={{ fontSize: 18, opacity: 0.8 }}>điểm</span>
              </div>

              <div style={{ fontSize: 13, opacity: 0.7 }}>
                Còn {pointsToNextTier.toLocaleString('vi-VN')} điểm để lên hạng Gold
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: '20px 28px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Tỷ lệ tích điểm</div>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>
                1.5x
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          background: 'white',
          borderRadius: 12,
          padding: 6,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          width: 'fit-content',
        }}>
          {(['overview', 'rewards', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === tab ? '#0E76A8' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748B',
              }}
            >
              {tab === 'overview' ? 'Tổng quan' : tab === 'rewards' ? 'Đổi quà' : 'Lịch sử'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Progress to next tier */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>
                Hành trình lên hạng Gold
              </h2>

              {/* Progress bar */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>
                    {userPoints.toLocaleString('vi-VN')} điểm
                  </span>
                  <span style={{ fontSize: 13, color: '#64748B' }}>
                    {(userTier.maxPoints || 15000).toLocaleString('vi-VN')} điểm
                  </span>
                </div>
                <div style={{
                  height: 12,
                  background: '#E2E8F0',
                  borderRadius: 6,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <div style={{
                    width: `${progressToNextTier}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0E76A8 0%, #10B981 100%)',
                    borderRadius: 6,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>

              {/* Current tier info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#F8FAFC', borderRadius: 12 }}>
                <span style={{ fontSize: 36 }}>{userTier.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
                    {userTier.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>
                    Điểm tiếp theo: {pointsToNextTier.toLocaleString('vi-VN')} để lên hạng Gold
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: userTier.bgColor,
                  borderRadius: 8,
                  color: userTier.color,
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  +50%
                </div>
              </div>
            </div>

            {/* Tier benefits */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>
                Quyền lợi của bạn
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {userTier.benefits.map((benefit, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 14, color: '#1E293B' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All tiers */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>
                Bảng xếp hạng hạng thành viên
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tiers.map(tier => (
                  <div
                    key={tier.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 20px',
                      background: tier.id === userTier.id ? tier.bgColor : '#F8FAFC',
                      borderRadius: 12,
                      border: tier.id === userTier.id ? `2px solid ${tier.color}` : '2px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{tier.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>{tier.name}</span>
                        {tier.id === userTier.id && (
                          <span style={{
                            fontSize: 10,
                            padding: '2px 8px',
                            background: '#0E76A8',
                            color: 'white',
                            borderRadius: 4,
                            fontWeight: 700,
                          }}>
                            HIỆN TẠI
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {tier.maxPoints
                          ? `${tier.minPoints.toLocaleString('vi-VN')} - ${tier.maxPoints.toLocaleString('vi-VN')} điểm`
                          : `${tier.minPoints.toLocaleString('vi-VN')}+ điểm`}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: tier.color,
                    }}>
                      {tier.id === 1 ? '1x' : tier.id === 2 ? '1.5x' : tier.id === 3 ? '2x' : '3x'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div>
            <div style={{
              background: '#FEF3C7',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>
                  Bạn có {userPoints.toLocaleString('vi-VN')} điểm
                </div>
                <div style={{ fontSize: 12, color: '#B45309' }}>
                  Tích đủ điểm để đổi những phần quà hấp dẫn!
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {rewards.map(reward => (
                <div
                  key={reward.id}
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                  }}
                  onClick={() => {
                    setSelectedReward(reward);
                    setShowClaimModal(true);
                  }}
                >
                  <div style={{ position: 'relative', paddingTop: '66%', background: '#F1F5F9' }}>
                    <img
                      src={reward.image}
                      alt={reward.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: '#0E76A8',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {reward.points.toLocaleString('vi-VN')} điểm
                    </div>
                  </div>

                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
                      {reward.name}
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 1.5 }}>
                      {reward.description}
                    </p>
                    <button
                      style={{
                        width: '100%',
                        padding: '12px 0',
                        background: userPoints >= reward.points ? '#0E76A8' : '#E2E8F0',
                        color: userPoints >= reward.points ? 'white' : '#94A3B8',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: 'Inter, sans-serif',
                        cursor: userPoints >= reward.points ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                      disabled={userPoints < reward.points}
                    >
                      {userPoints >= reward.points ? 'Đổi ngay' : 'Không đủ điểm'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>
              Lịch sử tích/đổi điểm
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    background: '#F8FAFC',
                    borderRadius: 12,
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: transaction.type === 'earn' ? '#ECFDF5' : '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {transaction.type === 'earn' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                        <line x1="12" y1="19" x2="12" y2="5"/>
                        <polyline points="5 12 12 5 19 12"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <polyline points="19 12 12 19 5 12"/>
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>
                      {transaction.description}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                      {transaction.date}
                    </div>
                  </div>

                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: transaction.type === 'earn' ? '#10B981' : '#EF4444',
                  }}>
                    {transaction.type === 'earn' ? '+' : ''}{transaction.points.toLocaleString('vi-VN')} điểm
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedReward && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
          onClick={() => setShowClaimModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              padding: 32,
              maxWidth: 420,
              width: '100%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                background: '#F1F5F9',
                margin: '0 auto 16px',
                overflow: 'hidden',
              }}>
                <img
                  src={selectedReward.image}
                  alt={selectedReward.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
                {selectedReward.name}
              </h3>
              <p style={{ fontSize: 14, color: '#64748B' }}>
                {selectedReward.description}
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background: '#F8FAFC',
              borderRadius: 12,
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 14, color: '#64748B' }}>Điểm hiện có</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
                {userPoints.toLocaleString('vi-VN')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowClaimModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  background: '#F1F5F9',
                  color: '#64748B',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert('Đổi thành công!');
                  setShowClaimModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  background: '#0E76A8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Đổi {selectedReward.points.toLocaleString('vi-VN')} điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
