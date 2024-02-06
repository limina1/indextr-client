<script lang="ts">
  import { ndk } from "$lib/ndk";
  import { nip19 } from "nostr-tools";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { idList } from "$lib/stores";
  import DefaultButton from "$lib/defaultShareButton.svelte";

  export let event: NDKEvent;
  const title: string = JSON.parse(event.content).title;
  const href: string = nip19.noteEncode(event.id);
  // console.log(event);
  // con
  // console.log(nip19.neventEncode(event));

  const handleSendEvents = () => {
    $idList = [];
    for (const id of event.tags
      .filter((tag) => tag[0] === "e")
      .map((tag) => tag[1])) {
      $idList = [...$idList, id];
    }
  };
</script>

<div class="ArticleBox">
  <a href="/{href}">
    <div class="ArticleHeader" on:click={handleSendEvents}>
      <p class="title">{title}</p>
    </div>
  </a>
  <DefaultButton {event} />
</div>
<br />

<style>
  .ArticleBox {
    /* position: relative; */
    display: grid;
    grid-template-columns: 3fr 1fr;
    border: 1px solid purple;
    border-radius: 10px;
    border-top-width: 5px;
    /* max-width: 100%; */
  }
  .ArticleHeader {
    border-radius: 10px;
    border-top-width: 5px;
    text-align: center;
    padding: 30px;
    border: 1px solid purple;
  }
  .title {
    color: white;
    font-size: 1.5em;
    font-weight: bold;
  }
</style>
