<script setup lang="ts">
const activePage = ref('resize')
const settingsOpen = ref(false)
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <header class="bg-[var(--ui-bg)]/75 backdrop-blur border-b border-[var(--ui-border)] sticky top-0 z-50">
      <UContainer class="flex items-center justify-between gap-3 h-16">
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
              onSelect: () => settingsOpen = !settingsOpen,
            },
          ]"
        />
        <div class="flex items-center justify-end">
          <UButton
            icon="iconoir:github"
            variant="ghost"
            color="neutral"
            to="https://github.com/tfabritius/covermaker"
            target="_blank"
          />
        </div>
      </UContainer>
    </header>

    <USlideover
      v-model:open="settingsOpen"
      title="Settings"
    >
      <template #body>
        <AppSettings />
      </template>
    </USlideover>

    <UContainer class="my-4">
      <TabResize v-if="activePage === 'resize'" @nav-to="page => activePage = page" />
      <TabMerge v-else-if="activePage === 'merge'" />
    </UContainer>
  </UApp>
</template>
