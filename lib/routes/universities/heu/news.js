import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const baseUrl = 'http://news.hrbeu.edu.cn';

const typeMap = {
    yw: {
        name: '要闻',
        url: '/xw/yw.htm',
    },
    sx: {
        name: '时讯',
        url: '/xw/sx.htm',
    },
};

export default async (ctx) => {
    const {
        type = 'yw'
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

    const urlList = $('.list-left-ul .txt-elise')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('href'))
        .get();

    const titleList = $('.list-left-ul .txt-elise')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('title'))
        .get();

    const dateList = $('.list-left-ul .txt-elise')
        .slice(0, 10)
        .map((i, e) => $('span', e).text())
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
                    description: $('.v_news_content').html(),
                    pubDate: dateList[index],
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return single;
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '此链接为跳转，点击标题查看',
                    pubDate: dateList[index],
                };
                return single;
            }
        })
    );

    ctx.state.data = {
        title: '工学新闻-' + typeMap[type].name,
        link,
        item: out,
    };
};