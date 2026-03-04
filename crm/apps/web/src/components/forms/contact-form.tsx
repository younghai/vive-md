"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { apiClient } from "@/lib/api/client"
import { Contact } from "@vive-crm/shared"

const contactSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요.").max(100),
  email: z.string().email("유효한 이메일 주소를 입력해주세요.").or(z.literal("")).optional(),
  phone: z.string().or(z.literal("")).optional(),
  company: z.string().max(200).or(z.literal("")).optional(),
  jobTitle: z.string().max(100).or(z.literal("")).optional(),
  memo: z.string().max(5000).or(z.literal("")).optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

interface ContactFormProps {
  initialData?: Contact
  onSuccess?: () => void
  onCancel?: () => void
}

export function ContactForm({ initialData, onSuccess, onCancel }: ContactFormProps) {
  const isEditing = !!initialData
  const queryClient = useQueryClient()

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      company: initialData?.company || "",
      jobTitle: initialData?.jobTitle || "",
      memo: initialData?.memo || "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      // 빈 문자열은 undefined로 변환하여 API에 전송
      const payload = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v])
      )
      
      if (isEditing) {
        return apiClient.patch(`/contacts/${initialData.id}`, payload)
      } else {
        return apiClient.post('/contacts', payload)
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "고객 정보가 수정되었습니다." : "새 고객이 추가되었습니다.")
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "오류가 발생했습니다.")
    }
  })

  function onSubmit(data: ContactFormValues) {
    mutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름 <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="홍길동" disabled={mutation.isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input placeholder="hong@example.com" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>전화번호</FormLabel>
                <FormControl>
                  <Input placeholder="010-0000-0000" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>회사명</FormLabel>
                <FormControl>
                  <Input placeholder="회사명" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>직책</FormLabel>
                <FormControl>
                  <Input placeholder="대표이사" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="고객에 대한 특이사항을 기록하세요." 
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
