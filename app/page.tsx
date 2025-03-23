import { ImageUploader } from "@/components/image-uploader"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
                ReviewHi
              </span>
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-purple-500/20 shadow-lg">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-200">꼼꼼한 마케팅은 리뷰하이와 시작하세요 ✨</span>
            </div>
          </div>
          <ImageUploader />
        </div>
      </main>
      <Footer />
    </div>
  )
}
