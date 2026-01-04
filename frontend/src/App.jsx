import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Components/AuthContext/AuthContext'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import LandingPage from './Components/LandingPage/LandingPageP'
import LoadingScreen from './Components/LoadingScreen/LoadingScreen'
import { GuestRoute } from './Components/ProtectedRoute/ProtectedRoute'
import { ProtectedRoute } from './Components/ProtectedRoute/ProtectedRoute'
import { ProductDetail } from './Components/ProductDetail/ProductDetail'
import { useAuth } from './Components/AuthContext/AuthContext'
import Wishlist from './Components/Wishlist/Wishlist'
import { WishlistProvider } from './Components/WishlistContext/WishlistContext'
// import './App.css'

function App() {


  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/landingpage" element={<LandingPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            {/* GUEST ONLY - Redirect to home if already logged in */}
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
          </Routes>
        </WishlistProvider>
      </AuthProvider>
    </Router>



  )
}

function AuthChecker({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />; // Show spinner while checking auth
  }

  return children;
}

export default App
