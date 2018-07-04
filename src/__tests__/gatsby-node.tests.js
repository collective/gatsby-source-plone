import {
  urlWithoutParameters,
  headersWithToken,
  normalizePath,
} from '../normalize';

test('url without parameters', () => {
  expect(
    urlWithoutParameters('https://example.com/search?q=examplequery')
  ).toBe('https://example.com/search');
});

test('headers with token', () => {
  expect(headersWithToken({ accept: 'application/json' }, 'token')).toEqual({
    accept: 'application/json',
    Authorization: 'Bearer token',
  });
});

test('normalize path', () => {
  expect(normalizePath('foo')).toBe('/foo/');
  expect(normalizePath('/foo')).toBe('/foo/');
  expect(normalizePath('foo/')).toBe('/foo/');
  expect(normalizePath('/foo/')).toBe('/foo/');
  expect(normalizePath('//foo//')).toBe('/foo/');
});
