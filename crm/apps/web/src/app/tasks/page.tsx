"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { CheckCircle2, Circle, Plus, Clock, CalendarIcon } from "lucide-react"

import { apiClient } from "@/lib/api/client"
import type { Task, ApiResponse } from "@vive-crm/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { TaskModal } from "@/components/forms/task-modal"

export default function TasksPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('open')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        status: filter,
      })
      const response = await apiClient.get<any, ApiResponse<Task[]>>(`/tasks?${params.toString()}`)
      return response
    },
  })

  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.patch(`/tasks/${taskId}/complete`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      toast.success("작업 상태가 업데이트되었습니다.")
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">작업 목록</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 작업 추가
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        <Button 
          variant={filter === 'open' ? 'default' : 'outline'} 
          onClick={() => { setFilter('open'); setPage(1); }}
          size="sm"
        >
          진행중
        </Button>
        <Button 
          variant={filter === 'done' ? 'default' : 'outline'} 
          onClick={() => { setFilter('done'); setPage(1); }}
          size="sm"
        >
          완료됨
        </Button>
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => { setFilter('all'); setPage(1); }}
          size="sm"
        >
          전체
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">로딩 중...</div>
        ) : data?.data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            표시할 작업이 없습니다.
          </div>
        ) : (
          data?.data.map((task) => {
            const isOverdue = task.dueDate && !task.completedAt && new Date(task.dueDate) < new Date()
            
            return (
              <Card key={task.id} className={`transition-all ${task.completedAt ? 'opacity-60 bg-muted/40' : ''}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  <button 
                    onClick={() => toggleTaskMutation.mutate(task.id)}
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    disabled={toggleTaskMutation.isPending}
                  >
                    {task.completedAt ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <div className={`font-medium ${task.completedAt ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded text-white font-medium ${
                        task.priority === 'HIGH' ? 'bg-red-500' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {format(new Date(task.dueDate), 'yyyy-MM-dd HH:mm')}
                          {isOverdue && ' (기한 지연)'}
                        </span>
                      )}
                      
                      {task.note && (
                        <span className="text-muted-foreground truncate max-w-md">
                          • {task.note}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <div className="text-sm text-muted-foreground">
            {page} / {data.pagination.totalPages} 페이지
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page === data.pagination.totalPages}
          >
            다음
          </Button>
        </div>
      )}

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
