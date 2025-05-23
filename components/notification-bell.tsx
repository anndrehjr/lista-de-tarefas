"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Clock, Calendar, BellOff } from "lucide-react"
import type { Notificacao } from "../app/page"

interface NotificationBellProps {
  notificacoes: Notificacao[]
  notificacoesPermitidas: boolean
  solicitarPermissao: () => void
}

export default function NotificationBell({
  notificacoes,
  notificacoesPermitidas,
  solicitarPermissao,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar o dropdown quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Formatar a data para exibição
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${notificacoes.length} notificações`}
      >
        {notificacoesPermitidas ? <Bell size={20} /> : <BellOff size={20} />}
        {notificacoes.length > 0 && <span className="notification-badge">{notificacoes.length}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-title">Notificações</div>

          {!notificacoesPermitidas && (
            <div className="notification-permission">
              <p className="notification-permission-text">
                Ative as notificações para receber alertas quando suas tarefas estiverem próximas de começar.
              </p>
              <button className="notification-permission-button" onClick={solicitarPermissao}>
                Ativar notificações
              </button>
            </div>
          )}

          {notificacoes.length > 0 ? (
            <ul className="notification-list">
              {notificacoes.map((notificacao) => (
                <li
                  key={`${notificacao.id}-${notificacao.tipo}`}
                  className={`notification-item ${notificacao.tempo === "hoje" ? "today" : ""} ${
                    notificacao.tipo === "horario" ? "time-alert" : ""
                  }`}
                >
                  <div className="notification-content">
                    <div className="notification-task-title">{notificacao.tarefa.titulo}</div>
                    <div className="notification-date">
                      {notificacao.tipo === "vencimento" ? (
                        <>
                          <Calendar size={14} className="notification-icon" />
                          <span>
                            Vence {notificacao.tempo}{" "}
                            {notificacao.tarefa.dataVencimento &&
                              `(${formatarData(notificacao.tarefa.dataVencimento)})`}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} className="notification-icon" />
                          <span>
                            Começa {notificacao.tempo}{" "}
                            {notificacao.tarefa.horaInicio && `(${notificacao.tarefa.horaInicio})`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="notification-empty">Nenhuma notificação no momento</div>
          )}
        </div>
      )}
    </div>
  )
}
