import { useState, useEffect } from 'react'
import api from '../services/api'
import { Package, Search, Edit, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal'

const Crops = () => {
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    category: '',
    growthPeriod: '',
    temperatureMin: '',
    temperatureMax: '',
    humidityMin: '',
    humidityMax: '',
    soilType: [],
    waterRequirement: 'medium',
    description: '',
    standardProcess: '',
    isActive: true,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [soilTypeInput, setSoilTypeInput] = useState('')

  useEffect(() => {
    fetchCrops()
  }, [])

  const fetchCrops = async () => {
    try {
      const response = await api.get('/crops')
      setCrops(response.data.data || [])
    } catch (error) {
      console.error('Error fetching crops:', error)
      setCrops([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.variety?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || crop.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenModal = (crop = null) => {
    if (crop) {
      setEditingCrop(crop)
      setFormData({
        name: crop.name || '',
        variety: crop.variety || '',
        category: crop.category || '',
        growthPeriod: crop.growthPeriod?.toString() || '',
        temperatureMin: crop.temperatureMin != null ? String(crop.temperatureMin) : '',
        temperatureMax: crop.temperatureMax != null ? String(crop.temperatureMax) : '',
        humidityMin: crop.humidityMin != null ? String(crop.humidityMin) : '',
        humidityMax: crop.humidityMax != null ? String(crop.humidityMax) : '',
        soilType: Array.isArray(crop.soilType) ? crop.soilType : [],
        waterRequirement: crop.waterRequirement || 'medium',
        description: crop.description || '',
        standardProcess: crop.standardProcess || '',
        isActive: crop.isActive !== undefined ? crop.isActive : true,
      })
    } else {
      setEditingCrop(null)
      setFormData({
        name: '',
        variety: '',
        category: '',
        growthPeriod: '',
        temperatureMin: '',
        temperatureMax: '',
        humidityMin: '',
        humidityMax: '',
        soilType: [],
        waterRequirement: 'medium',
        description: '',
        standardProcess: '',
        isActive: true,
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCrop(null)
    setError('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSoilType = () => {
    if (soilTypeInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        soilType: [...prev.soilType, soilTypeInput.trim()],
      }))
      setSoilTypeInput('')
    }
  }

  const handleRemoveSoilType = (index) => {
    setFormData((prev) => ({
      ...prev,
      soilType: prev.soilType.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        variety: formData.variety || undefined,
        category: formData.category || undefined,
        growthPeriod: formData.growthPeriod ? parseInt(formData.growthPeriod, 10) : undefined,
        temperatureMin: formData.temperatureMin ? parseFloat(formData.temperatureMin) : undefined,
        temperatureMax: formData.temperatureMax ? parseFloat(formData.temperatureMax) : undefined,
        humidityMin: formData.humidityMin ? parseFloat(formData.humidityMin) : undefined,
        humidityMax: formData.humidityMax ? parseFloat(formData.humidityMax) : undefined,
        soilType: formData.soilType || [],
        waterRequirement: formData.waterRequirement || undefined,
        description: formData.description || undefined,
        standardProcess: formData.standardProcess || undefined,
        isActive: formData.isActive,
      }

      if (editingCrop) {
        await api.put(`/crops/${editingCrop.id || editingCrop._id}`, submitData)
      } else {
        await api.post('/crops', submitData)
      }
      handleCloseModal()
      fetchCrops()
    } catch (err) {
      setError(
        err.response?.data?.message || 
        (editingCrop ? 'Cập nhật giống cây thất bại' : 'Tạo giống cây thất bại')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (crop) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa giống cây "${crop.name}"?`)) {
      return
    }

    try {
      await api.delete(`/crops/${crop.id || crop._id}`)
      fetchCrops()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa giống cây thất bại')
    }
  }

  if (loading) {
    return <div>Đang tải...</div>
  }

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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Danh mục Giống cây</h1>
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
          Thêm giống cây
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm giống cây..."
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
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="all">Tất cả loại</option>
          <option value="fruit">Trái cây</option>
          <option value="vegetable">Rau củ</option>
          <option value="grain">Ngũ cốc</option>
          <option value="other">Khác</option>
        </select>
      </div>

      {/* Crops Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredCrops.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Không có dữ liệu giống cây
          </div>
        ) : (
          filteredCrops.map((crop) => (
            <div
              key={crop.id || crop._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '15px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={24} color="#06b6d4" />
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                    {crop.name}
                  </h3>
                </div>
                {crop.isActive ? (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: '#10b98120',
                      color: '#10b981',
                    }}
                  >
                    Hoạt động
                  </span>
                ) : (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: '#ef444420',
                      color: '#ef4444',
                    }}
                  >
                    Không hoạt động
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '15px', fontSize: '14px', color: '#6b7280' }}>
                {crop.variety && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Giống:</strong> {crop.variety}
                  </div>
                )}
                {crop.category && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Loại:</strong> {crop.category}
                  </div>
                )}
                {crop.growthPeriod && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Thời gian sinh trưởng:</strong> {crop.growthPeriod} ngày
                  </div>
                )}
                {crop.waterRequirement && (
                  <div>
                    <strong>Nhu cầu nước:</strong> {crop.waterRequirement}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  paddingTop: '15px',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <button
                  onClick={() => handleOpenModal(crop)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #3b82f6',
                    background: 'white',
                    color: '#3b82f6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Edit size={16} />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(crop)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ef4444',
                    background: 'white',
                    color: '#ef4444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '15px', fontSize: '14px', color: '#6b7280' }}>
        Tổng số: {filteredCrops.length} giống cây
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCrop ? 'Chỉnh sửa Giống cây' : 'Thêm Giống cây Mới'}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Tên cây trồng <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Giống
                </label>
                <input
                  type="text"
                  name="variety"
                  value={formData.variety}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Loại
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Chọn loại --</option>
                  <option value="fruit">Trái cây</option>
                  <option value="vegetable">Rau củ</option>
                  <option value="grain">Ngũ cốc</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Thời gian sinh trưởng (ngày)
                </label>
                <input
                  type="number"
                  name="growthPeriod"
                  value={formData.growthPeriod}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Nhiệt độ tối thiểu (°C)
                </label>
                <input
                  type="number"
                  name="temperatureMin"
                  value={formData.temperatureMin}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Nhiệt độ tối đa (°C)
                </label>
                <input
                  type="number"
                  name="temperatureMax"
                  value={formData.temperatureMax}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Độ ẩm tối thiểu (%)
                </label>
                <input
                  type="number"
                  name="humidityMin"
                  value={formData.humidityMin}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Độ ẩm tối đa (%)
                </label>
                <input
                  type="number"
                  name="humidityMax"
                  value={formData.humidityMax}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Nhu cầu nước
              </label>
              <select
                name="waterRequirement"
                value={formData.waterRequirement}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Loại đất
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={soilTypeInput}
                  onChange={(e) => setSoilTypeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSoilType())}
                  placeholder="Nhập loại đất và nhấn Enter"
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSoilType}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Thêm
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {formData.soilType.map((soil, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {soil}
                    <button
                      type="button"
                      onClick={() => handleRemoveSoilType(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Quy trình canh tác chuẩn
              </label>
              <textarea
                name="standardProcess"
                value={formData.standardProcess}
                onChange={handleInputChange}
                rows={4}
                placeholder="Mô tả quy trình canh tác chuẩn..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isActive" style={{ fontSize: '14px', cursor: 'pointer' }}>
                Kích hoạt
              </label>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '25px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <button
              type="button"
              onClick={handleCloseModal}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                background: 'white',
                color: '#374151',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                backgroundColor: submitting ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {submitting ? 'Đang xử lý...' : editingCrop ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Crops

