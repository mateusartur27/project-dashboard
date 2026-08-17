import type { ReactNode } from "react";
import "./grouped-card-grid.css";

export interface CardGroup<T> {
  key: string;
  title: string;
  description: string;
  items: T[];
}

export function GroupedCardGrid<T>({
  heading,
  intro,
  controls,
  groups,
  renderItem,
}: {
  heading: string;
  intro: string;
  controls?: ReactNode;
  groups: Array<CardGroup<T>>;
  renderItem: (item: T) => ReactNode;
}) {
  return (
    <div className="grouped-grid">
      <div className="grouped-grid-intro">
        <h1>{heading}</h1>
        <p>{intro}</p>
      </div>

      {controls}

      {groups.map((group) => (
        <section key={group.key} className="grouped-grid-section">
          <div className="grouped-grid-header">
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className="grouped-grid-cards">{group.items.map((item) => renderItem(item))}</div>
        </section>
      ))}
    </div>
  );
}
