"use client"

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
  onOpenSubtaskModal: (task: Task) => void
}

export default function TaskList({
  tasks,
  onToggleTask,
  onDeleteTask,
  onToggleSubTask,
  onAddSubTask,
  onDeleteSubTask,
  onReorderTasks,
  onOpenSubtaskModal,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="empty-list">Nenhuma tarefa encontrada.</div>
  }

  return (
    <ul className="task-list">
      {tasks.map((task, index) => (
        <li key={task.id} id={`task-${task.id}`} className={`task-item category-${task.categoria}`}>
          <TaskItem
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onToggleSubTask={onToggleSubTask}
            onAddSubTask={onAddSubTask}
            onDeleteSubTask={onDeleteSubTask}
            onOpenSubtaskModal={onOpenSubtaskModal}
            index={index}
          />
        </li>
      ))}
    </ul>
  )
}
