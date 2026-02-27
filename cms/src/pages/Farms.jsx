import { useState, useEffect } from 'react'
import api from '../services/api'
import { Tractor as FarmIcon, Search, MapPin, Edit, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal'

const Farms = () => {
  const [farms, setFarms] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    totalArea: '',
    description: '',
    status: 'PENDING',
    regionId: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchFarms()
    fetchRegions()
  }, [])

  const fetchFarms = async () => {
    try {
      const response = await api.get('/farms')
      setFarms(response.data.data || [])
    } catch (error) {
      console.error('Error fetching farms:', error)
      setFarms([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRegions = async () => {
    try {
      const response = await api.get('/regions')
      setRegions(response.data.data || [])
    } catch (error) {
      console.error('Error fetching regions:', error)
    }
  }

  const filteredFarms = farms.filter((farm) => {
    return (
      farm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getStatusColor = (s) => {
    const v = (s || '').toLowerCase()
    const colors = { pending: '#f59e0b', active: '#10b981', suspended: '#ef4444', closed: '#6b7280' }
    return colors[v] || '#6b7280'
  }
  const getStatusLabel = (s) => {
    const v = (s || '').toLowerCase()
    const labels = { pending: 'Chờ duyệt', active: 'Hoạt động', suspended: 'Tạm dừng', closed: 'Đã đóng' }
    return labels[v] || s || '-'
  }

  const handleOpenModal = (farm = null) => {
    if (farm) {
      setEditingFarm(farm)
      setFormData({
        name: farm.name || '',
        address: farm.address || '',
        latitude: (farm.latitude ?? farm.location?.latitude)?.toString() || '',
        longitude: (farm.longitude ?? farm.location?.longitude)?.toString() || '',
        totalArea: farm.totalArea?.toString() || '',
        description: farm.description || '',
        status: farm.status || 'PENDING',
        regionId: farm.region?.id || farm.region?._id || farm.regionId || '',
      })
    } else {
      setEditingFarm(null)
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        totalArea: '',
        description: '',
        status: 'PENDING',
        regionId: '',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFarm(null)
    setError('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        totalArea: parseFloat(formData.totalArea) || 0,
        description: formData.description || undefined,
        status: formData.status,
        regionId: formData.regionId,
      }

      if (editingFarm) {
        await api.put(`/farms/${editingFarm.id || editingFarm._id}`, submitData)
      } else {
        await api.post('/farms', submitData)
      }
      handleCloseModal()
      fetchFarms()
    } catch (err) {
      setError(
        err.response?.data?.message || 
        (editingFarm ? 'Cập nhật trang trại thất bại' : 'Tạo trang trại thất bại')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (farm) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa trang trại "${farm.name}"?`)) {
      return
    }

    try {
      await api.delete(`/farms/${farm.id || farm._id}`)
      fetchFarms()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa trang trại thất bại')
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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
          Quản lý Trang trại
        </h1>
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
          Thêm trang trại
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
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
            placeholder="Tìm kiếm trang trại..."
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
      </div>

      {/* Farms Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredFarms.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Không có dữ liệu trang trại
          </div>
        ) : (
          filteredFarms.map((farm) => (
            <div
              key={farm.id || farm._id}
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
                  <FarmIcon size={24} color="#10b981" />
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                    {farm.name}
                  </h3>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(farm.status) + '20',
                    color: getStatusColor(farm.status),
                  }}
                >
                  {getStatusLabel(farm.status)}
                </span>
              </div>

              <div style={{ marginBottom: '15px', fontSize: '14px', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={16} />
                  <span>{farm.address || 'Chưa có địa chỉ'}</span>
                </div>
                {farm.owner && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Chủ sở hữu:</strong>{' '}
                    {typeof farm.owner === 'object' ? farm.owner.fullName : farm.owner}
                  </div>
                )}
                {farm.totalArea != null && (
                  <div>
                    <strong>Diện tích:</strong> {Number(farm.totalArea).toLocaleString('vi-VN')} m²
                  </div>
                )}
              </div>

              {farm.plots && farm.plots.length > 0 && (
                <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                  <strong>Số lô:</strong> {farm.plots.length}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  paddingTop: '15px',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <button
                  onClick={() => handleOpenModal(farm)}
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
                  onClick={() => handleDelete(farm)}
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
        Tổng số: {filteredFarms.length} trang trại
      </div>

      {/* Modal for Add/Edit Farm */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFarm ? 'Chỉnh sửa Trang trại' : 'Thêm Trang trại Mới'}
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
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Tên trang trại <span style={{ color: '#ef4444' }}>*</span>
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
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Địa chỉ <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Vĩ độ (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="10.762622"
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
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Kinh độ (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="106.660172"
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
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Diện tích (m²)
                </label>
                <input
                  type="number"
                  name="totalArea"
                  value={formData.totalArea}
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
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Trạng thái <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="SUSPENDED">Tạm dừng</option>
                  <option value="CLOSED">Đã đóng</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
<label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Khu vực <span style={{ color: '#ef4444' }}>*</span>
              </label>
                <select
                  name="regionId"
                  value={formData.regionId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Chọn khu vực --</option>
                  {regions.map((region) => (
                    <option key={region.id || region._id} value={region.id || region._id}>
                      {region.name} ({region.type === 'PROVINCE' ? 'Tỉnh' : region.type === 'DISTRICT' ? 'Huyện' : 'Xã'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
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
              {submitting ? 'Đang xử lý...' : editingFarm ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Farms
