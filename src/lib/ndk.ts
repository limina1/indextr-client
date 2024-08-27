import { browser } from '$app/environment';
import NDK from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { writable, type Writable } from 'svelte/store';
import { standardRelays } from './consts';

export function getStoredNdkConfig() {
  const relays = JSON.parse(
    (browser && localStorage.getItem('alexandria_relays')) || JSON.stringify(standardRelays)
  );
  
  // const dexieAdapter = new NDKCacheAdapterDexie({ dbName: 'alexandria-ndk-cache-db' });

  return {
    relays,
    // dexieAdapter,
  };
}

export function getNdkInstance() {
  const { relays } = getStoredNdkConfig();

  const ndk = new NDK({
    autoConnectUserRelays: true,
    enableOutboxModel: true,
    explicitRelayUrls: relays,
  });
  ndk.connect().then(() => console.debug('ndk connected'));

  return ndk;
}

export const ndk: Writable<NDK> = writable(getNdkInstance());

export const signedIn: Writable<boolean> = writable(false);
