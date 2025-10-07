<script setup lang="ts">
defineProps<{
  loading?: boolean
  minted?: boolean
  previewUrl?: string | null
}>()

const emit = defineEmits(['claim', 'share', 'viewCard'])

// Refs for card elements
const cardRef = ref<HTMLElement>()
const rotatorRef = ref<HTMLElement>()

// Card interaction state
let isHovering = false
let animationId: number | null = null

// Current and target values for smooth transitions
const current = { mx: 0.5, my: 0.5, rx: 0, ry: 0, posX: 50, posY: 50, o: 0.25 }
const target = { mx: 0.5, my: 0.5, rx: 0, ry: 0, posX: 50, posY: 50, o: 0.25 }

// Math utilities
function clamp(min: number, max: number, val: number) {
  return Math.min(Math.max(min, val), max)
}

function round(val: number, precision = 0) {
  const mult = 10 ** precision
  return Math.round((val + Number.EPSILON) * mult) / mult
}

function adjust(val: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
  return round(((val - fromMin) * (toMax - toMin)) / (fromMax - fromMin) + toMin)
}

// Smooth animation function
function animate() {
  const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor
  const lerpFactor = isHovering ? 0.15 : 0.025 // Faster when hovering, much slower when leaving

  current.mx = lerp(current.mx, target.mx, lerpFactor)
  current.my = lerp(current.my, target.my, lerpFactor)
  current.rx = lerp(current.rx, target.rx, lerpFactor)
  current.ry = lerp(current.ry, target.ry, lerpFactor)
  current.posX = lerp(current.posX, target.posX, lerpFactor)
  current.posY = lerp(current.posY, target.posY, lerpFactor)
  current.o = lerp(current.o, target.o, lerpFactor)

  // Update CSS variables
  if (cardRef.value) {
    cardRef.value.style.setProperty('--mx', current.mx.toString())
    cardRef.value.style.setProperty('--my', current.my.toString())
    cardRef.value.style.setProperty('--rx', `${current.rx}deg`)
    cardRef.value.style.setProperty('--ry', `${current.ry}deg`)
    cardRef.value.style.setProperty('--posx', `${current.posX}%`)
    cardRef.value.style.setProperty('--posy', `${current.posY}%`)
    cardRef.value.style.setProperty('--o', current.o.toString())
  }

  animationId = requestAnimationFrame(animate)
}

// Mouse interaction
function interact(e: PointerEvent) {
  if (!rotatorRef.value)
    return

  const rect = rotatorRef.value.getBoundingClientRect()
  const mx = clamp(0, 1, (e.clientX - rect.left) / rect.width)
  const my = clamp(0, 1, (e.clientY - rect.top) / rect.height)

  // Calculate rotations (±10 degrees max)
  const rX = round(adjust(mx, 0, 1, -20, 20) / 2)
  const rY = round(adjust(my, 0, 1, 20, -20) / 2)

  // Calculate background positions
  const posX = round(50 + adjust(mx, 0, 1, -40, 40))
  const posY = round(50 + adjust(my, 0, 1, -40, 40))

  // Update target values
  target.mx = mx
  target.my = my
  target.rx = rX
  target.ry = rY
  target.posX = posX
  target.posY = posY
  target.o = 1
}

// Mouse enter
function interactStart() {
  isHovering = true
}

// Reset on mouse leave
function interactEnd() {
  isHovering = false
  target.mx = 0.5
  target.my = 0.5
  target.rx = 0
  target.ry = 0
  target.posX = 50
  target.posY = 50
  target.o = 0.25
}

// Lifecycle hooks
onMounted(() => {
  if (rotatorRef.value) {
    rotatorRef.value.addEventListener('pointerenter', interactStart)
    rotatorRef.value.addEventListener('pointermove', interact)
    rotatorRef.value.addEventListener('pointerleave', interactEnd)
  }

  // Start animation loop
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  if (rotatorRef.value) {
    rotatorRef.value.removeEventListener('pointerenter', interactStart)
    rotatorRef.value.removeEventListener('pointermove', interact)
    rotatorRef.value.removeEventListener('pointerleave', interactEnd)
  }
})
</script>

