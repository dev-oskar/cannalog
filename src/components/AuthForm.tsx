import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'

interface AuthFormData {
  email: string
  password: string
}

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AuthFormData>()

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = isLogin 
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password)

      if (error) {
        setError(error.message)
      } else if (!isLogin) {
        setError('Check your email for the confirmation link!')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    reset()
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1B2951] mb-2">
            CannaLog
          </h1>
          <p className="text-[#8B6F47]">
            Cannabis Consumption Tracker
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex mb-6 bg-[#F5E6D3] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLogin
                ? 'bg-white text-[#1B2951] shadow-sm'
                : 'text-[#8B6F47] hover:text-[#1B2951]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isLogin
                ? 'bg-white text-[#1B2951] shadow-sm'
                : 'text-[#8B6F47] hover:text-[#1B2951]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1B2951] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email format'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1B2951] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A7C59] text-white py-2 px-4 rounded-md hover:bg-[#3d6649] focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-[#4A7C59] hover:text-[#3d6649] text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}