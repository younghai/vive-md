"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Search, Plus } from "lucide-react"

import { apiClient } from "@/lib/api/client"
import type { Contact, ApiResponse } from "@vive-crm/shared"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ContactModal } from "@/components/forms/contact-modal"
import { ContactDetailPanel } from "@/components/panels/contact-detail-panel"

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { q: searchTerm })
      })
      const response = await apiClient.get<any, ApiResponse<Contact[]>>(`/contacts?${params.toString()}`)
      return response
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">고객 목록</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 고객 추가
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="이름, 이메일, 회사명 검색..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>회사</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>리드 스코어</TableHead>
              <TableHead>등록일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((contact) => (
                <TableRow 
                  key={contact.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedContactId(contact.id)}
                >
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.company || '-'}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${contact.leadGrade === 'A' ? 'bg-green-100 text-green-800' :
                          contact.leadGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                          contact.leadGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {contact.leadGrade}
                      </span>
                      <span className="text-sm text-muted-foreground">{contact.leadScore}점</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(contact.createdAt), 'yyyy-MM-dd')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
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

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <ContactDetailPanel 
        contactId={selectedContactId} 
        isOpen={!!selectedContactId} 
        onClose={() => setSelectedContactId(null)}
        onEdit={(contact) => {
          // TODO: Open edit modal
          setSelectedContactId(null)
          console.log("Edit", contact)
        }}
      />
    </div>
  )
}
