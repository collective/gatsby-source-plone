export const serializeParams = params => {
  let parts = [];

  Object.entries(params).forEach(([key, val]) => {
    if (val === null || typeof val === 'undefined') {
      return;
    }

    if (Array.isArray(val)) {
      key = key + ':list';
    } else if (typeof val === 'number') {
      key = key + ':int';
      val = [val];
    } else {
      val = [val];
    }

    val.forEach(v => {
      if (typeof v.getMonth === 'function') {
        v = v.toISOString();
      } else if (typeof v === 'object') {
        // TODO: serialize into ZPublisher :record -format
        v = JSON.stringify(v);
      }
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
    });
  });

  return parts.join('&');
};
