<script lang="ts" setup>
import { useResizeStore } from '~/store/ResizeStore'

const resizeStore = useResizeStore()
const { images } = storeToRefs(resizeStore)

const allImagesSelected = computed<boolean | 'indeterminate'>({
  get: () => {
    if (images.value.every(img => !img.selected))
      return false
    if (images.value.every(img => img.selected))
      return true
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

const selectedCount = computed(() => images.value.filter(img => img.selected).length)

const selectionMenuItems = [[
  {
    label: 'Remove selected',
    icon: 'iconoir:trash',
    color: 'error' as const,
    onSelect: () => resizeStore.removeSelectedImages(),
  },
]]

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
    const srcUrl = URL.createObjectURL(file)
    resizeStore.addImage(reactive({
      id: '',
      filename: file.name,
      srcBlob: file,
      srcUrl,
      selected: false,
      resize: true,
      loading: false,
    }))
  }
}
</script>

<template>
  <div>
    <div class="flex gap-2">
      <FileUpload class="grow" :data-types="SUPPORTED_IMAGE_TYPES" multiple @files-added="handleFilesAdded">
        <p class="flex justify-center gap-1 p-3">
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

    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-semibold text-[var(--ui-text-highlighted)]">
        <span class="text-[var(--ui-primary)]">1.</span> Resize to aspect ratio
      </h2>
      <UDropdownMenu
        :items="selectionMenuItems"
        :class="selectedCount === 0 ? 'invisible pointer-events-none' : ''"
      >
        <UButton variant="subtle" color="neutral" size="sm" trailing-icon="iconoir:nav-arrow-down">
          {{ selectedCount }} selected
        </UButton>
      </UDropdownMenu>
    </div>

    <DropZone :data-types="SUPPORTED_IMAGE_TYPES" multiple @files-added="handleFilesAdded">
      <template #default="{ isOverDropZone }">
        <div
          class="border rounded-[calc(var(--ui-radius)*1.5)] transition-colors"
          :class="isOverDropZone
            ? 'border-[var(--ui-primary)] bg-[var(--ui-bg-elevated)]'
            : 'border-[var(--ui-border-accented)]'"
        >
          <UTable
            class="rounded-[calc(var(--ui-radius)*1.5)]"
            :data="images"
            :columns="[
              { id: 'select' },
              { id: 'filename', accessorKey: 'filename', header: 'Filename' },
              { id: 'srcImg', header: 'Original image' },
              { id: 'resize', header: 'Resize' },
              { id: 'targetImg', header: 'Resized image' },
            ]"
          >
            <template #select-header>
              <UCheckbox v-model="allImagesSelected" />
            </template>
            <template #select-cell="{ row }">
              <UCheckbox v-model="row.original.selected" />
            </template>

            <template #resize-cell="{ row }">
              <UCheckbox
                :model-value="row.original.resize"
                @update:model-value="resizeStore.setImageResize(row.original, $event as boolean)"
              />
            </template>

            <template #srcImg-cell="{ row }">
              <ImagePreview
                :blob="row.original.srcBlob"
                :object-url="row.original.srcUrl"
                :title="getBasename(row.original.filename)"
                :loading="false"
              />
            </template>

            <template #targetImg-cell="{ row }">
              <ImagePreview
                v-if="row.original.resize && row.original.targetUrl"
                :blob="row.original.targetBlob || null"
                :object-url="row.original.targetUrl"
                :title="getResizedBasename(row.original.filename)"
                :loading="row.original.loading"
              />
            </template>

            <template #empty>
              <UIcon name="iconoir:emoji-sad" class="text-lg" /> <p>No images added yet.</p>
            </template>
          </UTable>
        </div>
      </template>
    </DropZone>
  </div>
</template>
