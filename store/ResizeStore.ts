import { watchDebounced } from '@vueuse/core'

interface ResizeImage {
  filename: string
  srcDataURL: string
  srcType: string
  srcSize: number
  selected: boolean
  targetDataURL?: string
  loading: boolean
}

interface Config {
  targetAspectRatio: string
  rotate: 'auto' | 'on' | 'off'
  blur: number
  format: 'original' | 'image/jpeg' | 'image/png'
}

export const useResizeStore = defineStore('resize', () => {
  const config = ref<Config>({
    targetAspectRatio: '3:2',
    rotate: 'auto',
    blur: 1,
    format: 'original',
  })

  const targetAspectRatioValid = computed(() => {
    if (!/^\d+:\d+$/.test(config.value.targetAspectRatio)) {
      return false
    }

    const [width, height] = config.value.targetAspectRatio.split(':').map(Number)
    return (width ?? 0) > 0 && (height ?? 0) > 0
  })

  const targetAspectRatio = computed(() => {
    if (!targetAspectRatioValid.value) {
      return 1
    }
    const [width, height] = config.value.targetAspectRatio.split(':').map(Number)
    return (!!width && !!height) ? width / height : 1
  })

  const images = ref<ResizeImage[]>([])

  function addImage(image: ResizeImage) {
    images.value = [...images.value, image]
    resizeImage(image)
  }

  function removeSelectedImages() {
    images.value = images.value.filter(img => !img.selected)
  }

  async function resizeImage(img: ResizeImage) {
    img.loading = true

    const canvas = await resizeImageToCanvas(img.srcDataURL, config.value.rotate, targetAspectRatio.value, config.value.blur)
    const targetType = config.value.format === 'original' ? img.srcType : config.value.format
    img.targetDataURL = canvas.toDataURL(targetType)

    img.loading = false
  }

  async function resizeImageToCanvas(dataURL: string, rotate: 'on' | 'off' | 'auto', targetAspectRatio: number, blur: number): Promise<HTMLCanvasElement> {
    const { canvas, ctx } = createCanvas()

    let img = await loadImage(dataURL)

    // Rotate the image if required
    if (rotate === 'on' || (rotate === 'auto' && shouldRotateImage(img.width, img.height, targetAspectRatio))) {
      img = await rotateImage(img)
    }

    const { width, height } = enlargeToAspectRatio(img.height, img.width, targetAspectRatio)

    canvas.width = width
    canvas.height = height

    // Draw the image onto the off-screen canvas first
    ctx.drawImage(img, 0, 0, width, height)

    // Apply the blur filter to the image only (without the background)
    const radius = blur * Math.max(width, height) / 100
    ctx.filter = `blur(${radius}px)`
    ctx.drawImage(canvas, 0, 0, width, height)

    // Draw the image again without changing its size and without blurring
    ctx.filter = 'none'
    ctx.drawImage(img, (width - img.width) / 2, (height - img.height) / 2)

    return canvas
  }

  function shouldRotateImage(
    width: number,
    height: number,
    targetAspectRatio: number,
  ): boolean {
  // Calculate the current aspect ratio
    const currentAspectRatio = width / height

    // Calculate the difference between the current aspect ratio and the target aspect ratio
    const difference = Math.abs(currentAspectRatio - targetAspectRatio)

    // Calculate the difference if we were to rotate the image (swap width and height)
    const rotatedAspectRatio = height / width
    const rotatedDifference = Math.abs(rotatedAspectRatio - targetAspectRatio)

    // If the difference is smaller when rotated, we should rotate the image
    return rotatedDifference < difference
  }

  function enlargeToAspectRatio(
    height: number,
    width: number,
    aspectRatio: number,
  ) {
    if (width / height > aspectRatio) {
    // Enlarge the height
      height = Math.round(width / aspectRatio)
    }
    else {
    // Enlarge the width
      width = Math.round(height * aspectRatio)
    }
    return { width, height }
  }

  async function rotateImage(img: HTMLImageElement): Promise<HTMLImageElement> {
    const { canvas, ctx } = createCanvas()

    canvas.width = img.height
    canvas.height = img.width

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)

    return loadImage(canvas.toDataURL())
  }

  watchDebounced(config, () => {
    for (const image of images.value) {
      resizeImage(image)
    }
  }, { deep: true, debounce: 500 })

  return {
    config,
    images,
    addImage,
    removeSelectedImages,
    targetAspectRatioValid,
    resizeImage,
  }
})
