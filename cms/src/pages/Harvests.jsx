import { useState, useEffect } from 'react'
import api from '../services/api'
import { Download } from 'lucide-react'

const Harvests = () => {
  const [harvests, setHarvests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHarvests()
  }, [])

  const fetchHarvests = async () => {
    try {
      const res = await api.get('/harvests')
      setHarvests(res.data.data || [])
    } catch (e) {
      console.error(e)
      setHarvests([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/harvests/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `harvests-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Xuất file thất bại')
    }
  }

  const statusLabel = (s) => {
    const m = { PENDING_PROCESSING: 'Chờ xử lý', PROCESSING: 'Đang xử lý', PROCESSED: 'Đã chế biến', IN_STORAGE: 'Trong kho', DISTRIBUTED: 'Đã phân phối' }
    return m[s] || s
  }

  if (loading) return <div>Đang tải...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Thu hoạch</h1>
        <button onClick={handleExport} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={18} /> Xuất CSV
        </button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Ngày</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Lô / Trang trại</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Số lượng</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {harvests.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu thu hoạch</td></tr>
            ) : (
              harvests.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    {h.harvestDate ? new Date(h.harvestDate).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    {h.plot?.name || '-'} {h.plot?.farm?.name && ` / ${h.plot.farm.name}`}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right' }}>
                    {h.quantity != null ? `${Number(h.quantity).toLocaleString('vi-VN')} ${h.unit || 'kg'}` : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{statusLabel(h.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>Tổng: {harvests.length} bản ghi</div>
    </div>
  )
}

export default Harvests
