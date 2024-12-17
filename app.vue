<script setup lang="ts">
const activePage = ref('resize')
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <header class="bg-[var(--ui-bg)]/75 backdrop-blur border-b border-[var(--ui-border)] sticky top-0 z-50">
      <div
        class="max-w-[var(--ui-container)] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-16"
      >
        <span
          class="flex items-center"
        >
          <UIcon name="covermkr:logo" class="size-6 text-[var(--ui-primary)]" />
          <span class="text-xl font-bold text-[var(--ui-text-highlighted)]">

            <span class="text-[var(--ui-primary)]">Cover</span>
            <span>M</span>
            <span class="text-[var(--ui-text-highlighted)]/40">a</span>
            <span>k</span>
            <span class="text-[var(--ui-text-highlighted)]/40">e</span>
            <span>r</span>
          </span>
        </span>

        <UNavigationMenu
          class="ml-4"
          :items="[
            {
              label: 'Resize images to aspect ratio',
              icon: 'iconoir:expand',
              onSelect: () => activePage = 'resize',
              active: activePage === 'resize',
            },
            {
              label: 'Merge images',
              icon: 'iconoir:cell-2x2',
              onSelect: () => activePage = 'merge',
              active: activePage === 'merge',
            },
            {
              label: 'Settings',
              icon: 'iconoir:settings',
              onSelect: () => activePage = 'settings',
              active: activePage === 'settings',
            },
          ]"
        />
      </div>
    </header>

    <UContainer class="my-4">
      <TabResize v-if="activePage === 'resize'" @nav-to="page => activePage = page" />
      <TabMerge v-else-if="activePage === 'merge'" />
      <TabSettings v-else-if="activePage === 'settings'" />
    </UContainer>
  </UApp>
</template>

<style lang="css">
@import "tailwindcss";
@import "@nuxt/ui";
</style>
