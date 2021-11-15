import got from '~/utils/got.js';
import cheerio from 'cheerio';
import {parseDate} from '~/utils/parse-date.js';
import timezone from '~/utils/timezone';

export default async (ctx) => {
    const {
        keyword
    } = ctx.params;

    const {
        data
    } = await got({
        method: 'get',
        url: `http://search.smzdm.com/?c=home&s=${encodeURI(keyword)}&order=time&v=b`,
        headers: {
            Referer: `http://search.smzdm.com/?c=home&s=${encodeURI(keyword)}&order=time&v=b`,
        },
    });

    const $ = cheerio.load(data);
    const list = $('.feed-row-wide');

    ctx.state.data = {
        title: `${keyword} - 什么值得买`,
        link: `http://search.smzdm.com/?c=home&s=${encodeURI(keyword)}&order=time&v=b`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: `${item.find('.feed-block-title a').eq(0).text().trim()} - ${item.find('.feed-block-title a').eq(1).text().trim()}`,
                        description: `${item.find('.feed-block-descripe').contents().eq(2).text().trim()}<br>${item.find('.feed-block-extras span').text().trim()}<br><img src="http:${item.find('.z-feed-img img').attr('src')}">`,
                        pubDate: timezone(parseDate(item.find('.feed-block-extras').contents().eq(0).text().trim(), 'H:mm'), +8),
                        link: String(item.find('.feed-block-title a').attr('href')),
                    };
                })
                .get(),
    };
};