<script lang="ts">
  import Pharos from "$lib/parser";
  import { Heading } from "flowbite-svelte";

  export let parser: Pharos;
  export let rootIndexId: string;
  export let depth: number = 0;

  const title = parser.getIndexTitle(rootIndexId);
  const orderedChildren = parser.getOrderedChildIds(rootIndexId);
  const childIndices = parser.getChildIndexIds(rootIndexId);
  const childZettels = parser.getChildZettelIds(rootIndexId);

  const getHeadingTag = (depth: number) => {
    switch (depth) {
    case 0:
      return "h2";
    case 1:
      return "h3";
    case 2:
      return "h4";
    case 3:
      return "h5";
    case 4:
      return "h6";
    }
  };
</script>

<div>
  {#if depth < 4}
    <Heading tag={getHeadingTag(depth)}>{title}</Heading>
    {#each orderedChildren as id}
      {#if childIndices.includes(id)}
        <svelte:self {parser} rootIndexId={id} depth={depth + 1} />
      {:else if (childZettels.includes(id))}
        {@html parser.getHtmlContent(id)}
      {/if}
    {/each}
  {:else}
    {@html parser.getHtmlContent(rootIndexId)}
  {/if}
</div>