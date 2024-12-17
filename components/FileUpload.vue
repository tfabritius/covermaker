<script lang="ts" setup>
import { useDropZone } from '@vueuse/core'

const props = defineProps<{
  dataTypes?: string[]
  multiple?: boolean
}>()

const emit = defineEmits<{
  (event: 'filesAdded', files: File[]): void
}>()

const dropZone = useTemplateRef('dropZoneRef')

const { isOverDropZone } = useDropZone(dropZone, {
  onDrop: emitFiles,
  // TODO blocked by: https://github.com/vueuse/vueuse/issues/3910
  // dataTypes: props.dataTypes,
  multiple: props.multiple,
})

const fileInput = ref<HTMLInputElement>()

function emitFiles(files: File[] | null) {
  if (files) {
    emit('filesAdded', files)
  }
};

function onClick() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    emitFiles(Array.from(input.files))
  }
}
</script>

<template>
  <div
    ref="dropZoneRef"
    class="rounded-[calc(var(--ui-radius)*1.5)] font-medium items-center focus:outline-hidden transition-colors  text-sm gap-1.5 ring ring-inset ring-[var(--ui-border-accented)] text-[var(--ui-text)] bg-[var(--ui-bg)] hover:bg-[var(--ui-bg-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--ui-border-inverted)] p-1.5 cursor-pointer"
    :class="{
      'bg-[var(--ui-bg-elevated)]': isOverDropZone,
    }"
    @dragover.prevent
    @click="onClick"
  >
    <slot />
    <input
      ref="fileInput"
      type="file"
      :accept="dataTypes?.join(',') || '*/*'"
      :multiple="multiple"
      class="hidden"
      @change="onFileChange"
    >
  </div>
</template>
