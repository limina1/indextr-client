import { getNdkInstance } from "$lib/ndk";

export const load = async ({ params }) => {
  // TODO: Don't rely on browser cache here.
  const ndk = getNdkInstance();
  const { tag } = params;

  // TODO: Add error handling.
  const events = await ndk.fetchEvents({ '#d': [tag] });
  const event = events.values().next().value;

  return { event };
};
