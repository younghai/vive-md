"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Phone, Mail, Building2, CalendarIcon, Edit, Trash2 } from "lucide-react"

import { apiClient } from "@/lib/api/client"
import type { Contact, ApiResponse } from "@vive-crm/shared"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ContactDetailPanelProps {
  contactId: string | null
  isOpen: boolean
  onClose: () => void
  onEdit: (contact: Contact) => void
}

export function ContactDetailPanel({ contactId, isOpen, onClose, onEdit }: ContactDetailPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      if (!contactId) return null
      const response = await apiClient.get<any, ApiResponse<Contact>>(`/contacts/${contactId}`)
      return response.data
    },
    enabled: !!contactId && isOpen,
  })

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center justify-between">
            <span>{isLoading ? "로딩 중..." : data?.name}</span>
            {data && (
              <span className={`px-2.5 py-1 text-sm rounded ${
                data.leadGrade === 'A' ? 'bg-green-100 text-green-800' :
                data.leadGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                data.leadGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Grade {data.leadGrade} ({data.leadScore}점)
              </span>
            )}
          </SheetTitle>
          {data?.jobTitle && <SheetDescription>{data.jobTitle}</SheetDescription>}
        </SheetHeader>

        {data && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(data)}>
                <Edit className="w-4 h-4 mr-2" /> 수정
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> 삭제
              </Button>
            </div>

            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm">연락처 정보</h3>
              
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{data.email || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{data.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{data.company || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>마지막 연락: {data.lastContactAt ? format(new Date(data.lastContactAt), 'yyyy-MM-dd') : '-'}</span>
                </div>
              </div>
            </div>

            {data.tags && data.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map(tag => (
                    <span key={tag} className="bg-muted px-2 py-1 rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.memo && (
              <div>
                <h3 className="font-semibold text-sm mb-2">메모</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/10 p-3 rounded-md border border-muted">
                  {data.memo}
                </p>
              </div>
            )}
            
            <Separator />
            
            <div className="text-xs text-muted-foreground text-center">
              등록일: {format(new Date(data.createdAt), 'yyyy-MM-dd HH:mm')}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
