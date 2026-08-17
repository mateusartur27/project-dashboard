import { GroupedCardGrid } from "../../components/GroupedCardGrid";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useRemoteData } from "../../hooks/useRemoteData";
import type { RulesData } from "../../data/rules";
import type { ArchitectureData } from "../../data/types";
import { RuleCard } from "./RuleCard";
import "./rules-page.css";

export function RulesPage() {
  const rulesState = useRemoteData<RulesData>("rules");
  const architectureState = useRemoteData<ArchitectureData>("architecture");

  if (rulesState.kind === "loading" || architectureState.kind === "loading") {
    return <LoadingNote label="Carregando regras e arquitetura…" />;
  }

  if (rulesState.kind === "error") {
    return <ErrorNote message={rulesState.message} />;
  }

  if (architectureState.kind === "error") {
    return <ErrorNote message={architectureState.message} />;
  }

  const { rules, checklist } = rulesState.data;
  const architecture = architectureState.data;

  return (
    <div>
      <GroupedCardGrid
        heading="Regras e arquitetura"
        intro="As regras que qualquer mudança no sistema precisa seguir, e um resumo básico de como o sistema é montado."
        groups={[
          {
            key: "rules",
            title: "Regras não negociáveis",
            description: "Valem para qualquer mudança de código, humana ou por IA.",
            items: rules,
          },
        ]}
        renderItem={(rule) => <RuleCard key={rule.id} rule={rule} />}
      />

      <section className="rules-checklist">
        <h2>Checklist obrigatório em toda mudança</h2>
        <ol>
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="architecture-overview">
        <h2>Arquitetura, de forma básica</h2>

        <div className="architecture-style">
          <span className="architecture-style-label">{architecture.style.label}</span>
          <p>{architecture.style.detail}</p>
        </div>

        <div className="architecture-block">
          <h3>Princípios</h3>
          <ul>
            {architecture.principles.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </div>

        <div className="architecture-block">
          <h3>Dois repositórios</h3>
          <div className="architecture-repos">
            {architecture.repos.map((repo) => (
              <div key={repo.name} className="architecture-repo-card">
                <div className="architecture-repo-name">{repo.name}</div>
                <div className="architecture-repo-stack">{repo.stack}</div>
                <p>{repo.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="architecture-block">
          <h3>Estado e armazenamento</h3>
          <div className="architecture-storage">
            {architecture.storage.map((item) => (
              <div key={item.name} className="architecture-storage-item">
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="architecture-block">
          <h3>Fluxo de uma execução</h3>
          <ol className="architecture-flow">
            {architecture.flow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
