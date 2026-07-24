import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { createServer as createViteServer } from "vite";

const execFileAsync = promisify(execFile);
const hosts = ["192.168.31.125", "192.168.31.169", "192.168.31.1"];
const pingTimeout = 1500;
const production = process.argv.includes("--production");
const hostname = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 5173);
const distributionDirectory = resolve("dist");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

/** @param {string} host */
function getPingArguments(host) {
  if (process.platform === "win32") {
    return ["-n", "1", "-w", String(pingTimeout), host];
  }

  if (process.platform === "darwin") {
    return ["-c", "1", "-W", String(pingTimeout), host];
  }

  return ["-c", "1", "-W", String(Math.ceil(pingTimeout / 1000)), host];
}

/** @param {string} host */
async function getHostStatus(host) {
  try {
    await execFileAsync("ping", getPingArguments(host), {
      timeout: pingTimeout + 500,
      windowsHide: true,
    });

    return { host, status: "online" };
  } catch {
    return { host, status: "offline" };
  }
}

/**
 * @param {import("node:http").ServerResponse} response
 * @param {number} status
 * @param {unknown} body
 */
function sendJson(response, status, body) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

/**
 * @param {string} pathname
 * @param {import("node:http").ServerResponse} response
 */
async function serveStatic(pathname, response) {
  const requestedPath =
    pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
  let filePath = resolve(join(distributionDirectory, requestedPath));

  if (
    filePath !== distributionDirectory &&
    !filePath.startsWith(distributionDirectory + sep)
  ) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
    });
    response.end(file);
  } catch {
    filePath = join(distributionDirectory, "index.html");

    try {
      const file = await readFile(filePath);
      response.writeHead(200, { "Content-Type": mimeTypes[".html"] });
      response.end(file);
    } catch {
      response.writeHead(404);
      response.end("Build not found. Run pnpm build first.");
    }
  }
}

const vite = production
  ? null
  : await createViteServer({
      appType: "spa",
      server: { middlewareMode: true },
    });

const server = createServer(async (request, response) => {
  try {
    const url = new URL(
      request.url ?? "/",
      "http://" + (request.headers.host ?? "localhost"),
    );

    if (request.method === "GET" && url.pathname === "/api/status") {
      sendJson(response, 200, await Promise.all(hosts.map(getHostStatus)));
      return;
    }

    if (production) {
      await serveStatic(url.pathname, response);
      return;
    }

    vite.middlewares(request, response, (error) => {
      if (error) {
        console.error(error);
        response.writeHead(500);
        response.end("Internal server error");
      }
    });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Unable to check host status" });
  }
});

server.listen(port, hostname, () => {
  console.log(
    "Status page listening on http://" +
      hostname +
      ":" +
      port +
      " (" +
      (production ? "production" : "development") +
      ")",
  );
});
