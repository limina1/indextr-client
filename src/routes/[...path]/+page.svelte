<script lang="ts">
	import {ndk} from '$lib/ndk';
 import { page } from '$app/stores';
 import Article from '$lib/Article.svelte';
 import {idList} from '$lib/stores';
 import {nip19} from 'nostr-tools';
 const id = nip19.decode($page.params.path).data;



</script>
<Article />
