"use client"

import type React from "react"

import { useReducer, useEffect, useState, useRef } from "react"
import TaskForm from "../components/task-form"
import TaskList from "../components/task-list"
import ThemeToggle from "../components/theme-toggle"
import TaskFilters from "../components/task-filters"
import NotificationBell from "../components/notification-bell"
import TaskStatistics from "../components/task-statistics"
import SubtaskModal from "../components/subtask-modal"
import ConflictAlert from "../components/conflict-alert"

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
  horaInicio?: string // Nova propriedade: hora de início
  horaFim?: string // Nova propriedade: hora de término
  categoria: TaskCategory // Categoria da tarefa
  subTarefas?: SubTask[] // Subtarefas
  ordem?: number // Ordem para drag and drop
  notificada?: boolean // Indica se a notificação já foi enviada
}

// Tipos de ações para o reducer
type TaskAction =
  | {
      type: "ADICIONAR_TAREFA"
      titulo: string
      dataVencimento?: string
      horaInicio?: string
      horaFim?: string
      categoria: TaskCategory
    }
  | { type: "MARCAR_TAREFA"; id: number }
  | { type: "EXCLUIR_TAREFA"; id: number }
  | { type: "CARREGAR_TAREFAS"; tarefas: Task[] }
  | { type: "ADICIONAR_SUBTAREFA"; taskId: number; titulo: string }
  | { type: "MARCAR_SUBTAREFA"; taskId: number; subTaskId: number }
  | { type: "EXCLUIR_SUBTAREFA"; taskId: number; subTaskId: number }
  | { type: "REORDENAR_TAREFAS"; tarefas: Task[] }
  | { type: "MARCAR_NOTIFICADA"; id: number }

// Estado inicial com algumas tarefas de exemplo
const initialTasks: Task[] = [
  {
    id: 1,
    titulo: "Estudar React",
    feita: false,
    dataVencimento: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    horaInicio: "09:00",
    horaFim: "11:00",
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
    horaInicio: "14:00",
    horaFim: "16:30",
    categoria: "trabalho",
    subTarefas: [],
  },
  {
    id: 3,
    titulo: "Fazer exercícios",
    feita: false,
    dataVencimento: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    horaInicio: "07:00",
    horaFim: "08:00",
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
          horaInicio: action.horaInicio,
          horaFim: action.horaFim,
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
    case "MARCAR_NOTIFICADA":
      return tasks.map((task) => {
        if (task.id === action.id) {
          return {
            ...task,
            notificada: true,
          }
        }
        return task
      })
    default:
      return tasks
  }
}

// Tipos de filtros disponíveis
export type FilterType = "todas" | "pendentes" | "concluidas" | "vencidas" | "hoje"

// Tipo para notificações
export interface Notificacao {
  id: number
  tipo: "vencimento" | "horario"
  tarefa: Task
  tempo: string // "hoje", "amanhã", "em X minutos"
}

// Componente de Toast personalizado
export interface ToastProps {
  title: string
  description: string
  action?: React.ReactNode
  duration?: number
  onClose?: () => void
}

// Função para detectar conflitos de horário
function detectarConflitosHorario(tasks: Task[]) {
  const conflicts: Array<{
    task1: Task
    task2: Task
    overlap: string
  }> = []

  const tasksComHorario = tasks.filter((task) => task.horaInicio && task.horaFim && !task.feita && task.dataVencimento)

  for (let i = 0; i < tasksComHorario.length; i++) {
    for (let j = i + 1; j < tasksComHorario.length; j++) {
      const task1 = tasksComHorario[i]
      const task2 = tasksComHorario[j]

      // Verificar se são do mesmo dia
      if (task1.dataVencimento !== task2.dataVencimento) continue

      const [hora1Inicio, min1Inicio] = task1.horaInicio!.split(":").map(Number)
      const [hora1Fim, min1Fim] = task1.horaFim!.split(":").map(Number)
      const [hora2Inicio, min2Inicio] = task2.horaInicio!.split(":").map(Number)
      const [hora2Fim, min2Fim] = task2.horaFim!.split(":").map(Number)

      const inicio1 = hora1Inicio * 60 + min1Inicio
      const fim1 = hora1Fim * 60 + min1Fim
      const inicio2 = hora2Inicio * 60 + min2Inicio
      const fim2 = hora2Fim * 60 + min2Fim

      // Verificar sobreposição
      if (inicio1 < fim2 && inicio2 < fim1) {
        const inicioSobreposicao = Math.max(inicio1, inicio2)
        const fimSobreposicao = Math.min(fim1, fim2)
        const duracaoSobreposicao = fimSobreposicao - inicioSobreposicao

        const horasConflito = Math.floor(duracaoSobreposicao / 60)
        const minutosConflito = duracaoSobreposicao % 60

        let overlapText = ""
        if (horasConflito > 0) {
          overlapText += `${horasConflito}h`
        }
        if (minutosConflito > 0) {
          overlapText += `${minutosConflito}min`
        }

        conflicts.push({
          task1,
          task2,
          overlap: overlapText,
        })
      }
    }
  }

  return conflicts
}

