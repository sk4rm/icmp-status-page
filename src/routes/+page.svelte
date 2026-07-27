<script>
  import { onMount, untrack } from "svelte";
  import Contour from "$lib/Contour.svelte";
  import RelativeTimestamp from "$lib/RelativeTimestamp.svelte";

  /** @typedef {{ host: string, status: "checking" | "online" | "offline" }} Server */
  /** @type {import("./$types").PageProps} */
  let { data } = $props();

  /** @type {Server[]} */
  let servers = $state(
    untrack(() => data.hosts.map((host) => ({ host, status: "checking" }))),
  );

  /** @type {number | null} */
  let lastCheckedAt = $state(null);

  onMount(() => {
    let active = true;

    async function refreshStatuses() {
      try {
        const response = await fetch("/api/status", { cache: "no-store" });
        if (!response.ok) throw new Error("Status request failed");

        /** @type {Server[]} */
        const statuses = await response.json();
        if (active) servers = statuses;
      } catch {
        if (active) {
          servers = servers.map(({ host }) => ({ host, status: "offline" }));
        }
      }

      lastCheckedAt = Date.now();
    }

    refreshStatuses();
    const refreshTimer = setInterval(refreshStatuses, 30_000);

    return () => {
      active = false;
      clearInterval(refreshTimer);
    };
  });

  function onEditButtonClick() {
    alert("wip");
  }
</script>

<svelte:head>
  <title>status page</title>
</svelte:head>

<Contour />

<div class="mx-auto mb-48 w-full max-w-5xl px-4 sm:px-8 lg:px-10">
  <div class="mt-8 flex">
    <h1 class="text-6xl font-bold">status</h1>
    <button
      class="border size-12 my-auto ml-auto border-gray-500 text-slate-600 hover:border-red-500 hover:text-red-600 hover:cursor-not-allowed hidden md:block"
      onclick={onEditButtonClick}
      disabled
    >
      ✎
    </button>
  </div>
  <RelativeTimestamp {lastCheckedAt} />
  <div
    id="servers"
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    {#each servers as server}
      <div
        class={[
          "min-h-32 w-full border p-4",
          server.status === "online"
            ? "border-white"
            : "border-gray-500 text-slate-600",
        ]}
      >
        <h2 class="font-mono text-2xl">{server.host}</h2>
        <h3
          class={["text-sm", server.status === "online" ? "text-lime-400" : ""]}
        >
          <span class="inline-grid size-3 place-items-center align-middle">
            {#if server.status === "online"}
              <span
                class="col-start-1 row-start-1 size-2 animate-ping rounded-full border border-current opacity-75"
              ></span>
            {/if}
            <span
              class={[
                "col-start-1 row-start-1 size-2 rounded-full border border-current",
                server.status === "online" ? "bg-current" : "",
              ]}
            ></span>
          </span>
          {server.status}
        </h3>
        <rect class="bg-white h-full w-full"></rect>
      </div>
    {/each}
  </div>
</div>
