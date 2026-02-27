import { useState, useEffect } from 'react';
import './index.css';
import { cmsUrl } from './config';
import { getPublicPlots, getPublicStats, getFeaturedFarms, getPublicProducts, getRegionsSummary } from './api';

const FLOATING_ICONS = ['🌾', '🌱', '🌿', '🌳', '🌲', '🌴', '🌽', '🌷', '🌹', '🌺', '🌻', '🌼', '🌸', '🍃'];

const FEATURES = [
  { icon: '🗺️', title: 'Quản lý Khu vực & Trang trại', desc: 'Quản lý phân cấp từ Tỉnh → Huyện → Xã → Trang trại → Vùng trồng. Vẽ bản đồ lô đất chính xác với GeoJSON Polygon.' },
  { icon: '📅', title: 'Quản lý Mùa vụ & Giống cây', desc: 'Theo dõi toàn bộ vòng đời mùa vụ từ gieo trồng đến thu hoạch. Danh mục giống cây với thông tin kỹ thuật chi tiết.' },
  { icon: '✅', title: 'Nhiệm vụ & Nhật ký Canh tác', desc: 'Tạo và quản lý nhiệm vụ canh tác (tưới, bón phân, phun thuốc...). Nhật ký điện tử chuẩn truy xuất nguồn gốc.' },
  { icon: '🌐', title: 'IoT & Cảm biến Thông minh', desc: 'Tích hợp cảm biến môi trường. Cảnh báo tự động và gợi ý tưới, bón phân tối ưu.' },
  { icon: '🔗', title: 'Blockchain & NFT', desc: 'Số hoá lô trang trại thành NFT để gọi vốn minh bạch.' },
  { icon: '📱', title: 'Truy xuất Nguồn gốc', desc: 'Mỗi sản phẩm có mã QR truy xuất đầy đủ thông tin.' },
  { icon: '🤖', title: 'AI Dự báo & Phân tích', desc: 'Dự báo năng suất, cảnh báo sâu bệnh sớm.' },
  { icon: '👥', title: 'Đa Vai trò Người dùng', desc: 'Hệ thống hỗ trợ Nông dân, Nhà đầu tư, Doanh nghiệp phân phối, Quản trị viên.' },
  { icon: '💳', title: 'Thanh toán & Tài chính', desc: 'Hệ thống thanh toán tích hợp, quản lý dòng tiền minh bạch.' },
];

const BENEFITS = [
  { icon: '🌾', title: 'Cho Nông dân', desc: 'Quản lý dễ dàng, minh bạch dữ liệu, tiếp cận vốn, giảm phụ thuộc thương lái' },
  { icon: '💰', title: 'Cho Nhà đầu tư', desc: 'Đầu tư gắn với tài sản thật, theo dõi trực tiếp tiến độ' },
  { icon: '🏪', title: 'Cho Thị trường', desc: 'Truy xuất nguồn gốc rõ ràng, tăng giá trị nông sản' },
  { icon: '📊', title: 'Hiệu quả Cao', desc: 'Tối ưu quy trình, giảm chi phí, tăng năng suất' },
];

const PROCESS_STEPS = [
  { icon: '🏗️', title: 'Khởi tạo & Thiết lập', desc: 'Tạo hồ sơ trang trại, vẽ bản đồ chính xác.', points: ['Quản lý phân cấp địa lý', 'Bản đồ vệ tinh chính xác', 'Tính toán diện tích tự động'] },
  { icon: '📅', title: 'Lập kế hoạch Mùa vụ', desc: 'Chọn giống cây phù hợp, thiết lập lịch canh tác.', points: ['Danh mục giống cây đa dạng', 'Lịch canh tác thông minh', 'Dự báo năng suất'] },
  { icon: '🌱', title: 'Canh tác Thông minh', desc: 'IoT giám sát 24/7, cảnh báo tự động.', points: ['Cảm biến IoT real-time', 'Nhật ký điện tử đầy đủ', 'AI gợi ý canh tác'] },
  { icon: '🌾', title: 'Thu hoạch & Số hóa', desc: 'Đánh dấu thu hoạch, gắn QR truy xuất.', points: ['Ghi nhận thu hoạch chi tiết', 'QR code truy xuất', 'Chứng nhận chất lượng'] },
  { icon: '🔗', title: 'Phát hành NFT', desc: 'Tạo NFT đại diện quyền sở hữu.', points: ['NFT gắn với tài sản thật', 'Marketplace minh bạch', 'Smart contract tự động'] },
  { icon: '💰', title: 'Phân phối & Lợi nhuận', desc: 'Nhà đầu tư nhận sản phẩm hoặc bán lại.', points: ['Phân phối tự động', 'Thanh toán minh bạch', 'Tái đầu tư dễ dàng'] },
];

