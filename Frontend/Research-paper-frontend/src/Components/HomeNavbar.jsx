import { Link } from 'react-router-dom'

function HomeNavbar() {
  return (
    <nav className="w-full bg-transparent absolute top-0 left-0 px-6 py-4 flex justify-between items-center z-50">
      <div className="text-2xl font-bold text-blue-700">
        easy
        <span className="font-normal text-gray-400 ml-1">re</span>
        <span>search</span>
      </div>
      <Link
        to="/login"
        className="text-blue-600 font-medium border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition duration-300"
      >
        Login
      </Link>
    </nav>
  )
}

export default HomeNavbar
