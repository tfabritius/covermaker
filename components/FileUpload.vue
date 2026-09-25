<script lang="ts" setup>
defineProps<{
  dataTypes?: string[]
  multiple?: boolean
}>()

const emit = defineEmits<{
  (event: 'filesAdded', files: File[]): void
}>()

const fileInput = ref<HTMLInputElement>()

function onClick() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    emit('filesAdded', [...input.files])
  }
}
</script>

<template>
  <DropZone :multiple :data-types="dataTypes" @files-added="emit('filesAdded', $event)">
    <template #default="{ isOverDropZone }">
      <div
        class="rounded-[calc(var(--ui-radius)*1.5)] font-medium items-center focus:outline-hidden transition-colors text-sm gap-1.5 ring ring-inset text-default bg-default hover:bg-elevated focus-visible:ring-2 focus-visible:ring-inverted p-1.5 cursor-pointer"
        :class="isOverDropZone ? 'bg-elevated ring-primary' : 'ring-accented'"
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
  </DropZone>
</template>
