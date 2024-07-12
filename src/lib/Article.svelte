<script lang="ts">
  import { ndk } from '$lib/ndk';
  import { idList } from '$lib/stores';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { page } from '$app/stores';
  import { Heading, Sidebar, SidebarGroup, SidebarItem, SidebarWrapper, Skeleton, TextPlaceholder } from 'flowbite-svelte';
  import showdown from 'showdown';
  import { sineIn } from 'svelte/easing';
  import { onMount } from 'svelte';
  
  $: activeHash = $page.url.hash;

  async function getEvents(): Promise<NDKEvent[]> {
    const eventPromises = $idList.map(async (id) => await $ndk.fetchEvent(id));
    const events = await Promise.all(eventPromises);
    return events.filter((event) => event != null);
  }

  function normalizeHashPath(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  function scrollToElementWithOffset() {
    const hash = window.location.hash;
    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'auto',
        });
      }
    }
  }

  onMount(() => {
    window.addEventListener('hashchange', scrollToElementWithOffset);
    // Also handle the case where the user lands on the page with a hash in the URL
    scrollToElementWithOffset();

    return () => {
      window.removeEventListener('hashchange', scrollToElementWithOffset);
    };
  });

  const converter = new showdown.Converter();
</script>

{#await getEvents()}
  <Sidebar class='sidebar-leather fixed top-20 left-0 px-4 w-60'>
    <SidebarWrapper>
      <Skeleton/>
    </SidebarWrapper>
  </Sidebar>
  <TextPlaceholder class='max-w-2xl'/>
{:then events}
  <!-- TODO: Collapse the sidebar when the page gets below a certain width. -->
  <!-- TODO: Handle hash paths for navigation within the article. -->
  <Sidebar class='sidebar-leather fixed top-20 left-0 px-4 w-60' {activeHash}>
    <SidebarWrapper>
      <SidebarGroup class='sidebar-group-leather overflow-y-scroll'>
        {#each events as event}
          <SidebarItem
            class='sidebar-item-leather'
            label={event.getMatchingTags('title')[0][1]}
            href={`${$page.url.pathname}#${normalizeHashPath(event.getMatchingTags('title')[0][1])}`}
          />
        {/each}
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
  <div class='flex flex-col space-y-4 max-w-2xl'>
    {#each events as event}
      <div class='note-leather flex flex-col space-y-2'>
        <Heading
          tag='h3'
          class='h-leather'
          id={normalizeHashPath(event.getMatchingTags('title')[0][1])}
        >
          {event.getMatchingTags('title')[0][1]}
        </Heading>
        {@html converter.makeHtml(event.content)}
      </div>
    {/each}
  </div>
{/await}

<style>
  :global(.sidebar-group-leather) {
    max-height: calc(100vh - 8rem);
  }
</style>
