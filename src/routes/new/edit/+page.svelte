<script lang="ts">
  import { Button, Heading, Textarea, Toolbar, ToolbarButton, Tooltip } from "flowbite-svelte";
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

<div class='w-full flex justify-center'>
  <main class='main-leather flex flex-col space-y-4 max-w-2xl w-full'>
    <Heading tag='h1' class='h-leather mb-2'>New Article</Heading>
    {#if isEditing}
      <form>
        <Textarea
          id='article-content'
          class='textarea-leather'
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
      </form>
    {:else}
      <form class='border border-gray-400 dark:border-gray-600 rounded-lg flex flex-col space-y-2 h-fit'>
        <Toolbar class='toolbar-leather rounded-b-none bg-gray-200 dark:bg-gray-800'>
          <ToolbarButton name='Edit' on:click={hidePreview}>
            <CodeOutline class='w-6 h-6' />
          </ToolbarButton>
        </Toolbar>
        {#if rootIndexId}
          <Preview sectionClass='m-2' {parser} {rootIndexId} />
        {/if}
      </form>
    {/if}
  </main>
</div>
