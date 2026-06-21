import { useState } from 'react'
import { useToast } from '../components/shared/Toast'

interface Banner {
  id: string
  title: string
  imageUrl: string
  link: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'INACTIVE'
  order: number
}

interface Category {
  id: string
  name: string
  description: string
  imageUrl: string
  status: 'VISIBLE' | 'HIDDEN'
  order: number
  voucherCount: number
}

interface Article {
  id: string
  title: string
  category: string
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
  author: string
}

interface Policy {
  id: string
  key: string
  title: string
  content: string
  updatedAt: string
  updatedBy: string
  version: number
}

const mockBanners: Banner[] = [
  { id: 'BNR-001', title: 'Siêu sale mùa hè', imageUrl: '', link: '/campaigns/summer-sale', startDate: '01/06/2024', endDate: '30/06/2024', status: 'ACTIVE', order: 1 },
  { id: 'BNR-002', title: 'Đối tác mới - California Fitness', imageUrl: '', link: '/partners/california-fitness', startDate: '15/05/2024', endDate: '15/07/2024', status: 'ACTIVE', order: 2 },
  { id: 'BNR-003', title: 'Hướng dẫn sử dụng voucher', imageUrl: '', link: '/guides/how-to-use', startDate: '01/04/2024', endDate: '31/12/2024', status: 'INACTIVE', order: 3 },
]

const mockCategories: Category[] = [
  { id: 'CAT-001', name: 'Ẩm thực', description: 'Nhà hàng, quán ăn, cafe, bar', imageUrl: '', status: 'VISIBLE', order: 1, voucherCount: 245 },
  { id: 'CAT-002', name: 'Làm đẹp & Spa', description: 'Spa, salon, thẩm mỹ viện', imageUrl: '', status: 'VISIBLE', order: 2, voucherCount: 128 },
  { id: 'CAT-003', name: 'Giải trí', description: 'Rạp chiếu phim, bowling, game', imageUrl: '', status: 'VISIBLE', order: 3, voucherCount: 89 },
  { id: 'CAT-004', name: 'Thể hình & Yoga', description: 'Gym, yoga, bể bơi', imageUrl: '', status: 'VISIBLE', order: 4, voucherCount: 67 },
  { id: 'CAT-005', name: 'Du lịch', description: 'Khách sạn, tour, vé máy bay', imageUrl: '', status: 'HIDDEN', order: 5, voucherCount: 12 },
]

const mockArticles: Article[] = [
  { id: 'ART-001', title: 'Hướng dẫn mua voucher', category: 'Hướng dẫn', status: 'PUBLISHED', createdAt: '10/05/2024', author: 'Admin Le' },
  { id: 'ART-002', title: 'Chính sách đổi trả voucher', category: 'Chính sách', status: 'PUBLISHED', createdAt: '08/05/2024', author: 'Admin Le' },
  { id: 'ART-003', title: 'Cách sử dụng voucher tại nhà hàng', category: 'Hướng dẫn', status: 'DRAFT', createdAt: '20/06/2024', author: 'Admin Minh' },
  { id: 'ART-004', title: 'Giới thiệu đối tác California Fitness', category: 'Tin tức', status: 'PUBLISHED', createdAt: '15/05/2024', author: 'Admin Le' },
]

const mockPolicies: Policy[] = [
  { id: 'POL-001', key: 'terms_of_service', title: 'Điều khoản sử dụng', content: 'Nội dung điều khoản sử dụng...', updatedAt: '15/05/2024', updatedBy: 'Admin Le', version: 3 },
  { id: 'POL-002', key: 'privacy_policy', title: 'Chính sách bảo mật', content: 'Nội dung chính sách bảo mật...', updatedAt: '15/05/2024', updatedBy: 'Admin Le', version: 2 },
  { id: 'POL-003', key: 'cancellation_policy', title: 'Chính sách hủy và hoàn tiền', content: 'Nội dung chính sách hủy...', updatedAt: '20/06/2024', updatedBy: 'Admin Minh', version: 5 },
  { id: 'POL-004', key: 'voucher_usage', title: 'Chính sách sử dụng voucher', content: 'Nội dung chính sách sử dụng...', updatedAt: '10/04/2024', updatedBy: 'Admin Le', version: 1 },
]

type ContentTab = 'categories' | 'banners' | 'articles' | 'policies'

