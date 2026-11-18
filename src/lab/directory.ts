import {pages} from './pages';
import {published} from '../lib/content';
const topics:Record<string,RegExp>={'数学':/数学|公式/,'计算机科学':/代码|开发|工程|编程|技术|前端|工具/,'网络':/网络/,'人工智能':/人工智能|机器学习/,'生活':/生活|随笔|日记|写作/,'研究':/研究/};
export async function directory(){return [...pages.map(({entry:p})=>({title:p.title,url:p.path,description:p.description,topics:[p.topic],mock:p.mock})),...(await published()).map(p=>({title:p.data.title,url:`/posts/${p.id}/`,description:p.data.description,topics:Object.keys(topics).filter(k=>topics[k].test(p.data.tags.join(' '))),mock:false}))];}
