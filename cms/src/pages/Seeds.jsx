import { useState, useEffect } from 'react'
import api from '../services/api'
import { Package, Search, Edit, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal'

const Seeds = () => {
  const [seeds, setSeeds] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCropId, setFilterCropId] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSeed, setEditingSeed] = useState(null)
  const [formData, setFormData] = useState({
    cropId: '',
    name: '',
    supplier: '',
    price: '',
    unit: 'kg',
    quantityInStock: '',
    description: '',
    isActive: true,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSeeds()
    fetchCrops()
  }, [])

  const fetchSeeds = async () => {
    try {
      const response = await api.get('/seeds')
      setSeeds(response.data.data || [])
    } catch (error) {
      console.error('Error fetching seeds:', error)
      setSeeds([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCrops = async () => {
    try {
      const res = await api.get('/crops')
      setCrops(res.data.data || [])
    } catch (e) {
      console.error('Error fetching crops:', e)
    }
  }

  const filteredSeeds = seeds.filter((seed) => {
    const matchesSearch =
      seed.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seed.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCrop = filterCropId === 'all' || seed.cropId === filterCropId
    return matchesSearch && matchesCrop
  })

  const handleOpenModal = (seed = null) => {
    if (seed) {
      setEditingSeed(seed)
      setFormData({
        cropId: seed.cropId || '',
        name: seed.name || '',
        supplier: seed.supplier || '',
        price: seed.price != null ? String(seed.price) : '',
        unit: seed.unit || 'kg',
        quantityInStock: seed.quantityInStock != null ? String(seed.quantityInStock) : '',
        description: seed.description || '',
        isActive: seed.isActive !== undefined ? seed.isActive : true,
      })
    } else {
      setEditingSeed(null)
      setFormData({
        cropId: '',
        name: '',
        supplier: '',
        price: '',
        unit: 'kg',
        quantityInStock: '0',
        description: '',
        isActive: true,
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSeed(null)
    setError('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const submitData = {
        cropId: formData.cropId || undefined,
        name: formData.name,
        supplier: formData.supplier || undefined,
        price: formData.price ? parseFloat(formData.price) : 0,
        unit: formData.unit || 'kg',
        quantityInStock: formData.quantityInStock ? parseFloat(formData.quantityInStock) : 0,
        description: formData.description || undefined,
        isActive: formData.isActive,
      }

      if (editingSeed) {
        await api.put(`/seeds/${editingSeed.id}`, submitData)
      } else {
        if (!formData.cropId) {
          setError('Vui lòng chọn loại cây trồng')
          setSubmitting(false)
          return
        }
        await api.post('/seeds', submitData)
      }
      handleCloseModal()
      fetchSeeds()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingSeed ? 'Cập nhật hạt giống thất bại' : 'Tạo hạt giống thất bại')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (seed) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hạt giống "${seed.name}"?`)) return

    try {
      await api.delete(`/seeds/${seed.id}`)
      fetchSeeds()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa hạt giống thất bại')
    }
  }

  if (loading) return <div>Đang tải...</div>

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Danh mục Hạt giống</h1>
        <button
          onClick={() => handleOpenModal()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <Plus size={18} />
          Thêm hạt giống
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm hạt giống..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
        <select
          value={filterCropId}
          onChange={(e) => setFilterCropId(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '200px',
          }}
        >
          <option value="all">Tất cả loại cây</option>
          {crops.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredSeeds.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#6b7280' }}>
            Không có dữ liệu hạt giống
          </div>
        ) : (
          filteredSeeds.map((seed) => (
            <div
              key={seed.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Package size={24} color="#f59e0b" />
                  <h3 style={{ fontSize: 18, fontWeight: 600 }}>{seed.name}</h3>
                </div>
                {seed.isActive ? (
                  <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 500, backgroundColor: '#10b98120', color: '#10b981' }}>Hoạt động</span>
                ) : (
                  <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 500, backgroundColor: '#ef444420', color: '#ef4444' }}>Tạm ngưng</span>
                )}
              </div>
              <div style={{ marginBottom: 15, fontSize: 14, color: '#6b7280' }}>
                {seed.crop?.name && <div><strong>Loại cây:</strong> {seed.crop.name}</div>}
                {seed.supplier && <div><strong>Nhà cung cấp:</strong> {seed.supplier}</div>}
                <div><strong>Giá:</strong> {Number(seed.price || 0).toLocaleString('vi-VN')} ₫/{seed.unit}</div>
                <div><strong>Tồn kho:</strong> {seed.quantityInStock ?? 0} {seed.unit}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 15, borderTop: '1px solid #e5e7eb' }}>
                <button onClick={() => handleOpenModal(seed)} style={{ flex: 1, padding: 8, border: '1px solid #3b82f6', background: 'white', color: '#3b82f6', borderRadius: 4, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Edit size={16} /> Chỉnh sửa
                </button>
                <button onClick={() => handleDelete(seed)} style={{ flex: 1, padding: 8, border: '1px solid #ef4444', background: 'white', color: '#ef4444', borderRadius: 4, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Trash2 size={16} /> Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 15, fontSize: 14, color: '#6b7280' }}>Tổng số: {filteredSeeds.length} hạt giống</div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSeed ? 'Chỉnh sửa Hạt giống' : 'Thêm Hạt giống Mới'} size="large">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 4, marginBottom: 20, fontSize: 14 }}>{error}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Loại cây trồng <span style={{ color: '#ef4444' }}>*</span></label>
              <select name="cropId" value={formData.cropId} onChange={handleInputChange} required disabled={!!editingSeed} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
                <option value="">-- Chọn loại cây --</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Tên giống <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Nhà cung cấp</label>
                <input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Giá (₫)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" step="1000" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Đơn vị</label>
                <select name="unit" value={formData.unit} onChange={handleInputChange} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
                  <option value="kg">kg</option>
                  <option value="gói">Gói</option>
                  <option value="bao">Bao</option>
                  <option value="cây">Cây</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Tồn kho</label>
                <input type="number" name="quantityInStock" value={formData.quantityInStock} onChange={handleInputChange} min="0" step="0.1" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Mô tả</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <label htmlFor="isActive" style={{ fontSize: 14, cursor: 'pointer' }}>Kích hoạt</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 25, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={handleCloseModal} style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', color: '#374151', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Hủy</button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', backgroundColor: submitting ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}>{submitting ? 'Đang xử lý...' : editingSeed ? 'Cập nhật' : 'Tạo mới'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Seeds
