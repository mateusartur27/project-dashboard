import { type FormEvent, useState } from "react";
import { login } from "../../lib/auth";
import "./login-page.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await login(email, password);

    if (result.ok) {
      window.location.assign("/");
      return;
    }

    setError(result.error ?? "Não foi possível entrar.");
    setSubmitting(false);
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="shell-brand-mark">◆</span>
          <span>Painel de Sistemas</span>
        </div>
        <p className="login-subtitle">Entre para ver os módulos e o status ao vivo.</p>

        <label className="login-field">
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="login-field">
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="login-submit" disabled={submitting}>
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
