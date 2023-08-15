<script lang="ts">
	import ArticleHeader from '$lib/ArticleHeader.svelte';
	import ndk from '$lib/stores/ndk';
	ndk.connect();
	const kind: number = 30040;
	const eventlist = ndk.fetchEvents({ kinds: [kind] });
</script>

{#await eventlist}
	<p>Loading...</p>
{:then events}
	{#each Array.from(events) as event, i}
		<ArticleHeader title={JSON.parse(event.content).title} href={event.id} />
	{/each}
{/await}
