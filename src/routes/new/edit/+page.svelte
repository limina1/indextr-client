<script lang="ts">
  import { Heading, Textarea, Toolbar, ToolbarButton } from "flowbite-svelte";
  import { CodeOutline, EyeSolid } from "flowbite-svelte-icons";
  import { editorText } from "$lib/stores";
  import Preview from "$lib/components/Preview.svelte";
  import Pharos from "$lib/parser";
  import { ndk } from "$lib/ndk";

  let parser: Pharos;
  let isEditing: boolean = true;

  $: rootIndexId = parser?.getRootIndexId();

  const showPreview = () => {
    parser = new Pharos($ndk);
    parser.parse($editorText);
    isEditing = false;
  };

  const hidePreview = () => {
    isEditing = true;
  };
</script>

<main class='w-full flex justify-center'>
  <form class='max-w-2xl w-full'>
    <div class='flex flex-col space-y-4'>
      <Heading tag='h1' class='mb-2'>New Article</Heading>
      {#if isEditing}
        <Textarea
          id='article-content'
          rows=8
          placeholder='Write AsciiDoc content'
          bind:value={$editorText}
        >
          <Toolbar slot='header' embedded>
            <ToolbarButton name='Preview' on:click={showPreview}>
              <EyeSolid class='w-6 h-6' />
            </ToolbarButton>
          </Toolbar>
        </Textarea>
      {:else}
        <Toolbar>
          <ToolbarButton name='Edit' on:click={hidePreview}>
            <CodeOutline class='w-6 h-6' />
          </ToolbarButton>
        </Toolbar>
        {#if rootIndexId}
          <Preview {parser} {rootIndexId} />
        {/if}
      {/if}
    </div>
  </form>
</main>
