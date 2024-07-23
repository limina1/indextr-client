<script lang="ts">
	import Article from '$lib/Article.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<main>
	<Article event={data.event} />
</main>
