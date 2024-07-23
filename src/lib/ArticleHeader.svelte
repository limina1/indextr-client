<script lang="ts">
  import { neventEncode } from "$lib/utils";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { standardRelays } from "./consts";
  import { idList } from "$lib/stores";
  import { Card, Button, Modal, Tooltip } from "flowbite-svelte";
  import { ClipboardCheckOutline, ClipboardCleanOutline, CodeOutline, ShareNodesOutline } from "flowbite-svelte-icons";

  export let event: NDKEvent;
  const title: string = JSON.parse(event.content).title;
  const href: string = neventEncode(event);

  const handleSendEvents = () => {
    $idList = [];
    for (const id of event.tags
      .filter((tag) => tag[0] === "e")
      .map((tag) => tag[1])) {
      $idList = [...$idList, id];
    }
  };

  let eventIdCopied: boolean = false;
  function copyEventId() {
    console.debug("copyEventID");
    const relays: string[] = standardRelays;
    const naddr = neventEncode(event, relays);

    navigator.clipboard.writeText(naddr);

    eventIdCopied = true;
  }

  let jsonModalOpen: boolean = false;
  function viewJson() {
    console.debug("viewJSON");
    const relays: string[] = standardRelays;
    const naddr = neventEncode(event, relays);
    jsonModalOpen = true;
  }

  let shareLinkCopied: boolean = false;
  function shareNjump() {
    const relays: string[] = standardRelays;
    const naddr = neventEncode(event, relays);

    console.debug(naddr);
    navigator.clipboard.writeText(`njump.me/${naddr}`);

    shareLinkCopied = true;
  }
</script>

<Card class='ArticleBox card-leather w-lg'>
  <div class='flex flex-col space-y-4'>
    <a href="/{href}" on:click={handleSendEvents}>
      <h2>{title}</h2>
    </a>
    <div class='w-full flex space-x-2 justify-end'>
      <Button class='btn-leather' size='xs' on:click={shareNjump}><ShareNodesOutline /></Button>
      <Tooltip class='tooltip-leather' type='auto' placement='top' on:show={() => shareLinkCopied = false}>
        {#if shareLinkCopied}
          <ClipboardCheckOutline />
        {:else}
          Share via NJump
        {/if}
      </Tooltip>
      <Button class='btn-leather' size='xs' outline on:click={copyEventId}><ClipboardCleanOutline /></Button>
      <Tooltip class='tooltip-leather' type='auto' placement='top' on:show={() => eventIdCopied = false}>
        {#if eventIdCopied}
          <ClipboardCheckOutline />
        {:else}
          Copy event ID
        {/if}
      </Tooltip>
      <Button class='btn-leather' size='xs' outline on:click={viewJson}><CodeOutline /></Button>
      <Tooltip class='tooltip-leather' type='auto' placement='top'>View JSON</Tooltip>
    </div>
  </div>
  <Modal class='modal-leather' title='Event JSON' bind:open={jsonModalOpen} autoclose outsideclose size='sm'>
    <code>{JSON.stringify(event.rawEvent())}</code>
  </Modal>
</Card>
