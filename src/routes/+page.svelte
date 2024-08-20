<script lang="ts">
  import ArticleHeader from "$lib/ArticleHeader.svelte";
  import { ndk, signedIn } from "$lib/ndk";
  import { NDKRelaySet, type NDKUser } from "@nostr-dev-kit/ndk";
  const kind = 30040;
  const count: number = 10;

  async function loadEvents(user?: NDKUser) {
    if (user == null) {
      return $ndk.fetchEvents(
        { kinds: [kind] },
        { closeOnEose: true }
      );
    }

    const relays = await user.relayList();
    const relaySet = NDKRelaySet.fromRelayUrls(relays!.readRelayUrls, $ndk);
    
    // TODO: Add more filter parameters to customize the event feed.
    return $ndk.fetchEvents(
      { authors: [user.pubkey, ], kinds: [kind] },
      { closeOnEose: true },
      relaySet,
    );
  }

  $: eventList = loadEvents($ndk.activeUser);

  signedIn.subscribe(async isSignedIn => {
    if (isSignedIn) {
      eventList = loadEvents();
    }
  });
</script>

<div class='leather flex flex-col flex-grow-0 space-y-4 overflow-y-auto w-max'>
  {#await eventList}
    <p>Loading...</p>
  {:then events}
    {#each Array.from(events) as event}
      <ArticleHeader {event} />
    {/each}
  {/await}
</div>
