export type PipelinePhase =
  | "foundation"
  | "research"
  | "planning"
  | "music"
  | "narration"
  | "media"
  | "alignment"
  | "manifest"
  | "render"
  | "publish"
  | "orchestration"
  | "infra";

export interface PhaseInfo {
  id: PipelinePhase;
  label: string;
  description: string;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  phase: PipelinePhase;
  sourcePath: string;
  summary: string;
  input: string;
  output: string;
  consumers: string;
  constraints: string;
  notes?: string;
}

export type ImprovementStatus = "resolved" | "mitigated" | "open";

export type ImprovementCategoryId =
  | "media"
  | "content"
  | "audio"
  | "capacity"
  | "operations"
  | "editing"
  | "publishing"
  | "engagement";

export interface ImprovementCategoryInfo {
  id: ImprovementCategoryId;
  label: string;
  description: string;
}

export interface ImprovementDefinition {
  id: string;
  title: string;
  category: ImprovementCategoryId;
  status: ImprovementStatus;
  summary: string;
  detail: string;
  requestedBy?: string;
}

export interface LiveChannelSummary {
  channelId: string;
  revision: string;
  name: string;
  enabled: boolean;
  registeredAt: string;
}

export interface LiveChannelConfig {
  channel: {
    id: string;
    name: string;
    enabled: boolean;
    locale: string;
    timezone: string;
    metadata?: { platform?: string };
  };
  schedule: {
    generation: { cron: string; catchUp: string };
    publication: { slots: string[] };
  };
  batch: { videosPerRun: number; maxParallelVideos: number };
  production: {
    content: { durationSeconds: { min: number; target: number; max: number } };
    video: { width: number; height: number; fps: number; codec: string };
  };
  pipeline: Array<{ id: string; uses: string }>;
}

export interface LiveChannelDetail {
  channelId: string;
  revision: string;
  registeredAt: string;
  config: LiveChannelConfig;
}

export interface ModuleConfigurationSetting {
  label: string;
  value: string;
}

export interface RuleDefinition {
  id: string;
  title: string;
  rule: string;
  source: string;
}

export interface ModuleConfiguration {
  id: string;
  moduleId: string;
  stepId: string;
  usesIdentifier: string;
  channelId: string;
  channelName: string;
  summary: string;
  settings: ModuleConfigurationSetting[];
}

export interface ArchitectureData {
  style: { label: string; detail: string };
  principles: string[];
  repos: Array<{ name: string; stack: string; description: string }>;
  storage: Array<{ name: string; description: string }>;
  flow: string[];
}

export interface ChannelMappingData {
  usesToModuleId: Record<string, string>;
  alwaysOnModuleIds: string[];
}
