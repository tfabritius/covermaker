<script lang="ts" setup>
import { useMergeStore } from '~/store/MergeStore'
import { useResizeStore } from '~/store/ResizeStore'

const emit = defineEmits<{
  (event: 'navTo', page: string): void
}>()

const resizeStore = useResizeStore()
const { images } = storeToRefs(resizeStore)

const allImagesSelected = computed<boolean | 'indeterminate'>({
  get: () => {
    if (images.value.every(img => !img.selected)) {
      return false
    }
    if (images.value.every(img => img.selected)) {
      return true
    }
    return 'indeterminate'
  },
  set: (v) => {
    if (v === true || v === false) {
      for (const img of images.value) {
        img.selected = v
      }
    }
  },
})

const mergeStore = useMergeStore()

const demoImagesLoading = ref(false)

async function loadDemoImages() {
  demoImagesLoading.value = true
  const demoImages = [
    {
      sourceURL: 'https://commons.wikimedia.org/wiki/File:Claude_Monet_The_Cliffs_at_Etretat.jpg',
      filename: 'Claude_Monet_The_Cliffs_at_Etretat.jpg',
    },
    {
      sourceURL: 'https://commons.wikimedia.org/wiki/File:Edvard_Munch,_1893,_The_Scream,_oil,_tempera_and_pastel_on_cardboard,_91_x_73_cm,_National_Gallery_of_Norway.jpg',
      filename: 'Edvard_Munch,_1893,_The_Scream.jpg',
    },
    {
      sourceURL: 'https://commons.wikimedia.org/wiki/File:Vassily_Kandinsky,_1923_-_On_White_II.jpg',
      filename: 'Vassily_Kandinsky,_1923_-_On_White_II.jpg',
    },
  ]

  const files = await Promise.all(demoImages.map(async ({ filename }) => {
    const resp = await fetch(`demo/${filename}`)
    if (!resp.ok) {
      throw new Error('Network response was not ok')
    }
    const blob = await resp.blob()
    const file = new File([blob], filename, { type: blob.type })
    return file
  }))

  handleFilesAdded(files)
  demoImagesLoading.value = false
}

async function handleFilesAdded(files: File[]) {
  for (const file of files) {
    const dataURL = await readFileAsDataURL(file)
    resizeStore.addImage(reactive({
      filename: file.name,
      srcDataURL: dataURL,
      srcType: file.type,
      srcSize: file.size,
      selected: false,
      loading: false,
    }))
  }
}

async function mergeSelectedImages() {
  for (const image of images.value.filter(img => img.selected)) {
    mergeStore.addImage({
      srcDataURL: image.targetDataURL || '',
      basename: getResizedBasename(image.filename),
      selected: false,
    })
  }

  emit('navTo', 'merge')
}

async function downloadSelectedImages() {
  const content = await zipImages(
    images.value
      .filter(img => img.selected && img.targetDataURL)
      .map(img => ({
        basename: getResizedBasename(img.filename),
        dataURL: img.targetDataURL || '',
      })),
  )

  downloadFile(content, 'images.zip')
}

function getResizedBasename(v: string): string {
  return `${getBasename(v)}-resized`
}
</script>

<template>
  <div>
    <div class="flex gap-2">
      <FileUpload class="grow text-center p-5" :data-types="['image/*']" multiple @files-added="handleFilesAdded">
        <p class="flex justify-center gap-1">
          <UIcon name="iconoir:upload" class="size-5" /> Drag & Drop images here or click to select
        </p>
      </FileUpload>
      <UButton
        variant="outline"
        color="neutral"
        icon="iconoir:bright-star"
        :loading="demoImagesLoading"
        @click="loadDemoImages"
      >
        Load demo images
      </UButton>
    </div>

    <div class="my-2" />

    <UTable
      class="border border-[var(--ui-border-accented)] rounded-[calc(var(--ui-radius)*1.5)]"
      :data="images"
      :columns="[
        { id: 'select' },
        { id: 'filename', accessorKey: 'filename', header: 'Filename' },
        { id: 'srcImg', header: 'Input image' },
        { id: 'targetImg', header: 'Output image' },
      ]"
    >
      <template #select-header>
        <UCheckbox v-model="allImagesSelected" />
      </template>
      <template #select-cell="{ row }">
        <UCheckbox v-model="row.original.selected" />
      </template>

      <template #srcImg-cell="{ row }">
        <ImagePreview
          :src="row.original.srcDataURL"
          :title="getBasename(row.original.filename)"
          :loading="false"
        />
      </template>

      <template #targetImg-cell="{ row }">
        <ImagePreview
          v-if="row.original.targetDataURL"
          :src="row.original.targetDataURL"
          :title="getResizedBasename(row.original.filename)"
          :loading="row.original.loading"
        />
      </template>

      <template #empty>
        <UIcon name="iconoir:emoji-sad" class="text-lg" /> <p>No images added yet.</p>
      </template>
    </UTable>

    <div class="h-20" />

    <div
      v-if="allImagesSelected !== false"
      class="fixed top-auto left-auto bottom-4 right-4 bg-[var(--ui-bg)]
        border border-[var(--ui-primary)] rounded-[calc(var(--ui-radius)*1.5)]
        p-2 flex gap-2"
    >
      <UButton
        icon="iconoir:copy"
        variant="subtle"
        @click="mergeSelectedImages"
      >
        Merge selected image(s)
      </UButton>

      <UButton
        icon="iconoir:download"
        variant="subtle"
        color="neutral"
        @click="downloadSelectedImages"
      >
        Download selected image(s)
      </UButton>

      <UButton
        icon="iconoir:trash"
        variant="subtle"
        color="error"
        @click="resizeStore.removeSelectedImages"
      >
        Remove selected image(s)
      </UButton>
    </div>
  </div>
</template>
