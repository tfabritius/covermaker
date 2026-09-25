<script setup lang="ts">
import { useMergeStore } from '~/store/MergeStore'

const mergeStore = useMergeStore()
const { imageCollections } = storeToRefs(mergeStore)

const allImageCollectionsSelected = computed<boolean | 'indeterminate'>({
  get: () => {
    if (imageCollections.value.every(ic => !ic.selected))
      return false
    if (imageCollections.value.every(ic => ic.selected))
      return true
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

const selectedCount = computed(() => imageCollections.value.filter(ic => ic.selected).length)

const selectionMenuItems = [[
  {
    label: 'Download selected',
    icon: 'iconoir:download',
    onSelect: () => downloadSelectedImageCollections(),
  },
]]

async function downloadSelectedImageCollections() {
  const content = await zipImages(
    imageCollections.value
      .filter(ic => ic.selected && ic.targetBlob)
      .map(ic => ({
        basename: ic.basename,
        blob: ic.targetBlob as Blob,
      })),
  )

  downloadFile(content, 'images.zip')
}
</script>

<template>
  <div v-if="imageCollections.length > 0" data-testid="section-merge">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-[var(--ui-text-highlighted)]">
        <span class="text-[var(--ui-primary)]">2.</span> Merge images
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

    <div class="flex items-center gap-2 mb-3">
      <UCheckbox v-model="allImageCollectionsSelected" />
      <span class="text-sm text-[var(--ui-text-muted)]">Select all</span>
    </div>

    <div class="flex flex-wrap gap-4">
      <UCard
        v-for="(ic, i) in imageCollections"
        :key="i"
        data-testid="merge-collection-card"
        class="cursor-pointer"
        :class="ic.selected ? 'ring-2 ring-[var(--ui-primary)]' : ''"
        @click="ic.selected = !ic.selected"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <UCheckbox :model-value="ic.selected" @click.stop @update:model-value="ic.selected = !!$event" />
            <span class="text-sm font-medium">{{ ic.basename }}</span>
          </div>
        </template>
        <ImagePreview
          :blob="ic.targetBlob || null"
          :object-url="ic.targetUrl"
          :title="ic.basename"
          :loading="ic.loading"
        />
      </UCard>
    </div>
  </div>
</template>
