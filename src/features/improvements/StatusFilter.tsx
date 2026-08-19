import type { ImprovementStatus } from "../../data/types";
import "./status-filter.css";

const STATUS_OPTIONS: Array<{ value: ImprovementStatus; label: string }> = [
  { value: "open", label: "Aberto" },
  { value: "mitigated", label: "Mitigado" },
  { value: "resolved", label: "Resolvido" },
  { value: "pending", label: "Pendente" },
];

export function StatusFilter({
  selected,
  onChange,
}: {
  selected: ImprovementStatus[];
  onChange: (statuses: ImprovementStatus[]) => void;
}) {
  function toggle(status: ImprovementStatus) {
    onChange(selected.includes(status) ? selected.filter((s) => s !== status) : [...selected, status]);
  }

  return (
    <div className="status-filter">
      <span className="status-filter-label">Filtrar por situação</span>
      <div className="status-filter-options">
        <button
          type="button"
          className={`status-filter-pill ${selected.length === 0 ? "status-filter-pill-active" : ""}`}
          onClick={() => onChange([])}
        >
          Todas
        </button>
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`status-filter-pill ${selected.includes(option.value) ? "status-filter-pill-active" : ""}`}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
