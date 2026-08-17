import { Navigate, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useRemoteData } from "../../hooks/useRemoteData";
import { getConfigurationById } from "../../data/moduleConfigurations";
import { getModuleById, type ModulesData } from "../../data/modules";
import type { ModuleConfiguration } from "../../data/types";

export function ConfigurationDetailPage() {
  const { configId } = useParams<{ configId: string }>();
  const configurationsState = useRemoteData<ModuleConfiguration[]>("configurations");
  const modulesState = useRemoteData<ModulesData>("modules");

  if (configurationsState.kind === "loading" || modulesState.kind === "loading") {
    return <LoadingNote label="Carregando configuração…" />;
  }

  if (configurationsState.kind === "error") {
    return <ErrorNote message={configurationsState.message} />;
  }

  if (modulesState.kind === "error") {
    return <ErrorNote message={modulesState.message} />;
  }

  const configuration = configId ? getConfigurationById(configurationsState.data, configId) : undefined;
  if (!configuration) {
    return <Navigate to="/modules" replace />;
  }

  const module = getModuleById(modulesState.data, configuration.moduleId);

  return (
    <EntityDetail
      backTo={`/modules/${configuration.moduleId}`}
      backLabel={module ? module.name : "Módulo"}
      categoryLabel={configuration.channelName}
      title={configuration.stepId}
      summary={configuration.summary}
      meta={configuration.usesIdentifier}
      fields={configuration.settings.map((setting) => ({ label: setting.label, value: setting.value }))}
    />
  );
}
