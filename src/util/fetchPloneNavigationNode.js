// Fetch only navigation component node
export const fetchPloneNavigationNode = async (id, token, baseUrl, mock) => {
  // Fetch from Plone REST API and normalize it to be GraphQL compatible
  const data = normalizeData(
    await fetchPlone(
      `${id}/@navigation`,
      token,
      {
        // TODO: Higher depth results in "conflicting field types in your data"
        'expand.navigation.depth': 1,
      },
      mock
    ),
    baseUrl
  );
  // Yield navigation node
  return makeNavigationNode(
    `${id}/@navigation`,
    data,
    data._path.split('@navigation')[0]
  );
};