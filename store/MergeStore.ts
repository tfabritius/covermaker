import { watchDebounced } from '@vueuse/core'
import { dataURLToPhoton } from '~/composables/imageToPhoton'
import { photonToDataURL } from '~/composables/photonToCanvas'
import { photonResize } from '~/composables/photonResize'
import { photonCreateImage, photonCopyTo } from '~/composables/photonCopy'

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
  gridColumns: number
  gridRows: number
}

export const useMergeStore = defineStore('merge', () => {
  const config = ref<Config>({
    format: 'image/jpeg',
    gridColumns: 2,
    gridRows: 2,
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
    const chunkSize = config.value.gridColumns * config.value.gridRows
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize))
    }
    return chunks
  }

  const previousGroupedImages = ref<MergeImage[][]>([])
  const previousGridConfig = ref({ columns: config.value.gridColumns, rows: config.value.gridRows })

  // Function to regroup images and update imageCollections
  function regroupImages() {
    const groupedImages = groupItems(images.value)

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

    // Check if grid configuration has changed
    const gridConfigChanged = 
      previousGridConfig.value.columns !== config.value.gridColumns || 
      previousGridConfig.value.rows !== config.value.gridRows

    // Rebuild the imageCollection array with updated images
    imageCollections.value = groupedImages.map((group, index) => {
      // Check if a collection already exists at the index
      const existingCollection = imageCollections.value[index] || null

      // Check if the images in this group have changed
      const isSameImages = previousGroupedImages.value[index] && groupedImagesAreEqual(previousGroupedImages.value[index], group)

      return {
        images: group,
        basename: `Merged image ${index + 1}`,
        // If grid config changed, force regeneration by setting targetDataURL to null
        targetDataURL: (isSameImages && existingCollection && !gridConfigChanged) ? existingCollection.targetDataURL : null,
        selected: isSameImages && existingCollection ? existingCollection.selected : false,
        loading: false,
      }
    })

    previousGroupedImages.value = groupedImages
    previousGridConfig.value = { columns: config.value.gridColumns, rows: config.value.gridRows }
  }

  // Watch for changes to the images array and update imageCollection accordingly
  watchDebounced(images, () => {
    regroupImages()
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
    
    // Load all images as Photon images
    const photonImages = await Promise.all(ic.images.map(img => dataURLToPhoton(img.srcDataURL)))

    // Find the maximum width and height among all images
    const maxWidth = Math.max(...photonImages.map(img => img.get_width()))
    const maxHeight = Math.max(...photonImages.map(img => img.get_height()))

    const gridWidth = maxWidth * config.value.gridColumns
    const gridHeight = maxHeight * config.value.gridRows

    // Create a new blank image with configurable grid dimensions
    const gridImage = await photonCreateImage(gridWidth, gridHeight)

    // Resize and copy each image to its position in the grid
    for (let i = 0; i < photonImages.length; i++) {
      const img = photonImages[i]
      if (!img) {
        continue
      }
      
      // Resize image to fit the grid cell
      const resizedImg = await photonResize(img, maxWidth, maxHeight, 3)
      
      // Calculate position in the grid dynamically
      const col = i % config.value.gridColumns
      const row = Math.floor(i / config.value.gridColumns)
      const x = col * maxWidth
      const y = row * maxHeight
      
      // Copy the resized image to the grid
      await photonCopyTo(gridImage, resizedImg, x, y)
    }

    // Convert to dataURL for display
    ic.targetDataURL = await photonToDataURL(gridImage, config.value.format)
    ic.loading = false
  }

  // Watch for grid configuration changes
  watchDebounced(() => [config.value.gridColumns, config.value.gridRows], () => {
    // Force regrouping when grid size changes
    regroupImages()
  }, { debounce: 200 })

  // Watch for other config changes (format)
  watchDebounced(() => config.value.format, () => {
    for (const ic of imageCollections.value) {
      mergeImageCollection(ic)
    }
  }, { debounce: 200 })

  return {
    config,
    images,
    addImage,
    removeSelectedImages,
    imageCollections,
    mergeImageCollection,
  }
})
