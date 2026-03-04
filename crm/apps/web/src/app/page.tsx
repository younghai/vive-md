"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Briefcase, CheckSquare, PlusCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { DashboardSummary, ApiResponse } from "@vive-crm/shared"

export default function Home() {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await apiClient.get<any, ApiResponse<DashboardSummary>>('/dashboard/summary')
      return response.data
    }
  })

  if (isLoading) {
    return <div className="p-8">로딩 중...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 고객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalContacts ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              이번 주 신규 등록: {summary?.newContactsThisWeek ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 딜</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalDeals ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              성사된 딜: {summary?.wonDeals ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행중인 작업</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.openTasks ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              기한 지연: {summary?.overdueActivities ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘의 추천 액션</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary?.todayRecommendationsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              AI가 추천하는 연락 대상
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>파이프라인 통계</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 flex justify-center items-center h-[300px] text-muted-foreground">
            차트 영역 (추후 차트 라이브러리 연동)
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] text-muted-foreground flex justify-center items-center">
            최근 활동 리스트 연동 영역
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