const ABOUT_TABS = [
  { id: 'core', label: '💡 Ý tưởng Cốt lõi', content: 'core' },
  { id: 'roles', label: '👥 Đối tượng & Vai trò', content: 'roles' },
  { id: 'value', label: '⭐ Giá trị Cốt lõi', content: 'value' },
  { id: 'workflow', label: '🔄 Quy trình Nghiệp vụ', content: 'workflow' },
];

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [aboutTab, setAboutTab] = useState('core');
  const [plots, setPlots] = useState([]);
  const [stats, setStats] = useState({});
  const [featuredFarms, setFeaturedFarms] = useState([]);
  const [products, setProducts] = useState([]);
  const [regionsSummary, setRegionsSummary] = useState({ provincesCount: 0, provinces: [] });
  const [plotsError, setPlotsError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [plotsLoading, setPlotsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#about', label: 'Giới thiệu' },
    { href: '#features', label: 'Tính năng' },
    { href: '#benefits', label: 'Lợi ích' },
    { href: '#plots', label: 'Vùng trồng' },
    { href: '#stats', label: 'Thống kê' },
    { href: '#process', label: 'Quy trình' },
    { href: '#contact', label: 'Liên hệ' },
  ];

  const handleNavClick = () => setMobileMenuOpen(false);

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    setPlotsLoading(true);
    getPublicPlots(6).then((d) => { setPlots(d); setPlotsError(null); }).catch((e) => { setPlotsError(e?.message || String(e)); setPlots([]); }).finally(() => setPlotsLoading(false));
    setStatsLoading(true);
    getPublicStats().then((d) => { setStats(d); setStatsError(null); }).catch((e) => { setStatsError(e?.message || String(e)); setStats({}); }).finally(() => setStatsLoading(false));
    getFeaturedFarms(6).then(setFeaturedFarms).catch(() => setFeaturedFarms([]));
    getPublicProducts(8).then(setProducts).catch(() => setProducts([]));
    getRegionsSummary().then(setRegionsSummary).catch(() => setRegionsSummary({ provincesCount: 0, provinces: [] }));
  }, []);

  const formatRevenue = (v) => {
    if (!v && v !== 0) return '0';
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
    return Number(v).toLocaleString('vi-VN');
  };

  const viewOnMap = (lat, lng, name) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/95'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-emerald-600">NNTM</h1>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-gray-700 hover:text-emerald-600 text-sm font-medium">{l.label}</a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <a href={`${cmsUrl}/login`} className="hidden sm:inline btn-primary py-2 px-4 text-sm">Đăng nhập</a>
              <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100" aria-label="Menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}</svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-t shadow-lg py-4">
            <div className="flex flex-col px-4">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={handleNavClick} className="py-3 text-gray-700 hover:text-emerald-600 font-medium border-b border-gray-100 last:border-0">{l.label}</a>
              ))}
              <a href={`${cmsUrl}/login`} onClick={handleNavClick} className="mt-4 btn-primary py-3 text-center">Đăng nhập</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {FLOATING_ICONS.map((icon, i) => (
            <span key={i} className="absolute text-3xl opacity-20 animate-pulse" style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 5) * 18}%` }}>{icon}</span>
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Nền tảng Nông nghiệp <span className="text-emerald-600">Thông minh</span> & Số hoá Trang trại
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Quản lý toàn bộ vòng đời sản xuất nông nghiệp từ khu vực, trang trại, lô đất đến giống, chăm sóc, thu hoạch và bán hàng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`${cmsUrl}/login`} className="btn-primary text-lg">Bắt đầu ngay</a>
            <a href="#features" className="btn-secondary text-lg">Tìm hiểu thêm</a>
          </div>
        </div>
      </section>

      {/* About / Về NNTM */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Về NNTM</h2>
          <p className="text-center text-gray-600 mb-8">Nền tảng Nông nghiệp Thông minh & Số hoá Trang trại</p>
          <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-gray-200 pb-4">
            {ABOUT_TABS.map((t) => (
              <button key={t.id} onClick={() => setAboutTab(t.id)} className={`px-4 py-2 rounded-t-lg font-medium ${aboutTab === t.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-emerald-50'}`}>{t.label}</button>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {aboutTab === 'core' && (
              <div>
                <h3 className="text-xl font-bold mb-4">💡 Ý tưởng Cốt lõi</h3>
                <p className="text-gray-600 mb-6">NNTM là nền tảng quản lý toàn bộ vòng đời sản xuất nông nghiệp, kết hợp công nghệ IoT, AI và Blockchain.</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <h4 className="font-semibold mb-2">🔄 Quản lý Vòng đời</h4>
                    <ul className="text-sm text-gray-600"><li>Khu vực → Trang trại → Lô đất</li><li>Giống → Chăm sóc → Thu hoạch</li></ul>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <h4 className="font-semibold mb-2">🌐 IoT & AI</h4>
                    <ul className="text-sm text-gray-600"><li>Cảm biến môi trường real-time</li><li>Gợi ý tưới, bón phân tối ưu</li></ul>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <h4 className="font-semibold mb-2">🔗 Blockchain</h4>
                    <ul className="text-sm text-gray-600"><li>Số hoá lô trang trại</li><li>Truy xuất nguồn gốc</li></ul>
                  </div>
                </div>
              </div>
            )}
            {aboutTab === 'roles' && (
              <div>
                <h3 className="text-xl font-bold mb-4">👥 Đối tượng & Vai trò</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[{ icon: '🌾', title: 'Nông hộ / Trang trại', desc: 'Quản lý vườn, giống, lịch chăm sóc' }, { icon: '💰', title: 'Nhà đầu tư', desc: 'Mua NFT lô trang trại, nhận suất chia' }, { icon: '🏪', title: 'Doanh nghiệp Phân phối', desc: 'Đặt mua lô hàng, truy xuất nguồn gốc' }, { icon: '🛒', title: 'Người tiêu dùng', desc: 'Mua sản phẩm gắn QR truy xuất' }, { icon: '⚙️', title: 'Quản trị Hệ thống', desc: 'Duyệt trang trại, cấu hình tiêu chuẩn' }].map((r, i) => (
                    <div key={i} className="p-4 border rounded-xl">
                      <div className="text-2xl mb-2">{r.icon}</div>
                      <h4 className="font-semibold">{r.title}</h4>
                      <p className="text-sm text-gray-600">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {aboutTab === 'value' && (
              <div>
                <h3 className="text-xl font-bold mb-4">⭐ Giá trị Cốt lõi</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {BENEFITS.map((b, i) => (
                    <div key={i} className="p-4 bg-emerald-50 rounded-xl">
                      <h4 className="font-semibold">{b.icon} {b.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {aboutTab === 'workflow' && (
              <div>
                <h3 className="text-xl font-bold mb-4">🔄 Quy trình Nghiệp vụ</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">🌱 Vòng đời Sản xuất</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Thiết lập Trang trại & Bản đồ</li>
                      <li>Thiết lập Mùa vụ & Giống</li>
                      <li>Nhật ký & Sensor</li>
                      <li>Thu hoạch & Đóng gói</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🔗 Vòng đời NFT & Đầu tư</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Tạo NFT Lô Trang trại</li>
                      <li>Mint NFT</li>
                      <li>Bán NFT cho Nhà đầu tư</li>
                      <li>Theo dõi & Cập nhật</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Chức năng Nổi bật</h2>
          <p className="text-center text-gray-600 mb-12">Hệ thống quản lý nông nghiệp toàn diện với công nghệ tiên tiến</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-emerald-500 transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Giá trị Mang lại</h2>
          <p className="text-center text-gray-600 mb-12">Lợi ích thiết thực cho từng đối tượng người dùng</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow text-center">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Plots - from API */}
      <section id="plots" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Vùng trồng Đang hoạt động</h2>
          <p className="text-center text-gray-600 mb-12">Theo dõi trực tiếp các vùng trồng</p>
          {plotsError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Tải vùng trồng thất bại:</strong> {plotsError}
            </div>
          )}
          {plotsLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-gray-200 rounded" />
                    <div className="h-16 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!plotsLoading && !plotsError && plots.length === 0 && (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
              Chưa có dữ liệu vùng trồng. Vui lòng thử lại sau.
            </div>
          )}
          {!plotsLoading && !plotsError && plots.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map((plot) => (
              <div key={plot.id} className="bg-white border rounded-xl p-6 shadow hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{plot.name}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">LIVE</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{plot.description || plot.cropType}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">💧 Độ ẩm</div>
                    <div className="text-lg font-bold text-emerald-600">{plot.humidity || 70}%</div>
                    <div className="h-1.5 bg-gray-200 rounded mt-1"><div className="h-full bg-emerald-500 rounded" style={{ width: `${plot.humidity || 70}%` }} /></div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">🌱 Phát triển</div>
                    <div className="text-lg font-bold text-emerald-600">{plot.growth || 80}%</div>
                    <div className="h-1.5 bg-gray-200 rounded mt-1"><div className="h-full bg-emerald-500 rounded" style={{ width: `${plot.growth || 80}%` }} /></div>
                  </div>
                </div>
                {plot.farm?.latitude && (
                  <button onClick={() => viewOnMap(plot.farm.latitude, plot.farm.longitude, plot.name)} className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
                    🗺️ Xem trên Google Maps
                  </button>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Featured Farms */}
      {featuredFarms.length > 0 && (
        <section id="farms" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Trang trại Nổi bật</h2>
            <p className="text-center text-gray-600 mb-12">Các trang trại đang hoạt động trên nền tảng</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFarms.map((farm) => (
                <div key={farm.id} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{farm.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{farm.address}</p>
                  {farm.region?.name && <p className="text-gray-500 text-xs mb-3">{farm.region.name}</p>}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">{farm.plotsCount} lô</span>
                    {farm.totalArea > 0 && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{(farm.totalArea / 1000).toFixed(1)} ha</span>}
                    {(farm.certification || []).slice(0, 2).map((c, i) => <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">{c}</span>)}
                  </div>
                  {farm.latitude != null && (
                    <button onClick={() => viewOnMap(farm.latitude, farm.longitude, farm.name)} className="w-full py-2 border border-emerald-600 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50">
                      🗺️ Xem bản đồ
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section id="products" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Sản phẩm từ Vườn</h2>
            <p className="text-center text-gray-600 mb-12">Nông sản chất lượng từ các trang trại liên kết</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-gray-50 rounded-xl p-6 shadow hover:shadow-lg transition-all">
                  <div className="text-4xl mb-3">🌾</div>
                  <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                  {p.description && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{p.description}</p>}
                  <div className="text-lg font-bold text-emerald-600 mb-2">{Number(p.price).toLocaleString('vi-VN')} ₫/{p.unit}</div>
                  {(p.certifications || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(p.certifications || []).slice(0, 2).map((c, i) => <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">{c}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regions coverage */}
      {regionsSummary.provincesCount > 0 && (
        <section className="py-12 bg-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Phủ sóng {regionsSummary.provincesCount} tỉnh thành</h2>
            <p className="text-gray-600 text-sm mb-4">NNTM đang đồng hành cùng trang trại tại các khu vực</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(regionsSummary.provinces || []).map((prov) => (
                <span key={prov.id} className="px-3 py-1.5 bg-white rounded-full text-sm text-gray-700 shadow-sm">{prov.name}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats & History */}
      <section id="stats" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Thống kê & Lịch sử</h2>
          {statsError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Tải thống kê thất bại:</strong> {statsError}
            </div>
          )}
          {statsLoading && (
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow text-center animate-pulse">
                  <div className="h-10 bg-gray-200 rounded w-12 mx-auto mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto mt-2" />
                </div>
              ))}
            </div>
          )}
          {!statsLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-12">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-3xl mb-2">🏡</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.farmsCount ?? 0}</div>
              <div className="text-gray-600 text-sm">Trang trại</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-3xl mb-2">🌾</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.plotsCount ?? 0}</div>
              <div className="text-gray-600 text-sm">Vùng trồng</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.activeSeasonsCount ?? 0}</div>
              <div className="text-gray-600 text-sm">Mùa vụ đang canh tác</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-3xl mb-2">📦</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.productsCount ?? 0}</div>
              <div className="text-gray-600 text-sm">Sản phẩm</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-3xl mb-2">🌿</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.harvestsCount ?? 0}</div>
              <div className="text-gray-600 text-sm">Đợt thu hoạch</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-3xl mb-2">🔗</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.ordersCount ?? 0}</div>
              <div className="text-gray-600 text-sm">Đơn hàng</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-emerald-600">{formatRevenue(stats.totalRevenue)}</div>
              <div className="text-gray-600 text-sm">Doanh số (VNĐ)</div>
            </div>
          </div>
          )}
          <h3 className="text-xl font-semibold mb-4">Lịch sử Thu hoạch</h3>
          {statsLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!statsLoading && (stats.harvestHistory || []).length === 0 && (
            <div className="py-8 text-center text-gray-500 bg-white rounded-xl shadow">
              Chưa có lịch sử thu hoạch.
            </div>
          )}
          {!statsLoading && (stats.harvestHistory || []).length > 0 && (
          <div className="space-y-4">
            {(stats.harvestHistory || []).map((h, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl">🌾</div>
                <div>
                  <div className="text-sm text-gray-500">{h.date ? new Date(h.date).toLocaleDateString('vi-VN') : ''}</div>
                  <h4 className="font-semibold">{h.title}</h4>
                  <p className="text-gray-600 text-sm">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Process - Hành trình Số hóa */}
      <section id="process" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Hành trình Số hóa Nông nghiệp</h2>
          <p className="text-center text-gray-600 mb-12">6 bước đơn giản để biến trang trại thành tài sản số có giá trị</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROCESS_STEPS.map((s, i) => (
              <div key={i} className="bg-white border rounded-2xl p-6 shadow hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold">{i + 1}</div>
                  <span className="text-3xl">{s.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{s.desc}</p>
                <ul className="space-y-1">
                  {s.points.map((p, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Bắt đầu Hành trình Nông nghiệp Thông minh</h2>
          <p className="text-xl text-emerald-100 mb-8">Tham gia cùng hàng ngàn nông dân và nhà đầu tư đã tin tưởng NNTM</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`${cmsUrl}/login`} className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100">Vào quản lý</a>
            <a href={`${cmsUrl}/login`} className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10">Đăng nhập</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">NNTM</h3>
              <p className="text-sm">Nền tảng nông nghiệp thông minh – từ trang trại, mùa vụ, chăm sóc đến thu hoạch, bảo quản, bán hàng</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Tính năng</a></li>
                <li><a href="#benefits" className="hover:text-white">Lợi ích</a></li>
                <li><a href="#plots" className="hover:text-white">Vùng trồng</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white">Về chúng tôi</a></li>
                <li><a href="#process" className="hover:text-white">Quy trình</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: contact@nntm.vn</li>
                <li><a href={`${cmsUrl}/login`} className="hover:text-white">CMS Quản trị</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p className="text-amber-200/90 text-xs max-w-2xl mx-auto mb-4">
              * Lưu ý pháp lý: NFT trên nền tảng NNTM đại diện cho quyền lợi mùa vụ/lô canh tác, không đại diện quyền sở hữu đất và không thay thế sổ đỏ.
            </p>
            <p>© 2025 NNTM. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
