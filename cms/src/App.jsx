import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Regions from './pages/Regions'
import Farms from './pages/Farms'
import Plots from './pages/Plots'
import Seasons from './pages/Seasons'
import Tasks from './pages/Tasks'
import Crops from './pages/Crops'
import Harvests from './pages/Harvests'
import Processing from './pages/Processing'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Seeds from './pages/Seeds'
import SeedOrders from './pages/SeedOrders'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="regions" element={<Regions />} />
            <Route path="farms" element={<Farms />} />
            <Route path="plots" element={<Plots />} />
            <Route path="seasons" element={<Seasons />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="crops" element={<Crops />} />
            <Route path="harvests" element={<Harvests />} />
            <Route path="processing" element={<Processing />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="seeds" element={<Seeds />} />
            <Route path="seed-orders" element={<SeedOrders />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

