<script lang="ts">
  import { Input, Label, Textarea, Toolbar, ToolbarButton } from "flowbite-svelte";
  import { CodeOutline, EyeSolid } from "flowbite-svelte-icons";
  import { editorText } from "$lib/stores";
  import Preview from "$lib/components/Preview.svelte";
  import Pharos from "$lib/parser";
  import { ndk } from "$lib/ndk";

  const parser: Pharos = new Pharos($ndk);

  let isEditing: boolean = true;

  const showPreview = () => {
    isEditing = false;
    parser.parse($editorText);
  };

  const hidePreview = () => {
    isEditing = true;
  };
</script>

<main class='w-full flex justify-center'>
  <form class='max-w-2xl w-full'>
    <div class='flex flex-col space-y-4'>
      <div>
        <Label for='article-title' class='mb-2'>Article Title</Label>
        <Input type='text' id='article-title' placeholder='Title' required />
      </div>
      <div>
        <Label for='article-author' class='mb-2'>Author Name</Label>
        <Input type='text' id='article-author' placeholder='Author' required />
      </div>
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
        <div>
          <Toolbar>
            <ToolbarButton name='Edit' on:click={hidePreview}>
              <CodeOutline class='w-6 h-6' />
            </ToolbarButton>
          </Toolbar>
          <Preview parser={parser} rootIndexId={parser.getRootIndexId()} />
        </div>
      {/if}
    </div>
  </form>
</main>