<template>
  <div class="claim-page">
    <!-- Background image -->
    <div class="background-image" />

    <div class="claim-container">
      <!-- Header -->
      <header class="claim-header">
        <h1 class="claim-title">
          Chaotic Cards
        </h1>
        <p class="claim-subtitle">
          Connect your X profile and we will generate a unique card for you
        </p>
      </header>

      <div v-if="minted && previewUrl" class="w-full flex justify-center">
        <div class="w-[500px]">
          <IframePreview
            :src="previewUrl"
          />
        </div>
      </div>

      <!-- Card Container -->
      <div v-else class="card-container">
        <div ref="cardRef" class="card" data-rarity="rare v-full-art">
          <div class="card__translater">
            <button ref="rotatorRef" class="card__rotator">
              <div class="card__front">
                <img src="/card/final_card.png" alt="Chaotic Card" loading="lazy">
              </div>
              <div class="card__shine" />
              <div class="card__glare" />
            </button>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div v-if="loading">
        <UIcon name="i-mdi:loading" class="animate-spin h-8 w-8 my-8" />
      </div>
      <div v-else-if="minted" class="flex flex-col gap-4 items-center">
        <button class="claim-button" @click="emit('viewCard')">
          View my card
        </button>
        <button class="claim-button" @click="emit('share')">
          Share on <UIcon name="i-simple-icons:x" class="size-5 ml-2" />
        </button>
      </div>
      <button v-else class="claim-button" @click="emit('claim')">
        Claim Now
      </button>
    </div>
  </div>
</template>

<style>
/* ===== CSS VARIABLES ===== */
:root {
  /* Card dimensions */
  --card-aspect: 421 / 614;
  --card-radius: 30px;  /* Match the actual card corner radius */

  /* Initial values with smooth transitions */
  --mx: 0.5;
  --my: 0.5;
  --rx: 0deg;
  --ry: 0deg;
  --posx: 50%;
  --posy: 50%;
  --o: 0;

  /* Simple grain texture - no SVG filters */
  --grain: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.01) 1px, transparent 1px);
}

/* ===== CLAIM PAGE STYLES ===== */
.claim-page {
  background: #000000;
  color: white;
  font-family: 'Roboto Serif', serif;
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1034px;
  height: 1034px;
  background-image: url('/card/Background_image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.36;
}

.claim-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;
  min-height: 100vh;
  padding: 20px 20px 80px 20px;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

.claim-header {
  text-align: center;
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.claim-title {
  font-family: 'Roboto Serif', serif;
  font-size: clamp(32px, 3.5vw, 44px);
  font-weight: 500;
  font-style: italic;
  margin: 0;
  letter-spacing: -2px;
  text-transform: capitalize;
  text-align: center;
  display: block;
}

.claim-subtitle {
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: clamp(13px, 1.1vw, 15px);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.64);
  margin: 1vh 0 0 0;
  max-width: 264px;
  line-height: 1.4;
  text-transform: capitalize;
  text-align: center;
  display: block;
}

.card-container {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== HOLOGRAPHIC CARD STYLES ===== */
.card {
  --card-scale: 1;
  position: relative;
  aspect-ratio: var(--card-aspect);
  width: 71.5vw;
  max-width: 421px;
  will-change: transform;
  transform: translate3d(0, 0, 0.01px);
  transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.card__translater {
  display: grid;
  width: 100%;
  height: 100%;
  transform: scale(var(--card-scale));
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.card__rotator {
  --card-transition-duration: 0.6s;
  display: grid;
  transform-style: preserve-3d;
  transform: rotateY(var(--rx)) rotateX(var(--ry));
  transition: transform var(--card-transition-duration) cubic-bezier(0.23, 1, 0.32, 1);
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}

/* Layer stacking */
.card__front,
.card__shine,
.card__glare {
  grid-area: 1/1;
  border-radius: var(--card-radius);
  overflow: hidden;
}

.card__front {
  display: grid;
  transform: translateZ(1px);
  position: relative;
  /* Subtle glow around the card */
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))
          drop-shadow(0 0 40px rgba(100, 200, 255, 0.05));
}

.card__front img {
  grid-area: 1/1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

/* Enhanced glow on hover */
.card:hover .card__front {
  filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.2))
          drop-shadow(0 0 60px rgba(100, 200, 255, 0.1))
          drop-shadow(0 0 100px rgba(200, 100, 255, 0.05));
  transition: filter 0.3s ease-out;
}

/* Subtle metallic sheen for wireframe graphics */
.card[data-rarity*="v-full-art"] .card__shine {
  position: relative;
  background-image:
    /* Very subtle metallic band */
    linear-gradient(
      calc(45deg + var(--mx) * 90deg),
      transparent 40%,
      rgba(255, 255, 255, 0.1) 45%,
      rgba(200, 220, 255, 0.15) 48%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(200, 220, 255, 0.15) 52%,
      rgba(255, 255, 255, 0.1) 55%,
      transparent 60%
    );

  background-size: 200% 200%;
  background-position:
    calc(var(--posx) * 2% - 50%) calc(var(--posy) * 2% - 50%);

  mix-blend-mode: lighten;
  opacity: calc(var(--o) * 0.25);  /* Reduced opacity */
  z-index: 3;
  transform: translateZ(2px);
  pointer-events: none;
  will-change: opacity;
}

/* Smooth iridescent color shift */
.card[data-rarity*="v-full-art"] .card__shine::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    conic-gradient(
      from calc(var(--mx) * 360deg) at calc(var(--mx) * 100%) calc(var(--my) * 100%),
      rgba(255, 100, 100, 0.15) 0%,
      rgba(255, 150, 100, 0.15) 8%,
      rgba(255, 255, 100, 0.15) 16%,
      rgba(150, 255, 100, 0.15) 25%,
      rgba(100, 255, 100, 0.15) 33%,
      rgba(100, 255, 150, 0.15) 41%,
      rgba(100, 255, 255, 0.15) 50%,
      rgba(100, 150, 255, 0.15) 58%,
      rgba(100, 100, 255, 0.15) 66%,
      rgba(150, 100, 255, 0.15) 75%,
      rgba(255, 100, 255, 0.15) 83%,
      rgba(255, 100, 150, 0.15) 91%,
      rgba(255, 100, 100, 0.15) 100%
    );

  background-size: 120% 120%;

  mix-blend-mode: color;
  opacity: calc(var(--o) * 0.6);
  border-radius: var(--card-radius);
  filter: blur(0.5px);
}

