const axios = require('axios');
const cheerio = require('cheerio');

const fs = require('fs');

const express = require('express');

const app = express();
const PORT = 8000;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));


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

    console.log('Crawl URLs:', crawlUrls);
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
        fs.appendFileSync('index.html', result + '\n');
        console.log(result);


    const $ = cheerio.load(html);
    const socialLinks = [];

    for (const platform of socialPlatforms) {
      if (platform.pattern.test(url) && !foundSocialPlatforms[platform.name]) {
        socialLinks.push({ platform: platform.name, link: url });
        foundSocialPlatforms[platform.name] = true;
        console.log(`Social Links for ${platform.name}:`, socialLinks);

        if (Object.keys(foundSocialPlatforms).length === socialPlatforms.length) {
          console.log('All social media types found. Stopping...');
          process.exit(0); // Stop the script once all social media types are found
        }
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
