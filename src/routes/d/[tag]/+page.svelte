<script lang="ts">
	import Article from '$lib/Article.svelte';
  import { ndk } from '$lib/ndk';
  import { TextPlaceholder } from 'flowbite-svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const getIndexEvent = (d: string) => {
    return $ndk.fetchEvent({ '#d': [d] });
  };
</script>

<main>
  {#await getIndexEvent(data.event.d)}
    <TextPlaceholder size='xxl' />
  {:then index}
    <Article {index} />
  {/await}
</main>
