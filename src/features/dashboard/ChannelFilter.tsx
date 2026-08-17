import type { LiveChannelSummary } from "../../data/types";
import "./channel-filter.css";

export function ChannelFilter({
  channels,
  selected,
  onChange,
}: {
  channels: LiveChannelSummary[];
  selected: string | null;
  onChange: (channelId: string | null) => void;
}) {
  return (
    <div className="channel-filter">
      <span className="channel-filter-label">Filtrar por canal</span>
      <div className="channel-filter-options">
        <button
          type="button"
          className={`channel-filter-pill ${selected === null ? "channel-filter-pill-active" : ""}`}
          onClick={() => onChange(null)}
        >
          Todos
        </button>
        {channels.map((channel) => (
          <button
            key={channel.channelId}
            type="button"
            className={`channel-filter-pill ${selected === channel.channelId ? "channel-filter-pill-active" : ""}`}
            onClick={() => onChange(channel.channelId)}
          >
            {channel.name}
          </button>
        ))}
      </div>
    </div>
  );
}
