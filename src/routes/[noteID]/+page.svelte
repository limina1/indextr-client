<script lang="ts">
	import ndk from '$lib/stores/ndk';
	import { page } from '$app/stores';
	import Article from './Article.svelte';
	// export let data;
	const id: string = $page.params.noteID;
	let title: string = '';
	$: idList = [];
	let articleEvents = ndk.fetchEvent({ ids: [id] }).then((event?) => {
		title = JSON.parse(event?.content).title;
		for (let i = 0; i < event?.tags.length; i++) {
			// console.log(event?.tags[i][1]);
			idList = [...idList, event?.tags[i][1]];
		}
		return idList;
	});
</script>

<div class="title">
	<h1>{title}</h1>
</div>

{#await articleEvents then events}
	<Article eventIDs={events} />
{/await}

<style>
	.title {
		text-align: center;
	}
</style>
