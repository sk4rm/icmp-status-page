import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { json } from "@sveltejs/kit";

const execFileAsync = promisify(execFile);
const hosts = ["192.168.31.125", "192.168.31.169", "192.168.31.1"];
const pingTimeout = 1500;

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

/** @type {import("./$types").RequestHandler} */
export async function GET() {
  return json(await Promise.all(hosts.map(getHostStatus)), {
    headers: { "Cache-Control": "no-store" },
  });
}
