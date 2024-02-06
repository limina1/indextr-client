<script>
  // import Login from '$lib/login.svelte';
  import { tabs, userPublickey } from "$lib/state";
  // import {ndk} from '$lib/ndk';
  import { browser } from "$app/environment";
  import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
</script>

<!-- <nav class="abtBox">
     <a href="./">home</a>
     <a href="./create">New Note</a>
     <a href="./about">About</a>
     </nav> -->
<slot />

<style>
  .abtBox {
    position: fixed;
    top: 0;
    left: 0;
    min-width: 100%;
    max-height: 40;
    padding: 10px;
    background-color: black;
    /* border-radius: 10px; */
    /* margin: 10px; */
    text-decoration: none;
    font-weight: bold;
    z-index: 1;
  }
</style>
