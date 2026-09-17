import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the cloned home page structure", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Expense Demo<\/title>/i);
  assert.match(html, /Expense Demo サイトへようこそ!!/);
  assert.match(html, /class="navbar navbar-default navbar-fixed-top bg-inverse"/);
  assert.match(html, /href="\/ledgers\/local"/);
  assert.match(html, /href="\/fixed_ledgers\?hash_code=local"/);
  assert.match(html, /href="\/data\.xlsx"/);
  assert.match(html, /本プログラムについてのお問い合わせにはお答えすることができません。/);
  assert.match(html, /本プログラムは一切の保証を行わず、ご利用は全て利用者ご自身の責任において行っていただくものとします。本プログラムの利用により生じたいかなる損害・問題についても、提供者は一切の責任を負いません。/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview/);
});

test("preserves the registration form contracts", async () => {
  const response = await render("/ledgers/local/new");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /class="simple_form form-horizontal ledger"/);
  assert.match(html, /id="new_ledger"/);
  assert.match(html, /action="\/ledgers\/local\/create"/);
  assert.match(html, /name="ledger\[ledger_name\]"/);
  assert.match(html, /id="ledger_ledger_name"/);
  assert.match(html, /name="ledger\[ledger_type\]"/);
  assert.match(html, /id="ledger_cost"/);
  assert.match(html, /data-disable-with="登録する"/);
});

test("renders the fixed ledger table and detail markup", async () => {
  const listResponse = await render("/fixed_ledgers?hash_code=local");
  const listHtml = await listResponse.text();
  assert.match(listHtml, /class="table table-striped table-bordered table-hover"/);
  assert.match(listHtml, /取引処理番号/);
  assert.match(listHtml, /交通費/);
  assert.match(listHtml, /2020\/01\/30 22:43:37/);

  const detailResponse = await render("/fixed_ledgers/show/1");
  const detailHtml = await detailResponse.text();
  assert.match(detailHtml, /class="dl-horizontal"/);
  assert.match(detailHtml, /コード:/);
  assert.match(detailHtml, /13976/);
});

test("waits for localStorage before showing a missing-ledger warning", async () => {
  const response = await render("/ledgers/local/show/587524");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /経費照会/);
  assert.doesNotMatch(html, /指定された明細が見つかりません。/);
});

test("uses localStorage and includes the original local assets", async () => {
  const source = await readFile(
    new URL("../app/components/ExpensePages.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /window\.localStorage\.getItem/);
  assert.match(source, /window\.localStorage\.setItem/);
  assert.match(source, /expense_demo_ledgers/);
  assert.match(source, /function resetLedgers\(\)/);
  assert.match(source, /writeLedgers\(\[\]\)/);
  assert.match(source, /onClick=\{resetLedgers\}/);
  assert.match(source, /showActions/);
  assert.match(source, /アクション/);
  assert.match(source, /表示/);
  assert.match(source, /破棄/);
  assert.match(source, /合計金額:/);
  assert.match(source, /window\.confirm/);
  assert.match(source, /record\.code\}\?notice=Ledger\+was\+successfully\+created/);
  assert.match(source, /find\(\(ledger\) => ledger\.code === code\)/);
  assert.match(source, /const \[loaded, setLoaded\] = useState\(false\)/);
  assert.match(source, /loading=\{!loaded\}/);
  assert.match(source, /\{loading \? null : record \?/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);

  await access(
    new URL(
      "../public/assets/application-c3df72e94546ce304138fccba3572e705aaeaa8abe0559dba259c0cd8f888814.css",
      import.meta.url,
    ),
  );
  await access(new URL("../public/data.xlsx", import.meta.url));
  await access(new URL("../public/favicon.ico", import.meta.url));
});
