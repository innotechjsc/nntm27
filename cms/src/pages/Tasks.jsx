import { useState, useEffect } from 'react'
import api from '../services/api'
import { CheckSquare, Search, Edit, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { TaskType, TaskTypeLabels, TaskStatus, TaskStatusLabels, labelFor } from '../constants/enums'

const TSTATUS_COLORS = { PENDING: '#6b7280', IN_PROGRESS: '#3b82f6', COMPLETED: '#10b981', CANCELLED: '#ef4444' }

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [plots, setPlots] = useState([])
  const [seasons, setSeasons] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [suggestModalOpen, setSuggestModalOpen] = useState(false)
  const [suggestSeasonId, setSuggestSeasonId] = useState('')
const [suggestions, setSuggestions] = useState([])
const [selectedSuggestions, setSelectedSuggestions] = useState([])
const [suggestLoading, setSuggestLoading] = useState(false)
const [editingTask, setEditingTask] = useState(null)
const [formData, setFormData] = useState({
    plotId: '',
    seasonId: '',
    title: '',
    description: '',
    type: TaskType.WATERING,
    scheduledDate: '',
    status: TaskStatus.PENDING,
    assignedToId: '',
    notes: '',
  })
const [error, setError] = useState('')
const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchPlots()
    fetchSeasons()
    fetchUsers()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks')
      setTasks(response.data.data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
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

  const fetchSeasons = async () => {
    try {
      const res = await api.get('/seasons')
      setSeasons(res.data.data || [])
    } catch (e) {
      console.error('Error fetching seasons:', e)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const s = (task.status || '').toUpperCase().replace('-', '_')
    const matchesStatus = filterStatus === 'all' || s === filterStatus
    return matchesSearch && matchesStatus
  })

  const getTypeLabel = (t) => labelFor(TaskTypeLabels, t)
  const getStatusLabel = (s) => labelFor(TaskStatusLabels, s)
  const getStatusColor = (s) => TSTATUS_COLORS[(s || '').toUpperCase().replace('-', '_')] || '#6b7280'

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task)
      const pid = task.plotId || task.plot?.id || task.plot?._id
      const sid = task.seasonId || task.season?.id || task.season?._id
      const aid = task.assignedToId || task.assignedTo?.id || task.assignedTo?._id
      setFormData({
        plotId: pid || '',
        seasonId: sid || '',
        title: task.title || '',
        description: task.description || '',
        type: task.type || TaskType.WATERING,
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate).toISOString().split('T')[0] : '',
        status: task.status || TaskStatus.PENDING,
        assignedToId: aid || '',
        notes: task.notes || '',
      })
    } else {
      setEditingTask(null)
      setFormData({
        plotId: '',
        seasonId: '',
        title: '',
        description: '',
        type: TaskType.WATERING,
        scheduledDate: '',
        status: TaskStatus.PENDING,
        assignedToId: '',
        notes: '',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
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
        seasonId: formData.seasonId || undefined,
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
        status: formData.status,
        assignedToId: formData.assignedToId || undefined,
        notes: formData.notes || undefined,
      }

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id || editingTask._id}`, submitData)
      } else {
        await api.post('/tasks', submitData)
      }
      handleCloseModal()
      fetchTasks()
    } catch (err) {
      setError(
        err.response?.data?.message || 
        (editingTask ? 'Cập nhật nhiệm vụ thất bại' : 'Tạo nhiệm vụ thất bại')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (task) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhiệm vụ "${task.title}"?`)) {
      return
    }

    try {
      await api.delete(`/tasks/${task.id || task._id}`)
      fetchTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa nhiệm vụ thất bại')
    }
  }

  const handleFetchSuggestions = async () => {
    if (!suggestSeasonId) return
    setSuggestLoading(true)
    try {
      const res = await api.post('/tasks/suggest', { seasonId: suggestSeasonId })
      setSuggestions(res.data.data || [])
      setSelectedSuggestions((res.data.data || []).map((_, i) => i))
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tải gợi ý')
      setSuggestions([])
    } finally {
      setSuggestLoading(false)
    }
  }

  const handleCreateSuggested = async () => {
    const toCreate = suggestions.filter((_, i) => selectedSuggestions.includes(i))
    if (toCreate.length === 0) return
    setSuggestLoading(true)
    try {
      for (const s of toCreate) {
        await api.post('/tasks', {
          plotId: s.plotId,
          seasonId: s.seasonId,
          title: s.title,
          description: s.description,
          type: s.type,
          scheduledDate: s.scheduledDate ? new Date(s.scheduledDate).toISOString() : undefined,
        })
      }
      setSuggestModalOpen(false)
      setSuggestions([])
      fetchTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'Tạo task thất bại')
    } finally {
      setSuggestLoading(false)
    }
  }

  const toggleSuggestion = (i) => {
    setSelectedSuggestions((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Quản lý Nhiệm vụ</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSuggestModalOpen(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
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
            Gợi ý task theo mùa vụ
          </button>
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
            Thêm nhiệm vụ
          </button>
        </div>
      </div>

      {/* Modal gợi ý task */}
      <Modal isOpen={suggestModalOpen} onClose={() => { setSuggestModalOpen(false); setSuggestions([]) }} title="Gợi ý task theo mùa vụ" size="large">
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Chọn mùa vụ</label>
          <select
            value={suggestSeasonId}
            onChange={(e) => setSuggestSeasonId(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
          >
            <option value="">-- Chọn mùa vụ --</option>
            {seasons.filter((s) => s.status === 'GROWING' || s.status === 'PLANTED' || s.status === 'PLANNED').map((s) => (
              <option key={s.id} value={s.id}>{s.name || s.crop?.name || s.id} – {s.plot?.farm?.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleFetchSuggestions}
          disabled={!suggestSeasonId || suggestLoading}
          style={{ padding: '10px 20px', backgroundColor: suggestLoading ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: suggestLoading ? 'not-allowed' : 'pointer', fontSize: 14, marginBottom: 16 }}
        >
          {suggestLoading ? 'Đang tải...' : 'Lấy gợi ý'}
        </button>
        {suggestions.length > 0 && (
          <>
            <div style={{ marginBottom: 12, fontSize: 14, color: '#64748b' }}>Chọn các task muốn tạo (đã chọn {selectedSuggestions.length}/{suggestions.length}):</div>
            <div style={{ maxHeight: 280, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              {suggestions.map((s, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'start', gap: 10, padding: '8px 0', borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedSuggestions.includes(i)} onChange={() => toggleSuggestion(i)} style={{ marginTop: 4 }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{s.scheduledDate} – {getTypeLabel(s.type)}</div>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={handleCreateSuggested}
              disabled={selectedSuggestions.length === 0 || suggestLoading}
              style={{ padding: '10px 20px', backgroundColor: selectedSuggestions.length === 0 || suggestLoading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: selectedSuggestions.length === 0 || suggestLoading ? 'not-allowed' : 'pointer', fontSize: 14 }}
            >
              Tạo {selectedSuggestions.length} task đã chọn
            </button>
          </>
        )}
      </Modal>

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
            placeholder="Tìm kiếm nhiệm vụ..."
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
          {Object.entries(TaskStatusLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Tasks Table */}
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
                Tiêu đề
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Loại
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Vùng trồng
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Ngày thực hiện
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Trạng thái
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  Không có dữ liệu nhiệm vụ
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.id || task._id}
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                    {task.title}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {getTypeLabel(task.type)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {task.plot?.name || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {task.scheduledDate
                      ? new Date(task.scheduledDate).toLocaleDateString('vi-VN')
                      : '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(task.status) + '20',
                        color: getStatusColor(task.status),
                      }}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleOpenModal(task)}
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
                        onClick={() => handleDelete(task)}
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
        Tổng số: {filteredTasks.length} nhiệm vụ
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Chỉnh sửa Nhiệm vụ' : 'Thêm Nhiệm vụ Mới'}
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
                Tiêu đề <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
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
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Mùa vụ
                </label>
                <select
                  name="seasonId"
                  value={formData.seasonId}
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
                  {seasons.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name || `Mùa ${s.plot?.name || s.plotId} ${s.startDate ? new Date(s.startDate).toLocaleDateString('vi-VN') : ''}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Loại nhiệm vụ <span style={{ color: '#ef4444' }}>*</span>
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
                  {Object.entries(TaskTypeLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Ngày thực hiện <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                  {Object.entries(TaskStatusLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Giao cho
                </label>
                <select
                  name="assignedToId"
                  value={formData.assignedToId}
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
                  {users.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
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
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
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
              {submitting ? 'Đang xử lý...' : editingTask ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Tasks

