<script>
  import { onMount } from "svelte";

  /** @type {HTMLCanvasElement} */
  let canvas;

  onMount(() => {
    const context = /** @type {CanvasRenderingContext2D} */ (
      canvas.getContext("2d")
    );
    if (!context) return;

    let animationFrame = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = devicePixelRatio || 1;

      canvasWidth = Math.max(1, Math.round(bounds.width));
      canvasHeight = Math.max(1, Math.round(bounds.height));
      canvas.width = Math.round(canvasWidth * pixelRatio);
      canvas.height = Math.round(canvasHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
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
        const deltaX = x - positionX * canvasWidth;
        const deltaY = y - positionY * canvasHeight;
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
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      const gradient = context.createLinearGradient(0, 0, canvasWidth, 0);
      gradient.addColorStop(0, "#a55cff");
      gradient.addColorStop(0.5, "#718cff");
      gradient.addColorStop(1, "#55d8ff");

      context.strokeStyle = gradient;
      context.lineWidth = 0.85;

      const spacing = 9;

      for (let baseY = -80; baseY < canvasHeight + 80; baseY += spacing) {
        context.beginPath();

        for (let x = 0; x <= canvasWidth; x += 4) {
          const y = baseY + displacement(x, baseY, time);

          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }

        context.stroke();
      }

      animationFrame = requestAnimationFrame(draw);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    animationFrame = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  });
</script>

<canvas id="contours" class="block h-48 w-full sm:h-52" bind:this={canvas}
></canvas>
