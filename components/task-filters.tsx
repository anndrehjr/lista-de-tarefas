"use client"

import type { FilterType, TaskCategory } from "../app/page"

interface TaskFiltersProps {
  filtroAtual: FilterType
  setFiltroAtual: (filtro: FilterType) => void
  filtroCategoria: TaskCategory | "todas"
  setFiltroCategoria: (categoria: TaskCategory | "todas") => void
}

export default function TaskFilters({
  filtroAtual,
  setFiltroAtual,
  filtroCategoria,
  setFiltroCategoria,
}: TaskFiltersProps) {
  return (
    <div className="filters-container">
      <div className="filters-section">
        <h3 className="filters-title">Status</h3>
        <div className="filter-buttons">
          <button
            className={`filter-button ${filtroAtual === "todas" ? "active" : ""}`}
            onClick={() => setFiltroAtual("todas")}
          >
            Todas
          </button>
          <button
            className={`filter-button ${filtroAtual === "pendentes" ? "active" : ""}`}
            onClick={() => setFiltroAtual("pendentes")}
          >
            Pendentes
          </button>
          <button
            className={`filter-button ${filtroAtual === "concluidas" ? "active" : ""}`}
            onClick={() => setFiltroAtual("concluidas")}
          >
            Concluídas
          </button>
          <button
            className={`filter-button ${filtroAtual === "vencidas" ? "active" : ""}`}
            onClick={() => setFiltroAtual("vencidas")}
          >
            Vencidas
          </button>
          <button
            className={`filter-button ${filtroAtual === "hoje" ? "active" : ""}`}
            onClick={() => setFiltroAtual("hoje")}
          >
            Hoje
          </button>
        </div>
      </div>

      <div className="filters-section">
        <h3 className="filters-title">Categorias</h3>
        <div className="category-filters">
          <button
            className={`category-filter ${filtroCategoria === "todas" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("todas")}
          >
            Todas
          </button>
          <button
            className={`category-filter category-trabalho ${filtroCategoria === "trabalho" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("trabalho")}
          >
            Trabalho
          </button>
          <button
            className={`category-filter category-pessoal ${filtroCategoria === "pessoal" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("pessoal")}
          >
            Pessoal
          </button>
          <button
            className={`category-filter category-estudo ${filtroCategoria === "estudo" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("estudo")}
          >
            Estudo
          </button>
          <button
            className={`category-filter category-saúde ${filtroCategoria === "saúde" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("saúde")}
          >
            Saúde
          </button>
          <button
            className={`category-filter category-outro ${filtroCategoria === "outro" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("outro")}
          >
            Outro
          </button>
        </div>
      </div>
    </div>
  )
}
