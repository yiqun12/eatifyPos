const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

// list of pages common to both domains
const pages = [
  { url: '/', changefreq: 'daily', priority: 1 },

];

// Function to generate sitemap
const generateSitemap = (hostname, filename) => {
  const stream = new SitemapStream({ hostname });
  
  pages.forEach(page => {
    stream.write(page);
  });

  stream.end();

  return streamToPromise(stream)
    .then(data => {
      createWriteStream(`public/${filename}`).write(data.toString());
    })
    .catch(console.error);
};

// Generate sitemaps for both domains
generateSitemap('http://eatifydash.com', 'sitemap-eatifydash.xml');
generateSitemap('http://7dollar.delivery', 'sitemap-7dollar.xml');
