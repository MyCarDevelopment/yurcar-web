import { BrowserRouter } from 'react-router-dom'  // ← HashRouter → BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  // ← HashRouter
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
