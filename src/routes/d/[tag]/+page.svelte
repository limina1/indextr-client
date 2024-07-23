<script lang="ts">
	import Article from '$lib/Article.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let { event } = data;
</script>

<main>
	<Article {event} />
</main>
