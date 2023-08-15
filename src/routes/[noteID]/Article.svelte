<script lang="ts">
	import ndk from '$lib/stores/ndk';
	import Toc from './Toc.svelte';
	import Notes from './Note.svelte';
	export let eventIDs: string[] = [];
	let events: any[] = [];
	for (let i = 0; i < eventIDs.length; i++) {
		ndk.fetchEvent({ ids: [eventIDs[i]] }).then((res) => {
			events = [...events, res];
		});
	}
</script>

{#await events then article}
	<div class="article">
		<div class="toc">
			<Toc notes={article} />
		</div>

		<div class="article-content">
			<Notes notes={article} />
		</div>
	</div>
{/await}

<style>
	.article {
		display: flex;
		padding: 1rem;
	}
	.toc {
		padding: 3%;
		min-width: 5%;
		padding-top: 1%;
		border: 1px white solid;
		border-radius: 10px;
		border-top-width: 5px;
	}
	.article-content {
		min-width: 80%;
		max-width: 85%;
		padding: 1%;
		border: 1px white solid;
		border-radius: 10px;
		border-top-width: 5px;
	}
</style>
