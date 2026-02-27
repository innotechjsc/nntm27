import { useState, useEffect } from 'react'
import api from '../services/api'

const Inventory = () => {
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'summary'

  useEffect(() => {
    fetchInventory()
    fetchSummary()
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory')
      setItems(res.data.data || [])
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const res = await api.get('/inventory/summary')
      setSummary(res.data.data || [])
    } catch (e) {
      setSummary([])
    }
  }

  const statusLabel = (s) => {
    const m = { AVAILABLE: 'Có sẵn', RESERVED: 'Đã đặt', SHIPPED: 'Đã giao', SOLD: 'Đã bán', EXPIRED: 'Hết hạn', DAMAGED: 'Hỏng' }
    return m[s] || s
  }

  if (loading) return <div>Đang tải...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Kho / Bảo quản</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setView('list')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500, backgroundColor: view === 'list' ? '#3b82f6' : '#e5e7eb', color: view === 'list' ? 'white' : '#374151' }}
          >
            Chi tiết
          </button>
          <button
            onClick={() => setView('summary')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500, backgroundColor: view === 'summary' ? '#3b82f6' : '#e5e7eb', color: view === 'summary' ? 'white' : '#374151' }}
          >
            Tổng hợp
          </button>
        </div>
      </div>

      {view === 'summary' ? (
        <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Sản phẩm</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>Có sẵn</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>Đã đặt</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Chưa có tổng hợp tồn kho</td></tr>
              ) : (
                summary.map((s) => (
                  <tr key={s.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{s.productName || s.productId}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right' }}>{Number(s.available || 0).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right' }}>{Number(s.reserved || 0).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right', fontWeight: 500 }}>{Number(s.total || 0).toLocaleString('vi-VN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{ padding: 12, fontSize: 14, color: '#64748b' }}>Tổng hợp theo sản phẩm (chỉ AVAILABLE, RESERVED)</div>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Sản phẩm / Batch</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>Số lượng</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Vị trí</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu kho</td></tr>
              ) : (
                items.map((i) => (
                  <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{i.product?.name || `Batch ${i.processingBatchId || '-'}`}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right' }}>{i.quantity != null ? `${Number(i.quantity).toLocaleString('vi-VN')} ${i.unit || 'kg'}` : '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{i.location || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{statusLabel(i.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>Tổng: {view === 'list' ? items.length : summary.length} {view === 'list' ? 'dòng' : 'sản phẩm'}</div>
    </div>
  )
}

export default Inventory
