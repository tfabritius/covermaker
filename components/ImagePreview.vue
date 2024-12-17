<script setup lang="ts">
const props = defineProps<{
  src: string
  title: string
}>()

const image = useTemplateRef('image')

const mimeType = computed(() => props.src.split(';')[0].split(':')[1])

const size = computed(() => formatSize(dataURLToBlob(props.src).size))

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

function downloadImage(dataUrl: string, baseName: string) {
  const ext = mimeType.value.split('/')[1]
  const blob = dataURLToBlob(dataUrl)
  downloadFile(blob, `${baseName}.${ext}`)
}
</script>

<template>
  <UModal>
    <img
      ref="image"
      :src="src"
      class="cursor-pointer"
      width="100"
      height="100"
    >
    <template #title>
      {{ title }}
    </template>
    <template #description>
      {{ image?.naturalWidth }} x {{ image?.naturalHeight }} | {{ mimeType }} | {{ size }}
    </template>

    <template #body>
      <img
        :src="src"
      >
    </template>
    <template #footer>
      <UButton
        variant="ghost"
        icon="iconoir:download"
        @click="downloadImage(src, title)"
      >
        Download
      </UButton>
    </template>
  </UModal>
</template>
