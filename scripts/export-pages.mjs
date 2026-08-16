import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const client = resolve(root, "dist/client");
const output = resolve(root, "dist/pages");
const basePath = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}`
  : "/EVERHOME";

await mkdir(output, { recursive: true });
await cp(client, output, { recursive: true });

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("pages", Date.now().toString());
const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request("https://everhome.local/", { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) throw new Error(`Prerender failed: ${response.status}`);
let html = await response.text();
html = html
  .replaceAll('href="/_next/', `href="${basePath}/_next/`)
  .replaceAll('src="/_next/', `src="${basePath}/_next/`)
  .replaceAll('href="/favicon', `href="${basePath}/favicon`);

await writeFile(resolve(output, "index.html"), html);
await writeFile(resolve(output, "404.html"), html);
await writeFile(resolve(output, ".nojekyll"), "");
await writeFile(
  resolve(output, "version.json"),
  JSON.stringify({
    version: process.env.GITHUB_SHA || `local-${Date.now()}`,
    deployedAt: new Date().toISOString(),
  }),
);

const generated = await readFile(resolve(output, "index.html"), "utf8");
if (!generated.includes("EVERHOME") || !generated.includes(`${basePath}/_next/`)) {
  throw new Error("Generated Pages HTML failed validation");
}
console.log(`GitHub Pages export ready at ${basePath}/`);
