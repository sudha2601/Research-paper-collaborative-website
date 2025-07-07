import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()
   
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // Check token and redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          navigate('/user')
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('token')
      }
    }
  }, [navigate])

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/login`,
        data
      )
      const token = res.data.token
      localStorage.setItem('token', token)
      toast.success('Login successful!')
      setTimeout(() => {
        navigate('/user')
        reset()
      }, 1500)
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed'
      console.error('Login error:', message)

      if (message === 'User does not exist. Please register first.') {
        toast.warn('User not found. Redirecting to Register...')
        setTimeout(() => {
          navigate('/register')
        }, 2000)
      } else if (message === 'Invalid password') {
        toast.error('Invalid password. Try again.')
      } else {
        toast.error(message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-200 px-4">
      <div className="backdrop-blur-md bg-white/70 border border-white/30 shadow-2xl rounded-3xl w-full max-w-md p-10">
        <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-6">
          Login to easy <span className="text-gray-400 font-normal">re</span>search
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Gmail */}
          <div>
            <label className="block text-sm font-medium text-gray-800">Gmail</label>
            <input
              type="email"
              placeholder="Enter your gmail"
              {...register('gmail', {
                required: 'Gmail is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                  message: 'Must be a valid @gmail.com address',
                },
              })}
              className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${
                errors.gmail ? 'border-red-500 focus:ring-red-400' : 'focus:ring-indigo-400'
              }`}
            />
            {errors.gmail && <p className="text-red-500 text-sm mt-1">{errors.gmail.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 pr-10 ${
                  errors.password ? 'border-red-500 focus:ring-red-400' : 'focus:ring-indigo-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {!showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl transition duration-300 shadow-md cursor-pointer"
          >
            Login
          </button>
        </form>

        {/* Google Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">or continue with</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/google-login`,
                    {
                      token: credentialResponse.credential,
                    }
                  )
                  const token = res.data.token
                  localStorage.setItem('token', token)
                  toast.success('Google login successful!')
                  setTimeout(() => navigate('/user'), 1000)
                } catch (err) {
                  console.error('Google login failed:', err)
                  toast.error('Google login failed')
                }
              }}
              onError={() => {
                toast.error('Google login failed')
              }}
              useOneTap
            />
          </div>
        </div>

        {/* Register Link */}
        <p className="text-sm text-gray-600 mt-4 text-center">
          New here?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Register Now
          </span>
        </p>
      </div>

      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  )
}

export default Login
