<script lang="ts">
	import NDK from '@nostr-dev-kit/ndk';

	const ndk = new NDK({
		explicitRelayUrls: ['wss://indextr.com']
	});
	ndk.connect();
	const kind: number = 30040;
	const eventlist = ndk.fetchEvents({ kinds: [kind] });
</script>

{#await eventlist then events}
	{#each Array.from(events) as event}
		<div class="article-header">
			<h3>{JSON.parse(event.content).title}</h3>
		</div>
	{/each}
{/await}

<style>
	.article-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		border: 1px solid purple;
		border-radius: 10px;
		padding: 1rem;
		border-top-width: 5px;
	}
</style>
