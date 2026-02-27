import { useState, useEffect } from 'react'
import api from '../services/api'
import { Map, Search, Tractor, Edit, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { PlotStatus, PlotStatusLabels, labelFor } from '../constants/enums'

const STATUS_COLORS = { ACTIVE: '#10b981', FALLOW: '#f59e0b', HARVESTED: '#3b82f6', CLOSED: '#6b7280' }

const Plots = () => {
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('all')
  const [farms, setFarms] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlot, setEditingPlot] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    farmId: '',
    cropType: '',
    soilType: '',
    waterSource: '',
    status: PlotStatus.ACTIVE,
    geometryJson: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPlots()
    fetchFarms()
  }, [])

  const fetchPlots = async () => {
    try {
      const response = await api.get('/plots')
      setPlots(response.data.data || [])
    } catch (error) {
      console.error('Error fetching plots:', error)
      setPlots([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFarms = async () => {
    try {
      const response = await api.get('/farms')
      setFarms(response.data.data || [])
    } catch (error) {
      console.error('Error fetching farms:', error)
    }
  }

  const filteredPlots = plots.filter((plot) => {
    const matchesSearch =
      plot.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plot.cropType?.toLowerCase().includes(searchTerm.toLowerCase())
    const fid = plot.farmId || plot.farm?.id || plot.farm?._id
    const matchesFarm = selectedFarm === 'all' || fid === selectedFarm
    return matchesSearch && matchesFarm
  })

  const formatArea = (area) => {
    if (!area) return '0 m²'
    if (area >= 10000) return `${(area / 10000).toFixed(2)} ha`
    return `${Number(area).toLocaleString('vi-VN')} m²`
  }

  const getStatusColor = (s) => STATUS_COLORS[(s || '').toUpperCase()] || '#6b7280'
  const getStatusLabel = (s) => labelFor(PlotStatusLabels, s)

  const handleOpenModal = (plot = null) => {
    if (plot) {
      setEditingPlot(plot)
      const fid = plot.farmId || plot.farm?.id || plot.farm?._id
      setFormData({
        name: plot.name || '',
        farmId: fid || '',
        cropType: plot.cropType || '',
        soilType: plot.soilType || '',
        waterSource: plot.waterSource || '',
        status: plot.status || PlotStatus.ACTIVE,
        geometryJson: plot.geometry ? JSON.stringify(plot.geometry, null, 2) : '',
      })
    } else {
      setEditingPlot(null)
      setFormData({
        name: '',
        farmId: '',
        cropType: '',
        soilType: '',
        waterSource: '',
        status: PlotStatus.ACTIVE,
        geometryJson: '',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPlot(null)
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
        farmId: formData.farmId,
        cropType: formData.cropType || undefined,
        soilType: formData.soilType || undefined,
        waterSource: formData.waterSource || undefined,
        status: formData.status,
      }

      if (formData.geometryJson.trim()) {
        try {
          submitData.geometry = JSON.parse(formData.geometryJson)
        } catch (parseError) {
          setError('Định dạng JSON của geometry không hợp lệ')
          setSubmitting(false)
          return
        }
      }

      if (editingPlot) {
        await api.put(`/plots/${editingPlot.id || editingPlot._id}`, submitData)
      } else {
        if (!submitData.geometry) {
          setError('Vui lòng nhập geometry (polygon) cho lô đất')
          setSubmitting(false)
          return
        }
        await api.post('/plots', submitData)
      }
      handleCloseModal()
      fetchPlots()
    } catch (err) {
      setError(
        err.response?.data?.message || 
        (editingPlot ? 'Cập nhật vùng trồng thất bại' : 'Tạo vùng trồng thất bại')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (plot) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vùng trồng "${plot.name}"?`)) {
      return
    }

    try {
      await api.delete(`/plots/${plot.id || plot._id}`)
      fetchPlots()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa vùng trồng thất bại')
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
          Quản lý Vùng trồng
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
          Thêm vùng trồng
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
            placeholder="Tìm kiếm vùng trồng..."
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
          value={selectedFarm}
          onChange={(e) => setSelectedFarm(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '200px',
          }}
        >
          <option value="all">Tất cả trang trại</option>
          {farms.map((farm) => (
            <option key={farm.id || farm._id} value={farm.id || farm._id}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      {/* Plots Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredPlots.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Không có dữ liệu vùng trồng
          </div>
        ) : (
          filteredPlots.map((plot) => (
            <div
              key={plot.id || plot._id}
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
                  <Map size={24} color="#3b82f6" />
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                    {plot.name}
                  </h3>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(plot.status) + '20',
                    color: getStatusColor(plot.status),
                  }}
                >
                  {getStatusLabel(plot.status)}
                </span>
              </div>

              <div style={{ marginBottom: '15px', fontSize: '14px', color: '#6b7280' }}>
                {plot.farm && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Tractor size={16} />
                    <span>
                      {typeof plot.farm === 'object' ? plot.farm.name : 'Trang trại'}
                    </span>
                  </div>
                )}
                {plot.area && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Diện tích:</strong> {formatArea(plot.area)}
                  </div>
                )}
                {plot.cropType && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Cây trồng:</strong> {plot.cropType}
                  </div>
                )}
                {plot.soilType && (
                  <div>
                    <strong>Loại đất:</strong> {plot.soilType}
                  </div>
                )}
              </div>

              {plot.geometry && (
                <div
                  style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}
                >
                  <strong>Polygon:</strong> {plot.geometry.coordinates?.[0]?.length || 0} điểm
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
                  onClick={() => handleOpenModal(plot)}
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
                  onClick={() => handleDelete(plot)}
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
        Tổng số: {filteredPlots.length} vùng trồng
      </div>

      {/* Modal for Add/Edit Plot */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPlot ? 'Chỉnh sửa Vùng trồng' : 'Thêm Vùng trồng Mới'}
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
                Tên vùng trồng <span style={{ color: '#ef4444' }}>*</span>
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
                Trang trại <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="farmId"
                value={formData.farmId}
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
                <option value="">-- Chọn trang trại --</option>
                {farms.map((farm) => (
                  <option key={farm.id || farm._id} value={farm.id || farm._id}>
                    {farm.name}
                  </option>
                ))}
              </select>
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
                  Loại cây trồng
                </label>
                <input
                  type="text"
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Xoài cát Hòa Lộc"
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
                  {Object.entries(PlotStatusLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
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
                  Loại đất
                </label>
                <input
                  type="text"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Đất phù sa"
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
                  Nguồn nước
                </label>
                <input
                  type="text"
                  name="waterSource"
                  value={formData.waterSource}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Giếng khoan"
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
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Geometry (GeoJSON Polygon) {!editingPlot && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <textarea
                name="geometryJson"
                value={formData.geometryJson}
                onChange={handleInputChange}
                rows={8}
                placeholder='{"type": "Polygon", "coordinates": [[[lng1, lat1], [lng2, lat2], [lng3, lat3], [lng1, lat1]]]}'
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Định dạng GeoJSON Polygon. Polygon phải khép kín (điểm đầu và cuối giống nhau) và có tối thiểu 3 điểm.
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
              {submitting ? 'Đang xử lý...' : editingPlot ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Plots

