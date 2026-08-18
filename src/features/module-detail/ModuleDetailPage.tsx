import { Navigate, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useRemoteData } from "../../hooks/useRemoteData";
import { useChannelList } from "../../hooks/useChannelList";
import { getModuleById, getPhaseInfo, type ModulesData } from "../../data/modules";
import { computeConfigurationGroups, groupConfigurationsByStep } from "../../data/liveConfigurations";
import type { ChannelMappingData } from "../../data/types";
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
  "caption-motion":
    "Sem etapa própria no DAG — configurado dentro de with.captions da etapa build-manifest. Veja as configurações de render-manifest.",
  "chunked-narration": "Nenhum canal real declara `requestMode: chunked` ainda — ver Melhorias e o filtro por canal na listagem de módulos.",
};

export function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const modulesState = useRemoteData<ModulesData>("modules");
  const mappingState = useRemoteData<ChannelMappingData>("channel-mapping");
  const channelListState = useChannelList();

  if (modulesState.kind === "loading") {
    return <LoadingNote label="Carregando módulo…" />;
  }

  if (modulesState.kind === "error") {
    return <ErrorNote message={modulesState.message} />;
  }

  const module = moduleId ? getModuleById(modulesState.data, moduleId) : undefined;
  if (!module) {
    return <Navigate to="/modules" replace />;
  }

  const phase = getPhaseInfo(modulesState.data, module.phase);

  const configGroupsByStep =
    mappingState.kind === "ready" && channelListState.kind === "ready"
      ? groupConfigurationsByStep(computeConfigurationGroups(module.id, mappingState.data, channelListState.channels))
      : [];

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
        <h2>Configurações existentes</h2>

        {(mappingState.kind === "loading" || channelListState.kind === "loading") && (
          <LoadingNote label="Consultando a configuração real de cada canal…" />
        )}
        {mappingState.kind === "error" && <ErrorNote message={mappingState.message} />}
        {channelListState.kind === "error" && <ErrorNote message={channelListState.message} />}

        {mappingState.kind === "ready" && channelListState.kind === "ready" && (
          configGroupsByStep.length > 0 ? (
            <>
              <p className="module-configurations-intro">
                Direto da configuração real de cada canal registrado, agora — sem cópia guardada. Canais com o mesmo
                conjunto aparecem juntos; conjuntos diferentes aparecem separados.
              </p>
              {configGroupsByStep.map(({ stepId, groups }) => (
                <div key={stepId} className="configuration-step-block">
                  <h3 className="configuration-step-title">{stepId}</h3>
                  <div className="configuration-groups">
                    {groups.map((group) => (
                      <div key={group.key} className="configuration-group-card">
                        <div className="configuration-group-header">
                          <span className="configuration-group-name">{group.name}</span>
                          <code className="configuration-group-uses">{group.usesIdentifier}</code>
                        </div>
                        <p className="configuration-group-channels">Usado por: {group.channelNames.join(", ")}</p>
                        {group.settings.length > 0 ? (
                          <dl className="configuration-group-settings">
                            {group.settings.map((setting) => (
                              <div key={setting.label} className="configuration-setting-row">
                                <dt>{setting.label}</dt>
                                <dd>{setting.value}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p className="configuration-group-empty">Sem campos em with.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="module-configurations-empty">{NO_CONFIG_REASON[module.id] ?? "Sem configuração declarada por canal."}</p>
          )
        )}
      </section>
    </div>
  );
}
