<script lang="ts">
  import ArticleHeader from "$lib/ArticleHeader.svelte";
  import { FeedType, indexKind } from "$lib/consts";
  import { ndk } from "$lib/ndk";
  import { NDKEvent, NDKRelayList, NDKRelaySet, NDKSubscriptionCacheUsage, type NDKUser } from "@nostr-dev-kit/ndk";
  import { Button, Dropdown, Radio } from "flowbite-svelte";
  import { ChevronDownOutline } from "flowbite-svelte-icons";

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

  const getEventsFromUserFollows = (follows: Set<NDKUser>, userRelays: NDKRelayList): Promise<Set<NDKEvent>> => {
    const relaySet = NDKRelaySet.fromRelayUrls(userRelays?.readRelayUrls ?? [], $ndk);
    const pubkeys = Array.from(follows ?? []).map(user => user.pubkey);

    return $ndk.fetchEvents(
      { 
        authors: pubkeys,
        // @ts-ignore
        kinds: [indexKind]
      },
      relaySet,
    );
  };

  const getFeedTypeFriendlyName = (feedType: FeedType): string => {
    switch (feedType) {
    case FeedType.Relays:
      return 'Relays';
    case FeedType.Follows:
      return 'Follows';
    default:
      return '';
    }
  };

  let user: NDKUser | null | undefined;
  let readRelays: NDKRelayList | null | undefined;
  let userFollows: Set<NDKUser> | null | undefined;
  let feedType: FeedType = FeedType.Relays;

  $: {
    user = $ndk.activeUser;
    user?.relayList().then(relays => readRelays = relays);
    user?.follows().then(follows => userFollows = follows);
  }
</script>

<div class='leather flex flex-col flex-grow-0 space-y-4 overflow-y-auto w-max p-2'>
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
      <div class='leather w-full flex justify-end'>
        <Button>
          {`Showing articles from: ${getFeedTypeFriendlyName(feedType)}`}<ChevronDownOutline class='w-6 h-6' />
        </Button>
        <Dropdown class='w-fit p-2 space-y-2 text-sm'>
          <li>
            <Radio name='relays' bind:group={feedType} value={FeedType.Relays}>Relays</Radio>
          </li>
          <li>
            <Radio name='follows' bind:group={feedType} value={FeedType.Follows}>Follows</Radio>
          </li>
        </Dropdown>
      </div>
      {#if feedType === FeedType.Relays && readRelays != null}
        {#await getEventsFromUserRelays(readRelays)}
          <p>Loading...</p>
        {:then events}
          {#each Array.from(events) as event}
            <ArticleHeader {event} />
          {/each}
        {/await}
      {:else if feedType === FeedType.Follows && userFollows != null}
        {#await getEventsFromUserFollows(userFollows, readRelays)}
          <p>Loading...</p>
        {:then events}
          {#each Array.from(events) as event}
            <ArticleHeader {event} />
          {/each}
        {/await}
      {/if}
    {/if}
  {/key}
</div>
