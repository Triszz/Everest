import { useState, useEffect, useRef } from 'react'
import { useToast } from '../components/shared/Toast'
import { useCategoryManagement } from '../hooks/useCategoryManagement'
import { usePolicyManagement } from '../hooks/usePolicyManagement'
import { useBannerManagement } from '../hooks/useBannerManagement'
import type { CategoryResponse } from '../services/admin.service'
import type { BannerResponse } from '../services/admin.service'
import PopupManagement from './PopupManagement'
import PostManagement from './PostManagement'

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
  title: string
  content: string
  updatedAt: string
  updatedBy: string
  version: number
}

const mockArticles: Article[] = [
  { id: 'ART-001', title: 'Hướng dẫn mua voucher', category: 'Hướng dẫn', status: 'PUBLISHED', createdAt: '10/05/2024', author: 'Admin Le' },
  { id: 'ART-002', title: 'Chính sách đổi trả voucher', category: 'Chính sách', status: 'PUBLISHED', createdAt: '08/05/2024', author: 'Admin Le' },
  { id: 'ART-003', title: 'Cách sử dụng voucher tại nhà hàng', category: 'Hướng dẫn', status: 'DRAFT', createdAt: '20/06/2024', author: 'Admin Minh' },
  { id: 'ART-004', title: 'Giới thiệu đối tác California Fitness', category: 'Tin tức', status: 'PUBLISHED', createdAt: '15/05/2024', author: 'Admin Le' },
]

type ContentTab = 'categories' | 'banners' | 'popups' | 'posts' | 'policies'

