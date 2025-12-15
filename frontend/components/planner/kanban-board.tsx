"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GripVertical } from "lucide-react"

interface Task {
  id: string
  subject: string
  topic: string
  hours: number
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

const initialData: Column[] = [
  {
    id: "todo",
    title: "برای خواندن",
    tasks: [
      { id: "1", subject: "ریاضی", topic: "انتگرال", hours: 3 },
      { id: "2", subject: "فیزیک", topic: "مغناطیس", hours: 2 },
      { id: "3", subject: "شیمی", topic: "سینتیک", hours: 2 },
      { id: "4", subject: "عربی", topic: "ترجمه", hours: 1 },
    ],
  },
  {
    id: "inprogress",
    title: "در حال مطالعه",
    tasks: [
      { id: "5", subject: "زیست", topic: "متابولیسم", hours: 2 },
      { id: "6", subject: "ادبیات", topic: "دستور زبان", hours: 1 },
    ],
  },
  {
    id: "done",
    title: "تمام شده",
    tasks: [
      { id: "7", subject: "دین و زندگی", topic: "اخلاق", hours: 1 },
      { id: "8", subject: "فارسی", topic: "قرابت معنایی", hours: 1 },
    ],
  },
]

export function KanbanBoard() {
  const [columns, setColumns] = useState(initialData)
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColumnId: string } | null>(null)

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, sourceColumnId: columnId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask) return

    const newColumns = columns.map((col) => {
      // Remove from source
      if (col.id === draggedTask.sourceColumnId) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== draggedTask.task.id),
        }
      }
      // Add to target
      if (col.id === targetColumnId && col.id !== draggedTask.sourceColumnId) {
        return {
          ...col,
          tasks: [...col.tasks, draggedTask.task],
        }
      }
      return col
    })

    setColumns(newColumns)
    setDraggedTask(null)
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <Card
          key={column.id}
          className="flex flex-col"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{column.title}</span>
              <Badge variant="secondary">{column.tasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, column.id)}
                  className="group p-4 bg-card border-2 border-border rounded-lg cursor-move hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">{task.subject}</p>
                      <p className="text-sm text-muted-foreground mb-2">{task.topic}</p>
                      <Badge variant="outline" className="text-xs">
                        {task.hours} ساعت
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">هیچ درسی در این بخش نیست</div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
