"use client"

import { useState } from "react"
import type { Task, TaskCategory } from "../app/page"

interface TaskStatisticsProps {
  tasks: Task[]
}

export default function TaskStatistics({ tasks }: TaskStatisticsProps) {
  const [activeTab, setActiveTab] = useState<"status" | "category" | "timeline">("status")

  // Calcular estatísticas gerais
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.feita).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const overdueTasks = tasks.filter((task) => {
    if (!task.dataVencimento || task.feita) return false
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataVencimento = new Date(task.dataVencimento)
    dataVencimento.setHours(12, 0, 0, 0)
    return dataVencimento < hoje
  }).length

  // Calcular a categoria mais comum
  const categoryCount: Record<TaskCategory, number> = {
    trabalho: 0,
    pessoal: 0,
    estudo: 0,
    saúde: 0,
    outro: 0,
  }

  tasks.forEach((task) => {
    categoryCount[task.categoria] = (categoryCount[task.categoria] || 0) + 1
  })

  let mostCommonCategory: TaskCategory = "outro"
  let maxCount = 0

  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostCommonCategory = category as TaskCategory
    }
  })

  // Mapeamento de categorias para nomes em português
  const categoryNames: Record<TaskCategory, string> = {
    trabalho: "Trabalho",
    pessoal: "Pessoal",
    estudo: "Estudo",
    saúde: "Saúde",
    outro: "Outro",
  }

  return (
    <div className="statistics-container">
      <h2 className="statistics-title">Estatísticas</h2>

      <div className="statistics-summary">
        <div className="statistic-card">
          <span className="statistic-value">{totalTasks}</span>
          <span className="statistic-label">Total de Tarefas</span>
        </div>
        <div className="statistic-card">
          <span className="statistic-value">{completionRate}%</span>
          <span className="statistic-label">Taxa de Conclusão</span>
        </div>
        <div className="statistic-card">
          <span className="statistic-value">{overdueTasks}</span>
          <span className="statistic-label">Tarefas Vencidas</span>
        </div>
        <div className="statistic-card">
          <span className="statistic-value">{categoryNames[mostCommonCategory]}</span>
          <span className="statistic-label">Categoria Principal</span>
        </div>
      </div>

      <div className="statistics-tabs">
        <button
          className={`statistics-tab ${activeTab === "status" ? "active" : ""}`}
          onClick={() => setActiveTab("status")}
        >
          Status
        </button>
        <button
          className={`statistics-tab ${activeTab === "category" ? "active" : ""}`}
          onClick={() => setActiveTab("category")}
        >
          Categorias
        </button>
        <button
          className={`statistics-tab ${activeTab === "timeline" ? "active" : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          Linha do Tempo
        </button>
      </div>

      <div className="statistics-chart">
        {activeTab === "status" && (
          <div className="chart-container">
            <div className="simple-chart">
              <div className="chart-bar">
                <div className="chart-label">Concluídas</div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar-fill completed"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="chart-value">{completedTasks}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Pendentes</div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar-fill pending"
                    style={{ width: `${totalTasks > 0 ? ((totalTasks - completedTasks) / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="chart-value">{totalTasks - completedTasks}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "category" && (
          <div className="chart-container">
            <div className="simple-chart">
              {Object.entries(categoryCount)
                .filter(([_, count]) => count > 0)
                .map(([category, count]) => (
                  <div key={category} className="chart-bar">
                    <div className="chart-label">{categoryNames[category as TaskCategory]}</div>
                    <div className="chart-bar-container">
                      <div
                        className={`chart-bar-fill category-${category}`}
                        style={{ width: `${(count / totalTasks) * 100}%` }}
                      ></div>
                    </div>
                    <div className="chart-value">{count}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="chart-container">
            <div className="timeline-placeholder">
              <p>Dados de linha do tempo simplificados</p>
              <p>
                Tarefas para hoje:{" "}
                {
                  tasks.filter((task) => {
                    if (!task.dataVencimento) return false
                    const hoje = new Date()
                    hoje.setHours(0, 0, 0, 0)
                    const dataVencimento = new Date(task.dataVencimento)
                    dataVencimento.setHours(0, 0, 0, 0)
                    return dataVencimento.getTime() === hoje.getTime()
                  }).length
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
