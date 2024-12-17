<script setup lang="ts">
import { useMergeStore } from '~/store/MergeStore'

const mergeStore = useMergeStore()
const { images, imageCollections } = storeToRefs(mergeStore)

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
        <div class="flex items-center gap-4">
          <div
            v-for="i in [0, 1, 2, 3]"
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
              />
            </div>
          </div>
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
            v-if="row.original.targetDataURL"
            :src="row.original.targetDataURL"
            title="Merged image"
          />
        </div>
      </template>

      <template #empty>
        <UIcon name="iconoir:emoji-sad" class="text-lg" /> <p>No images added yet.</p>
      </template>
    </UTable>
  </div>

  <div
    v-if="allSourceImagesSelected !== false"
    class="fixed top-auto left-auto bottom-4 right-4 bg-[var(--ui-bg)]
        border border-[var(--ui-primary)] rounded-[calc(var(--ui-radius)*1.5)] p-2"
  >
    <UButton
      icon="iconoir:trash"
      color="error" variant="subtle" @click="mergeStore.removeSelectedImages"
    >
      Remove selected image(s)
    </UButton>
  </div>
</template>
