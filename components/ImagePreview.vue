<script setup lang="ts">
const props = defineProps<{
  blob: Blob | null
  objectUrl: string | null
  title: string
  loading: boolean
}>()

const image = useTemplateRef('image')

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
    class="size-24 flex items-center justify-center"
  >
    <UIcon name="iconoir:refresh-double" class="size-6 text-primary animate-spin" />
  </div>
  <div
    v-else-if="!objectUrl"
    class="size-24 flex items-center justify-center"
  >
    <UIcon
      name="iconoir:xmark-square"
      class="size-12 text-muted"
    />
  </div>
  <UModal v-else>
    <img
      ref="image"
      :src="objectUrl"
      class="cursor-pointer"
      width="100"
      height="100"
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
      >
    </template>
    <template #footer>
      <UButton
        variant="ghost"
        icon="iconoir:download"
        :disabled="!blob"
        @click="download()"
      >
        Download
      </UButton>
    </template>
  </UModal>
</template>
