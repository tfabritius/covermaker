<script setup lang="ts">
const settingsOpen = ref(false)
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <a href="#main-content" class="sr-only">
      Skip to main content
    </a>
    <header class="bg-(--ui-bg)/75 backdrop-blur border-b border-default sticky top-0 z-50">
      <UContainer class="flex items-center justify-between gap-3 h-16">
        <span aria-label="CoverMaker" class="flex items-center">
          <UIcon name="covermkr:logo" class="size-6 text-primary" aria-hidden="true" />
          <span class="text-xl font-bold text-highlighted" aria-hidden="true">
            <span class="text-primary">Cover</span>
            <span>M</span>
            <span class="text-(--ui-text-highlighted)/40">a</span>
            <span>k</span>
            <span class="text-(--ui-text-highlighted)/40">e</span>
            <span>r</span>
          </span>
        </span>

        <UButton
          icon="iconoir:settings"
          variant="ghost"
          color="neutral"
          :aria-label="settingsOpen ? 'Close settings' : 'Open settings'"
          :aria-expanded="settingsOpen"
          @click="settingsOpen = !settingsOpen"
        />
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

    <main id="main-content">
      <UContainer class="my-4 flex flex-col gap-8">
        <SectionResize />
        <SectionMerge />
      </UContainer>
    </main>

    <UFooter>
      <template #right>
        <UButton
          icon="iconoir:github"
          variant="ghost"
          color="neutral"
          aria-label="View source on GitHub"
          to="https://github.com/tfabritius/covermaker"
          target="_blank"
        />
      </template>
    </UFooter>
  </UApp>
</template>