export default function Content() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<ContentTab>('categories')
  const [banners, setBanners] = useState<Banner[]>(mockBanners)
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [editBanner, setEditBanner] = useState<Banner | null>(null)
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null)

  const tabs: { id: ContentTab; label: string; icon: string }[] = [
    { id: 'categories', label: 'Danh mục', icon: 'category' },
    { id: 'banners', label: 'Banner', icon: 'image' },
    { id: 'articles', label: 'Bài viết', icon: 'article' },
    { id: 'policies', label: 'Chính sách', icon: 'policy' },
  ]

  const handleDeleteCategory = (cat: Category) => {
    setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    showToast(`Đã xóa danh mục "${cat.name}"`, 'success')
  }

  const handleToggleCategory = (cat: Category) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === cat.id
          ? { ...c, status: c.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE' }
          : c
      )
    )
    const newStatus = cat.status === 'VISIBLE' ? 'ẩn' : 'hiển thị'
    showToast(`Đã ${newStatus} danh mục "${cat.name}"`, 'success')
  }

  const handleToggleBanner = (banner: Banner) => {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === banner.id
          ? { ...b, status: b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : b
      )
    )
    showToast(`Đã cập nhật trạng thái banner "${banner.title}"`, 'success')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Quản lý nội dung</h1>
        <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Quản lý danh mục, banner, bài viết và chính sách trên sàn.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-outline-variant)', paddingBottom: '0' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.id ? 600 : 500,
              transition: 'all 0.15s',
              marginBottom: '-2px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => { setEditCategory(null); setShowCategoryModal(true) }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Thêm danh mục
            </button>
          </div>
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '3rem' }}>#</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Voucher</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-outline)' }}>{cat.order}</span></td>
                    <td>
                      <p className="font-body-sm" style={{ fontWeight: 600 }}>{cat.name}</p>
                    </td>
                    <td><span className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{cat.description}</span></td>
                    <td><span className="font-label-md">{cat.voucherCount}</span></td>
                    <td>
                      <span className={`badge ${cat.status === 'VISIBLE' ? 'badge-active' : 'badge-info'}`}>
                        {cat.status === 'VISIBLE' ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => handleToggleCategory(cat)}
                          title={cat.status === 'VISIBLE' ? 'Ẩn' : 'Hiển thị'}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{cat.status === 'VISIBLE' ? 'visibility_off' : 'visibility'}</span>
                        </button>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => { setEditCategory(cat); setShowCategoryModal(true) }}
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => handleDeleteCategory(cat)}
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
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => { setEditBanner(null); setShowBannerModal(true) }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Thêm banner
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {banners.map((banner) => (
              <div key={banner.id} className="admin-card" style={{ overflow: 'hidden' }}>
                <div style={{ height: '8rem', background: 'linear-gradient(135deg, var(--color-surface-container-high) 0%, var(--color-surface-container) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-outline)' }}>image</span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 className="font-body-md" style={{ fontWeight: 600 }}>{banner.title}</h3>
                    <span className={`badge ${banner.status === 'ACTIVE' ? 'badge-active' : 'badge-info'}`}>
                      {banner.status === 'ACTIVE' ? 'Đang hiển thị' : 'Tắt'}
                    </span>
                  </div>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                    Liên kết: <span style={{ fontFamily: 'inherit' }}>{banner.link}</span>
                  </p>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', marginBottom: '0.75rem' }}>
                    {banner.startDate} → {banner.endDate}
                  </p>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="admin-btn admin-btn-ghost"
                      style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                      onClick={() => handleToggleBanner(banner)}
                    >
                      {banner.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                    </button>
                    <button
                      className="admin-btn admin-btn-ghost"
                      style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                      onClick={() => { setEditBanner(banner); setShowBannerModal(true) }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                      Sửa
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                      onClick={() => { setBanners((p) => p.filter((b) => b.id !== banner.id)); showToast(`Đã xóa banner "${banner.title}"`, 'success') }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="admin-btn admin-btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Tạo bài viết
            </button>
          </div>
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Tác giả</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {mockArticles.map((article) => (
                  <tr key={article.id}>
                    <td><span className="font-body-sm" style={{ fontWeight: 600 }}>{article.title}</span></td>
                    <td><span className="font-body-sm">{article.category}</span></td>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{article.author}</span></td>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{article.createdAt}</span></td>
                    <td>
                      <span className={`badge ${article.status === 'PUBLISHED' ? 'badge-active' : 'badge-info'}`}>
                        {article.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button className="admin-btn admin-btn-ghost" style={{ padding: '0.25rem', fontSize: '0.7rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                        </button>
                        <button className="admin-btn admin-btn-danger" style={{ padding: '0.25rem', fontSize: '0.7rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => { setEditPolicy(null); setShowPolicyModal(true) }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Tạo chính sách
            </button>
          </div>
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Khóa</th>
                  <th>Phiên bản</th>
                  <th>Cập nhật lần cuối</th>
                  <th>Người cập nhật</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {mockPolicies.map((policy) => (
                  <tr key={policy.id}>
                    <td><span className="font-body-sm" style={{ fontWeight: 600 }}>{policy.title}</span></td>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-outline)' }}>{policy.key}</span></td>
                    <td><span className="badge badge-info">v{policy.version}</span></td>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{policy.updatedAt}</span></td>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{policy.updatedBy}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => { setEditPolicy(policy); setShowPolicyModal(true); showToast(`Đang xem lịch sử chỉnh sửa "${policy.title}"`, 'info') }}
                          title="Xem lịch sử"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
                        </button>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => { setEditPolicy(policy); setShowPolicyModal(true) }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => showToast(`Đã lưu chính sách "${policy.title}"`, 'success')}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <>
          <div className="side-panel-overlay" onClick={() => setShowCategoryModal(false)} />
          <div className="side-panel" style={{ width: '32rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>
                {editCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Tên danh mục</label>
                  <input className="admin-input" defaultValue={editCategory?.name || ''} placeholder="VD: Ẩm thực" />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Mô tả</label>
                  <textarea className="admin-input" style={{ resize: 'vertical', minHeight: '80px' }} defaultValue={editCategory?.description || ''} placeholder="Mô tả danh mục..." />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Hình ảnh đại diện</label>
                  <div style={{ border: '2px dashed var(--color-outline-variant)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '0.5rem' }}>upload</span>
                    <p className="font-label-sm">Kéo thả hoặc nhấn để tải lên</p>
                    <p className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.65rem' }}>JPG, PNG, WebP — Tối đa 5MB</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setShowCategoryModal(false)}>
                Hủy
              </button>
              <button
                className="admin-btn admin-btn-primary"
                style={{ flex: 2 }}
                onClick={() => { showToast(editCategory ? 'Đã cập nhật danh mục!' : 'Đã tạo danh mục mới!', 'success'); setShowCategoryModal(false) }}
              >
                {editCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <>
          <div className="side-panel-overlay" onClick={() => setShowBannerModal(false)} />
          <div className="side-panel" style={{ width: '32rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>
                {editBanner ? 'Sửa banner' : 'Thêm banner mới'}
              </h3>
              <button onClick={() => setShowBannerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Tiêu đề banner</label>
                  <input className="admin-input" defaultValue={editBanner?.title || ''} placeholder="VD: Siêu sale mùa hè" />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Liên kết đích</label>
                  <input className="admin-input" defaultValue={editBanner?.link || ''} placeholder="/campaigns/summer-sale" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Ngày bắt đầu</label>
                    <input className="admin-input" type="date" defaultValue={editBanner?.startDate || ''} />
                  </div>
                  <div>
                    <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Ngày kết thúc</label>
                    <input className="admin-input" type="date" defaultValue={editBanner?.endDate || ''} />
                  </div>
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Hình ảnh banner</label>
                  <div style={{ border: '2px dashed var(--color-outline-variant)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '0.5rem' }}>upload</span>
                    <p className="font-label-sm">Kéo thả hoặc nhấn để tải lên</p>
                    <p className="font-label-sm" style={{ color: 'var(--color-outline)', fontSize: '0.65rem' }}>JPG, PNG, WebP — Tối đa 5MB</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setShowBannerModal(false)}>Hủy</button>
              <button className="admin-btn admin-btn-primary" style={{ flex: 2 }} onClick={() => { showToast(editBanner ? 'Đã cập nhật banner!' : 'Đã tạo banner mới!', 'success'); setShowBannerModal(false) }}>
                {editBanner ? 'Lưu thay đổi' : 'Tạo banner'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <>
          <div className="side-panel-overlay" onClick={() => setShowPolicyModal(false)} />
          <div className="side-panel" style={{ width: '36rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>
                {editPolicy ? `Chỉnh sửa: ${editPolicy.title}` : 'Tạo chính sách mới'}
              </h3>
              <button onClick={() => setShowPolicyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Tiêu đề</label>
                  <input className="admin-input" defaultValue={editPolicy?.title || ''} placeholder="VD: Chính sách hủy và hoàn tiền" />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Khóa chính sách</label>
                  <input className="admin-input" defaultValue={editPolicy?.key || ''} placeholder="VD: cancellation_policy" />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Nội dung (HTML)</label>
                  <textarea
                    className="admin-input"
                    style={{ resize: 'vertical', minHeight: '250px', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}
                    defaultValue={editPolicy?.content || ''}
                    placeholder="Nhập nội dung HTML..."
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setShowPolicyModal(false)}>Hủy</button>
              <button className="admin-btn admin-btn-primary" style={{ flex: 2 }} onClick={() => { showToast('Đã lưu chính sách!', 'success'); setShowPolicyModal(false) }}>
                Lưu chính sách
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
