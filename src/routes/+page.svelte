<script lang="ts">
  import ArticleHeader from "$lib/ArticleHeader.svelte";
  import { ndk } from "$lib/ndk";
  import { nip19 } from "nostr-tools";
  import { idList } from "$lib/stores";
  const kind = 30040;
  const count: number = 10;

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
    {#each Array.from(events) as event, i}
      <ArticleHeader {event} />
    {/each}
  {/await}
</div>
