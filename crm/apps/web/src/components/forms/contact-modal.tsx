"use client"

import { ContactForm } from "@/components/forms/contact-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>고객 추가</DialogTitle>
          <DialogDescription>
            새로운 고객 정보를 입력하세요. (AI 스코어가 자동 계산됩니다.)
          </DialogDescription>
        </DialogHeader>
        <ContactForm onSuccess={onClose} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
