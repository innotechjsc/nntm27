import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Users, Tractor, Map, Calendar, CheckSquare, Package, TrendingUp, Sprout, AlertTriangle } from 'lucide-react'

const Dashboard = () => {
  const [alerts, setAlerts] = useState({ overdueTasks: [], harvestSoon: [] })
  const [stats, setStats] = useState({
    users: 0,
    farms: 0,
    plots: 0,
    seasons: 0,
    tasks: 0,
    crops: 0,
    seeds: 0,
    harvests: 0,
    processing: 0,
    inventory: 0,
    orders: 0,
    seedOrders: 0,
  })
  const [growingSeasons, setGrowingSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
    fetchGrowingSeasons()
    fetchAlerts()
  }, [])

  const fetchStats = async () => {
    try {
      const [u, f, p, s, t, c, sd, h, pr, i, o, so] = await Promise.all([
        api.get('/users').catch(() => ({ data: { data: [] } })),
        api.get('/farms').catch(() => ({ data: { data: [] } })),
        api.get('/plots').catch(() => ({ data: { data: [] } })),
        api.get('/seasons').catch(() => ({ data: { data: [] } })),
        api.get('/tasks').catch(() => ({ data: { data: [] } })),
        api.get('/crops').catch(() => ({ data: { data: [] } })),
        api.get('/seeds').catch(() => ({ data: { data: [] } })),
        api.get('/harvests').catch(() => ({ data: { data: [] } })),
        api.get('/processing').catch(() => ({ data: { data: [] } })),
        api.get('/inventory').catch(() => ({ data: { data: [] } })),
        api.get('/orders').catch(() => ({ data: { data: [] } })),
        api.get('/seed-orders').catch(() => ({ data: { data: [] } })),
      ])
      const d = (r) => r.data.data?.length ?? r.data.count ?? 0
      setStats({
        users: d(u), farms: d(f), plots: d(p), seasons: d(s), tasks: d(t), crops: d(c), seeds: d(sd),
        harvests: d(h), processing: d(pr), inventory: d(i), orders: d(o), seedOrders: d(so),
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGrowingSeasons = async () => {
    try {
      const res = await api.get('/seasons', { params: { status: 'GROWING' } })
      const seasons = res.data.data || []
      const withProgress = await Promise.all(
        seasons.slice(0, 5).map(async (season) => {
          try {
            const pr = await api.get(`/seasons/${season.id}/growth-progress`)
            return { ...season, progress: pr.data.data }
          } catch {
            return { ...season, progress: null }
          }
        })
      )
      setGrowingSeasons(withProgress)
    } catch {
      setGrowingSeasons([])
    }
  }

  const fetchAlerts = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const in7Days = new Date(today)
      in7Days.setDate(in7Days.getDate() + 7)
      const [pt, it, gs, hs] = await Promise.all([
        api.get('/tasks', { params: { status: 'PENDING' } }).catch(() => ({ data: { data: [] } })),
        api.get('/tasks', { params: { status: 'IN_PROGRESS' } }).catch(() => ({ data: { data: [] } })),
        api.get('/seasons', { params: { status: 'GROWING' } }).catch(() => ({ data: { data: [] } })),
        api.get('/seasons', { params: { status: 'HARVESTING' } }).catch(() => ({ data: { data: [] } })),
      ])
      const tasks = [...(pt.data?.data || []), ...(it.data?.data || [])]
      const seasons = [...(gs.data?.data || []), ...(hs.data?.data || [])]
      const overdueTasks = tasks.filter((t) => {
        const d = t.scheduledDate ? new Date(t.scheduledDate) : null
        return d && d < today && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
      }).slice(0, 5)
      const harvestSoon = seasons.filter((s) => {
        const d = s.expectedHarvestDate ? new Date(s.expectedHarvestDate) : null
        return d && d >= today && d <= in7Days
      }).slice(0, 5)
      setAlerts({ overdueTasks, harvestSoon })
    } catch {
      setAlerts({ overdueTasks: [], harvestSoon: [] })
    }
  }

  const statCards = [
    { title: 'Người dùng', value: stats.users, icon: Users, color: '#3b82f6', path: '/users' },
    { title: 'Trang trại', value: stats.farms, icon: Tractor, color: '#10b981', path: '/farms' },
    { title: 'Vùng trồng', value: stats.plots, icon: Map, color: '#f59e0b', path: '/plots' },
    { title: 'Mùa vụ', value: stats.seasons, icon: Calendar, color: '#8b5cf6', path: '/seasons' },
    { title: 'Nhiệm vụ', value: stats.tasks, icon: CheckSquare, color: '#ef4444', path: '/tasks' },
    { title: 'Giống cây', value: stats.crops, icon: Package, color: '#06b6d4', path: '/crops' },
    { title: 'Hạt giống', value: stats.seeds, icon: Sprout, color: '#f59e0b', path: '/seeds' },
    { title: 'Thu hoạch', value: stats.harvests, icon: Package, color: '#84cc16', path: '/harvests' },
    { title: 'Chế biến', value: stats.processing, icon: TrendingUp, color: '#a855f7', path: '/processing' },
    { title: 'Kho', value: stats.inventory, icon: Package, color: '#0ea5e9', path: '/inventory' },
    { title: 'Đơn hàng', value: stats.orders, icon: TrendingUp, color: '#ec4899', path: '/orders' },
    { title: 'Đơn hạt giống', value: stats.seedOrders, icon: Sprout, color: '#22c55e', path: '/seed-orders' },
  ]

  if (loading) {
    return <div>Đang tải...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
          Tổng quan Hệ thống
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Quản lý và theo dõi toàn bộ hoạt động nông nghiệp
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.path}
              onClick={() => navigate(card.path)}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: card.color }}>
                    {card.value}
                  </p>
                </div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: card.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color={card.color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cảnh báo */}
      {(alerts.overdueTasks.length > 0 || alerts.harvestSoon.length > 0) && (
        <div style={{ backgroundColor: '#fef3c7', borderRadius: 8, padding: 20, marginBottom: 30, border: '1px solid #f59e0b' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="#d97706" /> Cảnh báo
          </h2>
          {alerts.overdueTasks.length > 0 && (
            <div style={{ marginBottom: alerts.harvestSoon.length > 0 ? 12 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#92400e' }}>Nhiệm vụ quá hạn:</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
                {alerts.overdueTasks.map((t) => (
                  <li key={t.id} style={{ marginBottom: 4 }}>
                    <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/tasks')}>{t.title}</span>
                    {' – '}{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString('vi-VN') : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alerts.harvestSoon.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#92400e' }}>Mùa vụ sắp thu hoạch (7 ngày tới):</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
                {alerts.harvestSoon.map((s) => (
                  <li key={s.id} style={{ marginBottom: 4 }}>
                    <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/seasons')}>{s.name || s.crop?.name || 'Mùa vụ'}</span>
                    {' – '}{s.expectedHarvestDate ? new Date(s.expectedHarvestDate).toLocaleDateString('vi-VN') : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mùa vụ đang phát triển */}
      {growingSeasons.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '30px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px' }}>
            Mùa vụ đang phát triển
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {growingSeasons.map((season) => (
              <div
                key={season.id}
                onClick={() => navigate('/seasons')}
                style={{
                  padding: '14px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '15px' }}>
                    {season.name || season.crop?.name || 'Mùa vụ'} – {season.plot?.farm?.name || ''}
                  </span>
                  {season.progress && (
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                      {season.progress.progressPercent}%
                    </span>
                  )}
                </div>
                {season.progress && season.progress.totalDays > 0 && (
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, season.progress.progressPercent)}%`,
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        borderRadius: '4px',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                )}
                {season.progress?.daysRemaining != null && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#64748b' }}>
                    Còn ~{season.progress.daysRemaining} ngày đến thu hoạch
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px' }}>
          Thao tác nhanh
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/farms')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Quản lý Trang trại
          </button>
          <button
            onClick={() => navigate('/plots')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Quản lý Vùng trồng
          </button>
          <button
            onClick={() => navigate('/seasons')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Quản lý Mùa vụ
          </button>
          <button
            onClick={() => navigate('/tasks')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Quản lý Nhiệm vụ
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
