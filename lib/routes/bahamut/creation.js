import utils from './utils.js';

export default async (ctx) => {
    const {
        author
    } = ctx.params;

    const url = ctx.params.category ? `https://home.gamer.com.tw/creationCategory.php?owner=${author}&c=${ctx.params.category}` : `https://home.gamer.com.tw/creation.php?owner=${author}`;

    const { title, items } = await utils.ProcessFeed(url, ctx);

    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};