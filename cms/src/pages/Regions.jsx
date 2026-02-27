import { useState, useEffect } from 'react'
import api from '../services/api'
import { MapPin, Search, Edit, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { RegionType, RegionTypeLabels, labelFor } from '../constants/enums'

const TYPE_COLORS = { PROVINCE: '#3b82f6', DISTRICT: '#10b981', COMMUNE: '#f59e0b' }

const Regions = () => {
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRegion, setEditingRegion] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: RegionType.PROVINCE,
    code: '',
    parentId: '',
    latitude: '',
    longitude: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRegions()
  }, [])

  const fetchRegions = async () => {
    try {
      const response = await api.get('/regions')
      setRegions(response.data.data || [])
    } catch (error) {
      console.error('Error fetching regions:', error)
      setRegions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRegions = regions.filter((region) => {
    const matchesSearch = region.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const t = (region.type || '').toUpperCase()
    const matchesType = filterType === 'all' || t === filterType
    return matchesSearch && matchesType
  })

  const getTypeLabel = (t) => labelFor(RegionTypeLabels, t)
  const getTypeColor = (t) => TYPE_COLORS[(t || '').toUpperCase()] || '#6b7280'

  const handleOpenModal = (region = null) => {
    if (region) {
      setEditingRegion(region)
      const pid = region.parentId && typeof region.parentId === 'object'
        ? (region.parentId.id || region.parentId._id) : region.parentId
      setFormData({
        name: region.name || '',
        type: region.type || RegionType.PROVINCE,
        code: region.code || '',
        parentId: pid || '',
        latitude: (region.latitude ?? region.location?.latitude) != null ? String(region.latitude ?? region.location?.latitude) : '',
        longitude: (region.longitude ?? region.location?.longitude) != null ? String(region.longitude ?? region.location?.longitude) : '',
      })
    } else {
      setEditingRegion(null)
      setFormData({
        name: '',
        type: RegionType.PROVINCE,
        code: '',
        parentId: '',
        latitude: '',
        longitude: '',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRegion(null)
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
        type: formData.type,
        code: formData.code || undefined,
        parentId: formData.parentId || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      }

      if (editingRegion) {
        await api.put(`/regions/${editingRegion.id || editingRegion._id}`, submitData)
      } else {
        await api.post('/regions', submitData)
      }
      handleCloseModal()
      fetchRegions()
    } catch (err) {
      setError(
        err.response?.data?.message || 
        (editingRegion ? 'Cập nhật khu vực thất bại' : 'Tạo khu vực thất bại')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (region) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khu vực "${region.name}"?`)) {
      return
    }

    try {
      await api.delete(`/regions/${region.id || region._id}`)
      fetchRegions()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa khu vực thất bại')
    }
  }

  const getParentOptions = () => {
    const t = (formData.type || '').toUpperCase()
    if (t === RegionType.PROVINCE) return []
    if (t === RegionType.DISTRICT) return regions.filter((r) => (r.type || '').toUpperCase() === RegionType.PROVINCE)
    if (t === RegionType.COMMUNE) return regions.filter((r) => (r.type || '').toUpperCase() === RegionType.DISTRICT)
    return []
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
          Quản lý Khu vực
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
          Thêm khu vực
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
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
            placeholder="Tìm kiếm khu vực..."
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="all">Tất cả loại</option>
          {Object.entries(RegionTypeLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Regions Table */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Tên
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Loại
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Mã
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Khu vực cha
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRegions.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  Không có dữ liệu khu vực
                </td>
              </tr>
            ) : (
              filteredRegions.map((region) => (
                <tr
                  key={region.id || region._id}
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color={getTypeColor(region.type)} />
                      {region.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getTypeColor(region.type) + '20',
                        color: getTypeColor(region.type),
                      }}
                    >
                      {getTypeLabel(region.type)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {region.code || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {region.parent?.name || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleOpenModal(region)}
                        style={{
                          padding: '6px',
                          border: 'none',
                          background: '#f0f9ff',
                          color: '#3b82f6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(region)}
                        style={{
                          padding: '6px',
                          border: 'none',
                          background: '#fef2f2',
                          color: '#ef4444',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '15px', fontSize: '14px', color: '#6b7280' }}>
        Tổng số: {filteredRegions.length} khu vực
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRegion ? 'Chỉnh sửa Khu vực' : 'Thêm Khu vực Mới'}
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
                Tên khu vực <span style={{ color: '#ef4444' }}>*</span>
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
                Loại <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="type"
                value={formData.type}
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
                {Object.entries(RegionTypeLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
              </select>
            </div>

            {(formData.type || '').toUpperCase() !== RegionType.PROVINCE && (
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Khu vực cha
                </label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Chọn khu vực cha --</option>
                  {getParentOptions().map((parent) => (
                    <option key={parent.id || parent._id} value={parent.id || parent._id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Mã khu vực
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
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
                  Vĩ độ
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
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
                  Kinh độ
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
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
              {submitting ? 'Đang xử lý...' : editingRegion ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Regions

