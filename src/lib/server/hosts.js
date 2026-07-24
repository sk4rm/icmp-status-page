import hostsYaml from "../../../hosts.yaml?raw";
import { parse } from "yaml";

/** @type {unknown} */
const config = parse(hostsYaml);

if (
  typeof config !== "object" ||
  config === null ||
  !("hosts" in config) ||
  !Array.isArray(config.hosts) ||
  config.hosts.length === 0 ||
  !config.hosts.every((host) => typeof host === "string" && host.trim())
) {
  throw new Error("hosts.yaml must contain a non-empty list of host strings");
}

const hosts = Object.freeze(
  [...new Set(config.hosts.map((host) => host.trim()))],
);

export function getHosts() {
  return [...hosts];
}
