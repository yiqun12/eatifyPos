const { SitemapStream, streamToPromise } = require('sitemap')
const { createWriteStream } = require('fs')

// list of pages
const pages = [
  { url: '/', changefreq: 'daily', priority: 1 },
  // include other urls to your site. 
  // { url: '/services/', changefreq: 'monthly', priority: 0.7 },
  // { url: '/careers/', changefreq: 'monthly', priority: 0.6 },
  // { url: '/sign-up/', changefreq: 'monthly', priority: 0.5 },
]

// create a stream to write to
const stream = new SitemapStream({ hostname: 'http://eatifydash.com' })

// pass the stream to the sitemap object
pages.forEach(page => {
  stream.write(page)
})

// close the stream
stream.end()

// generate the sitemap and write it to sitemap.xml
streamToPromise(stream)
  .then(data => {
    createWriteStream('public/sitemap.xml').write(data.toString())
  })
  .catch(console.error)