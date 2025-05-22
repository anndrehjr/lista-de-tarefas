"use client"

import { useReducer, useEffect, useState } from "react"
import TaskForm from "../components/task-form"
import TaskList from "../components/task-list"
import ThemeToggle from "../components/theme-toggle"
import TaskFilters from "../components/task-filters"
import NotificationBell from "../components/notification-bell"
import TaskStatistics from "../components/task-statistics"

// Definição das categorias disponíveis
export type TaskCategory = "trabalho" | "pessoal" | "estudo" | "saúde" | "outro"

// Definição do tipo de subtarefa
export interface SubTask {
  id: number
  titulo: string
  feita: boolean
}

// Definição do tipo de tarefa
export interface Task {
  id: number
  titulo: string
  feita: boolean
  dataVencimento?: string // Data de vencimento opcional
  categoria: TaskCategory // Categoria da tarefa
  subTarefas?: SubTask[] // Subtarefas
  ordem?: number // Ordem para drag and drop
}

// Tipos de ações para o reducer
type TaskAction =
  | { type: "ADICIONAR_TAREFA"; titulo: string; dataVencimento?: string; categoria: TaskCategory }
  | { type: "MARCAR_TAREFA"; id: number }
  | { type: "EXCLUIR_TAREFA"; id: number }
  | { type: "CARREGAR_TAREFAS"; tarefas: Task[] }
  | { type: "ADICIONAR_SUBTAREFA"; taskId: number; titulo: string }
  | { type: "MARCAR_SUBTAREFA"; taskId: number; subTaskId: number }
  | { type: "EXCLUIR_SUBTAREFA"; taskId: number; subTaskId: number }
  | { type: "REORDENAR_TAREFAS"; tarefas: Task[] }

// Estado inicial com algumas tarefas de exemplo
const initialTasks: Task[] = [
  {
    id: 1,
    titulo: "Estudar React",
    feita: false,
    dataVencimento: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    categoria: "estudo",
    subTarefas: [
      { id: 1, titulo: "Hooks básicos", feita: true },
      { id: 2, titulo: "Context API", feita: false },
    ],
  },
  {
    id: 2,
    titulo: "Criar protótipo",
    feita: true,
    dataVencimento: new Date().toISOString().split("T")[0],
    categoria: "trabalho",
    subTarefas: [],
  },
  {
    id: 3,
    titulo: "Fazer exercícios",
    feita: false,
    dataVencimento: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    categoria: "saúde",
    subTarefas: [],
  },
]

// Função reducer para gerenciar o estado das tarefas
function tasksReducer(tasks: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "ADICIONAR_TAREFA":
      return [
        ...tasks,
        {
          id: Date.now(),
          titulo: action.titulo,
          feita: false,
          dataVencimento: action.dataVencimento,
          categoria: action.categoria,
          subTarefas: [],
          ordem: tasks.length,
        },
      ]
    case "MARCAR_TAREFA":
      return tasks.map((task) => {
        if (task.id === action.id) {
          // Se a tarefa for marcada como concluída, todas as subtarefas também são
          const novoStatus = !task.feita
          return {
            ...task,
            feita: novoStatus,
            subTarefas: task.subTarefas?.map((st) => ({
              ...st,
              feita: novoStatus ? true : st.feita,
            })),
          }
        }
        return task
      })
    case "EXCLUIR_TAREFA":
      return tasks.filter((task) => task.id !== action.id)
    case "CARREGAR_TAREFAS":
      return action.tarefas
    case "ADICIONAR_SUBTAREFA":
      return tasks.map((task) => {
        if (task.id === action.taskId) {
          return {
            ...task,
            subTarefas: [
              ...(task.subTarefas || []),
              {
                id: Date.now(),
                titulo: action.titulo,
                feita: false,
              },
            ],
          }
        }
        return task
      })
    case "MARCAR_SUBTAREFA":
      return tasks.map((task) => {
        if (task.id === action.taskId) {
          const subTarefas = task.subTarefas?.map((st) =>
            st.id === action.subTaskId ? { ...st, feita: !st.feita } : st,
          )

          // Verificar se todas as subtarefas estão concluídas
          const todasConcluidas = subTarefas?.every((st) => st.feita) || false

          return {
            ...task,
            subTarefas,
            // Atualizar o status da tarefa principal apenas se todas as subtarefas estiverem concluídas
            feita: subTarefas && subTarefas.length > 0 ? todasConcluidas : task.feita,
          }
        }
        return task
      })
    case "EXCLUIR_SUBTAREFA":
      return tasks.map((task) => {
        if (task.id === action.taskId) {
          const subTarefas = task.subTarefas?.filter((st) => st.id !== action.subTaskId)
          return {
            ...task,
            subTarefas,
          }
        }
        return task
      })
    case "REORDENAR_TAREFAS":
      return action.tarefas
    default:
      return tasks
  }
}

// Tipos de filtros disponíveis
export type FilterType = "todas" | "pendentes" | "concluidas" | "vencidas" | "hoje"

