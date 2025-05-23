"use client"

import { AlertTriangle, Clock } from "lucide-react"
import type { Task } from "../app/page"

interface ConflictAlertProps {
  conflicts: Array<{
    task1: Task
    task2: Task
    overlap: string
  }>
  onClose: () => void
}

export default function ConflictAlert({ conflicts, onClose }: ConflictAlertProps) {
  if (conflicts.length === 0) return null

  const formatarData = (dataString: string) => {
    const [ano, mes, dia] = dataString.split("-").map(Number)
    return `${dia.toString().padStart(2, "0")}/${mes.toString().padStart(2, "0")}/${ano}`
  }

  return (
    <div className="conflict-alert">
      <div className="conflict-header">
        <div className="conflict-icon">
          <AlertTriangle size={20} />
        </div>
        <div className="conflict-title">
          <h3>Conflitos de Horário Detectados</h3>
          <p>As seguintes tarefas têm horários sobrepostos:</p>
        </div>
        <button className="conflict-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="conflict-list">
        {conflicts.map((conflict, index) => (
          <div key={index} className="conflict-item">
            <div className="conflict-tasks">
              <div className="conflict-task">
                <div className="task-name">{conflict.task1.titulo}</div>
                <div className="task-time">
                  <Clock size={14} />
                  {conflict.task1.horaInicio} - {conflict.task1.horaFim}
                  {conflict.task1.dataVencimento && (
                    <span className="task-date">({formatarData(conflict.task1.dataVencimento)})</span>
                  )}
                </div>
              </div>
              <div className="conflict-vs">vs</div>
              <div className="conflict-task">
                <div className="task-name">{conflict.task2.titulo}</div>
                <div className="task-time">
                  <Clock size={14} />
                  {conflict.task2.horaInicio} - {conflict.task2.horaFim}
                  {conflict.task2.dataVencimento && (
                    <span className="task-date">({formatarData(conflict.task2.dataVencimento)})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="conflict-overlap">Sobreposição: {conflict.overlap}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
