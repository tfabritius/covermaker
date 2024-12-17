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

function loadDemoImages() {
  const files = demoImages.map((f) => {
    const [metaData, base64Data] = f.dataURL.split(',')
    const binaryData = atob(base64Data)
    const arrayBuffer = new ArrayBuffer(binaryData.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i)
    }
    const blob = new Blob([uint8Array], { type: metaData.split(':')[1].split(';')[0] })
    return new File([blob], f.name, { type: blob.type })
  })

  handleFilesAdded(files)
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
    }))
  }
}

async function mergeSelectedImages() {
  for (const image of images.value.filter(img => img.selected)) {
    mergeStore.addImage({
      srcDataURL: image.targetDataURL || '',
      filename: image.filename,
      srcType: image.srcType,
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
        basename: img.filename.split('.').slice(0, -1).join('.'),
        dataURL: img.targetDataURL || '',
      })),
  )

  downloadFile(content, 'images.zip')
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
        <ImagePreview :src="row.original.srcDataURL" :title="row.original.filename" />
      </template>

      <template #targetImg-cell="{ row }">
        <ImagePreview
          v-if="row.original.targetDataURL" :src="row.original.targetDataURL"
          :title="row.original.filename"
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
