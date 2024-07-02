<script>
  import "../app.css";
  // import Login from '$lib/login.svelte';
  import { tabs, userPublickey } from "$lib/state";
  // import {ndk} from '$lib/ndk';
  import { browser } from "$app/environment";
  import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
  import Navigation from "$lib/components/Navigation.svelte";
</script>

<div class='leather h-full w-full flex flex-col items-center'>
  <Navigation class='sticky top-0' />
  <slot />
</div>

<style>
</style>
