import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { EntityCardBadge } from "./EntityCard";
import "./entity-detail.css";

export interface EntityDetailField {
  label: string;
  value: string;
}

export interface EntityDetailHighlight {
  label: string;
  text: string;
  tone?: "warn" | "ok";
}

export function EntityDetail({
  backTo,
  backLabel,
  categoryLabel,
  badge,
  title,
  summary,
  meta,
  fields,
  highlight,
  actions,
}: {
  backTo: string;
  backLabel: string;
  categoryLabel?: string;
  badge?: EntityCardBadge;
  title: string;
  summary: string;
  meta?: string;
  fields: EntityDetailField[];
  highlight?: EntityDetailHighlight;
  actions?: ReactNode;
}) {
  return (
    <div className="entity-detail">
      <div className="entity-detail-topbar">
        <Link to={backTo} className="entity-detail-back">
          ← {backLabel}
        </Link>
        {actions}
      </div>

      <header className="entity-detail-header">
        <div className="entity-detail-tags">
          {categoryLabel && <span className="entity-detail-phase">{categoryLabel}</span>}
          {badge && <span className={`entity-card-badge entity-card-badge-${badge.tone}`}>{badge.label}</span>}
        </div>
        <h1>{title}</h1>
        <p>{summary}</p>
        {meta && <code className="entity-detail-path">{meta}</code>}
      </header>

      <div className="entity-detail-grid">
        {fields.map((field) => (
          <div key={field.label} className="entity-detail-field">
            <h3>{field.label}</h3>
            <p>{field.value}</p>
          </div>
        ))}
      </div>

      {highlight && (
        <div className={`entity-detail-highlight entity-detail-highlight-${highlight.tone ?? "warn"}`}>
          <h3>{highlight.label}</h3>
          <p>{highlight.text}</p>
        </div>
      )}
    </div>
  );
}
