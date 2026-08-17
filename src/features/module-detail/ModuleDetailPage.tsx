import { Navigate, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useRemoteData } from "../../hooks/useRemoteData";
import { getModuleById, getPhaseInfo, type ModulesData } from "../../data/modules";
import { getConfigurationsForModule } from "../../data/moduleConfigurations";
import type { ModuleConfiguration } from "../../data/types";
import { ConfigurationCard } from "../configurations/ConfigurationCard";
import "./module-configurations.css";

const NO_CONFIG_REASON: Record<string, string> = {
  "channel-config": "Valida qualquer canal, antes mesmo do DAG existir — não recebe configuração de um canal específico.",
  "channel-registry": "Registra qualquer canal validado — não recebe configuração de um canal específico.",
  scheduler: "Agenda qualquer canal pelo cron declarado — não tem etapa própria com bloco `with`.",
  persistence: "Infraestrutura usada por toda etapa de todo canal — não é configurada por um canal específico.",
  "pipeline-orchestrator": "Resolve o DAG de qualquer canal — não tem bloco `with` próprio.",
  "pipeline-runtime": "Liga `uses` a módulo para qualquer canal — não tem bloco `with` próprio.",
  "video-run-coordination": "Agrega status de execução de qualquer canal — não tem bloco `with` próprio.",
  "media-fetch": "Acionado internamente por `footage-acquisition` via service binding — não tem etapa própria no DAG do canal.",
  "chunked-narration": "Nenhum canal real declara `requestMode: chunked` ainda — ver Melhorias e o filtro por canal na listagem de módulos.",
};

export function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const modulesState = useRemoteData<ModulesData>("modules");
  const configurationsState = useRemoteData<ModuleConfiguration[]>("configurations");

  if (modulesState.kind === "loading" || configurationsState.kind === "loading") {
    return <LoadingNote label="Carregando módulo…" />;
  }

  if (modulesState.kind === "error") {
    return <ErrorNote message={modulesState.message} />;
  }

  if (configurationsState.kind === "error") {
    return <ErrorNote message={configurationsState.message} />;
  }

  const module = moduleId ? getModuleById(modulesState.data, moduleId) : undefined;
  if (!module) {
    return <Navigate to="/modules" replace />;
  }

  const phase = getPhaseInfo(modulesState.data, module.phase);
  const configurations = getConfigurationsForModule(configurationsState.data, module.id);

  return (
    <div>
      <EntityDetail
        backTo="/modules"
        backLabel="Todos os módulos"
        categoryLabel={phase?.label}
        title={module.name}
        summary={module.summary}
        meta={module.sourcePath}
        fields={[
          { label: "Entra", value: module.input },
          { label: "Sai", value: module.output },
          { label: "Consumidores", value: module.consumers },
          { label: "Preso por", value: module.constraints },
        ]}
        highlight={module.notes ? { label: "Limitação conhecida", text: module.notes, tone: "warn" } : undefined}
      />

      <section className="module-configurations">
        <h2>Configurações por canal</h2>
        {configurations.length > 0 ? (
          <>
            <p className="module-configurations-intro">
              O módulo é o mesmo; o que muda por canal é o bloco <code>with</code> declarado no JSON. Clique num card para ver
              os valores completos.
            </p>
            <div className="module-configurations-grid">
              {configurations.map((configuration) => (
                <ConfigurationCard key={configuration.id} configuration={configuration} />
              ))}
            </div>
          </>
        ) : (
          <p className="module-configurations-empty">{NO_CONFIG_REASON[module.id] ?? "Sem configuração declarada por canal."}</p>
        )}
      </section>
    </div>
  );
}
