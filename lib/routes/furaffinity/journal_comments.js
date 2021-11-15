import got from '~/utils/got.js';

export default async (ctx) => {
    // 传入参数
    const id = String(ctx.params.id);

    // 发起第二个 HTTP GET 请求，用于获取该日记的标题
    const response2 = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/journal/${id}.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    const {
        data
    } = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/journal/${id}/comments.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });
    const data2 = response2.data;

    ctx.state.data = {
        // 源标题
        title: `${data2.title} - Journal Comments`,
        // 源链接
        link: `https://www.furaffinity.net/journal/${id}/`,
        // 源说明
        description: `Fur Affinity ${data2.title} - Journal Comments`,

        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 标题
            title: item.text,
            // 正文
            description: `<img src="${item.avatar}"> <br> ${item.name}: ${item.text}`,
            // 链接
            link: `https://www.furaffinity.net/journal/${id}/`,
            // 作者
            author: item.name,
            // 日期
            pubDate: new Date(item.posted_at).toUTCString(),
        })),
    };
};