export default function Home() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [filtroAtual, setFiltroAtual] = useState<FilterType>("todas")
  const [filtroCategoria, setFiltroCategoria] = useState<TaskCategory | "todas">("todas")
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [showStats, setShowStats] = useState(false)
  const [notificacoesPermitidas, setNotificacoesPermitidas] = useState(false)
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const [subtaskModalOpen, setSubtaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [conflicts, setConflicts] = useState<
    Array<{
      task1: Task
      task2: Task
      overlap: string
    }>
  >([])
  const [showConflicts, setShowConflicts] = useState(false)
  const notificacaoIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Função para mostrar toast
  const showToast = (toast: ToastProps) => {
    const toastWithDefaults = {
      ...toast,
      duration: toast.duration || 5000,
    }
    setToasts((prevToasts) => [...prevToasts, toastWithDefaults])

    // Remover o toast após a duração
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t !== toastWithDefaults))
      if (toast.onClose) toast.onClose()
    }, toastWithDefaults.duration)
  }

  // Verificar conflitos sempre que as tarefas mudarem
  useEffect(() => {
    const detectedConflicts = detectarConflitosHorario(tasks)
    setConflicts(detectedConflicts)

    // Mostrar alerta se houver novos conflitos
    if (detectedConflicts.length > 0 && !showConflicts) {
      setShowConflicts(true)
    }
  }, [tasks])

  // Solicitar permissão para notificações
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificacoesPermitidas(true)
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          setNotificacoesPermitidas(permission === "granted")
        })
      }
    }
  }, [])

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

    const hojeFormatado = hoje.toISOString().split("T")[0]
    const amanhaFormatado = amanha.toISOString().split("T")[0]

    const notificacoesVencimento = tasks
      .filter((task) => {
        if (!task.dataVencimento || task.feita) return false
        return task.dataVencimento === hojeFormatado || task.dataVencimento === amanhaFormatado
      })
      .map((tarefa) => {
        const ehHoje = tarefa.dataVencimento === hojeFormatado

        return {
          id: tarefa.id,
          tipo: "vencimento" as const,
          tarefa,
          tempo: ehHoje ? "hoje" : "amanhã",
        }
      })

    // Verificar tarefas com horário de início próximo
    const agora = new Date()
    const horaAtual = agora.getHours()
    const minutoAtual = agora.getMinutes()
    const dataAtual = agora.toISOString().split("T")[0]

    const notificacoesHorario = tasks
      .filter((task) => {
        if (!task.horaInicio || task.feita || task.notificada) return false
        if (task.dataVencimento && task.dataVencimento !== dataAtual) return false

        const [horaInicio, minutoInicio] = task.horaInicio.split(":").map(Number)

        // Calcular a diferença em minutos
        const minutosTotaisAtual = horaAtual * 60 + minutoAtual
        const minutosTotaisInicio = horaInicio * 60 + minutoInicio
        const diferencaMinutos = minutosTotaisInicio - minutosTotaisAtual

        // Notificar se a tarefa começa em menos de 30 minutos e ainda não começou
        return diferencaMinutos > 0 && diferencaMinutos <= 30
      })
      .map((tarefa) => {
        const [horaInicio, minutoInicio] = tarefa.horaInicio!.split(":").map(Number)

        // Calcular a diferença em minutos
        const minutosTotaisAtual = horaAtual * 60 + minutoAtual
        const minutosTotaisInicio = horaInicio * 60 + minutoInicio
        const diferencaMinutos = minutosTotaisInicio - minutosTotaisAtual

        return {
          id: tarefa.id,
          tipo: "horario" as const,
          tarefa,
          tempo: `em ${diferencaMinutos} minutos`,
        }
      })

    setNotificacoes([...notificacoesVencimento, ...notificacoesHorario])
  }, [tasks])

  // Configurar verificação periódica para notificações de horário
  useEffect(() => {
    // Limpar intervalo anterior se existir
    if (notificacaoIntervalRef.current) {
      clearInterval(notificacaoIntervalRef.current)
    }

    // Verificar a cada minuto se há tarefas próximas do horário de início
    notificacaoIntervalRef.current = setInterval(() => {
      const agora = new Date()
      const horaAtual = agora.getHours()
      const minutoAtual = agora.getMinutes()
      const dataAtual = agora.toISOString().split("T")[0]

      tasks.forEach((task) => {
        if (task.feita || task.notificada || !task.horaInicio) return
        if (task.dataVencimento && task.dataVencimento !== dataAtual) return

        const [horaInicio, minutoInicio] = task.horaInicio.split(":").map(Number)

        // Calcular a diferença em minutos
        const minutosTotaisAtual = horaAtual * 60 + minutoAtual
        const minutosTotaisInicio = horaInicio * 60 + minutoInicio
        const diferencaMinutos = minutosTotaisInicio - minutosTotaisAtual

        // Notificar se a tarefa começa em 15 minutos ou 5 minutos
        if ((diferencaMinutos === 15 || diferencaMinutos === 5) && notificacoesPermitidas) {
          // Enviar notificação do navegador
          const notification = new Notification("Lembrete de Tarefa", {
            body: `A tarefa "${task.titulo}" começa em ${diferencaMinutos} minutos (${task.horaInicio})`,
            icon: "/favicon.ico",
          })

          // Mostrar toast na interface
          showToast({
            title: "Tarefa próxima de começar",
            description: `"${task.titulo}" começa em ${diferencaMinutos} minutos (${task.horaInicio})`,
            action: (
              <button
                onClick={() => {
                  // Ação para ver a tarefa
                  const taskElement = document.getElementById(`task-${task.id}`)
                  if (taskElement) {
                    taskElement.scrollIntoView({ behavior: "smooth", block: "center" })
                    taskElement.classList.add("highlight-task")
                    setTimeout(() => {
                      taskElement.classList.remove("highlight-task")
                    }, 2000)
                  }
                }}
                className="toast-action-button"
              >
                Ver
              </button>
            ),
          })

          // Marcar como notificada se estiver a 5 minutos do início
          if (diferencaMinutos === 5) {
            dispatch({ type: "MARCAR_NOTIFICADA", id: task.id })
          }
        }
      })
    }, 60000) // Verificar a cada minuto

    // Limpar intervalo ao desmontar
    return () => {
      if (notificacaoIntervalRef.current) {
        clearInterval(notificacaoIntervalRef.current)
      }
    }
  }, [tasks, notificacoesPermitidas])

  // Alternar entre temas claro e escuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  }

  // Solicitar permissão para notificações
  const solicitarPermissaoNotificacoes = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificacoesPermitidas(permission === "granted")

        if (permission === "granted") {
          showToast({
            title: "Notificações ativadas",
            description: "Você receberá alertas quando suas tarefas estiverem próximas de começar.",
          })
        }
      })
    }
  }

  // Handlers para as ações
  const handleAddTask = (
    titulo: string,
    dataVencimento?: string,
    horaInicio?: string,
    horaFim?: string,
    categoria: TaskCategory = "outro",
  ) => {
    dispatch({
      type: "ADICIONAR_TAREFA",
      titulo,
      dataVencimento,
      horaInicio,
      horaFim,
      categoria,
    })
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

  const handleOpenSubtaskModal = (task: Task) => {
    setSelectedTask(task)
    setSubtaskModalOpen(true)
  }

  const handleCloseSubtaskModal = () => {
    setSubtaskModalOpen(false)
    setSelectedTask(null)
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
    const hojeFormatado = new Date().toISOString().split("T")[0]

    // Primeiro filtramos por status
    let tarefasFiltradas = tasks.filter((task) => {
      if (filtroAtual === "todas") return true
      if (filtroAtual === "pendentes") return !task.feita
      if (filtroAtual === "concluidas") return task.feita

      if (filtroAtual === "vencidas") {
        if (!task.dataVencimento || task.feita) return false
        // Comparar diretamente as strings de data
        return task.dataVencimento < hojeFormatado
      }

      if (filtroAtual === "hoje") {
        if (!task.dataVencimento) return false
        // Comparar diretamente as strings de data
        return task.dataVencimento === hojeFormatado
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
              <NotificationBell
                notificacoes={notificacoes}
                notificacoesPermitidas={notificacoesPermitidas}
                solicitarPermissao={solicitarPermissaoNotificacoes}
              />
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>

          {showStats && <TaskStatistics tasks={tasks} />}

          {/* Alerta de conflitos */}
          {showConflicts && conflicts.length > 0 && (
            <ConflictAlert conflicts={conflicts} onClose={() => setShowConflicts(false)} />
          )}

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
            onOpenSubtaskModal={handleOpenSubtaskModal}
          />

          {/* Modal de subtarefas */}
          {selectedTask && (
            <SubtaskModal
              task={selectedTask}
              isOpen={subtaskModalOpen}
              onClose={handleCloseSubtaskModal}
              onAddSubTask={handleAddSubTask}
              onToggleSubTask={handleToggleSubTask}
              onDeleteSubTask={handleDeleteSubTask}
            />
          )}

          {/* Sistema de Toast personalizado */}
          {toasts.length > 0 && (
            <div className="toast-container">
              {toasts.map((toast, index) => (
                <div key={index} className="toast">
                  <div className="toast-header">
                    <div className="toast-title">{toast.title}</div>
                    <button
                      className="toast-close"
                      onClick={() => {
                        setToasts((prevToasts) => prevToasts.filter((_, i) => i !== index))
                        if (toast.onClose) toast.onClose()
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="toast-body">{toast.description}</div>
                  {toast.action && <div className="toast-action">{toast.action}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
