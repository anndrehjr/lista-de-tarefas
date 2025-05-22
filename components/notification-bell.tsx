"use client"

import { useState } from "react"
import type { Task } from "../app/page"

interface NotificationBellProps {
  notificacoes: Task[]
}

export default function NotificationBell({ notificacoes }: NotificationBellProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const isHoje = (dataString: string) => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const data = new Date(dataString)
    data.setHours(0, 0, 0, 0)
    return data.getTime() === hoje.getTime()
  }

  return (
    <div className="notification-container">
      <button onClick={toggleNotifications} className="notification-bell" aria-label="Notificações">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {notificacoes.length > 0 && <span className="notification-badge">{notificacoes.length}</span>}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-title">Notificações</div>
          {notificacoes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Nenhuma notificação</div>
          ) : (
            <ul className="notification-list">
              {notificacoes.map((task) => (
                <li
                  key={task.id}
                  className={`notification-item ${task.dataVencimento && isHoje(task.dataVencimento) ? "today" : ""}`}
                >
                  <div className="notification-content">
                    <span className="notification-task-title">{task.titulo}</span>
                    {task.dataVencimento && (
                      <span className="notification-date">Vence em: {formatarData(task.dataVencimento)}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
