import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'

const Dashboard = () => (
  <div className="screen">
    <h2>📊 Приборная панель</h2>
    <div className="grid">
      <div className="card">
        <h3>P0420</h3>
        <p>Катализатор низкая эффективность</p>
        <p>Ремонт ~25 000 ₽</p>
      </div>
      <div className="card">
        <h3>Масло</h3>
        <p>5W-30, замена каждые 10к км</p>
      </div>
    </div>
  </div>
)

const CarInfo = () => (
  <div className="screen">
    <h2>🚗 Мой автомобиль</h2>
    <img src="https://via.placeholder.com/300x200?text=Telegram+2023" alt="Telegram" />
    <div className="car-details">
      <h3>Telegram 2023</h3>
      <p>Пробег: 45 000 км</p>
      <p>Двигатель: 1.6L, 122 л.с.</p>
    </div>
  </div>
)

const Home = () => (
  <div className="screen home">
    <div className="hero">
      <h2>🚗 Мой автомобиль</h2>
      <div className="car-card">
        <img src="https://via.placeholder.com/80?text=🚗" alt="Авто" />
        <div>
          <h3>Telegram 2023</h3>
          <p>45 000 км</p>
        </div>
      </div>
    </div>
    
    <div className="grid">
      <Link to="/dashboard" className="tile">
        <span className="tile-icon">📊</span>
        <span>Приборная панель</span>
      </Link>
      <Link to="/car" className="tile">
        <span className="tile-icon">🚗</span>
        <span>Автомобиль</span>
      </Link>
      <Link to="#" className="tile">
        <span className="tile-icon">🚑</span>
        <span>Помощь на дороге</span>
      </Link>
      <Link to="#" className="tile">
        <span className="tile-icon">🔧</span>
        <span>Услуги</span>
      </Link>
    </div>
  </div>
)

function App() {
  const location = useLocation()
  
  return (
    <div className="app">
      <header>
        <h1>🚗 Юркар</h1>
      </header>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/car" element={<CarInfo />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      
      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          Главная
        </Link>
        <Link to="/car" className={`nav-item ${location.pathname === '/car' ? 'active' : ''}`}>
          Авто
        </Link>
        <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          Дашборд
        </Link>
      </nav>
    </div>
  )
}

export default App
