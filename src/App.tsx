import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Encryption from '@/pages/Encryption'
import JWTDecoder from '@/pages/JWTDecoder'

function App() {
  return (
    <Router basename="/healthpro-cryptic">
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<Encryption />} />
          <Route path="/jwt" element={<JWTDecoder />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
