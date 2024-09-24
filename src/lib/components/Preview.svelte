<script lang="ts">
  import Pharos from "$lib/parser";
  import { Heading, P } from "flowbite-svelte";

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

<section class='note-leather flex flex-col space-y-2'>
  {#if depth < 4}
    <Heading tag={getHeadingTag(depth)}>{title}</Heading>
    {#each orderedChildren as id, index}
      {#if childIndices.includes(id)}
        <svelte:self {parser} rootIndexId={id} depth={depth + 1} />
      {:else if (childZettels.includes(id))}
        <P class='note-leather' firstupper={index === 0}>
          {@html parser.getContent(id)}
        </P>
      {/if}
    {/each}
  {:else}
    <P class='note-leather' firstupper>
      {@html parser.getContent(rootIndexId)}
    </P>
  {/if}
</section>