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