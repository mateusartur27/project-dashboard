import "./async-state.css";

export function LoadingNote({ label }: { label: string }) {
  return <p className="async-note">{label}</p>;
}

export function ErrorNote({ message }: { message: string }) {
  return <p className="async-note async-note-error">Não foi possível carregar dados ao vivo do control plane ({message}).</p>;
}
