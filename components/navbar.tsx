"use client"

import { useState } from "react"
import Link from "next/link"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="relative w-1/2 mx-auto px-6 mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-black font-bold text-sm">⚡</span>
              </div>
              <span className="text-white font-semibold text-lg">ChainZap</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#"
                className="text-white/80 hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="#"
                className="text-white/80 hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="#"
                className="text-white/80 hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                Contact
              </Link>
            </div>

            <button className="hidden md:block bg-black hover:bg-black/80 text-white font-semibold px-6 py-2 rounded-full transition-colors duration-300 text-sm">
              Connect Wallet
            </button>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/10">
              <Link href="#" className="block text-white/80 hover:text-white py-2 text-sm">
                Home
              </Link>
              <Link href="#" className="block text-white/80 hover:text-white py-2 text-sm">
                About
              </Link>
              <Link href="#" className="block text-white/80 hover:text-white py-2 text-sm">
                Contact
              </Link>
              <button className="w-full bg-black hover:bg-black/80 text-white font-semibold px-6 py-2 rounded-full transition-colors mt-4 text-sm">
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
