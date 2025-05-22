"use client"

import type React from "react"

import { useState } from "react"
import type { Task } from "../app/page"
import TaskItem from "./task-item"

interface TaskListProps {
  tasks: Task[]
  onToggleTask: (id: number) => void
  onDeleteTask: (id: number) => void
  onToggleSubTask: (taskId: number, subTaskId: number) => void
  onAddSubTask: (taskId: number, title: string) => void
  onDeleteSubTask: (taskId: number, subTaskId: number) => void
  onReorderTasks: (startIndex: number, endIndex: number) => void
}

export default function TaskList({
  tasks,
  onToggleTask,
  onDeleteTask,
  onToggleSubTask,
  onAddSubTask,
  onDeleteSubTask,
  onReorderTasks,
}: TaskListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  if (tasks.length === 0) {
    return <div className="empty-list">Nenhuma tarefa adicionada ainda.</div>
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const draggedOverItem = document.querySelector(`[data-index="${index}"]`)
    if (draggedOverItem) {
      draggedOverItem.classList.add("drag-over")
    }
  }

  const handleDragLeave = (index: number) => {
    const draggedOverItem = document.querySelector(`[data-index="${index}"]`)
    if (draggedOverItem) {
      draggedOverItem.classList.remove("drag-over")
    }
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return

    const draggedOverItem = document.querySelector(`[data-index="${index}"]`)
    if (draggedOverItem) {
      draggedOverItem.classList.remove("drag-over")
    }

    if (draggedIndex !== index) {
      onReorderTasks(draggedIndex, index)
    }

    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    document.querySelectorAll(".task-item").forEach((item) => {
      item.classList.remove("drag-over")
    })
  }

  return (
    <ul className="task-list">
      {tasks.map((task, index) => (
        <li
          key={task.id}
          data-index={index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={() => handleDragLeave(index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={`task-item ${draggedIndex === index ? "dragging" : ""} category-${task.categoria}`}
        >
          <div className="task-drag-handle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="8" r="1" />
              <circle cx="8" cy="16" r="1" />
              <circle cx="16" cy="8" r="1" />
              <circle cx="16" cy="16" r="1" />
            </svg>
          </div>

          <TaskItem
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onToggleSubTask={onToggleSubTask}
            onAddSubTask={onAddSubTask}
            onDeleteSubTask={onDeleteSubTask}
            index={index}
          />
        </li>
      ))}
    </ul>
  )
}
