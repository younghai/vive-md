"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"

import { apiClient } from "@/lib/api/client"
import type { Deal, ApiResponse } from "@vive-crm/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DealModal } from "@/components/forms/deal-modal"

const STAGES = [
  { id: 'LEAD', label: '리드' },
  { id: 'QUALIFIED', label: '적격 리드' },
  { id: 'PROPOSAL', label: '제안/견적' },
  { id: 'NEGOTIATION', label: '협상' },
  { id: 'WON', label: '수주' },
  { id: 'LOST', label: '실패' },
]

export default function DealsPage() {
  const queryClient = useQueryClient()
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['deals-pipeline'],
    queryFn: async () => {
      const response = await apiClient.get<any, ApiResponse<any>>('/deals/pipeline')
      return response.data.stages
    },
  })

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      await apiClient.patch(`/deals/${id}/stage`, { stage })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals-pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    updateStageMutation.mutate({
      id: draggableId,
      stage: destination.droppableId,
    })
  }

  if (!isMounted || isLoading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">딜 파이프라인</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 딜 추가
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-h-[600px] items-start">
            {STAGES.map((stage) => {
              const deals = data?.[stage.id] || []
              return (
                <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col h-full bg-muted/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <span className="bg-muted px-2 py-0.5 rounded-full text-xs text-muted-foreground font-medium">
                      {deals.length}
                    </span>
                  </div>
                  
                  <Droppable droppableId={stage.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 flex flex-col gap-3 min-h-[150px]"
                      >
                        {deals.map((deal: any, index: number) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`shadow-sm ${snapshot.isDragging ? 'opacity-70 shadow-md ring-1 ring-primary/20' : ''}`}
                              >
                                <CardContent className="p-4 flex flex-col gap-2">
                                  <div className="font-medium text-sm line-clamp-2">{deal.title}</div>
                                  <div className="text-sm font-semibold text-primary">
                                    ₩{deal.amount.toLocaleString()}
                                  </div>
                                  {deal.contact && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {deal.contact.name} ({deal.contact.company || '-'})
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      <DealModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
