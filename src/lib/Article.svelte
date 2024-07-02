<script lang="ts">
  import { ndk } from '$lib/ndk';
  import Toc from '$lib/components/Toc.svelte';
  import Notes from '$lib/components/Note.svelte';
  import { idList } from '$lib/stores';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { page } from '$app/stores';
  import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
  
  $: activeUrl = $page.url.pathname;

  let events: NDKEvent[] = [];

  async function getEvents() {
    $idList.forEach(async (id) => {
      const event = await $ndk.fetchEvent(id);
      events = [...events, event];
    });
  }
</script>

{#await getEvents() then article}
  <Sidebar {activeUrl}>
    <SidebarWrapper>
      <SidebarGroup>
        {#each events as event}
          <SidebarItem
            title={event.getMatchingTags('title')[0][1]}
            href={nip19.noteEncode(event.id)}
          />
        {/each}
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
<!-- <div class="article">
    <div class="toc">
      <Toc notes={events} />
    </div>

    <div class="article-content">
      <Notes notes={events} />
    </div>
  </div> -->
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
