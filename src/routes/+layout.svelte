<script>
 // import Login from '$lib/login.svelte';
 import {tabs, userPublickey} from '$lib/state';
 // import {ndk} from '$lib/ndk';
 import {browser} from '$app/environment';
 import {NDKNip07Signer} from '@nostr-dev-kit/ndk';
 import {onMount} from 'svelte';
</script>


<!-- <Login /> -->
<slot />
