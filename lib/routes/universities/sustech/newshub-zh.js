import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://newshub.sustech.edu.cn/zh/news/',
    });

    const $ = cheerio.load(data);

    const list = $('.m-newslist ul li');

    ctx.state.data = {
        title: '南方科技大学新闻网-中文',
        link: 'https://newshub.sustech.edu.cn/zh/news/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const itemPicUrl = String(item.find('a > div.u-pic').attr('style')).replace('background-image:url(', 'https://newshub.sustech.edu.cn/').replace(');', '');
                    const itemPubdate = item.find('a > div.u-date').text();
                    return {
                        pubDate: itemPubdate,
                        title: item.find('a > div.u-text > div.title.f-clamp').text(),
                        description: `<img src="${itemPicUrl}" class="type:primaryImage" ><br>${item.find('a > div.u-text > div.details.f-clamp4 > p').text()}`,
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};