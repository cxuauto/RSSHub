import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const baseUrl = 'http://uae.hrbeu.edu.cn';

const typeMap = {
    xwdt: {
        name: '新闻动态',
        url: '/3751/list.htm',
    },
    tzgg: {
        name: '通知公告',
        url: '/3752/list.htm',
    },
};

export default async (ctx) => {
    const {
        type = 'xwdt'
    } = ctx.params;
    const link = baseUrl + typeMap[type].url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data);

    const urlList = $('.column-news-item')
        .slice(0, 10)
        .map((i, e) => $(e).attr('href'))
        .get();

    const titleList = $('.column-news-item')
        .slice(0, 10)
        .map((i, e) => $('.column-news-title', e).text())
        .get();

    const dateList = $('.column-news-item')
        .slice(0, 10)
        .map((i, e) => $('.column-news-date', e).text())
        .get();

    const out = await Promise.all(
        urlList.map(async (itemUrl, index) => {
            itemUrl = url.resolve(baseUrl, itemUrl);
            if (itemUrl.includes('.htm')) {
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return JSON.parse(cache);
                }
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: $('.wp_articlecontent')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                        .trim(),
                    pubDate: dateList[index],
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return single;
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '此链接为文件，请点击下载',
                    pubDate: dateList[index],
                };
                return single;
            }
        })
    );

    ctx.state.data = {
        title: '水声工程学院-' + typeMap[type].name,
        link,
        item: out,
    };
};