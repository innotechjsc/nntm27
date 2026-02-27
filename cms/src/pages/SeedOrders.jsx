import { useState, useEffect, Fragment } from 'react'
import api from '../services/api'
import { ShoppingBag, Search, ChevronDown } from 'lucide-react'

const SeedOrderStatusLabels = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đã gửi hàng',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

const SeedOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {}
      const res = await api.get('/seed-orders', { params })
      setOrders(res.data.data || [])
    } catch (e) {
      console.error(e)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId)
    try {
      await api.put(`/seed-orders/${orderId}/status`, { status: newStatus })
      fetchOrders()
      setExpandedId(null)
    } catch (e) {
      alert(e.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !searchTerm ||
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.farmer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.farmer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  if (loading) return <div>Đang tải...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Đơn đặt hạt giống</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Quản lý đơn mua hạt giống của nông dân</p>
      </div>

      <div style={{ display: 'flex', gap: 15, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14, minWidth: 160 }}
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(SeedOrderStatusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Mã đơn</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Nông dân</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>Tổng tiền</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  Chưa có đơn đặt hạt giống
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <Fragment key={o.id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{o.orderNumber || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {o.farmer?.fullName || '-'}
                      {o.farmer?.email && <div style={{ fontSize: 12, color: '#64748b' }}>{o.farmer.email}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right' }}>
                      {o.totalAmount != null ? Number(o.totalAmount).toLocaleString('vi-VN') + ' ₫' : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: o.status === 'CANCELLED' ? '#fee2e2' : o.status === 'DELIVERED' ? '#d1fae5' : '#dbeafe',
                          color: o.status === 'CANCELLED' ? '#dc2626' : o.status === 'DELIVERED' ? '#059669' : '#2563eb',
                        }}
                      >
                        {SeedOrderStatusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <button
                        onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 14 }}
                      >
                        Chi tiết <ChevronDown size={16} style={{ transform: expandedId === o.id ? 'rotate(180deg)' : 'none' }} />
                      </button>
                    </td>
                  </tr>
                  {expandedId === o.id && (
                    <tr key={`${o.id}-detail`} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td colSpan={5} style={{ padding: 16 }}>
                        <div style={{ marginBottom: 12, fontSize: 14 }}>
                          <strong>Địa chỉ giao hàng:</strong> {o.shippingAddress}
                        </div>
                        {o.notes && <div style={{ marginBottom: 12, fontSize: 14 }}><strong>Ghi chú:</strong> {o.notes}</div>}
                        <div style={{ marginBottom: 12, fontSize: 14 }}><strong>Chi tiết sản phẩm:</strong></div>
                        <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 12 }}>
                          {o.items?.map((item, i) => (
                            <li key={i}>
                              {item.seedVariety?.name} (x{item.quantity} {item.seedVariety?.unit || 'kg'}) - {Number(item.totalPrice || 0).toLocaleString('vi-VN')} ₫
                            </li>
                          ))}
                        </ul>
                        {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s) => (
                              s !== o.status && (
                                <button
                                  key={s}
                                  onClick={() => handleUpdateStatus(o.id, s)}
                                  disabled={updatingStatus === o.id}
                                  style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: updatingStatus === o.id ? 'not-allowed' : 'pointer', fontSize: 13 }}
                                >
                                  {SeedOrderStatusLabels[s]}
                                </button>
                              )
                            ))}
                            <button
                              onClick={() => handleUpdateStatus(o.id, 'CANCELLED')}
                              disabled={updatingStatus === o.id}
                              style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: updatingStatus === o.id ? 'not-allowed' : 'pointer', fontSize: 13 }}
                            >
                              Hủy đơn
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>Tổng: {filteredOrders.length} đơn</div>
    </div>
  )
}

export default SeedOrders
