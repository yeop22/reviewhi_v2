"use client"

import Link from "next/link"
import { BookOpen, MessageCircle, Menu, X, Sparkles } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-black/30 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16">
        <div className="flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
              ReviewHi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/guide"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors hover:scale-105"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-purple-300" />
                <span>사용가이드</span>
              </div>
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors hover:scale-105"
            >
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-purple-300" />
                <span>문의하기</span>
              </div>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 p-1 rounded-md hover:bg-gray-800/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black/30 backdrop-blur-md">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link
              href="/guide"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-purple-900/20"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-300" />
                <span>사용가이드</span>
              </div>
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-purple-900/20"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-purple-300" />
                <span>문의하기</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
} 