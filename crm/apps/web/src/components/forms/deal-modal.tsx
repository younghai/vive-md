"use client"

import { DealForm } from "@/components/forms/deal-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DealModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DealModal({ isOpen, onClose }: DealModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>딜 추가</DialogTitle>
          <DialogDescription>
            새로운 영업 기회(Deal) 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <DealForm onSuccess={onClose} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
