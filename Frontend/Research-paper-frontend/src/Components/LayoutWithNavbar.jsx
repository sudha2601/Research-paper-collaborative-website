// components/LayoutWithNavbar.jsx
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

function LayoutWithNavbar() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default LayoutWithNavbar
