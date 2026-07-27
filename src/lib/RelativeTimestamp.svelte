<script>
  import { onMount } from "svelte";

  /** @type {{lastCheckedAt: number | null}} */
  let { lastCheckedAt } = $props();

  /** @param {number} seconds */
  function formatRelativeTime(seconds) {
    if (seconds >= 3_600) {
      const hours = Math.floor(seconds / 3_600);
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    return `${Math.floor(seconds)} second${seconds === 1 ? "" : "s"} ago`;
  }

  let relative = $state("never");

  onMount(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      if (lastCheckedAt === null) {
        relative = "never";
      } else {
        const delta = (now - lastCheckedAt) / 1_000;
        relative = formatRelativeTime(delta);
      }
    }, 1_000);

    return () => clearInterval(timer);
  });
</script>

<p class="mb-8">Last checked: {relative}</p>
