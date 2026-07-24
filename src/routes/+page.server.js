import { getHosts } from "$lib/server/hosts";

/** @type {import("./$types").PageServerLoad} */
export function load() {
  return { hosts: getHosts() };
}
