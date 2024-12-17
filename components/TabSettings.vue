<script setup lang="ts">
import { useMergeStore } from '~/store/MergeStore'
import { useResizeStore } from '~/store/ResizeStore'

const colorMode = useColorMode()

const resizeStore = useResizeStore()
const { config: resizeConfig, targetAspectRatioValid } = storeToRefs(resizeStore)

const mergeStore = useMergeStore()
const { config: mergeConfig } = storeToRefs(mergeStore)
</script>

<template>
  <div class="flex justify-center">
    <div class="w-200 flex flex-col gap-4">
      <h2 class="text-lg font-semibold">
        General settings
      </h2>

      <UFormField
        label="Color mode"
      >
        <USelect
          v-model="colorMode.preference"
          :items="[
            { label: 'System', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]"
          class="w-50"
        />
      </UFormField>

      <USeparator />

      <h2 class="text-lg font-semibold flex items-center gap-1">
        <UIcon name="iconoir:expand" /> Resize settings
      </h2>

      <UFormField
        label="Target aspect ratio"
        description="The aspect ratio to which the image will be enlarged."
        hint="width:height"
      >
        <UButtonGroup class="w-50">
          <UInput
            v-model="resizeConfig.targetAspectRatio"
            class="w-full"
            variant="outline"
          >
            <template #trailing>
              <UIcon
                v-if="targetAspectRatioValid"
                class="text-green-500"
                name="iconoir:check"
              />
              <UIcon
                v-else
                class="text-red-500"
                name="iconoir:warning-triangle"
              />
            </template>
          </UInput>
          <UDropdownMenu
            :items="[
              { label: '4:3', onSelect: () => resizeConfig.targetAspectRatio = '4:3' },
              { label: '3:2', onSelect: () => resizeConfig.targetAspectRatio = '3:2' },
              { label: '1:1', onSelect: () => resizeConfig.targetAspectRatio = '1:1' },
            ]"
          >
            <UButton
              icon="iconoir:more-horiz"
              color="neutral"
              variant="outline"
            />
          </UDropdownMenu>
        </UButtonGroup>
      </UFormField>

      <UFormField
        label="Rotate image"
        description="Determines whether images should be rotated by 90°."
      >
        <USelect
          v-model="resizeConfig.rotate"
          class="w-50"
          :items="['auto', 'on', 'off']"
        />
      </UFormField>

      <UFormField
        label="Blur factor"
      >
        <div class="flex w-50">
          <USlider
            v-model="resizeConfig.blur"
            :min="0"
            :max="10"
            :step=".1"
          />
          <span class="ml-1">{{ resizeConfig.blur.toFixed(1) }}</span>
        </div>
      </UFormField>

      <UFormField
        label="Target image file format"
      >
        <USelect
          v-model="resizeConfig.format"
          class="w-50"
          :items="[
            { label: 'original', value: 'original' },
            { label: 'jpeg', value: 'image/jpeg' },
            { label: 'png', value: 'image/png' },
          ]"
        />
      </UFormField>

      <USeparator />

      <h2 class="text-lg font-semibold flex items-center gap-1">
        <UIcon name="iconoir:cell-2x2" /> Merge settings
      </h2>
      <UFormField
        label="Target image file format"
      >
        <USelect
          v-model="mergeConfig.format"
          class="w-50"
          :items="[
            { label: 'jpeg', value: 'image/jpeg' },
            { label: 'png', value: 'image/png' },
          ]"
        />
      </UFormField>
    </div>
  </div>
</template>
