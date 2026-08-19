import { Link } from "react-router-dom";
import "./entity-card.css";

export interface EntityCardBadge {
  label: string;
  tone: "ok" | "warn" | "neutral" | "info";
}

export function EntityCard({
  to,
  title,
  description,
  meta,
  badge,
  dimmed,
}: {
  to: string;
  title: string;
  description: string;
  meta?: string;
  badge?: EntityCardBadge;
  dimmed?: boolean;
}) {
  return (
    <Link to={to} className={`entity-card ${dimmed ? "entity-card-dimmed" : ""}`}>
      <div className="entity-card-top">
        <div className="entity-card-name">{title}</div>
        {badge && <span className={`entity-card-badge entity-card-badge-${badge.tone}`}>{badge.label}</span>}
      </div>
      <p className="entity-card-summary">{description}</p>
      {meta && (
        <div className="entity-card-footer">
          <code>{meta}</code>
        </div>
      )}
    </Link>
  );
}
