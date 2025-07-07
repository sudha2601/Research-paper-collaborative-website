import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
            easy
            <span className="font-normal text-gray-400 ml-1">re</span>
            <span className="ml-0.5 text-blue-600">search</span>
          </Link>

          {/* Navigation Links */}
          <div className="space-x-6 hidden md:flex">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition duration-200">
              Home
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition duration-200">
              Login
            </Link>
            <Link to="/register" className="text-gray-600 hover:text-blue-600 font-medium transition duration-200">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
