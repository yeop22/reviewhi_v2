"use client"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#1a1625] border-t border-gray-800/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">© {currentYear} ReviewHi</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/terms" className="text-gray-400 hover:text-purple-300 transition-colors">
              이용약관
            </a>
            <a href="/privacy" className="text-gray-400 hover:text-purple-300 transition-colors">
              개인정보처리방침
            </a>
            <span className="text-gray-400">
              Made with <span className="text-purple-400">ReviewHi</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
} 