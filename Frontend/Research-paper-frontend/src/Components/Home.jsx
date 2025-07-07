import { Link } from 'react-router-dom'
import HomeNavbar from './HomeNavbar'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 relative overflow-hidden">
      <HomeNavbar />

      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h1 className="flex text-5xl md:text-6xl font-bold text-blue-700 ">
          easy
          <span className="font-normal text-gray-400 ml-3">re</span>
          <span className="text-blue-700">search</span>
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-xl">
          Simplify your research collaboration. Invite, highlight, comment, and grow your ideas together.
        </p>

        <Link
          to="/login"
          className="mt-10 px-8 py-3 bg-blue-600 text-white text-lg rounded-full shadow-md hover:bg-blue-700 transition duration-300 font-medium"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}

export default Home
