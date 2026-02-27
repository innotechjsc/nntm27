import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, CheckCircle } from 'lucide-react'
import Modal from '../components/Modal'

const Processing = () => {
  const [batches, setBatches] = useState([])
  const [harvests, setHarvests] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [completeBatch, setCompleteBatch] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    harvestId: '',
    startDate: new Date().toISOString().split('T')[0],
    processingType: 'drying',
    inputQuantity: '',
    notes: '',
  })
  const [completeData, setCompleteData] = useState({ outputQuantity: '', wasteQuantity: '', products: [] })

  useEffect(() => {
    fetchBatches()
    fetchHarvests()
    fetchProducts()
  }, [])

  const fetchBatches = async () => {
    try {
      const res = await api.get('/processing')
      setBatches(res.data.data || [])
    } catch (e) {
      console.error(e)
      setBatches([])
    } finally {
      setLoading(false)
    }
  }

  const fetchHarvests = async () => {
    try {
      const res = await api.get('/harvests')
      setHarvests(res.data.data || [])
    } catch (e) {
      setHarvests([])
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.data || [])
    } catch (e) {
      setProducts([])
    }
  }

  const statusLabel = (s) => {
    const m = { PENDING: 'Chờ', IN_PROGRESS: 'Đang xử lý', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' }
    return m[s] || s
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/processing', {
        name: formData.name,
        harvestId: formData.harvestId,
        startDate: formData.startDate,
        processingType: formData.processingType,
        inputQuantity: parseFloat(formData.inputQuantity) || 0,
        notes: formData.notes || undefined,
      })
      setCreateOpen(false)
      setFormData({ name: '', harvestId: '', startDate: new Date().toISOString().split('T')[0], processingType: 'drying', inputQuantity: '', notes: '' })
      fetchBatches()
      fetchHarvests()
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo batch thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const openComplete = (b) => {
    setCompleteBatch(b)
    setCompleteData({
      outputQuantity: b.outputQuantity ?? b.inputQuantity ?? '',
      wasteQuantity: b.wasteQuantity ?? '0',
      products: [],
    })
    setCompleteOpen(true)
    setError('')
  }

  const handleComplete = async (e) => {
    e.preventDefault()
    if (!completeBatch) return
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        outputQuantity: completeData.outputQuantity ? parseFloat(completeData.outputQuantity) : completeBatch.inputQuantity,
        wasteQuantity: completeData.wasteQuantity ? parseFloat(completeData.wasteQuantity) : 0,
      }
      if (completeData.products.filter((p) => p.productId && p.quantity > 0).length > 0) {
        payload.products = completeData.products
          .filter((p) => p.productId && p.quantity > 0)
          .map((p) => ({ productId: p.productId, quantity: parseFloat(p.quantity), unit: p.unit || 'kg', location: p.location }))
      }
      await api.post(`/processing/${completeBatch.id}/complete`, payload)
      setCompleteOpen(false)
      setCompleteBatch(null)
      fetchBatches()
    } catch (err) {
      setError(err.response?.data?.message || 'Hoàn thành batch thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const addProductRow = () => {
    setCompleteData((prev) => ({ ...prev, products: [...prev.products, { productId: '', quantity: '', unit: 'kg', location: '' }] }))
  }

  const updateProductRow = (idx, field, value) => {
    setCompleteData((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    }))
  }

  const removeProductRow = (idx) => {
    setCompleteData((prev) => ({ ...prev, products: prev.products.filter((_, i) => i !== idx) }))
  }

  if (loading) return <div>Đang tải...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Chế biến</h1>
        <button
          onClick={() => { setCreateOpen(true); setError(''); setFormData({ name: '', harvestId: '', startDate: new Date().toISOString().split('T')[0], processingType: 'drying', inputQuantity: '', notes: '' }) }}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} /> Tạo batch chế biến
        </button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Tên batch</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Thu hoạch</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Loại</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>Đầu vào (kg)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>Đầu ra (kg)</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu chế biến</td></tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{b.name || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{b.harvest?.plot?.name} / {b.harvest?.harvestDate ? new Date(b.harvest.harvestDate).toLocaleDateString('vi-VN') : '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{b.processingType || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right' }}>{b.inputQuantity != null ? Number(b.inputQuantity).toLocaleString('vi-VN') : '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right' }}>{b.outputQuantity != null ? Number(b.outputQuantity).toLocaleString('vi-VN') : '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{statusLabel(b.status)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>
                    {b.status === 'IN_PROGRESS' && (
                      <button onClick={() => openComplete(b)} style={{ padding: '6px 12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                        <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Hoàn thành
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>Tổng: {batches.length} batch</div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Tạo batch chế biến" size="large">
        <form onSubmit={handleCreate}>
          {error && <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 4, marginBottom: 16 }}>{error}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Tên batch <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Thu hoạch nguồn <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={formData.harvestId} onChange={(e) => setFormData((p) => ({ ...p, harvestId: e.target.value }))} required style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="">-- Chọn thu hoạch --</option>
                {harvests.map((h) => (
                  <option key={h.id} value={h.id}>{h.plot?.name} – {h.harvestDate ? new Date(h.harvestDate).toLocaleDateString('vi-VN') : ''} ({h.quantity} kg)</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Ngày bắt đầu <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} required style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Loại chế biến</label>
                <select value={formData.processingType} onChange={(e) => setFormData((p) => ({ ...p, processingType: e.target.value }))} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}>
                  <option value="drying">Sấy khô</option>
                  <option value="milling">Xay nghiền</option>
                  <option value="packaging">Đóng gói</option>
                  <option value="cleaning">Làm sạch</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Số lượng đầu vào (kg) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="number" value={formData.inputQuantity} onChange={(e) => setFormData((p) => ({ ...p, inputQuantity: e.target.value }))} required min="0" step="0.01" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Ghi chú</label>
              <textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={2} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={() => setCreateOpen(false)} style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', backgroundColor: submitting ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Đang tạo...' : 'Tạo batch'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={completeOpen} onClose={() => { setCompleteOpen(false); setCompleteBatch(null) }} title="Hoàn thành chế biến" size="large">
        {completeBatch && (
          <form onSubmit={handleComplete}>
            {error && <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 4, marginBottom: 16 }}>{error}</div>}
            <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>Batch: <strong>{completeBatch.name}</strong> – Đầu vào: {completeBatch.inputQuantity} kg</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Số lượng đầu ra (kg)</label>
                  <input type="number" value={completeData.outputQuantity} onChange={(e) => setCompleteData((p) => ({ ...p, outputQuantity: e.target.value }))} min="0" step="0.01" placeholder={completeBatch.inputQuantity} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Phế phẩm (kg)</label>
                  <input type="number" value={completeData.wasteQuantity} onChange={(e) => setCompleteData((p) => ({ ...p, wasteQuantity: e.target.value }))} min="0" step="0.01" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>Tạo tồn kho (tùy chọn)</label>
                  <button type="button" onClick={addProductRow} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>+ Thêm sản phẩm</button>
                </div>
                {completeData.products.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <select value={p.productId} onChange={(e) => updateProductRow(i, 'productId', e.target.value)} style={{ flex: 2, padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
                      <option value="">-- Sản phẩm --</option>
                      {products.map((pr) => (<option key={pr.id} value={pr.id}>{pr.name}</option>))}
                    </select>
                    <input type="number" value={p.quantity} onChange={(e) => updateProductRow(i, 'quantity', e.target.value)} placeholder="Số lượng" min="0" step="0.01" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                    <input type="text" value={p.location} onChange={(e) => updateProductRow(i, 'location', e.target.value)} placeholder="Vị trí kho" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                    <button type="button" onClick={() => removeProductRow(i)} style={{ padding: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" onClick={() => { setCompleteOpen(false); setCompleteBatch(null) }} style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>
              <button type="submit" disabled={submitting} style={{ padding: '10px 20px', backgroundColor: submitting ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none', borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Đang xử lý...' : 'Hoàn thành'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default Processing
