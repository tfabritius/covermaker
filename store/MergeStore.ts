import { watchDebounced } from '@vueuse/core'

interface ImageCollection {
  images: MergeImage[]
  targetDataURL: string | null
  basename: string
  selected: boolean
  loading: boolean
}

interface MergeImage {
  basename: string
  srcDataURL: string
  selected: boolean
}

interface Config {
  format: 'image/jpeg' | 'image/png'
}

export const useMergeStore = defineStore('merge', () => {
  const config = ref<Config>({
    format: 'image/jpeg',
  })

  const images = ref<MergeImage[]>([])

  function addImage(image: MergeImage) {
    images.value = [...images.value, image]
  }

  function removeSelectedImages() {
    images.value = images.value.filter(img => !img.selected)
  }

  const imageCollections = ref<ImageCollection[]>([])

  function groupItems<T>(items: T[]): T[][] {
    const chunkSize = 4
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize))
    }
    return chunks
  }

  const previousGroupedImages = ref<MergeImage[][]>([])

  // Watch for changes to the images array and update imageCollection accordingly
  watchDebounced(images, (newImages) => {
    const groupedImages = groupItems(newImages)

    // Function to check if two groups of images are the same
    const groupedImagesAreEqual = (group1: MergeImage[], group2: MergeImage[]) => {
      if (group1.length !== group2.length)
        return false
      for (let i = 0; i < group1.length; i++) {
        if (group1[i] !== group2[i])
          return false // Compare individual image objects, adjust as needed
      }
      return true
    }

    // Rebuild the imageCollection array with updated images
    imageCollections.value = groupedImages.map((group, index) => {
      // Check if a collection already exists at the index
      const existingCollection = imageCollections.value[index] || null

      // Check if the images in this group have changed
      const isSameImages = previousGroupedImages.value[index] && groupedImagesAreEqual(previousGroupedImages.value[index], group)

      return {
        images: group,
        basename: `Merged image ${index + 1}`,
        targetDataURL: isSameImages ? existingCollection.targetDataURL : null,
        selected: isSameImages ? existingCollection.selected : false,
        loading: false,
      }
    })

    previousGroupedImages.value = groupedImages
  }, {
    debounce: 200,
  })

  watchDebounced(imageCollections, (newImageCollections) => {
    newImageCollections
      .filter(ic => ic.targetDataURL === null)
      .forEach(ic => mergeImageCollection(ic))
  }, {
    debounce: 200,
  })

  async function mergeImageCollection(ic: ImageCollection) {
    ic.loading = true
    const imgElements = await Promise.all(ic.images.map(img => loadImage(img.srcDataURL)))

    const maxWidth = Math.max(...imgElements.map(img => img.width))
    const maxHeight = Math.max(...imgElements.map(img => img.height))

    const { canvas, ctx } = createCanvas()
    canvas.width = 2 * maxWidth
    canvas.height = 2 * maxHeight

    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i]
      const x = i % 2 === 0 ? 0 : maxWidth
      const y = i < 2 ? 0 : maxHeight
      ctx.drawImage(img, x, y, maxWidth, maxHeight)
    }

    ic.targetDataURL = canvas.toDataURL()
    ic.loading = false
  }

  return {
    config,
    images,
    addImage,
    removeSelectedImages,
    imageCollections,
    mergeImageCollection,
  }
})
