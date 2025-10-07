<template>
  <p class="text-base">
    FPS (Frames Per Second) check ensures your generative art runs smoothly at 60 FPS or higher. Real-time FPS monitoring displays continuously in the preview window, showing green when ≥60 FPS and red when below.
  </p>

  <ul class="list-disc mt-4 ml-5">
    <li>Optimize your code to reduce computational complexity</li>
    <li>Avoid expensive operations in the draw loop</li>
    <li>Use efficient data structures and algorithms</li>
    <li>Consider caching calculations when possible</li>
    <li>Profile your code to identify performance bottlenecks</li>
    <li>Watch the live FPS counter in the top-right corner of the preview</li>
  </ul>

  <p class="text-sm text-muted-foreground mt-4">
    Note: FPS is monitored continuously using requestAnimationFrame, providing real-time performance feedback. The displayed value is smoothed over the last 60 frames for stability.
  </p>
</template>
