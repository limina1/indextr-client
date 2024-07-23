<script lang="ts">
  import ArticleHeader from "$lib/ArticleHeader.svelte";
  import { ndk } from "$lib/ndk";
  const kind = 30040;
  const count: number = 10;

  // TODO: Add more filter parameters to customize the event feed.
  async function loadEvents() {
    const eventlist = await $ndk.fetchEvents({ kinds: [kind] });
    return eventlist;
  }
  const eventlist = loadEvents();
</script>

<div class='leather flex flex-col flex-grow-0 space-y-4 overflow-y-auto w-max'>
  {#await eventlist}
    <p>Loading...</p>
  {:then events}
    {#each Array.from(events) as event}
      <ArticleHeader {event} />
    {/each}
  {/await}
</div>
