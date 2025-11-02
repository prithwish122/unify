"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        const { data, error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: name || undefined,
          callbackURL: "/dashboard",
        })

        if (signUpError) {
          setError(signUpError.message || "Failed to sign up. Please try again.")
          return
        }

        // Successfully signed up and signed in
        onClose()
        router.refresh()
      } else {
        // Sign in
        const { data, error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        })

        if (signInError) {
          setError(signInError.message || "Invalid email or password.")
          return
        }

        // Successfully signed in
        onClose()
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Auth error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
      
      if (result.error) {
        setError(result.error.message || "Google sign-in is not configured. Please use email/password or configure Google OAuth in your .env file.")
        setIsLoading(false)
        return
      }
      
      // The redirect will happen automatically on success
    } catch (err: any) {
      const errorMessage = err?.message || err?.error?.message || "Failed to sign in with Google."
      if (errorMessage.includes("Provider not found") || errorMessage.includes("404")) {
        setError("Google sign-in is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file, or use email/password sign-in.")
      } else {
        setError(errorMessage)
      }
      console.error("Google auth error:", err)
      setIsLoading(false)
    }
  }

  // Check if Google OAuth is configured
  // Since we can't check server-side env vars on client, we'll handle errors gracefully

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Liquid Glass Container */}
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Login Form */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {isSignUp ? "Create Account" : "Welcome Back"}
                    </h2>
                    <p className="text-white/70">
                      {isSignUp ? "Sign up to get started" : "Sign in to continue to your dashboard"}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {/* Name Input (only for sign up) */}
                    {isSignUp && (
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-white/90">
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
                          placeholder="Enter your name"
                        />
                      </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-white/90">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-white/90">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        minLength={8}
                      />
                    </div>

                    {/* Forgot Password (only for sign in) */}
                    {!isSignUp && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm text-white/70 hover:text-white transition-colors duration-200"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      className="w-full px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-xl font-medium transition-all duration-300 hover:bg-white/30 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {isSignUp ? "Signing up..." : "Signing in..."}
                        </>
                      ) : (
                        isSignUp ? "Sign Up" : "Sign In"
                      )}
                    </motion.button>
                  </form>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-white/70">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-1 gap-3">
                    <motion.button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      className="px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </motion.button>
                    <p className="text-xs text-white/40 text-center mt-1">
                      Note: Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable
                    </p>
                  </div>

                  {/* Sign Up/Sign In Toggle */}
                  <div className="text-center">
                    <p className="text-sm text-white/70">
                      {isSignUp ? "Already have an account? " : "Don't have an account? "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp)
                          setError(null)
                          setEmail("")
                          setPassword("")
                          setName("")
                        }}
                        className="text-white hover:underline font-medium"
                      >
                        {isSignUp ? "Sign in" : "Sign up"}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
