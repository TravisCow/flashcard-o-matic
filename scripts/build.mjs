import { build } from "esbuild";
import { mkdir, copyFile } from "node:fs/promises";
await mkdir("build", { recursive: true });
await build({
  entryPoints: ["src/index.js"],
  bundle: true,
  minify: true,
  outdir: "build",
  entryNames: "app",
  loader: { ".js": "jsx" },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.REACT_APP_DEMO": JSON.stringify(
      process.argv.includes("--demo") ? "true" : "false",
    ),
    "process.env.REACT_APP_API_BASE_URL": JSON.stringify(
      process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
    ),
  },
});
await copyFile("public/index.html", "build/index.html");
console.log(
  "Built " +
    (process.argv.includes("--demo")
      ? "browser demo"
      : "local HTTP API client"),
);
