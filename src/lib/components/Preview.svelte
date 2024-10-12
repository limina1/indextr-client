<script lang="ts">
  import { parser } from "$lib/parser";
    import { hoverTargetId } from "$lib/stores";
  import { Button, Heading, P, Textarea, Tooltip } from "flowbite-svelte";
  import { CaretDownSolid, CaretUpSolid, EditOutline } from "flowbite-svelte-icons";

  export let sectionClass: string = '';
  export let isSectionStart: boolean = false;
  export let rootId: string;
  export let depth: number = 0;
  export let allowEditing: boolean = false;

  let isEditing: boolean = false;
  let currentContent: string;

  const title = $parser.getIndexTitle(rootId);
  const orderedChildren = $parser.getOrderedChildIds(rootId);

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

  const handleFocus = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.id === rootId) {
      $hoverTargetId = rootId;
      e.stopPropagation();
    }
  };

  const handleBlur = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.id === rootId) {
      $hoverTargetId = '';
      e.stopPropagation();
    }
  };

  // TODO: Trigger rerender when editing state changes.
  const toggleEditing = (id: string, shouldSave: boolean = true) => {
    const editing = isEditing;
    currentContent = $parser.getContent(id);

    if (editing && shouldSave) {
      // TODO: Save updated content.
    }

    isEditing = !editing;
  };
</script>

<!-- This component is recursively structured.  The base case is single block of content. -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<section
  id={rootId}
  class={`note-leather w-full flex space-x-2 ${sectionClass}`}
  on:mouseover={handleFocus}
  on:focus={handleFocus}
>
  <!-- Zettel base case -->
  {#if orderedChildren.length === 0 || depth >= 4}
    <P firstupper={isSectionStart}>
      {@html $parser.getContent(rootId)}
    </P>
  {:else}
    <div class='flex flex-col space-y-2'>
      <Heading tag={getHeadingTag(depth)} class='h-leather'>
        {title}
      </Heading>
      <!-- Recurse on child indices and zettels -->
      {#each orderedChildren as id, index}
        <svelte:self rootId={id} depth={depth + 1} {allowEditing} isSectionStart={index === 0} />
      {/each}
    </div>
  {/if}
  {#if allowEditing}
    <div class={`flex flex-col space-y-2 justify-start ${$hoverTargetId === rootId ? 'visible' : 'invisible'}`}>
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
</section>

<!-- <section class={`note-leather grid grid-cols-[1fr_auto] gap-2 ${sectionClass}`}>
  <div class={`flex flex-col space-y-2 ${depth > 0 ? 'border-l-gray-500 border-l pl-2' : ''}`}>
    {#if depth < 4}
      <Heading tag={getHeadingTag(depth)} class='h-leather'>{title}</Heading>
      {#each orderedChildren as id, index}
        {#if childIndices.includes(id)}
          <svelte:self rootIndexId={id} depth={depth + 1} {allowEditing} />
        {:else if (childZettels.includes(id))}
          <div class='note-leather grid grid-cols-[1fr_auto] gap-2'>
            {#if isEditing.get(id)}
              <form>
                <Textarea class='textarea-leather' rows={5} bind:value={editorContent[id]}>
                  <div slot='footer' class='flex justify-end'>
                    <Button class='btn-leather' size='sm' outline on:click={() => toggleEditing(id, false)}>
                      Cancel
                    </Button>
                    <Button class='btn-leather' size='sm' on:click={() => toggleEditing(id)}>
                      Save
                    </Button>
                  </div>
                </Textarea>
              </form>
            {:else}
              <P class='border-l-gray-500 border-l pl-2' firstupper={index === 0}>
                {@html $parser.getContent(id)}
              </P>
            {/if}
            {#if allowEditing}
              <div class='col-start-2 flex flex-col space-y-2 justify-start'>
                <Button class='btn-leather' size='sm' outline>
                  <CaretUpSolid />
                </Button>
                <Button class='btn-leather' size='sm' outline>
                  <CaretDownSolid />
                </Button>
                <Button class='btn-leather' size='sm' outline on:click={() => toggleEditing(id)}>
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
  </div>
  {#if allowEditing}
    <div class='col-start-2 flex flex-col space-y-2 justify-start'>
      <Button class='btn-leather' size='sm' outline>
        <CaretUpSolid />
      </Button>
      <Button class='btn-leather' size='sm' outline>
        <CaretDownSolid />
      </Button>
      <Button class='btn-leather' size='sm' outline>
        <EditOutline />
      </Button>
    </div>
  {/if}
</section> -->