<script>
  import { onMount } from "svelte";

  const hosts = ["192.168.31.125", "192.168.31.169", "192.168.31.1"];
  const servers = hosts.map((host) => ({
    host,
    status: Math.random() > 0.5 ? "online" : "offline",
  }));

  /** @type {HTMLCanvasElement} */
  let canvas;

  onMount(() => {
    const context = /** @type {CanvasRenderingContext2D} */ (
      canvas.getContext("2d")
    );
    if (!context) return;

    let animationFrame = 0;

    function resize() {
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = 200 * devicePixelRatio;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.minHeight = "200px";
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} time
     */
    function displacement(x, y, time) {
      let distance =
        18 * Math.sin(x * 0.006 + y * 0.012 + time) +
        10 * Math.sin(x * 0.013 - y * 0.008 - time * 0.7) +
        5 * Math.sin(x * 0.027 + y * 0.018);

      const disturbances = [
        [0.18, 0.46, 55],
        [0.43, 0.31, -48],
        [0.67, 0.68, 45],
        [0.9, 0.37, -60],
      ];

      for (const [positionX, positionY, strength] of disturbances) {
        const deltaX = x - positionX * innerWidth;
        const deltaY = y - positionY * 500;
        const radius = 150;

        distance +=
          strength *
          Math.exp(-(deltaX * deltaX + deltaY * deltaY) / (radius * radius)) *
          Math.sin(deltaX * 0.018);
      }

      return distance;
    }

    /** @param {number} timestamp */
    function draw(timestamp) {
      const time = timestamp * 0.00015;

      context.fillStyle = "#050609";
      context.fillRect(0, 0, innerWidth, 500);

      const gradient = context.createLinearGradient(0, 0, innerWidth, 0);
      gradient.addColorStop(0, "#a55cff");
      gradient.addColorStop(0.5, "#718cff");
      gradient.addColorStop(1, "#55d8ff");

      context.strokeStyle = gradient;
      context.lineWidth = 0.85;

      const spacing = 9;

      for (let baseY = -80; baseY < 580; baseY += spacing) {
        context.beginPath();

        for (let x = 0; x <= innerWidth; x += 4) {
          const y = baseY + displacement(x, baseY, time);

          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }

        context.stroke();
      }

      animationFrame = requestAnimationFrame(draw);
    }

    resize();
    addEventListener("resize", resize);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  });
</script>

<canvas id="contours" class="inline" bind:this={canvas}></canvas>

<div class="mx-[10em] mb-[12em]">
  <h1 class="mb-[0.5em] text-[4em] font-bold">status</h1>
  <div id="servers" class="flex flex-wrap gap-[1em]">
    {#each servers as server}
      <div
        class={[
          "block h-[8em] w-[16em] shrink-0 grow-0 box-content border p-[1em]",
          server.status === "online"
            ? "border-white"
            : "border-[gray] text-[darkslategray]",
        ]}
      >
        <h2 class="text-[1.5em] font-bold">{server.host}</h2>
        <h3
          class={[
            "text-[1.17em] font-bold",
            server.status === "online" ? "text-[greenyellow]" : "",
          ]}
        >
          <span class="overflow-hidden text-[0.75em]"
            >{server.status === "online" ? "●" : "○"}</span
          >
          {server.status}
        </h3>
      </div>
    {/each}
  </div>
</div>
