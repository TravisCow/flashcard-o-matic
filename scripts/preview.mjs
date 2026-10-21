import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const file =
      pathname === "/app.js"
        ? "app.js"
        : pathname === "/app.css"
          ? "app.css"
          : "index.html";
    const content = await readFile(
      new URL("../build/" + file, import.meta.url),
    );
    res.writeHead(200, {
      "Content-Type": file.endsWith(".js")
        ? "text/javascript"
        : file.endsWith(".css")
          ? "text/css"
          : "text/html",
    });
    res.end(content);
  } catch {
    res.writeHead(503);
    res.end("Build the application first.");
  }
}).listen(5102, "127.0.0.1", () =>
  console.log("Flashcards: http://localhost:5102/"),
);
