<script lang='ts'>
  import { Avatar, Button, Popover } from 'flowbite-svelte';
  import NDK, { NDKNip07Signer, type NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { signedIn, ndk } from '$lib/ndk';

  let profile: NDKUserProfile | null = null;

  const signInWithExtension = async () => {
    const signer = new NDKNip07Signer();
    const user = await signer.user();
    
    user.ndk = $ndk;
    $ndk.signer = signer;
    $ndk.activeUser = user;

    await $ndk.connect();
    profile = await user.fetchProfile();

    console.log('NDK signed in with extension and reconnected.');

    $signedIn = true;
  };

  const signInWithBunker = () => {
    console.warn('Bunker sign-in not yet implemented.');
  };
</script>

{#if $signedIn}
  <Avatar
    rounded
    class='h-6 w-6 m-4 cursor-pointer'
    src={profile?.image}
    alt={profile?.displayName}
  />
  <Popover
    class='popover-leather w-fit'
    placement='bottom'
    target='avatar'
  >
    <h3 class='text-lg font-bold'>{profile?.displayName}</h3>
    <h4 class='text-base'>@{profile?.name}</h4>
</Popover>
{:else}
  <Avatar rounded class='h-6 w-6 m-4 cursor-pointer' id='avatar' />
  <Popover
    class='popover-leather w-fit'
    placement='bottom'
    target='avatar'
  >
    <div class='w-full flex space-x-2'>
      <Button
        on:click={signInWithExtension}
      >
        Extension Sign-In
      </Button>
      <Button
        color='alternative'
        on:click={signInWithBunker}
      >
        Bunker Sign-In
      </Button>
    </div>
  </Popover>
{/if}
