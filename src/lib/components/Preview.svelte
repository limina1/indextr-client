<script lang="ts">
  import { parser } from "$lib/parser";
  import { Button, Heading, P, Tooltip } from "flowbite-svelte";
  import { CaretDownSolid, CaretUpSolid, EditOutline } from "flowbite-svelte-icons";

  export let sectionClass: string = '';

  export let rootIndexId: string;
  export let depth: number = 0;
  export let allowEditing: boolean = false;
  // TODO: Add editing functionality.
  const isEditing: boolean = false;

  const title = $parser.getIndexTitle(rootIndexId);
  const orderedChildren = $parser.getOrderedChildIds(rootIndexId);
  const childIndices = $parser.getChildIndexIds(rootIndexId);
  const childZettels = $parser.getChildZettelIds(rootIndexId);

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

<section class={`note-leather flex flex-col space-y-2 ${sectionClass}`}>
  {#if depth < 4}
    <Heading tag={getHeadingTag(depth)} class='h-leather'>{title}</Heading>
    {#each orderedChildren as id, index}
      {#if childIndices.includes(id)}
        <svelte:self rootIndexId={id} depth={depth + 1} {allowEditing} />
      {:else if (childZettels.includes(id))}
        <div class='grid grid-cols-[1fr_auto] gap-2'>
          <P class='note-leather' firstupper={index === 0}>
            {@html $parser.getContent(id)}
          </P>
          {#if allowEditing}
            <div class='flex flex-col space-y-2 justify-start'>
              <Button class='btn-leather' size='sm' outline>
                <CaretUpSolid />
              </Button>
              <Button class='btn-leather' size='sm' outline>
                <CaretDownSolid />
              </Button>
              <Button class='btn-leather' size='sm' outline>
                <EditOutline />
              </Button>
              <Tooltip class='tooltip-leather' type='auto' placement='top'>
                Edit
              </Tooltip>
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  {:else}
    <P class='note-leather' firstupper>
      {@html $parser.getContent(rootIndexId)}
    </P>
  {/if}
</section>