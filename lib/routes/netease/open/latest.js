import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const list_response = await got.get('https://c.open.163.com/open/getLatestMovies.do?callback=');

    const list = JSON.parse(list_response.data.match(/\((.*?)\)/)[1]) || [];

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        const author = $('.m-courseinfo__side ul > li:nth-child(2)');

        const images = $('img');
        for (let k = 0; k < images.length; k++) {
            const testRealURL = $(images[k])
                .attr('src')
                .match(/\?url=([^&]+)/);
            if (testRealURL) {
                $(images[k]).replaceWith(`<img src="${testRealURL[1]}" />`);
            }
        }

        const content = $('.m-courseinfo__side');
        $('.i-container__title').remove();

        return {
            author: author.text().trim(),
            description: content.html(),
            pubDate: new Date(),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const link = item.url;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const rssitem = {
                title: item.title,
                link,
            };

            try {
                const response = await got.get(link);
                const result = parseContent(response.data);

                rssitem.author = result.author;
                rssitem.description = result.description;
                rssitem.pubDate = result.pubDate;
            } catch {
                return '';
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return rssitem;
        })
    );

    ctx.state.data = {
        title: '网易公开课 - 最新课程',
        link: 'https://open.163.com/',
        item: out.filter((item) => item !== ''),
    };
};