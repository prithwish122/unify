"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    onClose()
  }

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
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-white/70">Sign in to continue to your dashboard</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      />
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-white/70 hover:text-white transition-colors duration-200"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-xl font-medium transition-all duration-300 hover:bg-white/30 hover:border-white/40"
                    >
                      Sign In
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
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30"
                    >
                      Google
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30"
                    >
                      GitHub
                    </motion.button>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-white/70">
                      Don't have an account?{" "}
                      <button className="text-white hover:underline font-medium">
                        Sign up
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
