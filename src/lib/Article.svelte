<script lang="ts">
  import { ndk } from '$lib/ndk';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { page } from '$app/stores';
  import { Button, Heading, Sidebar, SidebarGroup, SidebarItem, SidebarWrapper, Skeleton, TextPlaceholder, Tooltip } from 'flowbite-svelte';
  import showdown from 'showdown';
  import { onMount } from 'svelte';
  import { BookOutline } from 'flowbite-svelte-icons';
  import { alexandriaKinds } from './stores';

  export let event: NDKEvent | null | undefined;

  async function getEvents(index?: NDKEvent | null | undefined): Promise<IterableIterator<NDKEvent>> {
    if (index == null) {
      // TODO: Add error handling.
    }

    const eventSet = await $ndk.fetchEvents({
      kinds: $alexandriaKinds,
      ids: index!.getMatchingTags('e').map((value) => value[1]),
    });
    
    return eventSet.values();
  }

  $: eventPromises = getEvents(event);
  
  $: activeHash = $page.url.hash;

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

  let showToc: boolean = true;
  let showTocButton: boolean = false;
  const tocBreakpoint = 1140;

  /**
   * Hides the table of contents sidebar when the window shrinks below a certain size.  This
   * prevents the sidebar from occluding the article content.
   */
  const setTocVisibilityOnResize = () => {
    showToc = window.innerWidth >= tocBreakpoint;
    showTocButton = window.innerWidth < tocBreakpoint;
  };

  /**
   * Hides the table of contents sidebar when the user clicks outside of it.
   */
  const hideTocOnClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;

    if (target.closest('.sidebar-leather') || target.closest('.btn-leather')) {
      return;
    }

    if (showToc) {
      showToc = false;
    }
  };

  onMount(() => {
    // Always check whether the TOC sidebar should be visible.
    setTocVisibilityOnResize();

    window.addEventListener('hashchange', scrollToElementWithOffset);
    // Also handle the case where the user lands on the page with a hash in the URL
    scrollToElementWithOffset();

    window.addEventListener('resize', setTocVisibilityOnResize);
    window.addEventListener('click', hideTocOnClick);

    return () => {
      window.removeEventListener('hashchange', scrollToElementWithOffset);
      window.removeEventListener('resize', setTocVisibilityOnResize);
      window.removeEventListener('click', hideTocOnClick);
    };
  });

  const converter = new showdown.Converter();
</script>

{#await eventPromises}
  <Sidebar class='sidebar-leather fixed top-20 left-0 px-4 w-60'>
    <SidebarWrapper>
      <Skeleton/>
    </SidebarWrapper>
  </Sidebar>
  <TextPlaceholder class='max-w-2xl'/>
{:then events}
  {#if showTocButton && !showToc}
    <Button
      class='btn-leather fixed top-20 left-4 h-6 w-6'
      outline={true}
      on:click={ev => {
        showToc = true;
        ev.stopPropagation();
      }}
    >
      <BookOutline />
    </Button>
    <Tooltip>
      Show Table of Contents
    </Tooltip>
  {/if}
  {#if showToc}
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
  {/if}
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