export default function Home() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [filtroAtual, setFiltroAtual] = useState<FilterType>("todas")
  const [filtroCategoria, setFiltroCategoria] = useState<TaskCategory | "todas">("todas")
  const [notificacoes, setNotificacoes] = useState<Task[]>([])
  const [showStats, setShowStats] = useState(false)

  // Carregar tarefas do localStorage ao iniciar
  useEffect(() => {
    const savedTasks = localStorage.getItem("tarefas")
    if (savedTasks) {
      dispatch({ type: "CARREGAR_TAREFAS", tarefas: JSON.parse(savedTasks) })
    }

    // Carregar tema salvo
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setTheme("dark")
      document.documentElement.setAttribute("data-theme", "dark")
    }
  }, [])

  // Salvar tarefas no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("tarefas", JSON.stringify(tasks))
  }, [tasks])

  // Verificar tarefas para notificações
  useEffect(() => {
    // Encontrar tarefas que vencem hoje ou amanhã e não estão concluídas
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const tarefasNotificacao = tasks.filter((task) => {
      if (!task.dataVencimento || task.feita) return false

      const dataVencimento = new Date(task.dataVencimento)
      dataVencimento.setHours(0, 0, 0, 0)

      return dataVencimento.getTime() === hoje.getTime() || dataVencimento.getTime() === amanha.getTime()
    })

    setNotificacoes(tarefasNotificacao)
  }, [tasks])

  // Alternar entre temas claro e escuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  }

  // Handlers para as ações
  const handleAddTask = (titulo: string, dataVencimento?: string, categoria: TaskCategory = "outro") => {
    dispatch({ type: "ADICIONAR_TAREFA", titulo, dataVencimento, categoria })
  }

  const handleToggleTask = (id: number) => {
    dispatch({ type: "MARCAR_TAREFA", id })
  }

  const handleDeleteTask = (id: number) => {
    dispatch({ type: "EXCLUIR_TAREFA", id })
  }

  const handleAddSubTask = (taskId: number, titulo: string) => {
    dispatch({ type: "ADICIONAR_SUBTAREFA", taskId, titulo })
  }

  const handleToggleSubTask = (taskId: number, subTaskId: number) => {
    dispatch({ type: "MARCAR_SUBTAREFA", taskId, subTaskId })
  }

  const handleDeleteSubTask = (taskId: number, subTaskId: number) => {
    dispatch({ type: "EXCLUIR_SUBTAREFA", taskId, subTaskId })
  }

  const handleReorderTasks = (startIndex: number, endIndex: number) => {
    const result = Array.from(filtrarTarefas())
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    // Atualizar a ordem de todas as tarefas
    const updatedTasks = tasks
      .map((task) => {
        const foundInResult = result.find((t) => t.id === task.id)
        if (foundInResult) {
          return { ...task, ordem: result.findIndex((t) => t.id === task.id) }
        }
        return task
      })
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))

    dispatch({ type: "REORDENAR_TAREFAS", tarefas: updatedTasks })
  }

  // Filtrar tarefas com base no filtro atual e categoria
  const filtrarTarefas = () => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Primeiro filtramos por status
    let tarefasFiltradas = tasks.filter((task) => {
      if (filtroAtual === "todas") return true
      if (filtroAtual === "pendentes") return !task.feita
      if (filtroAtual === "concluidas") return task.feita

      if (filtroAtual === "vencidas") {
        if (!task.dataVencimento || task.feita) return false
        const dataVencimento = new Date(task.dataVencimento)
        dataVencimento.setHours(12, 0, 0, 0)
        return dataVencimento < hoje
      }

      if (filtroAtual === "hoje") {
        if (!task.dataVencimento) return false
        const dataVencimento = new Date(task.dataVencimento)
        dataVencimento.setHours(12, 0, 0, 0)
        const dataVencimentoSemHora = new Date(dataVencimento.setHours(0, 0, 0, 0))
        return dataVencimentoSemHora.getTime() === hoje.getTime()
      }

      return true
    })

    // Depois filtramos por categoria
    if (filtroCategoria !== "todas") {
      tarefasFiltradas = tarefasFiltradas.filter((task) => task.categoria === filtroCategoria)
    }

    // Ordenar por ordem (para drag and drop)
    return tarefasFiltradas.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
  }

  return (
    <main className="min-h-screen">
      <div className="p-8">
        <div className="task-container">
          <div className="task-header">
            <h1>Lista de Tarefas</h1>
            <p>Organize suas tarefas de forma simples e eficiente</p>
            <div className="header-controls">
              <button
                className="statistics-toggle"
                onClick={() => setShowStats(!showStats)}
                aria-label="Mostrar estatísticas"
              >
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
                  <path d="M3 3v18h18"></path>
                  <path d="M18 17V9"></path>
                  <path d="M13 17V5"></path>
                  <path d="M8 17v-3"></path>
                </svg>
              </button>
              <NotificationBell notificacoes={notificacoes} />
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>

          {showStats && <TaskStatistics tasks={tasks} />}

          <TaskForm onAddTask={handleAddTask} />

          <TaskFilters
            filtroAtual={filtroAtual}
            setFiltroAtual={setFiltroAtual}
            filtroCategoria={filtroCategoria}
            setFiltroCategoria={setFiltroCategoria}
          />

          <TaskList
            tasks={filtrarTarefas()}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onToggleSubTask={handleToggleSubTask}
            onAddSubTask={handleAddSubTask}
            onDeleteSubTask={handleDeleteSubTask}
            onReorderTasks={handleReorderTasks}
          />
        </div>
      </div>
    </main>
  )
}
