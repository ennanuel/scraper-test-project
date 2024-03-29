import axios from "axios";
import { load } from "cheerio";
import { Router } from "express";
import { checkIfShouldWaitForCoolDown, waitForCoolDown } from "../utils/coolDown.js";
import { updateLog } from "../utils/log.js";

const route = Router();

const convertStringToNumber = (value) => /nan/i.test(Number(value)) ? 1 : Number(value);

route.get('/:searchValue/:page', async function (req, res) {
    try {
        const { searchValue, page = 1 } = req.params;
        if (!searchValue) throw new Error('You have to search for something!');

        // This cooldown logic is meant to avoid being noticed by Amazon's anti-bot measures
        const { shouldWaitForCoolDown, byHowLong } = checkIfShouldWaitForCoolDown();
        if (shouldWaitForCoolDown) {
            console.warn("Waiting for cool down please wait...");
            await waitForCoolDown(byHowLong);
        }

        const pageNum = convertStringToNumber(page);
        const searchUrl = `https://www.amazon.com/s?crid=36QNR0DBY6M7J&k=${searchValue}&page=${pageNum}&ref=glow_cls&refresh=1&sprefix=s%2Caps%2C309`;

        // Without this header, the fetch would always return a 503 error.
        const headers = { 'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:80.0) Gecko/20100101 Firefox/80.0' };

        const response = await axios.get(searchUrl, { headers });
        const html = response.data;

        const $ = load(html);
        const products = [];

        $('div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.sg-col-4-of-20').each(
            function (index, element) {
                const item = $(element);
                const title = item.find('span.a-size-base-plus.a-color-base.a-text-normal').text();
                const image = item.find('img.s-image').attr('src');
                const rating = item.find('a.a-popover-trigger.a-declarative i.a-icon.a-icon-star-small.a-star-small-4-5.aok-align-bottom span.a-icon-alt').text();
                const reviewers = item.find('div.s-csa-instrumentation-wrapper.alf-search-csa-instrumentation-wrapper a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style span.a-size-base.s-underline-text').text();
                const product = { title, image, rating, reviewers };
                products.push(product);
            }
        );

        const pagination = $("span.s-pagination-strip span.s-pagination-item.s-pagination-disabled").text();
        const pagesFound = pagination.match(/\d+$/, '');
        const totalPages = convertStringToNumber(pagesFound ? pagesFound[0] : 0);
        
        const result = {
            products,
            page: pageNum,
            totalPages
        };

        // This updates the 'log.json' file for cooldown logic
        updateLog();

        return res.status(200).json(result);
    } catch (error) {
        const message = error?.data || error.message;
        console.error(error?.data || error);

        return res.status(500).json({ message });
    }
});

export default route;