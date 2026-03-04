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
import { Deal, Contact, ApiResponse } from "@vive-crm/shared"

const dealSchema = z.object({
  title: z.string().min(1, "딜 이름을 입력해주세요.").max(200),
  amount: z.coerce.number().min(0, "금액은 0 이상이어야 합니다."),
  probability: z.coerce.number().min(0).max(100, "확률은 0~100 사이여야 합니다."),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
  contactId: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  description: z.string().max(5000).optional(),
})

type DealFormValues = z.infer<typeof dealSchema>

interface DealFormProps {
  initialData?: Deal
  onSuccess?: () => void
  onCancel?: () => void
}

export function DealForm({ initialData, onSuccess, onCancel }: DealFormProps) {
  const isEditing = !!initialData
  const queryClient = useQueryClient()

  // 연락처 목록 조회 (고객 연결용)
  const { data: contactsData } = useQuery({
    queryKey: ['contacts-lite'],
    queryFn: async () => {
      const response = await apiClient.get<any, ApiResponse<Contact[]>>('/contacts?pageSize=100')
      return response.data
    },
  })

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: initialData?.title || "",
      amount: initialData?.amount || 0,
      probability: initialData?.probability || 10,
      stage: initialData?.stage || 'LEAD',
      contactId: initialData?.contactId || "",
      expectedCloseDate: initialData?.expectedCloseDate 
        ? new Date(initialData.expectedCloseDate).toISOString().split('T')[0] 
        : "",
      description: initialData?.description || "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: DealFormValues) => {
      const payload = {
        ...data,
        contactId: data.contactId || undefined,
        expectedCloseDate: data.expectedCloseDate || undefined,
        description: data.description || undefined,
      }
      
      if (isEditing) {
        return apiClient.patch(`/deals/${initialData.id}`, payload)
      } else {
        return apiClient.post('/deals', payload)
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "딜 정보가 수정되었습니다." : "새 딜이 추가되었습니다.")
      queryClient.invalidateQueries({ queryKey: ['deals-pipeline'] })
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
              <FormLabel>딜 이름 <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="딜 이름 입력" disabled={mutation.isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>예상 금액(₩)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>성공 확률(%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>스테이지</FormLabel>
                <Select disabled={mutation.isPending} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="스테이지 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LEAD">리드</SelectItem>
                    <SelectItem value="QUALIFIED">적격 리드</SelectItem>
                    <SelectItem value="PROPOSAL">제안/견적</SelectItem>
                    <SelectItem value="NEGOTIATION">협상</SelectItem>
                    <SelectItem value="WON">수주</SelectItem>
                    <SelectItem value="LOST">실패</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedCloseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>예상 종료일</FormLabel>
                <FormControl>
                  <Input type="date" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                    <SelectItem key={contact.id} value={contact.id}>{contact.name} {contact.company ? `(${contact.company})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="딜에 대한 세부 설명을 기록하세요." 
                  className="resize-none h-24"
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
