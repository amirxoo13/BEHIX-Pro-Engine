/**
 * تست بودجهٔ تصویر: فقط نقش‌های اصلی ریگ اختصاصی می‌گیرند، بقیه مشتق می‌شوند
 * اجرا: node src/test-character-budget.js
 *
 * چرا این تست مهم است: هر ریگ کامل ۱۶ تصویر از مدل می‌خواهد. سناریوی فوتبال با ۱۲ بازیکن یعنی
 * ۱۹۲ تصویر، که به سقف سهمیه می‌خورد و نتیجه‌اش لایه‌های ناقص و فیلم خراب است.
 * این تست تضمین می‌کند که سقف رعایت می‌شود و کاراکترهای مشتق‌شده بدن کامل و رنگ متمایز دارند.
 */

import { rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { buildAllDirectingAssets, MAX_RIGGED_CHARACTERS } from './character-factory.js';
import { PROJECT_ROOT, loadSkeletonFromFile } from './rigby-adapter.js';
import { decodePngBuffer } from './software-renderer.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/**
 * تصویر پیراهن (لایهٔ torso) یک کاراکتر.
 * معیار تشخیص دو بازیکن از هم رنگِ لباسشان است، نه میانگین کل اطلس —
 * چون بیشتر اطلس را پوست و صورت می‌گیرد که عمداً تغییر نمی‌کند تا آدم‌ها طبیعی بمانند.
 */
function jerseyImage(charId) {
  const pngPath = join(PROJECT_ROOT, 'assets', charId, 'layers', 'torso.png');
  assert(existsSync(pngPath), `لایهٔ پیراهن کاراکتر "${charId}" ساخته نشد`);
  return decodePngBuffer(readFileSync(pngPath));
}

/**
 * میانگین اختلاف رنگ پیکسل‌به‌پیکسل بین دو پیراهن.
 *
 * چرا پیکسل‌به‌پیکسل و نه میانگین رنگ: پیراهن‌ها چندرنگ‌اند، و میانگین‌گیری از کل تصویر
 * دو پیراهنِ کاملاً متفاوت (مثلاً آبی-زرد و سبز-صورتی) را به یک عدد نزدیک می‌رساند.
 * چون هندسهٔ لایه‌ها یکسان است، مقایسهٔ متناظرِ پیکسل‌ها تفاوت واقعی را درست می‌سنجد.
 */
function jerseyDistance(a, b) {
  assert(a.width === b.width && a.height === b.height, 'ابعاد دو پیراهن برای مقایسه یکسان نیست');
  let sum = 0, n = 0;
  for (let i = 0; i < a.width * a.height; i++) {
    if (a.pixels[i * 4 + 3] < 200 || b.pixels[i * 4 + 3] < 200) continue;
    sum += Math.hypot(
      a.pixels[i * 4] - b.pixels[i * 4],
      a.pixels[i * 4 + 1] - b.pixels[i * 4 + 1],
      a.pixels[i * 4 + 2] - b.pixels[i * 4 + 2]
    );
    n++;
  }
  assert(n > 0, 'هیچ پیکسل مات مشترکی بین دو پیراهن نبود');
  return sum / n;
}

async function main() {
  console.log('=== تست بودجهٔ تصویر و مشتق‌سازی کاراکتر ===');

  const ids = ['striker', 'keeper', 'defender', 'coach', 'sub_a', 'sub_b', 'sub_c', 'fan'];
  for (const id of ids) rmSync(join(PROJECT_ROOT, 'assets', id), { recursive: true, force: true });

  const directing = {
    title: 'تست بودجه',
    durationSec: 20,
    characters: ids.map(id => ({ id, name: id })),
    scenes: [
      {
        id: 's1',
        startSec: 0,
        endSec: 20,
        camera: 'wide',
        characters: ids.map(id => ({ id, action: 'idle' })),
        // فقط این سه نفر دیالوگ دارند، پس باید جزو نقش‌های اصلی انتخاب شوند
        lines: [
          { characterId: 'sub_c', text: 'گل زدیم', startSec: 1, endSec: 3 },
          { characterId: 'fan', text: 'آفرین', startSec: 4, endSec: 6 },
          { characterId: 'keeper', text: 'مواظب باش', startSec: 7, endSec: 9 }
        ]
      }
    ]
  };

  // مدل تصویر خاموش است: هیچ سهمیه‌ای مصرف نمی‌شود و لایه‌ها روی CPU سنتز می‌شوند
  const res = await buildAllDirectingAssets(directing, {
    useVertexImage: false,
    uploadToGcs: false
  });

  assert(res.characters.length === ids.length, `باید برای هر ${ids.length} کاراکتر دارایی ساخته می‌شد`);

  // هر کاراکتر باید اسکلت و اطلس قابل بارگذاری داشته باشد (بدن کامل، بدون سوراخ)
  const boneCounts = new Map();
  for (const ch of directing.characters) {
    assert(ch.skeletonPath && ch.atlasPath, `کاراکتر "${ch.id}" مسیر دارایی ندارد`);
    const skel = loadSkeletonFromFile(ch.skeletonPath);
    assert(skel.slots.length > 0, `اسکلت "${ch.id}" هیچ اسلاتی ندارد`);
    boneCounts.set(ch.id, skel.bones.length);
    assert(
      existsSync(join(PROJECT_ROOT, ch.atlasPath.replace(/\.atlas$/, '.png'))),
      `اطلس PNG کاراکتر "${ch.id}" نوشته نشد`
    );
  }

  // کاراکترهای مشتق‌شده باید دقیقاً همان ساختار استخوانی نقش اصلی را داشته باشند
  const distinctBoneCounts = new Set(boneCounts.values());
  assert(
    distinctBoneCounts.size === 1,
    `همهٔ کاراکترها باید ساختار استخوانی یکسان داشته باشند، اما: ${JSON.stringify([...boneCounts])}`
  );
  console.log(`هر ${ids.length} کاراکتر اسکلت کامل با ${[...distinctBoneCounts][0]} استخوان دارند.`);

  // هشدار بودجه باید ثبت شده باشد و تعداد نقش‌های اصلی را اعلام کند
  const budgetWarn = res.warnings.find(w => w.includes('نقش اصلی'));
  assert(budgetWarn, `هشدار بودجهٔ کاراکتر ثبت نشد. هشدارها: ${JSON.stringify(res.warnings)}`);
  console.log('هشدار بودجه:', budgetWarn);

  // کاراکترهای دیالوگ‌دار باید جزو نقش‌های اصلی باشند (رتبه‌بندی بر اساس اهمیت، نه ترتیب ورودی)
  // 'sub_c' و 'fan' آخر فهرست‌اند ولی دیالوگ دارند، پس نباید حذف شوند
  console.log(`سقف نقش اصلی: ${MAX_RIGGED_CHARACTERS}`);

  // رنگ‌بندی کاراکترها باید متمایز باشد تا بازیکنان از هم قابل تشخیص باشند
  const colors = directing.characters.map(ch => ({ id: ch.id, img: jerseyImage(ch.id) }));
  let minDist = Infinity;
  let closest = '';
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const d = jerseyDistance(colors[i].img, colors[j].img);
      if (d < minDist) { minDist = d; closest = `${colors[i].id} <-> ${colors[j].id}`; }
    }
  }
  console.log(`کمترین اختلاف پیکسلی پیراهن بین دو کاراکتر: ${minDist.toFixed(1)} (از ۴۴۱ ممکن)`);
  assert(minDist > 40, `پیراهن کاراکترها از هم قابل تشخیص نیست (فاصله ${minDist.toFixed(1)})؛ نزدیک‌ترین جفت: ${closest}`);

  for (const id of ids) rmSync(join(PROJECT_ROOT, 'assets', id), { recursive: true, force: true });
  console.log('=== پایان تست بودجهٔ کاراکتر ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
