"use client"

import type React from "react"
import { useState } from "react"
import type { Task } from "../app/page"
import { Trash2, Clock, List } from "lucide-react"

interface TaskItemProps {
  task: Task
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onToggleSubTask: (taskId: number, subTaskId: number) => void
  onAddSubTask: (taskId: number, title: string) => void
  onDeleteSubTask: (taskId: number, subTaskId: number) => void
  onOpenSubtaskModal: (task: Task) => void
  index: number
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onToggleSubTask,
  onAddSubTask,
  onDeleteSubTask,
  onOpenSubtaskModal,
  index,
}: TaskItemProps) {
  const [newSubTask, setNewSubTask] = useState("")
  const [showSubTasks, setShowSubTasks] = useState(false)

  // Modificar as funções isVencida e isHoje para corrigir o problema de comparação de datas
  const isVencida = () => {
    if (!task.dataVencimento || task.feita) return false

    const hojeFormatado = new Date().toISOString().split("T")[0]

    // Comparar diretamente as strings de data
    return task.dataVencimento < hojeFormatado
  }

  // Verificar se a tarefa vence hoje
  const isHoje = () => {
    if (!task.dataVencimento || task.feita) return false

    const hojeFormatado = new Date().toISOString().split("T")[0]

    // Comparar diretamente as strings de data
    return task.dataVencimento === hojeFormatado
  }

  // Formatar a data para exibição
  const formatarData = (dataString: string) => {
    // Usar o formato YYYY-MM-DD diretamente para evitar problemas de fuso horário
    const [ano, mes, dia] = dataString.split("-").map(Number)
    return `${dia.toString().padStart(2, "0")}/${mes.toString().padStart(2, "0")}/${ano}`
  }

  // Determinar a classe CSS com base no status da tarefa
  const getStatusClass = () => {
    if (task.feita) return "task-completed"
    if (isVencida()) return "task-overdue"
    if (isHoje()) return "task-today"
    return ""
  }

  // Mapeamento de categorias para ícones
  const categoriasIcons = {
    trabalho: "💼",
    pessoal: "🏠",
    estudo: "📚",
    saúde: "❤️",
    outro: "📌",
  }

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSubTask.trim()) {
      onAddSubTask(task.id, newSubTask.trim())
      setNewSubTask("")
    }
  }

  const subTasksCompleted = task.subTarefas ? task.subTarefas.filter((st) => st.feita).length : 0
  const subTasksTotal = task.subTarefas ? task.subTarefas.length : 0
  const hasSubTasks = subTasksTotal > 0

  return (
    <>
      <input
        type="checkbox"
        checked={task.feita}
        onChange={() => onToggle(task.id)}
        id={`task-${task.id}`}
        className="task-checkbox"
      />

      <div className="task-content">
        <div className="task-title-row">
          <label htmlFor={`task-${task.id}`} className={`task-label ${task.feita ? "task-completed" : ""}`}>
            {task.titulo}
          </label>
          <div className="task-actions">
            <span className="task-category" title={`Categoria: ${task.categoria}`}>
              {categoriasIcons[task.categoria]}
            </span>
            <button
              onClick={() => onOpenSubtaskModal(task)}
              className="subtask-modal-button"
              title="Gerenciar subtarefas"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {task.dataVencimento && (
          <div className="task-due-date">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="due-date-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{formatarData(task.dataVencimento)}</span>
          </div>
        )}

        {(task.horaInicio || task.horaFim) && (
          <div className="task-due-date mt-1">
            <Clock className="due-date-icon" size={14} />
            <span>
              {task.horaInicio && task.horaFim
                ? `${task.horaInicio} - ${task.horaFim}`
                : task.horaInicio
                  ? `A partir de ${task.horaInicio}`
                  : `Até ${task.horaFim}`}
            </span>
          </div>
        )}

        {hasSubTasks && (
          <div className="subtasks-progress">
            <div className="subtasks-progress-bar">
              <div
                className="subtasks-progress-fill"
                style={{ width: `${subTasksTotal > 0 ? (subTasksCompleted / subTasksTotal) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="subtasks-count">
              {subTasksCompleted}/{subTasksTotal}
            </span>
            <button
              className="subtasks-toggle"
              onClick={() => setShowSubTasks(!showSubTasks)}
              aria-label={showSubTasks ? "Esconder subtarefas" : "Mostrar subtarefas"}
            >
              {showSubTasks ? "▼" : "►"}
            </button>
          </div>
        )}

        {showSubTasks && hasSubTasks && (
          <ul className="subtasks-list">
            {task.subTarefas?.map((subTask) => (
              <li key={subTask.id} className="subtask-item">
                <input
                  type="checkbox"
                  checked={subTask.feita}
                  onChange={() => onToggleSubTask(task.id, subTask.id)}
                  id={`subtask-${task.id}-${subTask.id}`}
                  className="subtask-checkbox"
                />
                <label
                  htmlFor={`subtask-${task.id}-${subTask.id}`}
                  className={`subtask-label ${subTask.feita ? "subtask-completed" : ""}`}
                >
                  {subTask.titulo}
                </label>
                <button
                  onClick={() => onDeleteSubTask(task.id, subTask.id)}
                  className="subtask-delete"
                  aria-label="Excluir subtarefa"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {showSubTasks && (
          <form onSubmit={handleAddSubTask} className="subtask-form">
            <input
              type="text"
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              placeholder="Nova subtarefa..."
              className="subtask-input"
            />
            <button
              type="submit"
              disabled={!newSubTask.trim()}
              className="subtask-add-button"
              aria-label="Adicionar subtarefa"
            >
              +
            </button>
          </form>
        )}
      </div>

      <button onClick={() => onDelete(task.id)} className="task-delete" aria-label="Excluir tarefa">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </>
  )
}
