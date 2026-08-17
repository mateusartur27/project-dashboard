// Envia cada JSON em private-data/ (não versionado) para a chave
// correspondente no KV DASHBOARD_DATA. Rode depois de editar qualquer
// arquivo em private-data/, ou depois que docs do sistema de origem
// mudarem. Sem `--remote`, aplica só no KV local do `wrangler pages dev`.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";

const remote = process.argv.includes("--remote");
const files = readdirSync("private-data").filter((name) => name.endsWith(".json"));

if (files.length === 0) {
  console.error("private-data/ está vazio — nada para sincronizar.");
  process.exit(1);
}

for (const file of files) {
  const key = file.replace(/\.json$/, "");
  const args = [
    "wrangler",
    "kv",
    "key",
    "put",
    "--binding=DASHBOARD_DATA",
    key,
    `--path=private-data/${file}`,
    ...(remote ? ["--remote"] : ["--local"]),
  ];
  console.log(`> ${key}${remote ? " (remote)" : " (local)"}`);
  execFileSync("npx", args, { stdio: "inherit", shell: true });
}
