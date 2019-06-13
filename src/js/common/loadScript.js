import injectScript from '../service/injectScript';

// load Zendesk
injectScript({ fromSrc: `https://static.zdassets.com/ekr/snippet.js?key=${APP_ENV.ZENDESK_KEY}`, attrs: {
  id: 'ze-snippet'
}});

// load GA
injectScript({
  fromCode: `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', '${APP_ENV.GA_ID}', 'auto');
      ga('send', 'pageview');
    `
});

// load FB Pixel
injectScript({
  fromCode: `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${APP_ENV.FB_PIXEL_ID}');
    fbq('track', 'PageView');
  `
});
const noScriptEl = document.createElement('noscript');
noScriptEl.innerHTML = `
  <img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${APP_ENV.FB_PIXEL_ID}&ev=PageView&noscript=1"
  />
`;
document.head.appendChild(noScriptEl);
