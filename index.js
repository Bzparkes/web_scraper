const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const socialPlatforms = [
  { name: 'facebook', pattern: /facebook\.com/ },
  { name: 'instagram', pattern: /instagram\.com/ },
  { name: 'linkedin', pattern: /linkedin\.com/ },
  { name: 'twitter', pattern: /twitter\.com/ },
  { name: 'youtube', pattern: /youtube\.com/ },
  // Add more social media platforms here
];

const foundSocialPlatforms = {};

async function getCrawlUrls(url) {
  try {
    const response = await axios(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const crawlUrls = [];

    $('a', html).each(function () {
      const href = $(this).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        crawlUrls.push(href);
      }
    });

    return crawlUrls;
  } catch (err) {
    console.error('An error occurred in getCrawlUrls:', err.message);
    throw err;
  }
}

async function crawlAndFindSocials(url) {
  try {
    const response = await axios(url);
    const html = response.data;

    for (const platform of socialPlatforms) {
      if (platform.pattern.test(url) && !foundSocialPlatforms[platform.name]) {
        foundSocialPlatforms[platform.name] = true;
        const result = `Social Links for ${platform.name}: ${url} - ${foundSocialPlatforms[platform.name] ? 'Yes' : 'No'}`;
        console.log(result);
        fs.appendFileSync('index.html', result + '<br>\n');
      }
    }
  } catch (err) {
    console.error('An error occurred in crawlAndFindSocials:', err.message);
  }
}

async function crawlWebsite(baseUrl) {
  try {
    const crawlUrls = await getCrawlUrls(baseUrl);

    for (const url of crawlUrls) {
      await crawlAndFindSocials(url);
    }

    console.log('Crawling complete. All pages checked.');
  } catch (err) {
    console.error('An error occurred in crawlWebsite:', err.message);
  }
}

// Create or clear the index.html file
fs.writeFileSync('index.html', '');

crawlWebsite('https://redhealth.com.au/'); // Replace with the website URL you want to scrape
