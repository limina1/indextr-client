<script lang="ts">
  import ArticleHeader from "$lib/ArticleHeader.svelte";
  import { indexKind } from "$lib/consts";
  import { ndk } from "$lib/ndk";
  import { NDKEvent, NDKRelayList, NDKRelaySet, type NDKUser } from "@nostr-dev-kit/ndk";

  const getEvents = (): Promise<Set<NDKEvent>> =>
    $ndk.fetchEvents(
      // @ts-ignore
      { kinds: [indexKind] },
    );

  const getEventsFromUserRelays = (userRelays: NDKRelayList): Promise<Set<NDKEvent>> => {
    const relaySet = NDKRelaySet.fromRelayUrls(userRelays!.readRelayUrls, $ndk);

    // TODO: Add more filter parameters to customize the event feed.
    return $ndk.fetchEvents(
      // @ts-ignore
      { kinds: [indexKind] },
      relaySet,
    );
  };

  let user: NDKUser | null | undefined;
  let readRelays: NDKRelayList | null | undefined;

  $: {
    user = $ndk.activeUser;
    user?.relayList().then(relays => readRelays = relays);
  }
</script>

<div class='leather flex flex-col flex-grow-0 space-y-4 overflow-y-auto w-max'>
  {#key user}
    {#if user == null || readRelays == null}
      {#await getEvents()}
        <p>Loading...</p>
      {:then events}
        {#each Array.from(events) as event}
          <ArticleHeader {event} />
        {/each}
      {/await}
    {:else}
      {#await getEventsFromUserRelays(readRelays)}
        <p>Loading...</p>
      {:then events}
        {#each Array.from(events) as event}
          <ArticleHeader {event} />
        {/each}
      {/await}
    {/if}
  {/key}
</div>
