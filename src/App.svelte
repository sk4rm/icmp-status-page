<script>
  import Contour from "./Contour.svelte";

  const hosts = ["192.168.31.125", "192.168.31.169", "192.168.31.1"];
  const servers = hosts.map((host) => ({
    host,
    status: Math.random() > 0.5 ? "online" : "offline",
  }));
</script>

<Contour />

<div class="mx-auto mb-48 w-full max-w-5xl px-4 sm:px-8 lg:px-10">
  <h1 class="mb-8 text-6xl font-bold">status</h1>
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
        <h2 class="text-2xl font-bold">{server.host}</h2>
        <h3
          class={[
            "text-lg font-bold",
            server.status === "online" ? "text-lime-400" : "",
          ]}
        >
          <span class="overflow-hidden text-sm"
            >{server.status === "online" ? "●" : "○"}</span
          >
          {server.status}
        </h3>
      </div>
    {/each}
  </div>
</div>
