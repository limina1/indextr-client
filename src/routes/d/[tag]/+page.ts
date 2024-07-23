import { getNdkInstance } from "$lib/ndk";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { error } from "@sveltejs/kit";

// MichaelJ - 23 July 2024 - Disable server-side rendering so that the load function can use the
// browser's local storage to retrieve saved relays and the cache adapter for the NDK instance.
export const ssr = false;

export const load = async ({ params }) => {
  const ndk = getNdkInstance();
  const { tag } = params;

  let events: Set<NDKEvent> = new Set();
  let event: NDKEvent | null | undefined;

  try {
    events = await ndk.fetchEvents({ '#d': [tag] });
    event = events.values().next().value;
  } catch (err) {
    console.error(err);
  }

  if (events.size === 0) {
    error(404, 'No events found with the given d tag.');
  }

  return { event };
};
