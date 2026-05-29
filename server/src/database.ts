import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'shopping.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: SqlJsDatabase;

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  return db;
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper to run a select and return typed rows
export function queryAll<T>(sql: string, params?: any[]): T[] {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T>(sql: string, params?: any[]): T | undefined {
  const rows = queryAll<T>(sql, params);
  return rows[0];
}

export function dbRun(sql: string, params?: any[]): void {
  db.run(sql, params);
}

export function dbExec(sql: string): void {
  db.exec(sql);
}

export function getLastId(): number {
  const rows = queryAll<{ id: number }>('SELECT last_insert_rowid() as id');
  return rows[0]?.id ?? 0;
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL DEFAULT '',
      ip TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      order_sn TEXT PRIMARY KEY,
      goods_id INTEGER,
      goods_name TEXT DEFAULT '',
      order_amount INTEGER DEFAULT 0,
      promotion_amount INTEGER DEFAULT 0,
      order_status INTEGER DEFAULT 0,
      order_create_time TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      images TEXT DEFAULT '[]',
      original_price REAL NOT NULL,
      current_price REAL NOT NULL,
      coupon_amount REAL DEFAULT 0,
      coupon_link TEXT DEFAULT '',
      platform TEXT NOT NULL,
      platform_label TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      sales INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      buy_link TEXT DEFAULT '',
      is_hot INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      end_time TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  saveDatabase();
}

export function seedDatabase() {
  const count = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  if (count && count.count > 0) return;

  const categories = [
    ['数码家电', 'digital', '📱'],
    ['服饰鞋包', 'fashion', '👗'],
    ['食品生鲜', 'food', '🍖'],
    ['美妆个护', 'beauty', '💄'],
    ['家居日用', 'home', '🏠'],
    ['母婴用品', 'baby', '🍼'],
  ];

  for (const c of categories) {
    db.run('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)', c);
  }

  const products: any[][] = [
    ['小米 Redmi Note 13 5G 智能手机 120Hz高刷屏', '搭载天玑6080处理器，5000mAh大电池，1亿像素主摄', 'https://picsum.photos/seed/xiaomi/400/400', '["https://picsum.photos/seed/xiaomi1/600/600","https://picsum.photos/seed/xiaomi2/600/600"]', 1499, 1099, 100, '', 'jd', '京东', 1, 23500, 4.5, '', 1, 0, '2026-05-30'],
    ['华为 FreeBuds 5i 无线降噪蓝牙耳机', '42dB主动降噪，长达28小时续航，Hi-Res认证音质', 'https://picsum.photos/seed/huawei/400/400', '["https://picsum.photos/seed/huawei1/600/600","https://picsum.photos/seed/huawei2/600/600"]', 499, 329, 30, '', 'tmall', '天猫', 1, 18000, 4.7, '', 1, 0, '2026-05-25'],
    ['Anker 65W 氮化镓快充充电器', '三口快充，兼容MacBook/iPhone/安卓，小巧便携', 'https://picsum.photos/seed/anker/400/400', '["https://picsum.photos/seed/anker1/600/600","https://picsum.photos/seed/anker2/600/600"]', 169, 99, 20, '', 'jd', '京东', 1, 45000, 4.8, '', 1, 0, '2026-05-28'],
    ['联想小新 100W 智能投影仪', '1080P高清，自动对焦梯形校正，家庭影院首选', 'https://picsum.photos/seed/lenovo/400/400', '["https://picsum.photos/seed/lenovo1/600/600","https://picsum.photos/seed/lenovo2/600/600"]', 1999, 1499, 200, '', 'tmall', '天猫', 1, 8500, 4.4, '', 0, 1, '2026-06-15'],
    ['罗技 MX Master 3S 无线鼠标', '8000DPI，静音按键，MagSpeed电磁滚轮，跨屏操控', 'https://picsum.photos/seed/logitech/400/400', '["https://picsum.photos/seed/logitech1/600/600","https://picsum.photos/seed/logitech2/600/600"]', 799, 529, 50, '', 'jd', '京东', 1, 12000, 4.9, '', 0, 0, '2026-06-01'],
    ['Nike Air Max 270 男女同款气垫运动鞋', '经典大气垫设计，透气网面鞋面，舒适缓震', 'https://picsum.photos/seed/nike/400/400', '["https://picsum.photos/seed/nike1/600/600","https://picsum.photos/seed/nike2/600/600"]', 1099, 599, 100, '', 'tmall', '天猫', 2, 32000, 4.6, '', 1, 0, '2026-05-31'],
    ['优衣库轻薄羽绒服 男女同款', '轻量保暖，可收纳设计，秋冬必备内搭', 'https://picsum.photos/seed/uniqlo/400/400', '["https://picsum.photos/seed/uniqlo1/600/600","https://picsum.photos/seed/uniqlo2/600/600"]', 599, 399, 0, '', 'tmall', '天猫', 2, 28000, 4.5, '', 0, 0, '2026-06-10'],
    ['Coach 经典老花单肩包 女士轻奢', '经典C纹印花，牛皮材质，通勤百搭款', 'https://picsum.photos/seed/coach/400/400', '["https://picsum.photos/seed/coach1/600/600","https://picsum.photos/seed/coach2/600/600"]', 3500, 1680, 300, '', 'pdd', '拼多多', 2, 5600, 4.3, '', 0, 1, '2026-06-05'],
    ['蕉下冰丝防晒衣 UPF50+ 男女同款', '凉感科技面料，全身防晒，轻薄透气不闷热', 'https://picsum.photos/seed/bananain/400/400', '["https://picsum.photos/seed/bananain1/600/600","https://picsum.photos/seed/bananain2/600/600"]', 259, 159, 30, '', 'taobao', '淘宝', 2, 67000, 4.6, '', 1, 0, '2026-05-22'],
    ['三只松鼠坚果大礼包 每日坚果 30袋装', '混合坚果仁，无添加，每日一包营养均衡', 'https://picsum.photos/seed/nuts/400/400', '["https://picsum.photos/seed/nuts1/600/600","https://picsum.photos/seed/nuts2/600/600"]', 139, 69, 20, '', 'jd', '京东', 3, 156000, 4.7, '', 1, 0, '2026-05-30'],
    ['认养一头牛 纯牛奶 250ml*24盒', '自有牧场，3.3g优质乳蛋白，孩子爱喝的好牛奶', 'https://picsum.photos/seed/milk/400/400', '["https://picsum.photos/seed/milk1/600/600","https://picsum.photos/seed/milk2/600/600"]', 89, 59, 10, '', 'tmall', '天猫', 3, 89000, 4.8, '', 0, 0, '2026-06-20'],
    ['舟山带鱼 新鲜冷冻 精选大带鱼 2kg', '深海捕捞，肉质鲜嫩，急冻锁鲜直达', 'https://picsum.photos/seed/fish/400/400', '["https://picsum.photos/seed/fish1/600/600","https://picsum.photos/seed/fish2/600/600"]', 99, 49, 15, '', 'pdd', '拼多多', 3, 34000, 4.4, '', 0, 0, '2026-05-25'],
    ['良品铺子 高端零食礼盒 20袋装', '精选肉脯果干，礼盒包装，送礼自用两相宜', 'https://picsum.photos/seed/snack/400/400', '["https://picsum.photos/seed/snack1/600/600","https://picsum.photos/seed/snack2/600/600"]', 168, 89, 30, '', 'taobao', '淘宝', 3, 45000, 4.5, '', 0, 1, '2026-06-15'],
    ['兰蔻小黑瓶精华肌底液 50ml', '二裂酵母精华，修护肌肤屏障，细腻毛孔', 'https://picsum.photos/seed/lancome/400/400', '["https://picsum.photos/seed/lancome1/600/600","https://picsum.photos/seed/lancome2/600/600"]', 1100, 680, 100, '', 'tmall', '天猫', 4, 23000, 4.8, '', 1, 0, '2026-06-15'],
    ['完美日记 小细跟口红 3支套装', '丝绒质地，不拔干，显白持久', 'https://picsum.photos/seed/lipstick/400/400', '["https://picsum.photos/seed/lipstick1/600/600","https://picsum.photos/seed/lipstick2/600/600"]', 189, 89, 30, '', 'taobao', '淘宝', 4, 78000, 4.4, '', 0, 1, '2026-05-28'],
    ['芙丽芳丝 净润洗面奶 100g*2支', '氨基酸洁面，温和不刺激，敏感肌可用', 'https://picsum.photos/seed/cleanser/400/400', '["https://picsum.photos/seed/cleanser1/600/600","https://picsum.photos/seed/cleanser2/600/600"]', 258, 149, 20, '', 'jd', '京东', 4, 56000, 4.7, '', 0, 0, '2026-06-01'],
    ['欧莱雅 紫熨斗眼霜 30ml', '玻尿酸+玻色因，淡化细纹，紧致眼周', 'https://picsum.photos/seed/eyecream/400/400', '["https://picsum.photos/seed/eyecream1/600/600","https://picsum.photos/seed/eyecream2/600/600"]', 359, 219, 40, '', 'tmall', '天猫', 4, 41000, 4.6, '', 0, 0, '2026-06-10'],
    ['网易严选 乳胶床垫 1.8m 天然泰国乳胶', '93%天然乳胶含量，七区支撑，透气防螨', 'https://picsum.photos/seed/mattress/400/400', '["https://picsum.photos/seed/mattress1/600/600","https://picsum.photos/seed/mattress2/600/600"]', 2599, 1499, 300, '', 'jd', '京东', 5, 19000, 4.7, '', 0, 0, '2026-06-30'],
    ['苏泊尔 电饭煲 4L 智能预约 IH电磁加热', 'IH立体加热，24小时预约，不粘内胆', 'https://picsum.photos/seed/supor/400/400', '["https://picsum.photos/seed/supor1/600/600","https://picsum.photos/seed/supor2/600/600"]', 499, 299, 50, '', 'taobao', '淘宝', 5, 62000, 4.6, '', 1, 0, '2026-05-31'],
    ['无印良品 超声波香薰机 加湿器', '静音运行，暖光夜灯，舒缓身心', 'https://picsum.photos/seed/muji/400/400', '["https://picsum.photos/seed/muji1/600/600","https://picsum.photos/seed/muji2/600/600"]', 380, 238, 30, '', 'tmall', '天猫', 5, 15000, 4.5, '', 0, 1, '2026-06-20'],
    ['洁柔 抽纸 3层加厚 整箱30包', '原生木浆，不漂白，柔韧不掉屑', 'https://picsum.photos/seed/tissue/400/400', '["https://picsum.photos/seed/tissue1/600/600","https://picsum.photos/seed/tissue2/600/600"]', 69, 36, 10, '', 'pdd', '拼多多', 5, 230000, 4.3, '', 0, 0, '2026-06-15'],
    ['花王 纸尿裤 妙而舒 XL码 整箱128片', '日本原装进口，3D透气表层，12小时干爽', 'https://picsum.photos/seed/diaper/400/400', '["https://picsum.photos/seed/diaper1/600/600","https://picsum.photos/seed/diaper2/600/600"]', 269, 169, 30, '', 'jd', '京东', 6, 98000, 4.8, '', 1, 0, '2026-05-31'],
    ['飞鹤 星飞帆 婴幼儿配方奶粉 3段 900g', '更适合中国宝宝体质，OPO结构脂，助力吸收', 'https://picsum.photos/seed/formula/400/400', '["https://picsum.photos/seed/formula1/600/600","https://picsum.photos/seed/formula2/600/600"]', 328, 238, 50, '', 'tmall', '天猫', 6, 45000, 4.7, '', 0, 0, '2026-06-10'],
    ['贝亲 宽口径玻璃奶瓶 240ml+160ml 套装', '硼硅玻璃材质，仿母乳实感奶嘴，防胀气', 'https://picsum.photos/seed/bottle/400/400', '["https://picsum.photos/seed/bottle1/600/600","https://picsum.photos/seed/bottle2/600/600"]', 199, 119, 20, '', 'taobao', '淘宝', 6, 72000, 4.6, '', 0, 0, '2026-06-05'],
    ['babycare 婴儿湿巾 手口专用 80抽*12包', 'EDI纯水，珍珠纹加厚，无酒精无香精', 'https://picsum.photos/seed/wipes/400/400', '["https://picsum.photos/seed/wipes1/600/600","https://picsum.photos/seed/wipes2/600/600"]', 89, 49, 10, '', 'pdd', '拼多多', 6, 134000, 4.5, '', 0, 1, '2026-05-28'],
  ];

  const insertSql = `INSERT INTO products (title, description, image, images, original_price, current_price,
    coupon_amount, coupon_link, platform, platform_label, category_id, sales, rating,
    buy_link, is_hot, is_new, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const p of products) {
    db.run(insertSql, p);
  }

  saveDatabase();
}
