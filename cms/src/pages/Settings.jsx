import { useState } from 'react'
import { Settings as SettingsIcon, Save, Bell, Shield, Database } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'NNTM',
    siteDescription: 'Nền tảng Nông nghiệp Thông minh & Số hoá Trang trại',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
  })

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    // TODO: Implement save to API
    alert('Đã lưu cài đặt!')
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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Cài đặt</h1>
        <button
          onClick={handleSave}
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
          <Save size={16} />
          Lưu tất cả
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* General Settings */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '25px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <SettingsIcon size={20} color="#3b82f6" />
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Cài đặt chung</h2>
          </div>

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
                Tên hệ thống
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
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
                Mô tả hệ thống
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label
                htmlFor="maintenanceMode"
                style={{ fontSize: '14px', cursor: 'pointer' }}
              >
                Chế độ bảo trì
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="allowRegistration"
                checked={settings.allowRegistration}
                onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label
                htmlFor="allowRegistration"
                style={{ fontSize: '14px', cursor: 'pointer' }}
              >
                Cho phép đăng ký người dùng mới
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '25px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <Bell size={20} color="#f59e0b" />
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Thông báo</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label
                htmlFor="emailNotifications"
                style={{ fontSize: '14px', cursor: 'pointer' }}
              >
                Thông báo qua Email
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="smsNotifications"
                checked={settings.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label
                htmlFor="smsNotifications"
                style={{ fontSize: '14px', cursor: 'pointer' }}
              >
                Thông báo qua SMS
              </label>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '25px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <Database size={20} color="#10b981" />
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Thông tin hệ thống</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Phiên bản:</span>
              <span style={{ fontWeight: '500' }}>1.0.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Môi trường:</span>
              <span style={{ fontWeight: '500' }}>Development</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Database:</span>
              <span style={{ fontWeight: '500' }}>PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

