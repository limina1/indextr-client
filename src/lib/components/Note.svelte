<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
 	import {Converter} from 'showdown';
 	const converter = new Converter();
	export let notes: NDKEvent[] = [];
 	notes.forEach((note) => {
		note.votes = 0;
	});
 import {nip19} from 'nostr-tools';
 $: notes.forEach((note) => {
		note.voteUp = () => {
			note.votes++;
			note.update();
		};
		note.voteDown = () => {
			note.votes--;
			note.update();
		};
	 note.getVotes = () => {
			return note.votes;
		};
	});
</script>

<div class="notes">
	{#each notes as note}
		<div class="title" id={nip19.noteEncode(note.id)}>
			<h4>{note.getMatchingTags('title')[0][1]}</h4>
		</div>
		<div class="vote">
			<button on:click={note.voteUp}>&#x25B2;</button>
			<p>{note.getVotes()}</p>
			<button on:click={note.voteDown}>&#x25BC;</button>
		</div>
		<div class="content">
			{@html converter.makeHtml(note.content)}
		</div>
	{/each}
</div>

<style>
	.notes {
		display: grid;
		border: 1px solid white;
	}

	.title {
		display: grid;
		grid-column: 1/2;
		margin: auto;
		float: right;
		border: 1px solid white;
		text-align: center;
	}

	.content {
		display: grid;
		grid-column: 1/2;
		width: 100%;
		padding: 10px;
		border: 1px solid white;
	}
 	.vote {
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
		grid-column: 3/3;
		width: 5%;
		margin: 1%;
	}
</style>
