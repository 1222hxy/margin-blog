export const brand = 'YhkLab';
export const productPath = '/products/folio/';
export const articlePath = '/notes/reading-a-graph/';
export const nav = [
  ['研究', '/topics/research/'], ['产品', productPath], ['数学', '/topics/math/'],
  ['计算机科学', '/topics/computing/'], ['网络', '/topics/network/'],
  ['人工智能', '/topics/ai/'], ['生活', '/topics/life/'],
] as const;
export const features = { login: false, trial: false, listen: false } as const;
export const groups = [
  ['研究', [nav[0], nav[2]]], ['实验室', [nav[1], ['组件目录', productPath+'#library']]],
  ['技术', [nav[3], nav[4], nav[5]]], ['手记', [nav[6], ['文章示例',articlePath]]],
  ['本站', [['首页','/'],['文章归档','/archive/'],['订阅 RSS','/rss.xml']]],
] as const;
export const mockProduct = {title:'Folio · 研究笔记台', intro:'产品介绍占位 · Mock', description:'Mock 产品：把一次观察、一组数据和一份可复查的笔记放在同一页。以下案例、价格和评价均为虚构示例。'};
export const mockArticle = {title:'从一张图开始，记录一次研究',description:'一篇 Mock 研究手记：把问题、观察和可复查的证据放回同一条阅读路径。文中数值均为演示数据。',date:'2026年11月18日'};
