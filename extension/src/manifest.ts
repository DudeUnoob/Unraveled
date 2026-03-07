import { defineManifest } from "@crxjs/vite-plugin";

<<<<<<< Updated upstream
=======
const DEFAULT_API_BASE_URL = "https://fmndxwcgyzevetcoizwd.supabase.co";

const resolveApiHostPermission = (): string => {
  const candidate = process.env.VITE_UNRAVEL_API_BASE_URL ?? DEFAULT_API_BASE_URL;

  try {
    return `${new URL(candidate).origin}/*`;
  } catch {
    return `${new URL(DEFAULT_API_BASE_URL).origin}/*`;
  }
};

const retailerHostPermissions = [
  "https://www.zara.com/*",
  "https://www2.hm.com/*",
  "https://www.asos.com/*",
  "https://us.shein.com/*",
  "https://www.shein.com/*",
  "https://www.amazon.com/*"
];

>>>>>>> Stashed changes
export default defineManifest({
  manifest_version: 3,
  name: "Unravel",
  description: "The sustainability of your clothes, unraveled right where you shop.",
  version: "0.1.0",
  permissions: ["activeTab", "storage", "sidePanel"],
  host_permissions: [
    "https://www.zara.com/*",
    "https://www2.hm.com/*",
    "https://www.asos.com/*",
    "https://us.shein.com/*",
    "https://www.shein.com/*",
    "https://www.amazon.com/*"
  ],
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
      matches: [
        "https://www.zara.com/*",
        "https://www2.hm.com/*",
        "https://www.asos.com/*",
        "https://us.shein.com/*",
        "https://www.shein.com/*",
        "https://www.amazon.com/*"
      ],
      js: ["src/content/content-script.ts"],
      run_at: "document_idle"
    }
  ]
});