/* Basic glare effect */
.card__glare {
  background-image: radial-gradient(
    farthest-corner circle at calc(var(--mx) * 100%) calc(var(--my) * 100%),
    rgba(255, 255, 255, 0.8) 10%,
    rgba(255, 255, 255, 0.65) 20%,
    rgba(0, 0, 0, 0.21) 90%
  );
  mix-blend-mode: overlay;
  opacity: calc(var(--o) * 0.5);
  z-index: 5;
  transform: translateZ(3px);
  pointer-events: none;
  will-change: opacity;
}

/* Idle state with subtle shimmer */
.card {
  animation: idle-float 12s ease-in-out infinite;
}

@keyframes idle-float {
  0%, 100% { --posx: 50%; --posy: 50%; }
  25% { --posx: 48%; --posy: 52%; }
  50% { --posx: 52%; --posy: 48%; }
  75% { --posx: 50%; --posy: 51%; }
}

/* Base transitions for smooth enter/leave */
.card__shine,
.card__glare {
  transition: opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.card__front {
  transition: filter 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.card__rotator {
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

/* Hover states */
.card:hover {
  --card-scale: 1.02;
}

.card:hover .card__shine {
  opacity: calc(var(--o) * 0.8);
}

.card:hover .card__glare {
  opacity: calc(var(--o) * 0.7);
}

/* Default visible state for testing */
.card__shine {
  opacity: 0.1; /* Very subtle idle shimmer */
}

/* ===== CLAIM BUTTON STYLES ===== */
.claim-button {
  background: white;
  color: black;
  border: none;
  border-radius: 55px;
  padding: 11px 22px;
  font-family: 'Roboto Serif', serif;
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 400;
  font-style: italic;
  letter-spacing: -1.06px;
  text-transform: capitalize;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: clamp(150px, 15vw, 183px);
  height: clamp(45px, 4vh, 55px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 32px;
}

.claim-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
}

.claim-button:active {
  transform: scale(0.98);
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .claim-title {
    font-size: 36px;
  }

  .claim-subtitle {
    font-size: 14px;
    max-width: 280px;
  }

  .background-image {
    width: 100vw;
    height: 100vw;
  }

  .card {
    transform: scale(0.8);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
  }

  .card__rotator {
    --card-transition-duration: 0s;
  }
}
</style>
