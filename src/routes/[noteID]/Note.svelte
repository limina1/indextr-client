<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	export let notes: NDKEvent[] = [];
</script>

<div class="notes">
	{#each notes as note}
		<div class="title" id={note.id}>
			<h4>{note.getMatchingTags('title')[0][1]}</h4>
		</div>
		<div class="content">
			<p>{note.content}</p>
		</div>
	{/each}
</div>

<style>
	.notes {
		display: grid;
		border: 1px solid white;
	}

	.title {
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
</style>
