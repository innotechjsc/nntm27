import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Tractor, 
  Map, 
  Settings, 
  LogOut,
  Menu,
  X,
  MapPin,
  Calendar,
  CheckSquare,
  Package,
  LayoutDashboard,
  Scissors,
  Warehouse,
  ShoppingCart,
  Sprout
} from 'lucide-react'
import { useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/users', label: 'Người dùng', icon: Users },
    { path: '/regions', label: 'Khu vực', icon: MapPin },
    { path: '/farms', label: 'Trang trại', icon: Tractor },
    { path: '/plots', label: 'Vùng trồng', icon: Map },
    { path: '/seasons', label: 'Mùa vụ', icon: Calendar },
    { path: '/tasks', label: 'Nhiệm vụ', icon: CheckSquare },
    { path: '/crops', label: 'Giống cây', icon: Package },
    { path: '/seeds', label: 'Hạt giống', icon: Package },
    { path: '/harvests', label: 'Thu hoạch', icon: Package },
    { path: '/processing', label: 'Chế biến', icon: Scissors },
    { path: '/inventory', label: 'Kho', icon: Warehouse },
    { path: '/orders', label: 'Đơn hàng', icon: ShoppingCart },
    { path: '/seed-orders', label: 'Đơn hạt giống', icon: Sprout },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '250px' : '0',
          backgroundColor: '#1e293b',
          color: 'white',
          transition: 'width 0.3s',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {sidebarOpen && (
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
              NNTM CMS
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <nav style={{ flex: 1, padding: '20px 0' }}>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: isActive ? '#334155' : 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.target.style.background = '#334155'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.target.style.background = 'transparent'
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            <div
              style={{
                padding: '20px',
                borderTop: '1px solid #334155',
              }}
            >
              <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                <div style={{ fontWeight: 'bold' }}>{user?.fullName}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#dc2626',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                }}
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div style={{ padding: '30px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout

