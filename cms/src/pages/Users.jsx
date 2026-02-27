import { useState, useEffect } from 'react'
import api from '../services/api'
import { Users as UsersIcon, Search, Edit, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { UserRole, UserRoleLabels, labelFor } from '../constants/enums'

const ROLE_COLORS = { FARMER: '#10b981', INVESTOR: '#3b82f6', ADMIN: '#f59e0b', DISTRIBUTOR: '#8b5cf6', PROCESSOR: '#06b6d4' }

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.FARMER,
    isActive: true,
    walletAddress: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Note: API cần có endpoint GET /api/users cho admin
      // Tạm thời dùng endpoint hiện có hoặc tạo mới
      const response = await api.get('/users')
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      // Fallback: hiển thị thông báo
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const r = (user.role || '').toUpperCase()
    const matchesRole = filterRole === 'all' || r === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleLabel = (r) => labelFor(UserRoleLabels, r)
  const getRoleColor = (r) => ROLE_COLORS[(r || '').toUpperCase()] || '#6b7280'

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        role: user.role || UserRole.FARMER,
        isActive: user.isActive !== undefined ? user.isActive : true,
        walletAddress: user.walletAddress || '',
      })
    } else {
      setEditingUser(null)
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: UserRole.FARMER,
        isActive: true,
        walletAddress: '',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setError('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData }
        if (!updateData.password) {
          delete updateData.password
        }
        await api.put(`/users/${editingUser.id || editingUser._id}`, updateData)
      } else {
        // Create user - password is required for new users
        if (!formData.password) {
          setError('Mật khẩu là bắt buộc khi tạo người dùng mới')
          setSubmitting(false)
          return
        }
        await api.post('/auth/register', { ...formData, role: formData.role })
      }
      handleCloseModal()
      fetchUsers()
    } catch (err) {
      setError(
        err.response?.data?.message || 
        (editingUser ? 'Cập nhật người dùng thất bại' : 'Tạo người dùng thất bại')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`)) {
      return
    }

    try {
      await api.delete(`/users/${user.id || user._id}`)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa người dùng thất bại')
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
          Quản lý Người dùng
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
          Thêm người dùng
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
            placeholder="Tìm kiếm theo tên hoặc email..."
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
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="all">Tất cả vai trò</option>
          {Object.entries(UserRoleLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
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
                Email
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Vai trò
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Trạng thái
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Ngày tạo
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  Không có dữ liệu người dùng
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id || user._id}
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {user.fullName}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getRoleColor(user.role) + '20',
                        color: getRoleColor(user.role),
                      }}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: user.isActive ? '#10b98120' : '#ef444420',
                        color: user.isActive ? '#10b981' : '#ef4444',
                      }}
                    >
                      {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                      : '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleOpenModal(user)}
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
                        onClick={() => handleDelete(user)}
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
        Tổng số: {filteredUsers.length} người dùng
      </div>

      {/* Modal for Add/Edit User */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng Mới'}
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
                Họ và tên <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
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
                Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={!!editingUser}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: editingUser ? '#f3f4f6' : 'white',
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
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
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
                Mật khẩu {!editingUser && <span style={{ color: '#ef4444' }}>*</span>}
                {editingUser && <span style={{ fontSize: '12px', color: '#6b7280' }}> (Để trống nếu không đổi)</span>}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser}
                minLength={6}
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
                Vai trò <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="role"
                value={formData.role}
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
                {Object.entries(UserRoleLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
              </select>
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
                Địa chỉ ví (Wallet Address)
              </label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                placeholder="0x..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label
                htmlFor="isActive"
                style={{ fontSize: '14px', cursor: 'pointer' }}
              >
                Kích hoạt tài khoản
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
              {submitting ? 'Đang xử lý...' : editingUser ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users

