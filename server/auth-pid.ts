import 'dotenv/config';
import { checkMemberAuthority, generateAuthorityUrl } from './src/lib/pdd.js';

async function main() {
  console.log('=== 查询 PID 授权状态 ===');
  const result = await checkMemberAuthority();
  console.log('状态:', result.msg);

  if (result.bind) {
    console.log('已备案，可以使用推广链接 API');
    return;
  }

  console.log('\n=== 生成授权备案链接 ===');
  const auth = await generateAuthorityUrl();
  console.log('短链接:', auth.shortUrl);
  console.log('\n请用拼多多 APP 打开此链接完成授权');
}
main().catch(err => console.error('错误:', err.message));
