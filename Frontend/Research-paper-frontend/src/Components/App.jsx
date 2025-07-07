import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import Register from './Register'
import LayoutWithNavbar from './LayoutWithNavbar'
import User from './User'
import Maingroup from './Maingroup'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <Router>
      <>
        <Routes>
          {/* Public routes without navbar */}
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/group/:groupId" element={<Maingroup />} /> {/* <-- Add this line */}

          {/* Routes with navbar */}
          <Route element={<LayoutWithNavbar />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Add more routes here */}
          </Route>
        </Routes>
        <ToastContainer position="top-center" autoClose={2500} />
      </>
    </Router>
  )
}

export default App