export default function Content() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<ContentTab>('categories')
  const {
    categories: rawCategories,
    total,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFilters,
  } = useCategoryManagement()
  const {
    policies: rawPolicies,
    isLoading: isLoadingPolicies,
    fetchPolicies,
    savePolicy,
    deletePolicy,
    setCurrentPolicy,
  } = usePolicyManagement()
  const {
    banners,
    isLoading: isLoadingBanners,
    error: bannerError,
    fetchBanners,
    createBanner,
    updateBanner,
    toggleBannerStatus,
    deleteBanner: deleteBannerHook,
  } = useBannerManagement()
  const categories: CategoryResponse[] = rawCategories ?? []
  const policies: Policy[] = rawPolicies.map((p) => ({ id: String(p.policyId), title: p.title, content: p.content, updatedAt: p.updatedAt, updatedBy: '', version: 1 }))

  useEffect(() => {
    if (activeTab === 'policies') fetchPolicies()
  }, [activeTab])
  useEffect(() => {
    if (activeTab === 'banners') fetchBanners()
  }, [activeTab])
  const [catFormName, setCatFormName] = useState('')
  const [catFormDesc, setCatFormDesc] = useState('')
  const [isSavingCat, setIsSavingCat] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [editCategory, setEditCategory] = useState<CategoryResponse | null>(null)

  const openCategoryModal = (cat: CategoryResponse | null) => {
    setEditCategory(cat)
    setCatFormName(cat?.categoryName ?? '')
    setCatFormDesc(cat?.description ?? '')
    setShowCategoryModal(true)
  }

  const handleSaveCategory = async () => {
    if (!catFormName.trim()) { showToast('Tên danh mục không được để trống', 'error'); return }
    setIsSavingCat(true)
    try {
      if (editCategory) {
        await updateCategory(editCategory.categoryId, { categoryName: catFormName.trim(), description: catFormDesc.trim() || undefined })
        showToast('Đã cập nhật danh mục!', 'success')
      } else {
        await createCategory({ categoryName: catFormName.trim(), description: catFormDesc.trim() || undefined })
        showToast('Đã tạo danh mục mới!', 'success')
      }
      setShowCategoryModal(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi lưu danh mục', 'error')
    } finally {
      setIsSavingCat(false)
    }
  }
  const [editBanner, setEditBanner] = useState<BannerResponse | null>(null)
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null)
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'banner' | 'policy'; item: any; policyConfirmStep?: number } | null>(null)
  const [isSavingPolicy, setIsSavingPolicy] = useState(false)
  const policyContentRef = useRef<HTMLTextAreaElement>(null)
  const policyTitleRef = useRef<HTMLInputElement>(null)

  const tabs: { id: ContentTab; label: string; icon: string }[] = [
    { id: 'categories', label: 'Danh mục', icon: 'category' },
    { id: 'banners', label: 'Banner', icon: 'image' },
    { id: 'popups', label: 'Popup', icon: 'campaign' },
    { id: 'posts', label: 'Bài viết', icon: 'article' },
    { id: 'policies', label: 'Chính sách', icon: 'policy' },
  ]

  const handleDeleteCategory = (cat: CategoryResponse) => {
    setDeleteConfirm({ type: 'category', item: cat })
  }

  const handleDeleteBanner = (banner: BannerResponse) => {
    setDeleteConfirm({ type: 'banner', item: banner })
  }

  const handleDeletePolicy = (policy: Policy) => {
    setDeleteConfirm({ type: 'policy', item: policy, policyConfirmStep: 1 })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    const { type, item, policyConfirmStep } = deleteConfirm
    try {
      if (type === 'category') {
        await deleteCategory(item.categoryId)
        showToast(`Đã xóa danh mục "${item.categoryName}"`, 'success')
      } else if (type === 'banner') {
        await deleteBannerHook(item.bannerId)
        showToast(`Đã xóa banner "${item.title}"`, 'success')
      } else if (type === 'policy') {
        if (policyConfirmStep === 1) {
          setDeleteConfirm({ type: 'policy', item, policyConfirmStep: 2 })
        }
        await deletePolicy(Number(item.id))
        showToast(`Đã xóa chính sách "${item.title}"`, 'success')
      }
    } catch {
      showToast(`Không thể xóa`, 'error')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleSavePolicy = async () => {
    const content = policyContentRef.current?.value ?? ''
    const title = policyTitleRef.current?.value ?? ''
    if (!title.trim() || !content.trim()) {
      showToast('Tiêu đề và nội dung không được để trống', 'error')
      return
    }
    setIsSavingPolicy(true)
    try {
      await savePolicy({ title: title.trim(), content: content.trim() })
      showToast('Đã lưu chính sách!', 'success')
      setShowPolicyModal(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lưu chính sách thất bại', 'error')
    } finally {
      setIsSavingPolicy(false)
    }
  }

  const handleToggleBanner = async (banner: BannerResponse) => {
    const nextStatus = banner.status === 'Visible' ? 'Hidden' : 'Visible'
    try {
      await toggleBannerStatus(banner.bannerId, nextStatus)
      showToast(
        nextStatus === 'Visible'
          ? `Đã hiển thị banner "${banner.title}" (các banner khác đã ẩn)`
          : `Đã ẩn banner "${banner.title}"`,
        'success',
      )
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Đổi trạng thái banner thất bại', 'error')
    }
  }

  const [bannerForm, setBannerForm] = useState({
    title: '',
    imageUrl: '',
    status: 'Hidden' as 'Visible' | 'Hidden',
  })
  const bannerImageInputRef = useRef<HTMLInputElement>(null)

  const openBannerModal = (banner: BannerResponse | null) => {
    setEditBanner(banner)
    setBannerForm({
      title: banner?.title ?? '',
      imageUrl: banner?.imageUrl ?? '',
      status: banner?.status ?? 'Hidden',
    })
    setShowBannerModal(true)
  }

  const handleSaveBanner = async () => {
    if (!bannerForm.title.trim()) {
      showToast('Tiêu đề banner không được để trống', 'error')
      return
    }
    if (!bannerForm.imageUrl.trim()) {
      showToast('imageUrl không được để trống', 'error')
      return
    }
    try {
      if (editBanner) {
        await updateBanner(editBanner.bannerId, {
          title: bannerForm.title.trim(),
          imageUrl: bannerForm.imageUrl.trim(),
        })
        showToast('Đã cập nhật banner!', 'success')
      } else {
        await createBanner({
          title: bannerForm.title.trim(),
          imageUrl: bannerForm.imageUrl.trim(),
          status: bannerForm.status,
        })
        showToast('Đã tạo banner mới!', 'success')
      }
      setShowBannerModal(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lưu banner thất bại', 'error')
    }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            {total > 0 && <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{total} danh mục</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--color-outline)' }}>search</span>
                <input
                  className="admin-input"
                  style={{ paddingLeft: '2.25rem', width: '220px' }}
                  placeholder="Tìm kiếm..."
                  defaultValue=""
                  onChange={(e) => updateFilters({ search: e.target.value })}
                />
              </div>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => openCategoryModal(null)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                Thêm danh mục
              </button>
            </div>
          </div>
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-outline)' }}>Đang tải...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-error)' }}>{error}</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-outline)' }}>Chưa có danh mục nào.</td></tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat.categoryId}>
                      <td><span className="font-label-sm" style={{ color: 'var(--color-outline)' }}>{index + 1}</span></td>
                      <td>
                        <p className="font-body-sm" style={{ fontWeight: 600 }}>{cat.categoryName}</p>
                      </td>
                      <td><span className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{cat.description || '—'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                            onClick={() => openCategoryModal(cat)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Quản lý banner hiển thị trên trang chủ.
              <strong> Chỉ một banner ở trạng thái "Hiển thị"</strong> tại một thời điểm — bật banner này sẽ tự động ẩn các banner còn lại.
            </p>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => openBannerModal(null)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Thêm banner
            </button>
          </div>
          {isLoadingBanners ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              Đang tải...
            </div>
          ) : bannerError ? (
            <div style={{ padding: '1.5rem', color: 'var(--color-error)' }}>{bannerError}</div>
          ) : banners.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              Chưa có banner nào.
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {banners.map((banner) => (
              <div key={banner.bannerId} className="admin-card" style={{ overflow: 'hidden' }}>
                <div style={{
                  height: '8rem',
                  background: banner.imageUrl
                    ? `url(${banner.imageUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, var(--color-surface-container-high) 0%, var(--color-surface-container) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!banner.imageUrl && (
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-outline)' }}>image</span>
                  )}
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <h3 className="font-body-md" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.title}</h3>
                    <span className={`badge ${banner.status === 'Visible' ? 'badge-active' : 'badge-info'}`} style={{ flexShrink: 0 }}>
                      {banner.status === 'Visible' ? 'Đang hiển thị' : 'Đã ẩn'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="admin-btn admin-btn-ghost"
                      style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                      onClick={() => handleToggleBanner(banner)}
                    >
                      {banner.status === 'Visible' ? 'Ẩn' : 'Hiển thị'}
                    </button>
                    <button
                      className="admin-btn admin-btn-ghost"
                      style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                      onClick={() => openBannerModal(banner)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                      Sửa
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      style={{ flex: 1, fontSize: '0.7rem', padding: '0.375rem' }}
                      onClick={() => handleDeleteBanner(banner)}
                      title="Xóa banner"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Popups Tab */}
      {activeTab === 'popups' && <PopupManagement />}

      {/* Posts Tab */}
      {activeTab === 'posts' && <PostManagement />}

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
            {isLoadingPolicies ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                Đang tải...
              </div>
            ) : policies.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                Chưa có chính sách nào.
              </div>
            ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Nội dung</th>
                  <th>Cập nhật lần cuối</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => {
                  const isExpanded = expandedPolicyId === policy.id
                  const preview = policy.content.length > 120 ? policy.content.slice(0, 120) + '…' : policy.content
                  return (
                  <tr key={policy.id}>
                    <td><span className="font-body-sm" style={{ fontWeight: 600 }}>{policy.title}</span></td>
                    <td>
                      <div
                        className="policy-content-preview"
                        style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', maxWidth: '28rem', cursor: 'pointer' }}
                        onClick={() => setExpandedPolicyId(isExpanded ? null : policy.id)}
                        title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                      >
                        <span
                          className="font-label-sm"
                          style={{ color: isExpanded ? 'var(--color-on-surface)' : 'var(--color-outline)' }}
                          dangerouslySetInnerHTML={{ __html: isExpanded ? policy.content : preview }}
                        />
                      </div>
                    </td>
                    <td><span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', whiteSpace: 'nowrap' }}>{policy.updatedAt}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
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
                          onClick={() => handleDeletePolicy(policy)}
                          title="Xóa chính sách"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>)
                })}
              </tbody>
            </table>
            )}
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
                  <input className="admin-input" value={catFormName} onChange={e => setCatFormName(e.target.value)} placeholder="VD: Ẩm thực" />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Mô tả</label>
                  <textarea className="admin-input" style={{ resize: 'vertical', minHeight: '80px' }} value={catFormDesc} onChange={e => setCatFormDesc(e.target.value)} placeholder="Mô tả danh mục..." />
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
                disabled={isSavingCat || !catFormName.trim()}
                onClick={handleSaveCategory}
              >
                {isSavingCat ? 'Đang lưu...' : editCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
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
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                    Tiêu đề banner
                  </label>
                  <input
                    className="admin-input"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="VD: Siêu sale mùa hè"
                  />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                    URL hình ảnh
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      ref={bannerImageInputRef}
                      className="admin-input"
                      value={bannerForm.imageUrl}
                      onChange={(e) => setBannerForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                    {bannerForm.imageUrl && (
                      <div style={{
                        width: '3rem', height: '3rem', flexShrink: 0,
                        background: `url(${bannerForm.imageUrl}) center/cover no-repeat`,
                        borderRadius: '0.375rem', border: '1px solid var(--color-outline-variant)',
                      }} />
                    )}
                  </div>
                </div>
                {!editBanner && (
                  <div>
                    <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                      Trạng thái khi tạo
                    </label>
                    <select
                      className="admin-input"
                      value={bannerForm.status}
                      onChange={(e) => setBannerForm((f) => ({ ...f, status: e.target.value as 'Visible' | 'Hidden' }))}
                    >
                      <option value="Hidden">Đã ẩn</option>
                      <option value="Visible">Đang hiển thị (sẽ ẩn các banner khác)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setShowBannerModal(false)}>Hủy</button>
              <button className="admin-btn admin-btn-primary" style={{ flex: 2 }} onClick={handleSaveBanner}>
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
                  <input
                    ref={policyTitleRef}
                    className="admin-input"
                    defaultValue={editPolicy?.title || ''}
                    placeholder="VD: Chính sách hủy và hoàn tiền"
                  />
                </div>
                <div>
                  <label className="font-label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Nội dung</label>
                  <textarea
                    ref={policyContentRef}
                    className="admin-input"
                    style={{ resize: 'vertical', minHeight: '250px', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}
                    defaultValue={editPolicy?.content || ''}
                    placeholder="Nhập nội dung..."
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={() => setShowPolicyModal(false)}>Hủy</button>
              <button className="admin-btn admin-btn-primary" style={{ flex: 2 }} disabled={isSavingPolicy} onClick={handleSavePolicy}>
                {isSavingPolicy ? 'Đang lưu...' : 'Lưu chính sách'}
              </button>
            </div>
          </div>
        </>
      )}
      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <>
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setDeleteConfirm(null)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: 'var(--color-surface)', borderRadius: '12px', padding: '1.5rem',
            zIndex: 1001, minWidth: '340px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            {deleteConfirm.type === 'policy' && deleteConfirm.policyConfirmStep === 1 ? (
              <>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Xác nhận xóa chính sách</h3>
                <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  Bạn đang xóa chính sách <strong>"{deleteConfirm.item.title}"</strong>. Bạn cần xác nhận thêm một lần nữa để hoàn tất.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteConfirm(null)}>Hủy</button>
                  <button className="admin-btn admin-btn-danger" onClick={confirmDelete}>Tiếp tục</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Xác nhận xóa</h3>
                <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  Bạn có chắc muốn xóa <strong>{deleteConfirm.type === 'category' ? deleteConfirm.item.categoryName : deleteConfirm.item.title}</strong>? Hành động này không thể hoàn tác.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteConfirm(null)}>Hủy</button>
                  <button className="admin-btn admin-btn-danger" onClick={confirmDelete}>Xóa</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
