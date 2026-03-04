"use client"

import { TaskForm } from "@/components/forms/task-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TaskModal({ isOpen, onClose }: TaskModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>작업 추가</DialogTitle>
          <DialogDescription>
            새로운 할 일(Task)을 등록합니다. 마감 기한을 설정하면 자동으로 알림이 생성됩니다.
          </DialogDescription>
        </DialogHeader>
        <TaskForm onSuccess={onClose} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
