<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	export let notes: NDKEvent[] = [];
</script>

<div class="toc">
	<h2>Table of contents</h2>
	<ul>
		{#each notes as note}
			<li><a href="#{note.id}">{note.getMatchingTags('title')[0][1]}</a></li>
		{/each}
	</ul>
</div>

<style>
	.toc h2 {
		text-align: center;
	}
</style>
