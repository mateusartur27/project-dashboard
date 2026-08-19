import "./search-field.css";

export function SearchField({
  value,
  onChange,
  placeholder = "Pesquisar…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-field">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="search-field-input"
        aria-label={placeholder}
      />
      {value && (
        <button type="button" className="search-field-clear" onClick={() => onChange("")} aria-label="Limpar pesquisa">
          ×
        </button>
      )}
    </div>
  );
}
