import { getNdkInstance, ndk } from '$lib/ndk';

export const load = async ({ params }) => {
  // TODO: Don't rely on browser cache here.
  const ndk = getNdkInstance();
  const { id } = params;

  // TODO: Add error handling.
  const event = await ndk.fetchEvent(id);

  return { event };
};
