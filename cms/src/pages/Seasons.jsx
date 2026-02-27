import { useState, useEffect } from 'react'
import api from '../services/api'
import { Calendar, Search, Edit, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { SeasonStatus, SeasonStatusLabels, labelFor } from '../constants/enums'

const SSTATUS_COLORS = { PLANNED: '#6b7280', PLANTED: '#3b82f6', GROWING: '#10b981', HARVESTING: '#f59e0b', HARVESTED: '#8b5cf6', COMPLETED: '#10b981' }

const Seasons = () => {
  const [seasons, setSeasons] = useState([])
  const [plots, setPlots] = useState([])
  const [crops, setCrops] = useState([])
  const [seeds, setSeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSeason, setEditingSeason] = useState(null)
  const [formData, setFormData] = useState({
    plotId: '',
    cropId: '',
    seedVarietyId: '',
    name: '',
    startDate: '',
    expectedHarvestDate: '',
    actualHarvestDate: '',
    expectedYield: '',
    actualYield: '',
    status: SeasonStatus.PLANNED,
    standard: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSeasons()
    fetchPlots()
    fetchCrops()
    fetchSeeds()
  }, [])

  const fetchSeasons = async () => {
    try {
      const response = await api.get('/seasons')
      setSeasons(response.data.data || [])
    } catch (error) {
      console.error('Error fetching seasons:', error)
      setSeasons([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPlots = async () => {
    try {
      const response = await api.get('/plots')
      setPlots(response.data.data || [])
    } catch (error) {
      console.error('Error fetching plots:', error)
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

  const fetchSeeds = async () => {
    try {
      const res = await api.get('/seeds')
      setSeeds(res.data.data || [])
    } catch (e) {
      console.error('Error fetching seeds:', e)
    }
  }

  const filteredSeasons = seasons.filter((season) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      season.name?.toLowerCase().includes(q) ||
      season.crop?.name?.toLowerCase().includes(q) ||
      season.seedVariety?.name?.toLowerCase().includes(q)
    const s = (season.status || '').toUpperCase()
    const matchesStatus = filterStatus === 'all' || s === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusLabel = (s) => labelFor(SeasonStatusLabels, s)
  const getStatusColor = (s) => SSTATUS_COLORS[(s || '').toUpperCase()] || '#6b7280'

  const handleOpenModal = (season = null) => {
    if (season) {
      setEditingSeason(season)
      const pid = season.plotId || season.plot?.id || season.plot?._id
      const cid = season.cropId || season.crop?.id || season.crop?._id
      const svid = season.seedVarietyId || season.seedVariety?.id || season.seedVariety?._id
      setFormData({
        plotId: pid || '',
        cropId: cid || '',
        seedVarietyId: svid || '',
        name: season.name || '',
        startDate: season.startDate ? new Date(season.startDate).toISOString().split('T')[0] : '',
        expectedHarvestDate: season.expectedHarvestDate ? new Date(season.expectedHarvestDate).toISOString().split('T')[0] : '',
        actualHarvestDate: season.actualHarvestDate ? new Date(season.actualHarvestDate).toISOString().split('T')[0] : '',
        expectedYield: season.expectedYield != null ? String(season.expectedYield) : '',
        actualYield: season.actualYield != null ? String(season.actualYield) : '',
        status: season.status || SeasonStatus.PLANNED,
        standard: season.standard || '',
      })
    } else {
      setEditingSeason(null)
      setFormData({
        plotId: '',
        cropId: '',
        seedVarietyId: '',
        name: '',
        startDate: '',
        expectedHarvestDate: '',
        actualHarvestDate: '',
        expectedYield: '',
        actualYield: '',
        status: SeasonStatus.PLANNED,
        standard: '',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSeason(null)
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
        plotId: formData.plotId,
        cropId: formData.cropId || undefined,
        seedVarietyId: formData.seedVarietyId || undefined,
        name: formData.name || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        expectedHarvestDate: formData.expectedHarvestDate ? new Date(formData.expectedHarvestDate).toISOString() : undefined,
        actualHarvestDate: formData.actualHarvestDate ? new Date(formData.actualHarvestDate).toISOString() : undefined,
        expectedYield: formData.expectedYield ? parseFloat(formData.expectedYield) : undefined,
        actualYield: formData.actualYield ? parseFloat(formData.actualYield) : undefined,
        status: formData.status,
        standard: formData.standard || undefined,
      }

      if (editingSeason) {
        await api.put(`/seasons/${editingSeason.id || editingSeason._id}`, submitData)
      } else {
        await api.post('/seasons', submitData)
      }
      handleCloseModal()
      fetchSeasons()
    } catch (err) {
      setError(
        err.response?.data?.message || 
        (editingSeason ? 'Cập nhật mùa vụ thất bại' : 'Tạo mùa vụ thất bại')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (season) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mùa vụ này?`)) {
      return
    }

    try {
      await api.delete(`/seasons/${season.id || season._id}`)
      fetchSeasons()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa mùa vụ thất bại')
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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Quản lý Mùa vụ</h1>
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
          Thêm mùa vụ
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
            placeholder="Tìm kiếm mùa vụ..."
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(SeasonStatusLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Seasons Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredSeasons.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Không có dữ liệu mùa vụ
          </div>
        ) : (
          filteredSeasons.map((season) => (
            <div
              key={season.id || season._id}
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
                  <Calendar size={24} color="#8b5cf6" />
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                    {season.name || season.crop?.name || 'Mùa vụ'}
                  </h3>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(season.status) + '20',
                    color: getStatusColor(season.status),
                  }}
                >
                  {getStatusLabel(season.status)}
                </span>
              </div>

              <div style={{ marginBottom: '15px', fontSize: '14px', color: '#6b7280' }}>
                {season.plot && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Vùng trồng:</strong>{' '}
                    {typeof season.plot === 'object' ? season.plot.name : 'N/A'}
                  </div>
                )}
                {season.seedVariety?.name && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Giống:</strong> {season.seedVariety.name}
                  </div>
                )}
                {season.startDate && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Ngày bắt đầu:</strong>{' '}
                    {new Date(season.startDate).toLocaleDateString('vi-VN')}
                  </div>
                )}
                {season.expectedYield != null && (
                  <div>
                    <strong>Sản lượng dự kiến:</strong> {Number(season.expectedYield).toLocaleString('vi-VN')} kg
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
                  onClick={() => handleOpenModal(season)}
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
                  onClick={() => handleDelete(season)}
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
        Tổng số: {filteredSeasons.length} mùa vụ
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSeason ? 'Chỉnh sửa Mùa vụ' : 'Thêm Mùa vụ Mới'}
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
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Vùng trồng <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="plotId"
                value={formData.plotId}
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
                <option value="">-- Chọn vùng trồng --</option>
                {plots.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Cây trồng
                </label>
                <select
                  name="cropId"
                  value={formData.cropId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Không chọn --</option>
                  {crops.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Giống (Seed)
                </label>
                <select
                  name="seedVarietyId"
                  value={formData.seedVarietyId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Không chọn --</option>
                  {seeds.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name} {s.crop?.name ? `(${s.crop.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Tên mùa vụ
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Vụ Đông Xuân 2024"
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Ngày bắt đầu <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
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
                  Ngày thu hoạch dự kiến
                </label>
                <input
                  type="date"
                  name="expectedHarvestDate"
                  value={formData.expectedHarvestDate}
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
                  Ngày thu hoạch thực tế
                </label>
                <input
                  type="date"
                  name="actualHarvestDate"
                  value={formData.actualHarvestDate}
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
                  Sản lượng dự kiến (kg)
                </label>
                <input
                  type="number"
                  name="expectedYield"
                  value={formData.expectedYield}
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
                  Sản lượng thực tế (kg)
                </label>
                <input
                  type="number"
                  name="actualYield"
                  value={formData.actualYield}
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
                  {Object.entries(SeasonStatusLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Tiêu chuẩn (VietGAP, GlobalGAP, etc.)
              </label>
              <input
                type="text"
                name="standard"
                value={formData.standard}
                onChange={handleInputChange}
                placeholder="VietGAP"
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
              {submitting ? 'Đang xử lý...' : editingSeason ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Seasons

