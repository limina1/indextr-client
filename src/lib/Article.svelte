<script lang="ts">
	import { ndk } from '$lib/ndk';
	import Toc from '$lib/components/Toc.svelte';
	import Notes from '$lib/components/Note.svelte';
    import {idList} from '$lib/stores';
    let events: NDKEvent[] = [];
    async function getEvents() {
        $idList.forEach(async (id) => {
            const event = await $ndk.fetchEvent(id);
            events = [...events, event];
        });
    }
</script>

{#await getEvents() then article}
	<div class="article">
		<div class="toc">
			<Toc notes={events} />
		</div>

		<div class="article-content">
			<Notes notes={events} />
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
