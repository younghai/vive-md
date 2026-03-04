"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { Download } from "lucide-react"

import { apiClient } from "@/lib/api/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly')

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', reportType],
    queryFn: async () => {
      const response = await apiClient.get<any, any>(`/reports/${reportType}`)
      return response.data
    },
  })

  const { data: activitiesData } = useQuery({
    queryKey: ['reports-activities'],
    queryFn: async () => {
      const response = await apiClient.get<any, any>('/reports/activities')
      
      // Transform object to array for PieChart
      if (response?.data) {
        return Object.entries(response.data).map(([name, value]) => ({
          name, value
        }))
      }
      return []
    },
  })

  // Format stage changes for chart
  const stageData = reportData?.pipelineStageChanges ? 
    Object.entries(reportData.pipelineStageChanges).map(([name, count]) => ({
      name, count
    })) : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">리포트 및 통계</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-muted rounded-md p-1">
            <button
              className={`px-3 py-1 text-sm font-medium rounded ${reportType === 'weekly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setReportType('weekly')}
            >
              주간
            </button>
            <button
              className={`px-3 py-1 text-sm font-medium rounded ${reportType === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setReportType('monthly')}
            >
              월간
            </button>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> 내보내기
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">데이터를 불러오는 중입니다...</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">새로운 고객</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData?.newContacts || 0}명</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">생성된 딜</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData?.newDeals || 0}건</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">성사된 딜 (수주액)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData?.wonDeals || 0}건</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ₩{(reportData?.wonAmount || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">수주 성공률</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData?.successRate ? `${(reportData.successRate * 100).toFixed(1)}%` : '0%'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>파이프라인 변경 추이</CardTitle>
                <CardDescription>기간 내 각 스테이지로 이동한 딜 건수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] mt-4">
                  {stageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stageData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{fill: 'var(--muted)'}}
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      데이터가 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>활동 유형별 분포</CardTitle>
                <CardDescription>기간 내 기록된 활동의 종류별 비율</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {activitiesData && activitiesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activitiesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {activitiesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      데이터가 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
