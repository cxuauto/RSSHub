import got from '~/utils/got.js';
import cheerio from 'cheerio';

const maxPages = 5;

export default async (ctx) => {
    const { subdomain } = ctx.params;
    const shopUrl = `https://${subdomain}.booth.pm`;

    let shopName;
    const items = [];
    for (let page = 1; page <= maxPages; page++) {
        const pageUrl = `${shopUrl}/items?page=${page}`;

        const {
            data
        } = await got({
            method: 'get',
            url: pageUrl,
        });

        const $ = cheerio.load(data);
        shopName = $('div.shop-name > span').text();
        const pageItems = $('li.item');

        if (pageItems.length === 0) {
            break;
        }

        for (let i = 0; i < pageItems.length; ++i) {
            const pageItem = pageItems[i];

            // extract item name
            const itemName = $('h2.item-name > a', pageItem).text();

            // extract item url
            const itemUrl = shopUrl + $('h2.item-name > a', pageItem).attr('href');

            // extract item preview url
            const itemPreviewUrl = $('div.swap-image > img', pageItem).attr('src');

            items.push({
                title: itemName,
                description: `<img src='${itemPreviewUrl}'/>`,
                link: itemUrl,
            });
        }
    }

    ctx.state.data = {
        title: shopName,
        link: shopUrl,
        description: shopName,
        allowEmpty: true,
        item: items,
    };
};