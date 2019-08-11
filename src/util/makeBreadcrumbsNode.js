export const makeBreadcrumbsNode = (id, data, path) => {
  return {
    ...data,
    id: id,
    internal: {
      contentDigest: createContentDigest(data),
      mediaType: 'application/json',
      type: 'PloneBreadcrumbs',
    },
    _path: path,
  };
};