import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { tag } = params;

  return {
    event: {
      d: tag,
    }
  };
};
