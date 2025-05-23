"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import type { Task } from "../app/page"

interface SubtaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onAddSubTask: (taskId: number, title: string) => void
  onToggleSubTask: (taskId: number, subTaskId: number) => void
  onDeleteSubTask: (taskId: number, subTaskId: number) => void
}

export default function SubtaskModal({
  task,
  isOpen,
  onClose,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}: SubtaskModalProps) {
  const [newSubTask, setNewSubTask] = useState("")

  if (!isOpen) return null

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSubTask.trim()) {
      onAddSubTask(task.id, newSubTask.trim())
      setNewSubTask("")
    }
  }

  const subTasksCompleted = task.subTarefas ? task.subTarefas.filter((st) => st.feita).length : 0
  const subTasksTotal = task.subTarefas ? task.subTarefas.length : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Subtarefas</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="task-info">
            <h3 className="task-title">{task.titulo}</h3>
            <div className="task-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${subTasksTotal > 0 ? (subTasksCompleted / subTasksTotal) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {subTasksCompleted} de {subTasksTotal} concluídas
              </span>
            </div>
          </div>

          <form onSubmit={handleAddSubTask} className="add-subtask-form">
            <input
              type="text"
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              placeholder="Nova subtarefa..."
              className="subtask-input-modal"
            />
            <button type="submit" disabled={!newSubTask.trim()} className="add-subtask-button">
              <Plus size={16} />
              Adicionar
            </button>
          </form>

          <div className="subtasks-list-modal">
            {task.subTarefas && task.subTarefas.length > 0 ? (
              task.subTarefas.map((subTask) => (
                <div key={subTask.id} className="subtask-item-modal">
                  <input
                    type="checkbox"
                    checked={subTask.feita}
                    onChange={() => onToggleSubTask(task.id, subTask.id)}
                    id={`modal-subtask-${task.id}-${subTask.id}`}
                    className="subtask-checkbox-modal"
                  />
                  <label
                    htmlFor={`modal-subtask-${task.id}-${subTask.id}`}
                    className={`subtask-label-modal ${subTask.feita ? "completed" : ""}`}
                  >
                    {subTask.titulo}
                  </label>
                  <button
                    onClick={() => onDeleteSubTask(task.id, subTask.id)}
                    className="subtask-delete-modal"
                    aria-label="Excluir subtarefa"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="no-subtasks">Nenhuma subtarefa adicionada ainda.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
