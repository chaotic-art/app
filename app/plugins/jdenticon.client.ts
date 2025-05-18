import * as jdenticon from 'jdenticon'

export default defineNuxtPlugin(() => {
  jdenticon.configure({
    lightness: {
      color: [0.4, 0.8],
      grayscale: [0.3, 0.9],
    },
    saturation: {
      color: 0.5,
      grayscale: 0.0,
    },
    backColor: '#0000', // Transparent background
  })

  return {
    provide: {
      jdenticon,
    },
  }
})
