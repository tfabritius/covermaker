<script setup lang="ts">
const settingsOpen = ref(false)
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <header class="bg-[var(--ui-bg)]/75 backdrop-blur border-b border-[var(--ui-border)] sticky top-0 z-50">
      <UContainer class="flex items-center justify-between gap-3 h-16">
        <span class="flex items-center">
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

        <UButton
          icon="iconoir:settings"
          variant="ghost"
          color="neutral"
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

    <UContainer class="my-4 flex flex-col gap-8">
      <SectionResize />
      <SectionMerge />
    </UContainer>

    <UFooter>
      <template #right>
        <UButton
          icon="iconoir:github"
          variant="ghost"
          color="neutral"
          to="https://github.com/tfabritius/covermaker"
          target="_blank"
        />
      </template>
    </UFooter>
  </UApp>
</template>
