// 简单环境变量读取，兼容直接赋值和 import.meta.env（Vite 风格）
// 实际运行时由 tsx 载入，直接从 process.env 读取即可

let pddCached: { clientId: string; clientSecret: string } | null = null;

export function getPddConfig() {
  if (pddCached) return pddCached;

  pddCached = {
    clientId: process.env.PDD_CLIENT_ID || '',
    clientSecret: process.env.PDD_CLIENT_SECRET || '',
  };

  return pddCached;
}

let tbkCached: { appKey: string; appSecret: string; adzoneId: string } | null = null;

export function getTbkConfig() {
  if (tbkCached) return tbkCached;

  tbkCached = {
    appKey: process.env.TBK_APP_KEY || '',
    appSecret: process.env.TBK_APP_SECRET || '',
    adzoneId: process.env.TBK_ADZONE_ID || '',
  };

  return tbkCached;
}
