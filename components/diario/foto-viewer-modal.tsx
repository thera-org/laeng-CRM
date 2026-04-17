"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Trash2, X } from "lucide-react"
import { getSignedFotoUrlsAction } from "./actions/diarioActions"
import type { DiarioObrasFoto } from "@/lib/types"

interface FotoViewerModalProps {
  isOpen: boolean
  onClose: () => void
  fotos: DiarioObrasFoto[]
  initialIndex?: number
  canDelete?: boolean
  onDelete?: (foto: DiarioObrasFoto) => Promise<boolean | void> | boolean | void
}

export function FotoViewerModal({
  isOpen,
  onClose,
  fotos,
  initialIndex = 0,
  canDelete = false,
  onDelete,
}: FotoViewerModalProps) {
  const [index, setIndex] = useState(initialIndex)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex, isOpen])

  useEffect(() => {
    if (!isOpen || fotos.length === 0) return
    const paths = fotos.map((f) => f.storage_path)
    const missing = paths.filter((p) => !signedUrls[p])
    if (missing.length === 0) return
    setLoading(true)
    getSignedFotoUrlsAction(missing).then((res) => {
      if (res.ok) setSignedUrls((prev) => ({ ...prev, ...(res.data || {}) }))
      setLoading(false)
    })
  }, [isOpen, fotos])

  if (fotos.length === 0) return null
  const current = fotos[Math.min(index, fotos.length - 1)]
  const url = current ? signedUrls[current.storage_path] : null

  const goPrev = () => setIndex((i) => (i - 1 + fotos.length) % fotos.length)
  const goNext = () => setIndex((i) => (i + 1) % fotos.length)

  const handleDelete = async () => {
    if (!onDelete || !current) return
    await onDelete(current)
    if (fotos.length <= 1) onClose()
    else setIndex((i) => Math.min(i, fotos.length - 2))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black p-0 overflow-hidden">
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          {loading || !url ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="max-w-full max-h-full object-contain" />
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            <span>
              {index + 1} / {fotos.length}
            </span>
            {canDelete && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                className="h-7 px-2"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Remover
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
