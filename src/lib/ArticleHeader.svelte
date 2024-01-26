<script lang="ts">
 	import {nip19} from 'nostr-tools';
 	import {ndk} from '$lib/ndk';
 	import {idList} from '$lib/stores';
    import DefaultButton from '$lib/defaultShareButton.svelte';

 	export let event: NDKEvent;
 	const title: string = JSON.parse(event.content).title;
 	const href: string = nip19.noteEncode(event.id)
 	const handleSendEvents = () => {
		$idList=[];
		for (const id of event.tags.filter((tag)=> tag[0]==='e').map((tag)=> tag[1])) {
			$idList = [...$idList, id];
		}
	};



</script>

<a data-sveltekit-preload-data="tap" href="/{href}">
	<div class="ArticleHeader" on:click={handleSendEvents}>
		<h2>{title}</h2>
	</div>

</a>

<style>
	.ArticleHeader {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		border: 1px solid purple;
		border-radius: 10px;
		padding: 5px;
		border-top-width: 5px;
	}
	.ArticleHeader h2 {
		font-size: 1.5rem;
	}
/* position button top right corner */
</style>
