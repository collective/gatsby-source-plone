// Camelize
export const normalizeType = type => {
  type = type
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter) {
      return letter.toUpperCase();
    })
    .replace(/[\s\.]+/g, '');
  return type.startsWith('Plone') ? type : `Plone${type}`;
};