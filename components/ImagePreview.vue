<script setup lang="ts">
const props = defineProps<{
  src: string | null
  title: string
  loading: boolean
}>()

const image = useTemplateRef('image')

const mimeType = computed(() => (props.src ?? '').split(';')[0]?.split(':')[1])

const size = computed(() => formatSize(dataURLToBlob(props.src ?? '').size))

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
  const ext = mimeType.value?.split('/')[1]
  const blob = dataURLToBlob(dataUrl)
  downloadFile(blob, `${baseName}.${ext}`)
}
</script>

<template>
  <div
    v-if="loading"
    name="iconoir:refresh-double"
    class="size-24 flex items-center justify-center"
  >
    <UIcon name="iconoir:refresh-double" class="size-6 text-[var(--ui-primary)] animate-spin" />
  </div>
  <div
    v-else-if="src === null"
    class="size-24 flex items-center justify-center"
  >
    <UIcon
      name="iconoir:xmark-square"
      class="size-12 text-[var(--ui-text-muted)]"
    />
  </div>
  <UModal v-else>
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
      {{ image?.naturalWidth }} × {{ image?.naturalHeight }} | {{ mimeType }} | {{ size }}
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
