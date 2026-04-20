import { defineManifest } from "@crxjs/vite-plugin";

const DEFAULT_API_BASE_URL = "https://fmndxwcgyzevetcoizwd.supabase.co";

const resolveApiHostPermission = (): string => {
  const candidate = process.env.VITE_UNRAVEL_API_BASE_URL ?? DEFAULT_API_BASE_URL;

  try {
    return `${new URL(candidate).origin}/*`;
  } catch {
    return `${new URL(DEFAULT_API_BASE_URL).origin}/*`;
  }
};

/** Run on any HTTPS/HTTP page so JSON-LD + generic PDP extraction works on all stores. */
const universalPageMatches = ["https://*/*", "http://*/*"];


export default defineManifest({
  manifest_version: 3,
  name: "Unravel",
  description: "The sustainability of your clothes, unraveled right where you shop.",
  version: "0.1.0",
  permissions: ["activeTab", "storage", "sidePanel"],
  host_permissions: [...new Set([...universalPageMatches, resolveApiHostPermission()])],
  action: {
    default_title: "Unravel",
    default_popup: "src/popup/index.html"
  },
  side_panel: {
    default_path: "src/popup/index.html"
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: universalPageMatches,
      js: ["src/content/content-script.ts"],
      run_at: "document_idle"
    }
  ]
});
