<script setup lang="ts">
import { useMergeStore } from '~/store/MergeStore'

const mergeStore = useMergeStore()
const { images, imageCollections, config } = storeToRefs(mergeStore)

const gridSize = computed(() => config.value.gridColumns * config.value.gridRows)

const allSourceImagesSelected = computed<boolean | 'indeterminate'>({
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

const allImageCollectionsSelected = computed<boolean | 'indeterminate'>({
  get: () => {
    if (imageCollections.value.every(ic => !ic.selected)) {
      return false
    }
    if (imageCollections.value.every(ic => ic.selected)) {
      return true
    }
    return 'indeterminate'
  },
  set: (v) => {
    if (v === true || v === false) {
      for (const ic of imageCollections.value) {
        ic.selected = v
      }
    }
  },
})

async function handleFilesAdded(files: File[]) {
  for (const file of files) {
    const dataURL = await readFileAsDataURL(file)
    mergeStore.addImage(reactive({
      basename: getBasename(file.name),
      srcDataURL: dataURL,
      srcType: file.type,
      srcSize: file.size,
      selected: false,
    }))
  }
}

async function downloadSelectedImageCollections() {
  const content = await zipImages(
    imageCollections.value
      .filter(ic => ic.selected && ic.targetDataURL)
      .map(ic => ({
        basename: ic.basename,
        dataURL: ic.targetDataURL || '',
      })),
  )

  downloadFile(content, 'images.zip')
}
</script>

<template>
  <FileUpload class="text-center p-5" :data-types="['image/*']" multiple @files-added="handleFilesAdded">
    <p class="flex justify-center gap-1">
      <UIcon name="iconoir:upload" class="size-5" /> Drag & Drop images here or click to select
    </p>
  </FileUpload>

  <div class="my-2" />

  <div class="border border-[var(--ui-border-accented)] rounded-[calc(var(--ui-radius)*1.5)]">
    <UTable
      :data="imageCollections"
      :columns="[
        { id: 'inputImg' },
        { id: 'outputImg' },
      ]"
    >
      <template #inputImg-header>
        <div class="flex gap-2">
          <UCheckbox v-model="allSourceImagesSelected" />
          Input images
        </div>
      </template>
      <template #inputImg-cell="{ row }">
        <div class="flex items-center gap-4 flex-wrap">
          <template
            v-for="(_, i) in gridSize"
            :key="i"
          >
            <div
              v-if="row.original.images[i]"
              class="flex items-center gap-2"
            >
              <UCheckbox v-model="row.original.images[i].selected" />
              <ImagePreview
                v-if="row.original.images[i]"
                :src="row.original.images[i].srcDataURL"
                :title="row.original.images[i].basename"
                :loading="false"
              />
            </div>
          </template>
        </div>
      </template>
      <template #outputImg-header>
        <div class="flex gap-2">
          <UCheckbox v-model="allImageCollectionsSelected" />
          Output images
        </div>
      </template>
      <template #outputImg-cell="{ row }">
        <div class="flex items-center gap-2">
          <UCheckbox v-model="row.original.selected" />
          <ImagePreview
            :src="row.original.targetDataURL"
            :title="row.original.basename"
            :loading="row.original.loading"
          />
        </div>
      </template>

      <template #empty>
        <UIcon name="iconoir:emoji-sad" class="text-lg" /> <p>No images added yet.</p>
      </template>
    </UTable>
  </div>

  <div class="h-20" />

  <div
    v-if="allSourceImagesSelected !== false || allImageCollectionsSelected !== false"
    class="fixed top-auto left-0 bottom-4 right-0"
  >
    <UContainer class="flex justify-end">
      <div
        class="bg-[var(--ui-bg)]/75 backdrop-blur
               border border-[var(--ui-primary)] rounded-[calc(var(--ui-radius)*1.5)]
               p-2 flex gap-2"
      >
        <UButton
          v-if="allSourceImagesSelected !== false"
          icon="iconoir:trash"
          color="error"
          variant="subtle"
          @click="mergeStore.removeSelectedImages"
        >
          Remove selected source image(s)
        </UButton>

        <UButton
          v-if="allImageCollectionsSelected !== false"
          icon="iconoir:download"
          color="primary"
          variant="subtle"
          @click="downloadSelectedImageCollections"
        >
          Download selected output images
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
