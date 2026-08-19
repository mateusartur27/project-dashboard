import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GroupedCardGrid } from "../../components/GroupedCardGrid";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { StalenessNotice } from "../../components/StalenessNotice";
import { SearchField } from "../../components/SearchField";
import { useRemoteData } from "../../hooks/useRemoteData";
import { useModuleRegistry } from "../../hooks/useModuleRegistry";
import { matchesSearch } from "../../lib/search";
import { modulesByPhase, type ModulesData } from "../../data/modules";
import { deriveUsesModuleIds, isModuleUsedByChannel } from "../../data/channels";
import { fetchChannelDetail, fetchChannelSummaries } from "../../lib/liveChannels";
import type { LiveChannelSummary } from "../../data/types";
import { ModuleCard } from "./ModuleCard";
import { ChannelFilter } from "./ChannelFilter";

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const modulesState = useRemoteData<ModulesData>("modules");
  const mappingState = useModuleRegistry();

  const [channels, setChannels] = useState<LiveChannelSummary[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(() => searchParams.get("channel"));
  const [usedModuleIds, setUsedModuleIds] = useState<string[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchChannelSummaries()
      .then(setChannels)
      .catch(() => setChannels([]));
  }, []);

  useEffect(() => {
    if (!selectedChannelId || mappingState.kind !== "ready") {
      setUsedModuleIds(null);
      return;
    }
    let cancelled = false;
    const usesToModule = mappingState.data;
    fetchChannelDetail(selectedChannelId)
      .then((channel) => {
        if (cancelled) return;
        setUsedModuleIds(channel ? deriveUsesModuleIds(usesToModule, channel.config.pipeline) : []);
      })
      .catch(() => {
        if (!cancelled) setUsedModuleIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedChannelId, mappingState]);

  if (modulesState.kind === "loading" || mappingState.kind === "loading") {
    return <LoadingNote label="Carregando módulos…" />;
  }

  if (modulesState.kind === "error") {
    return <ErrorNote message={modulesState.message} />;
  }

  if (mappingState.kind === "error") {
    return <ErrorNote message={mappingState.message} />;
  }

  const filteredModules = modulesState.data.modules.filter((module) =>
    matchesSearch(search, module.name, module.summary, module.id, module.sourcePath),
  );
  const groups = modulesByPhase({ ...modulesState.data, modules: filteredModules }).map((group) => ({
    key: group.phase.id,
    title: group.phase.label,
    description: group.phase.description,
    items: group.modules,
  }));

  return (
    <GroupedCardGrid
      heading="Módulos do sistema"
      intro="Cada card é um módulo real do control plane, agrupado pela fase do pipeline declarativo que ele implementa. Clique em um card para ver entrada, saída, consumidores e as decisões que o restringem."
      controls={
        <>
          <SearchField value={search} onChange={setSearch} placeholder="Pesquisar módulos…" />
          <StalenessNotice docKey="modules" />
          <ChannelFilter channels={channels} selected={selectedChannelId} onChange={setSelectedChannelId} />
        </>
      }
      groups={groups}
      renderItem={(module) => (
        <ModuleCard
          key={module.id}
          module={module}
          dimmed={usedModuleIds ? !isModuleUsedByChannel(module.id, usedModuleIds) : false}
        />
      )}
    />
  );
}
