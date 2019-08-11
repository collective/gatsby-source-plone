// Normalize path
export const normalizePath = path => {
  path = path ? path.replace(/^\/*/, '/').replace(/\/*$/, '/') : '/';
  if (path.match(/\/view\/$/)) {
    path = path.substr(0, path.length - 'view/'.length);
  }
  return path;
};