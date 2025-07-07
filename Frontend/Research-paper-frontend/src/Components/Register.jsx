import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function Register() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('http://localhost:5000/api/register', data)
      const token = res.data.token
      localStorage.setItem('token', token)
      toast.success('Registered successfully!')
      navigate('/user')
      reset()
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      if (message === 'User already exists') {
        toast.warn('User already exists. Redirecting to login...')
        setTimeout(() => navigate('/login'), 2500)
      } else {
        toast.error(message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-200 px-4">
      <div className="backdrop-blur-md bg-white/70 border border-white/30 shadow-2xl rounded-3xl w-full max-w-md p-10">
        <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-6">
          Register on easy <span className="text-gray-400 font-normal">re</span>search
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              {...register('name', { required: 'Name is required' })}
              className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-400' : 'focus:ring-indigo-400'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

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
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl transition duration-300 shadow-md cursor-pointer"
          >
            Register
          </button>
        </form>

        {/* Google Sign In */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">or continue with</p>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const res = await axios.post('http://localhost:5000/api/google-login', {
                  token: credentialResponse.credential,
                })
                const token = res.data.token
                localStorage.setItem('token', token)
                toast.success('Logged in with Google!')
                navigate('/user')
              } catch (err) {
                toast.error('Google login failed.')
              }
            }}
            onError={() => toast.error('Google login failed')}
            useOneTap
          />
        </div>
      </div>
    </div>
  )
}

export default Register
