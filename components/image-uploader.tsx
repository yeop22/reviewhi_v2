"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { X, Upload, ImageIcon, Copy, Trash2, Link2, CheckCircle2, Image, FileImage, ClipboardCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

interface FileWithPreview extends File {
  preview: string
  id: string
}

// 허용된 파일 형식 정의
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const OUTPUT_EXTENSION = "jpg"

// 짧은 ID 생성 함수 추가
const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8)
}

export function ImageUploader() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 파일 타입 검증
    const validFiles = acceptedFiles.filter(file => {
      const isValid = ALLOWED_FILE_TYPES.includes(file.type)
      if (!isValid) {
        toast({
          title: "❌ 파일 형식 오류",
          description: "JPG, JPEG, PNG 형식의 이미지만 업로드 가능합니다.",
          variant: "destructive",
        })
      }
      return isValid
    })

    const newFiles = validFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: uuidv4(),
      }),
    )
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((rejection) => {
        if (rejection.errors[0]?.code === 'file-too-large') {
          toast({
            title: "❌ 파일 크기 초과",
            description: "파일 크기는 10MB를 초과할 수 없습니다.",
            variant: "destructive",
          })
        }
      })
    },
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  // Storage 버킷 존재 여부 확인 함수
  const checkBucket = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('images')
      if (error) {
        console.error('버킷 확인 에러:', error)
        return false
      }
      console.log('버킷 확인 성공:', data)
      return true
    } catch (error) {
      console.error('버킷 확인 중 에러 발생:', error)
      return false
    }
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "선택된 파일 없음",
        description: "업로드할 이미지를 선택해주세요",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    const urls: string[] = []

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = fileName

        console.log("파일 업로드 시작:", {
          원본파일명: file.name,
          저장파일명: fileName,
          파일크기: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          파일타입: file.type
        })

        const { data, error } = await supabase.storage
          .from("reviewhi")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true
          })

        if (error) {
          console.error("Supabase 업로드 에러:", error)
          throw error
        }

        console.log("업로드 성공:", data)

        const { data: urlData } = supabase.storage
          .from("reviewhi")
          .getPublicUrl(filePath)

        if (!urlData?.publicUrl) {
          throw new Error("파일 URL을 가져오는데 실패했습니다.")
        }

        console.log("공개 URL 생성됨:", urlData.publicUrl)
        urls.push(urlData.publicUrl)
      }

      setUploadedUrls((prev) => [...prev, ...urls])
      setFiles([])
      
      toast({
        title: "✅ 업로드 성공",
        description: `${urls.length}개의 이미지가 성공적으로 업로드되었습니다`,
        variant: "default",
      })

    } catch (error) {
      console.error("업로드 에러:", error)
      toast({
        title: "❌ 업로드 실패",
        description: error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "📋 클립보드에 복사됨",
      description: "링크가 클립보드에 복사되었습니다",
    })
  }

  const copyAllLinks = () => {
    if (uploadedUrls.length === 0) return
    const linksText = uploadedUrls.join(", ")
    navigator.clipboard.writeText(linksText)
    toast({
      title: "📋 모든 링크 복사됨",
      description: "모든 링크가 클립보드에 복사되었습니다",
    })
  }

  const removeLink = (url: string) => {
    setUploadedUrls((prev) => prev.filter((item) => item !== url))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto backdrop-blur-md bg-black/30 border-gray-800 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-light text-white tracking-tight flex items-center gap-2">
          <FileImage className="h-5 w-5 text-purple-400" />
          이미지 업로더
        </CardTitle>
        <CardDescription className="text-gray-300">
          이미지를 드래그하여 업로드하고 링크를 받으세요 ✨
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 transition-colors",
            "flex flex-col items-center justify-center gap-2",
            isDragActive
              ? "border-purple-500 bg-purple-50"
              : "border-gray-800/20 hover:border-purple-500/50",
          )}
        >
          <input {...getInputProps()} accept=".jpg,.jpeg,.png" />
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-10 w-10 text-primary/80" />
            </div>
            {isDragActive ? (
              <p className="text-primary font-medium">🎯 이미지를 여기에 놓으세요...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-300 font-medium">📸 이미지를 여기에 드래그하거나 클릭하여 선택하세요</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-purple-900/20 text-xs px-2 border-purple-800/50 text-purple-200">
                    JPG
                  </Badge>
                  <Badge variant="outline" className="bg-purple-900/20 text-xs px-2 border-purple-800/50 text-purple-200">
                    JPEG
                  </Badge>
                  <Badge variant="outline" className="bg-purple-900/20 text-xs px-2 border-purple-800/50 text-purple-200">
                    PNG
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <Image className="h-4 w-4 text-purple-300" />
                선택된 이미지 ({files.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                모두 지우기
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-800 bg-black/40"
                >
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-full w-full object-cover"
                    onLoad={() => {
                      URL.revokeObjectURL(file.preview)
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="text-white hover:text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-xs text-gray-300 truncate">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadedUrls.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <Link2 className="h-4 w-4 text-purple-300" />
                업로드된 링크 ({uploadedUrls.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAllLinks}
                  className="text-xs border-purple-800/50 bg-purple-900/20 hover:bg-purple-900/40 text-white"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  모든 링크 복사
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedUrls([])}
                  className="text-xs border-red-800/50 bg-red-900/10 hover:bg-red-900/30 text-red-300 hover:text-red-200"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  모두 지우기
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {uploadedUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-gray-800 group hover:border-purple-800/30 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0 h-10 w-10 rounded bg-purple-900/30 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-purple-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 truncate">{url}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-purple-300 hover:bg-purple-900/20"
                            onClick={() => copyToClipboard(url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">링크 복사</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => removeLink(url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">링크 삭제</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-3 pt-2 border-t border-gray-800">
        <Button
          variant="default"
          onClick={uploadFiles}
          disabled={files.length === 0 || uploading}
          className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 text-white"
        >
          {uploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              이미지 업로드
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 