import { watchDebounced } from '@vueuse/core'
import { blobToPhoton } from '~/composables/imageToPhoton'
import { photonBlur } from '~/composables/photonBlur'
import { photonCopyTo } from '~/composables/photonCopy'
import { photonResize } from '~/composables/photonResize'
import { photonRotate90 } from '~/composables/photonRotate'
import { photonToBlob } from '~/composables/photonToCanvas'

interface ResizeImage {
  filename: string
  srcBlob: Blob
  srcUrl: string
  selected: boolean
  targetBlob?: Blob
  targetUrl?: string
  loading: boolean
}

interface Config {
  targetAspectRatio: string
  rotate: 'auto' | 'on' | 'off'
  blur: number
  format: 'original' | 'image/jpeg' | 'image/png' | 'image/webp'
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
    // Revoke object URLs to avoid memory leaks
    for (const img of images.value) {
      if (img.selected) {
        try {
          if (img.srcUrl)
            URL.revokeObjectURL(img.srcUrl)
          if (img.targetUrl)
            URL.revokeObjectURL(img.targetUrl)
        }
        catch {}
      }
    }
    images.value = images.value.filter(img => !img.selected)
  }

  async function resizeImage(img: ResizeImage) {
    img.loading = true

    const targetType = config.value.format === 'original' ? img.srcBlob.type : config.value.format
    const outBlob = await resizeImageWithPhoton(
      img.srcBlob,
      config.value.rotate,
      targetAspectRatio.value,
      config.value.blur,
      targetType,
    )

    img.targetBlob = outBlob
    try {
      if (img.targetUrl)
        URL.revokeObjectURL(img.targetUrl)
    }
    catch {}
    img.targetUrl = URL.createObjectURL(outBlob)

    img.loading = false
  }

  async function resizeImageWithPhoton(
    srcBlob: Blob,
    rotate: 'on' | 'off' | 'auto',
    targetAspectRatio: number,
    blur: number,
    outputType: string,
  ): Promise<Blob> {
    // Load image as Photon image
    let photonImg = await blobToPhoton(srcBlob)

    // Get original dimensions
    let width = photonImg.get_width()
    let height = photonImg.get_height()

    // Rotate the image if required
    if (rotate === 'on' || (rotate === 'auto' && shouldRotateImage(width, height, targetAspectRatio))) {
      photonImg = await photonRotate90(photonImg)
      // Swap dimensions after rotation
      ;[width, height] = [height, width]
    }

    // Calculate target dimensions to match aspect ratio
    const { width: targetWidth, height: targetHeight } = enlargeToAspectRatio(height, width, targetAspectRatio)

    // Create a new image with target dimensions, resize original image to fill it, and apply blur
    const backgroundImg = await photonResize(photonImg, targetWidth, targetHeight, 3)

    // Apply blur to the background
    const radius = Math.floor(blur * Math.max(targetWidth, targetHeight) / 100)
    if (radius > 0) {
      await photonBlur(backgroundImg, radius)
    }

    // Copy the original (unblurred) image to the center
    const offsetX = Math.floor((targetWidth - width) / 2)
    const offsetY = Math.floor((targetHeight - height) / 2)
    await photonCopyTo(backgroundImg, photonImg, offsetX, offsetY)

    // Convert to Blob for display/download
    return photonToBlob(backgroundImg, outputType)
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
