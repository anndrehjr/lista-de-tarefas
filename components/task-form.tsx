"use client"

import type React from "react"

import { useState } from "react"
import type { TaskCategory } from "../app/page"

interface TaskFormProps {
  onAddTask: (titulo: string, dataVencimento?: string, categoria?: TaskCategory) => void
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [titulo, setTitulo] = useState("")
  const [showDateInput, setShowDateInput] = useState(false)
  const [dataVencimento, setDataVencimento] = useState("")
  const [categoria, setCategoria] = useState<TaskCategory>("outro")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (titulo.trim()) {
      onAddTask(titulo.trim(), dataVencimento || undefined, categoria)
      setTitulo("")
      setDataVencimento("")
      setShowDateInput(false)
    }
  }

  return (
    <div className="task-form-container">
      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Adicionar nova tarefa..."
          className="task-input"
        />
        <button type="submit" disabled={!titulo.trim()} className="task-button">
          Adicionar
        </button>
      </form>

      <div className="task-form-options">
        <div className="category-selector">
          <label htmlFor="categoria" className="option-label">
            Categoria:
          </label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as TaskCategory)}
            className="category-select"
          >
            <option value="trabalho">Trabalho</option>
            <option value="pessoal">Pessoal</option>
            <option value="estudo">Estudo</option>
            <option value="saúde">Saúde</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div className="date-toggle-container">
          {!showDateInput ? (
            <button type="button" onClick={() => setShowDateInput(true)} className="date-toggle-button">
              + Adicionar data de vencimento
            </button>
          ) : (
            <div className="date-input-container">
              <label htmlFor="data-vencimento" className="date-label">
                Data:
              </label>
              <input
                type="date"
                id="data-vencimento"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="date-input"
                min={new Date().toISOString().split("T")[0]}
              />
              <button
                type="button"
                onClick={() => {
                  setShowDateInput(false)
                  setDataVencimento("")
                }}
                className="date-toggle-button"
              >
                Remover
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
