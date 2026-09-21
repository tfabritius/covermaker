<script lang="ts" setup>
import { useDropZone } from '@vueuse/core'

const props = defineProps<{
  dataTypes?: string[] | undefined
  multiple?: boolean
}>()

const emit = defineEmits<{
  (event: 'filesAdded', files: File[]): void
}>()

const zoneRef = useTemplateRef('zoneRef')
const { isOverDropZone } = useDropZone(zoneRef, {
  onDrop: (files) => {
    if (files)
      emit('filesAdded', files)
  },
  ...(props.dataTypes !== undefined ? { dataTypes: props.dataTypes } : {}),
  multiple: props.multiple,
})
</script>

<template>
  <div ref="zoneRef" @dragover.prevent>
    <slot :is-over-drop-zone="isOverDropZone" />
  </div>
</template>
