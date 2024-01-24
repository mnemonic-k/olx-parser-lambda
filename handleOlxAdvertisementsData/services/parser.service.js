const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const { OlxAdPost } = require('../models/olxAdPost.model.js')

async function getPhoneNumber(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const revealButtonSelector = '[data-cy=ad-contact-phone]'
    const phoneNumberSelector = '[data-testid=contact-phone]';

    try {
        await page.goto(url);
        await page.waitForSelector(revealButtonSelector, { timeout: 5000 });
        

        await page.click(revealButtonSelector);
      
        await page.waitForSelector(phoneNumberSelector, { timeout: 5000 });
        
        const phoneNumber = await page
        .$eval(phoneNumberSelector, (element) => element.textContent.trim());
        
        return phoneNumber
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await page.close();
        await browser.close();
    }
}

async function parseOlxData() {
    try {
        const response = await axios.get("https://www.olx.ua/uk/nedvizhimost/")
    
        const $ = cheerio.load(response.data);

        const ads = $('div[data-cy=l-card]').slice(0, 10);

        for (const element of ads.toArray()) {
            const href = $(element).find('.css-rc5s2u').attr('href')
            const location = $(element).find("[data-testid=location-date]").text().split('-')[0];
            
            const adDetailsPageUrl = `https://www.olx.ua/${href}`

            const detailsPage = await axios.get(adDetailsPageUrl)
    
            const $adDetails = cheerio.load(detailsPage.data);

            const uuid = $adDetails(".css-12hdxwj").text().trim().split(' ')[1]
            const title = $adDetails("[data-cy=ad_title] h4").text().trim();
            const description = $adDetails("[data-cy=ad_description] div").text().trim();
            const price = $adDetails("[data-testid=ad-price-container] h3").text().trim();
            const postedAt = $adDetails("[data-cy=ad-posted-at]").text().trim();

            const seller = $adDetails("[data-testid=user-profile-link] h4").first().text().trim();
            // const contactPhone = await getPhoneNumber(adDetailsPageUrl)

            const payload = {
              title,
              description,
              price,
              postedAt,
              seller,
            //contactPhone,
              location
            }

            console.log(`UUID Post: ${uuid}`)

            await OlxAdPost.create({ ...payload });

            console.log('saved successfully!')
            console.log('-------------------')
        }
      } catch(err) {
        console.log(err);
    }
}

module.exports = {
    getPhoneNumber,
    parseOlxData
}