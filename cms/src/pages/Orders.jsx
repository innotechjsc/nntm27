import { useState, useEffect, Fragment } from 'react'
import api from '../services/api'
import { ChevronDown } from 'lucide-react'

const OrderStatusLabels = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đã gửi hàng',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Hoàn tiền',
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {}
      const res = await api.get('/orders', { params })
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
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      fetchOrders()
      setExpandedId(null)
    } catch (e) {
      alert(e.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const statusLabel = (s) => OrderStatusLabels[s] || s

  if (loading) return <div>Đang tải...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Đơn hàng / Bán hàng</h1>
      </div>
      <div style={{ marginBottom: 16 }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14, minWidth: 180 }}
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(OrderStatusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Mã đơn</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Khách hàng</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>Tổng tiền</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Chưa có đơn hàng</td></tr>
            ) : (
              orders.map((o) => (
                <Fragment key={o.id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{o.orderNumber || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{o.customerName || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right' }}>
                      {o.totalAmount != null ? Number(o.totalAmount).toLocaleString('vi-VN') + ' ₫' : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, backgroundColor: o.status === 'CANCELLED' ? '#fee2e2' : o.status === 'DELIVERED' ? '#d1fae5' : '#dbeafe', color: o.status === 'CANCELLED' ? '#dc2626' : o.status === 'DELIVERED' ? '#059669' : '#2563eb' }}>
                        {statusLabel(o.status)}
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
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td colSpan={5} style={{ padding: 16 }}>
                        <div style={{ marginBottom: 12, fontSize: 14 }}><strong>Địa chỉ giao hàng:</strong> {o.shippingAddress}</div>
                        {o.items?.length > 0 && (
                          <div style={{ marginBottom: 12, fontSize: 14 }}>
                            <strong>Chi tiết sản phẩm:</strong>
                            <ul style={{ margin: '8px 0 0 20px' }}>
                              {o.items.map((item) => (
                                <li key={item.id}>{item.product?.name} (x{item.quantity}) – {Number(item.totalPrice || 0).toLocaleString('vi-VN')} ₫</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s) => s !== o.status && (
                              <button key={s} onClick={() => handleUpdateStatus(o.id, s)} disabled={updatingStatus === o.id} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: updatingStatus === o.id ? 'not-allowed' : 'pointer', fontSize: 13 }}>
                                {statusLabel(s)}
                              </button>
                            ))}
                            <button onClick={() => handleUpdateStatus(o.id, 'CANCELLED')} disabled={updatingStatus === o.id} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: updatingStatus === o.id ? 'not-allowed' : 'pointer', fontSize: 13 }}>
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
      <div style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>Tổng: {orders.length} đơn</div>
    </div>
  )
}

export default Orders
