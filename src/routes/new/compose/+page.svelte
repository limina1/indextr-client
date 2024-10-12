<script lang='ts'>
  import Preview from "$lib/components/Preview.svelte";
  import { parser } from "$lib/parser";
  import { Heading } from "flowbite-svelte";

  
</script>

<div class='w-full flex justify-center'>
  <main class='main-leather flex flex-col space-y-4 max-w-2xl w-full mt-4 mb-4'>
    <Heading tag='h1' class='h-leather mb-2'>Compose</Heading>
    <Preview rootId={$parser.getRootIndexId()} allowEditing={true} />
  </main>
</div>
