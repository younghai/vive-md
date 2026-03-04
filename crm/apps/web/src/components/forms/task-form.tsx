"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api/client"
import { Task, Contact, Deal, ApiResponse } from "@vive-crm/shared"

const taskSchema = z.object({
  title: z.string().min(1, "작업 제목을 입력해주세요.").max(200),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
  note: z.string().max(1000).optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormProps {
  initialData?: Task
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaskForm({ initialData, onSuccess, onCancel }: TaskFormProps) {
  const isEditing = !!initialData
  const queryClient = useQueryClient()

  const { data: contactsData } = useQuery({
    queryKey: ['contacts-lite'],
    queryFn: async () => {
      const response = await apiClient.get<any, ApiResponse<Contact[]>>('/contacts?pageSize=100')
      return response.data
    },
  })

  const { data: dealsData } = useQuery({
    queryKey: ['deals-lite'],
    queryFn: async () => {
      const response = await apiClient.get<any, ApiResponse<any>>('/deals/pipeline')
      // Flatten all deals from stages
      const allDeals: Deal[] = []
      Object.values(response.data.stages).forEach((stageDeals: any) => {
        allDeals.push(...stageDeals)
      })
      return allDeals
    },
  })

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || "",
      priority: initialData?.priority || 'MEDIUM',
      dueDate: initialData?.dueDate 
        ? new Date(initialData.dueDate).toISOString().slice(0, 16) 
        : "",
      note: initialData?.note || "",
      contactId: initialData?.contactId || "",
      dealId: initialData?.dealId || "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const payload = {
        ...data,
        contactId: data.contactId || undefined,
        dealId: data.dealId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      }
      
      if (isEditing) {
        return apiClient.patch(`/tasks/${initialData.id}`, payload)
      } else {
        return apiClient.post('/tasks', payload)
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "작업이 수정되었습니다." : "새 작업이 추가되었습니다.")
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "오류가 발생했습니다.")
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>작업 제목 <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="할 일 입력" disabled={mutation.isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>우선순위</FormLabel>
                <Select disabled={mutation.isPending} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="우선순위" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HIGH">높음</SelectItem>
                    <SelectItem value="MEDIUM">보통</SelectItem>
                    <SelectItem value="LOW">낮음</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>마감 기한</FormLabel>
                <FormControl>
                  <Input type="datetime-local" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>연결된 고객</FormLabel>
                <Select disabled={mutation.isPending} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="고객 선택 (선택사항)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">연결 안함</SelectItem>
                    {contactsData?.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dealId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>연결된 딜</FormLabel>
                <Select disabled={mutation.isPending} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="딜 선택 (선택사항)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">연결 안함</SelectItem>
                    {dealsData?.map(deal => (
                      <SelectItem key={deal.id} value={deal.id}>{deal.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="작업에 대한 메모를 기록하세요." 
                  className="resize-none h-20"
                  disabled={mutation.isPending} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
              취소
            </Button>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? '수정하기' : '저장하기'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
