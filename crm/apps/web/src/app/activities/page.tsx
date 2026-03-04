"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { FileText, Phone, Mail, MessageSquare, Briefcase, Plus } from "lucide-react"

import { apiClient } from "@/lib/api/client"
import type { Activity, ApiResponse } from "@vive-crm/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Briefcase,
  NOTE: FileText,
  OTHER: MessageSquare,
}

const ACTIVITY_COLORS: Record<string, string> = {
  CALL: "text-blue-500 bg-blue-100",
  EMAIL: "text-green-500 bg-green-100",
  MEETING: "text-purple-500 bg-purple-100",
  NOTE: "text-yellow-500 bg-yellow-100",
  OTHER: "text-gray-500 bg-gray-100",
}

const ACTIVITY_LABELS: Record<string, string> = {
  CALL: "전화",
  EMAIL: "이메일",
  MEETING: "미팅",
  NOTE: "메모",
  OTHER: "기타",
}

export default function ActivitiesPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['activities', page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
      })
      // Using the dashboard activities endpoint for now since there's no general activities list API yet
      // If we implement a full /activities list later, we can change this URL
      const response = await apiClient.get<any, ApiResponse<Activity[]>>(`/dashboard/activities?${params.toString()}`)
      return response
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">활동 로그</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> 활동 추가
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">로딩 중...</div>
          ) : data?.data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              기록된 활동이 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {data?.data.map((activity: any) => {
                const Icon = ACTIVITY_ICONS[activity.type] || MessageSquare
                const colorClass = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.OTHER
                const label = ACTIVITY_LABELS[activity.type] || "활동"

                return (
                  <div key={activity.id} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {activity.title} <span className="text-xs font-normal text-muted-foreground ml-2">({label})</span>
                        </p>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {format(new Date(activity.performedAt), 'yyyy-MM-dd HH:mm')}
                        </p>
                      </div>
                      
                      {activity.note && (
                        <p className="text-sm text-muted-foreground">
                          {activity.note}
                        </p>
                      )}
                      
                      {(activity.contact || activity.deal) && (
                        <div className="flex gap-3 mt-2 text-xs font-medium">
                          {activity.contact && (
                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              👤 {activity.contact.name}
                            </span>
                          )}
                          {activity.deal && (
                            <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                              💼 {activity.deal.title}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
