import { createContentDigest } from './helper';

export const makeNavigationNode = (id, data, path) => {
  return {
    ...data,
    id: id,
    internal: {
      contentDigest: createContentDigest(data),
      mediaType: 'application/json',
      type: 'PloneNavigation',
    },
    _path: path,
  };
};
