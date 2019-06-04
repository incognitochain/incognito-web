function injectScript({
  fromSrc,
  fromCode,
  attrs = []
}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    if (fromSrc) {
      script.async = true;
      script.src = fromSrc;
      script.addEventListener('load', resolve);
      script.addEventListener('error', () => reject(`Error loading script. ${String(fromSrc)}`));
      script.addEventListener('abort', () => reject(`Script loading aborted. ${String(fromSrc)}`));
    } else if (fromCode) {
      script.text = String(fromCode);
    }
    Object.entries(attrs)
      .forEach(([key, value]) => {
        script[key] = value; 
      });
    document.head.appendChild(script);
  });
}

export default injectScript;

/**
 * injectScript('https://dev.zopim.com/web-sdk/latest/web-sdk.js').then(() => {
 *  console.log('Script loaded!')
 * }).catch(() => {
 *  console.log('Script load error!')
 * })
 */
