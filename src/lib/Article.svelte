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

  const converter = new showdown.Converter();

  const transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn
  };

  let width: number;
  let breakpoint: number = 768; // Tailwind md breakpoint
  let drawerHidden: boolean = false;
  $: width >= breakpoint
    ? drawerHidden = false
    : drawerHidden = true;
  onMount(() => {
    width >= breakpoint
      ? drawerHidden = false
      : drawerHidden = true;
  });
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
      <SidebarGroup>
        {#each events as event}
          <SidebarItem
            class='sidebar-item-leather'
            label={event.getMatchingTags('title')[0][1]}
            href={`${$page.url.pathname}#${event.getMatchingTags('title')[0][1]}`}
          />
        {/each}
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
  <div class='flex flex-col space-y-4 max-w-2xl'>
    {#each events as event}
      <div class='note-leather flex flex-col space-y-2'>
        <Heading tag='h3' class='h-leather'>{event.getMatchingTags('title')[0][1]}</Heading>
        {@html converter.makeHtml(event.content)}
      </div>
    {/each}
  </div>
{/await}

<style>
  .article {
    display: flex;
    padding: 1rem;
  }
  .toc {
    padding: 3%;
    min-width: 5%;
    padding-top: 1%;
    border: 1px white solid;
    border-radius: 10px;
    border-top-width: 5px;
  }
  .article-content {
    min-width: 80%;
    max-width: 85%;
    padding: 1%;
    border: 1px white solid;
    border-radius: 10px;
    border-top-width: 5px;
  }
</style>
