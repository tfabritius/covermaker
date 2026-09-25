<script setup lang="ts">
const props = defineProps<{
  blob: Blob | null
  objectUrl: string | null
  title: string
  loading: boolean
}>()

const image = useTemplateRef('image')
const modalOpen = ref(false)

const mimeType = computed(() => props.blob?.type || 'application/octet-stream')

const size = computed(() => formatSize(props.blob ? props.blob.size : 0))

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} kiB`
  }
  else {
    return `${(bytes / 1048576).toFixed(2)} MiB`
  }
}

function download() {
  if (!props.blob)
    return
  const ext = mimeType.value.split('/')[1] || 'bin'
  downloadFile(props.blob, `${props.title}.${ext}`)
}
</script>

<template>
  <div
    v-if="loading"
    name="iconoir:refresh-double"
    role="status"
    aria-label="Loading image"
    class="size-24 flex items-center justify-center"
  >
    <UIcon name="iconoir:refresh-double" class="size-6 text-primary animate-spin" aria-hidden="true" />
  </div>
  <div
    v-else-if="!objectUrl"
    role="img"
    aria-label="No image available"
    class="size-24 flex items-center justify-center"
  >
    <UIcon
      name="iconoir:xmark-square"
      class="size-12 text-muted"
      aria-hidden="true"
    />
  </div>
  <UModal v-else v-model:open="modalOpen">
    <img
      ref="image"
      :src="objectUrl"
      :alt="title"
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      class="cursor-pointer"
      width="100"
      height="100"
      @keydown.enter.prevent="modalOpen = true"
      @keydown.space.prevent="modalOpen = true"
    >
    <template #title>
      {{ title }}
    </template>
    <template #description>
      {{ image?.naturalWidth }} × {{ image?.naturalHeight }} | {{ mimeType }} | {{ size }}
    </template>

    <template #body>
      <img
        :src="objectUrl"
        :alt="title"
      >
    </template>
    <template #footer>
      <UButton
        variant="ghost"
        icon="iconoir:download"
        :disabled="!blob"
        :aria-label="`Download ${title}`"
        @click="download()"
      >
        Download
      </UButton>
    </template>
  </UModal>
</template>
