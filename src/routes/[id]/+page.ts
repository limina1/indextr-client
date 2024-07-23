import { getNdkInstance, ndk } from '$lib/ndk';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { error } from '@sveltejs/kit';

// MichaelJ - 23 July 2024 - Disable server-side rendering so that the load function can use the
// browser's local storage to retrieve saved relays and the cache adapter for the NDK instance.
export const ssr = false;

export const load = async ({ params }) => {
  const ndk = getNdkInstance();
  const { id } = params;

  let event: NDKEvent | null | undefined;

  try {
    event = await ndk.fetchEvent(id);
  } catch (err) {
    console.error(err);
  }

  if (!event) {
    error(404, 'No event found with the given ID.');
  }

  return { event };
};
