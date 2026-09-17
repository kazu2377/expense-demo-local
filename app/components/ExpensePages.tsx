"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";

const STORAGE_KEY = "expense_demo_ledgers";
const LEGACY_COOKIE_NAME = "expense_demo_ledgers";

type Ledger = {
  id: number;
  code: number;
  ledger_name: string;
  ledger_type: "0" | "1" | "2";
  cost: string;
  remarks: string;
  created_at: string;
};

type FixedLedger = Ledger & {
  created_at: string;
};

const TYPE_LABELS: Record<Ledger["ledger_type"], string> = {
  "0": "立替",
  "1": "仮払",
  "2": "その他",
};

const FIXED_LEDGERS: FixedLedger[] = [
  { id: 1, code: 13976, ledger_name: "交通費", ledger_type: "0", cost: "3410", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 2, code: 13977, ledger_name: "雑費", ledger_type: "0", cost: "6880", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 3, code: 13978, ledger_name: "交通費", ledger_type: "1", cost: "10630", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 4, code: 13979, ledger_name: "宿泊費", ledger_type: "1", cost: "5360", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 5, code: 13980, ledger_name: "書籍費", ledger_type: "0", cost: "2850", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 6, code: 13981, ledger_name: "宿泊費", ledger_type: "0", cost: "8450", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 7, code: 13982, ledger_name: "交際費", ledger_type: "2", cost: "9960", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 8, code: 13983, ledger_name: "宿泊費", ledger_type: "0", cost: "8000", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 9, code: 13984, ledger_name: "交通費", ledger_type: "1", cost: "9630", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 10, code: 13985, ledger_name: "交通費", ledger_type: "2", cost: "2980", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 11, code: 13986, ledger_name: "交際費", ledger_type: "2", cost: "7440", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 12, code: 13987, ledger_name: "書籍費", ledger_type: "1", cost: "1810", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 13, code: 13988, ledger_name: "書籍費", ledger_type: "0", cost: "8040", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 14, code: 13989, ledger_name: "交通費", ledger_type: "1", cost: "10290", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 15, code: 13990, ledger_name: "交際費", ledger_type: "1", cost: "11150", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 16, code: 13991, ledger_name: "交通費", ledger_type: "0", cost: "4320", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 17, code: 13992, ledger_name: "雑費", ledger_type: "0", cost: "9040", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 18, code: 13993, ledger_name: "交通費", ledger_type: "0", cost: "11570", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 19, code: 13994, ledger_name: "宿泊費", ledger_type: "1", cost: "10410", remarks: "", created_at: "2020/01/30 22:43:37" },
  { id: 20, code: 13995, ledger_name: "書籍費", ledger_type: "2", cost: "10860", remarks: "", created_at: "2020/01/30 22:43:37" },
];

function readLedgers(): Ledger[] {
  if (typeof window === "undefined") return [];

  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);

    // Cookie版を一度利用したブラウザでは、既存データを初回だけ移行する。
    if (!raw) {
      const prefix = `${LEGACY_COOKIE_NAME}=`;
      const legacyValue = document.cookie
        .split("; ")
        .find((part) => part.startsWith(prefix))
        ?.slice(prefix.length);

      if (legacyValue) {
        raw = decodeURIComponent(legacyValue);
        window.localStorage.setItem(STORAGE_KEY, raw);
        document.cookie = `${LEGACY_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
      }
    }

    if (!raw) return [];

    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLedgers(ledgers: Ledger[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ledgers));
}

function resetLedgers() {
  writeLedgers([]);
  document.cookie = `${LEGACY_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function discardLedger(code: number) {
  const remaining = readLedgers().filter((ledger) => ledger.code !== code);
  writeLedgers(remaining);
  return remaining;
}

function nowText() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function SiteHeader({ homeActive = false }: { homeActive?: boolean }) {
  return (
    <header>
      <nav className="navbar navbar-default navbar-fixed-top bg-inverse">
        <a className="navbar-brand" href="/">Expense Demo</a>
        <ul className="nav navbar-nav">
          <li className={`nav-item ${homeActive ? "active" : ""}`}>
            <a className="nav-link" href="/">ホーム</a>
          </li>
        </ul>
        <ul className="nav navbar-nav navbar-right"></ul>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="footer">
      <hr />
      <div className="col-lg-12">
        <nav className="navbar navbar-dark bg-inverse">
          <ul className="nav navbar-nav footer-notice">
            <li className="nav-item">本プログラムについてのお問い合わせにはお答えすることができません。</li>
            <li className="nav-item">本プログラムは一切の保証を行わず、ご利用は全て利用者ご自身の責任において行っていただくものとします。本プログラムの利用により生じたいかなる損害・問題についても、提供者は一切の責任を負いません。</li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

function PageFrame({
  children,
  homeActive = false,
}: {
  children: ReactNode;
  homeActive?: boolean;
}) {
  return (
    <>
      <SiteHeader homeActive={homeActive} />
      {children}
      <SiteFooter />
    </>
  );
}

const downloadAttributes = {
  type: "application/vnd.ms-excel",
  disposition: "attachment",
  url_based_filename: "true",
  format: "xlsx",
};

export function HomePage() {
  return (
    <PageFrame homeActive>
      <div className="page-header">
        <h1>Expense Demo サイトへようこそ!!</h1>
        <ul>
        </ul>
        <div className="panel panel-default center-block">
          <div className="panel-heading">メニュー</div>
          <div className="panel-body">
            <div className="container">
              <h3>経費登録</h3>
              <a
                className="btn btn-primary btn-block menu-link"
                style={{ margin: "15px" }}
                href="/ledgers/local"
                onClick={resetLedgers}
              >
                経費を登録する
              </a>
              <div {...({ align: "center" } as Record<string, string>)}>
                <a {...downloadAttributes} className="btn btn-info" href="/data.xlsx">
                  サンプルのダウンロード
                </a>
                演習で使用しているエクセルファイルは、こちらからダウンロード可能です。
              </div>
              <br /><br /><br />
              <hr />
              <h3>経費照会</h3>
              <a className="btn btn-primary btn-block menu-link" style={{ margin: "15px" }} href="/fixed_ledgers?hash_code=local">
                経費のリストを参照する
              </a>
              <br /><br /><br />
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function LedgerTable({
  ledgers,
  linkPrefix,
  showActions = false,
  onDiscard,
}: {
  ledgers: Ledger[];
  linkPrefix: string;
  showActions?: boolean;
  onDiscard?: (code: number) => void;
}) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered table-hover">
        <thead>
          <tr>
            <th>取引処理番号</th>
            <th>タイトル</th>
            <th>種別</th>
            <th>金額</th>
            <th>備考</th>
            <th>作成日</th>
            {showActions ? <th>アクション</th> : null}
          </tr>
        </thead>
        <tbody>
          {ledgers.map((ledger) => (
            <tr key={ledger.id}>
              <td>
                {showActions ? (
                  <strong>{ledger.code}</strong>
                ) : (
                  <a href={`${linkPrefix}/${ledger.id}`}>{ledger.id}</a>
                )}
              </td>
              <td>{ledger.ledger_name}</td>
              <td>{TYPE_LABELS[ledger.ledger_type]}</td>
              <td>{ledger.cost}</td>
              <td>{ledger.remarks}</td>
              <td>{ledger.created_at}</td>
              {showActions ? (
                <td className="action-cell">
                  <a className="btn btn-default btn-xs" href={`/ledgers/local/show/${ledger.code}`}>表示</a>
                  <a
                    className="btn btn-danger btn-xs"
                    data-confirm="破棄してよろしいですか？"
                    rel="nofollow"
                    data-method="delete"
                    href={`/ledgers/local/${ledger.code}`}
                    onClick={(event) => {
                      event.preventDefault();
                      onDiscard?.(ledger.code);
                    }}
                  >
                    破棄
                  </a>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LedgerListPage() {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLedgers(readLedgers());
    setLoaded(true);
  }, []);

  function discard(code: number) {
    if (!window.confirm("破棄してよろしいですか？")) return;
    setLedgers(discardLedger(code));
  }

  const totalCost = ledgers.reduce((total, ledger) => total + (Number(ledger.cost) || 0), 0);

  return (
    <PageFrame>
      <div className="page-header">
        <h1>経費一覧</h1>
      </div>
      <a className="btn btn-primary menu-link" id="newTx" style={{ margin: "10px" }} href="/ledgers/local/new">
        明細を登録する
      </a>
      <div className="panel panel-default center-block">
        <div className="panel-heading">取引一覧</div>
        <div className="panel-body">
          {loaded && ledgers.length > 0 ? (
            <>
              <LedgerTable
                ledgers={ledgers}
                linkPrefix="/ledgers/local/show"
                showActions
                onDiscard={discard}
              />
              <div className="text-right ledger-total">
                <strong>合計金額: {totalCost.toLocaleString("ja-JP")}</strong>
              </div>
            </>
          ) : (
            <div className="alert alert-warning" role="alert">
              「明細を登録する」から、取引を作成します。
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}

export function NewLedgerPage() {
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const ledgerName = (form.elements.namedItem("ledger[ledger_name]") as HTMLInputElement).value.trim();
    const ledgerType = (form.elements.namedItem("ledger[ledger_type]") as HTMLSelectElement).value as Ledger["ledger_type"];
    const cost = (form.elements.namedItem("ledger[cost]") as HTMLInputElement).value.trim();
    const remarks = (form.elements.namedItem("ledger[remarks]") as HTMLInputElement).value.trim();

    if (!ledgerName || !ledgerType || !cost) {
      setError("タイトル、種別、金額を入力してください。");
      return;
    }

    if (!/^\d+$/.test(cost)) {
      setError("金額は半角数字で入力してください。");
      return;
    }

    const current = readLedgers();
    const nextId = current.reduce((max, ledger) => Math.max(max, ledger.id), 0) + 1;
    const nextCode = current.reduce((max, ledger) => Math.max(max, ledger.code), 587523) + 1;
    const record: Ledger = {
      id: nextId,
      code: nextCode,
      ledger_name: ledgerName,
      ledger_type: ledgerType,
      cost,
      remarks,
      created_at: nowText(),
    };

    try {
      writeLedgers([...current, record]);
      window.location.assign(`/ledgers/local/show/${record.code}?notice=Ledger+was+successfully+created.`);
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : "localStorageへの保存に失敗しました。");
    }
  }

  return (
    <PageFrame>
      <div className="page-header">
        <h1>経費登録</h1>
      </div>
      <form
        className="simple_form form-horizontal ledger"
        noValidate
        id="new_ledger"
        action="/ledgers/local/create"
        acceptCharset="UTF-8"
        method="post"
        onSubmit={submit}
      >
        <input name="utf8" type="hidden" value="✓" readOnly />
        <input type="hidden" name="authenticity_token" value="local-storage" readOnly />

        <div className="form-group">
          <label className="control-label col-xl-2 col-lg-2 col-md-2 col-sm-6 col-xs-6" htmlFor="ledger_ledger_name">タイトル*</label>
          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-6">
            <input className="form-control" type="text" name="ledger[ledger_name]" id="ledger_ledger_name" />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xl-2 col-lg-2 col-md-2 col-sm-6 col-xs-6" htmlFor="ledger_ledger_type">種別*</label>
          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-6">
            <select className="form-control" name="ledger[ledger_type]" id="ledger_ledger_type" defaultValue="">
              <option value=""></option>
              <option value="0">立替</option>
              <option value="1">仮払</option>
              <option value="2">その他</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xl-2 col-lg-2 col-md-2 col-sm-6 col-xs-6" htmlFor="ledger_cost">金額*</label>
          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-6">
            <input className="form-control" type="text" name="ledger[cost]" id="ledger_cost" inputMode="numeric" />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xl-2 col-lg-2 col-md-2 col-sm-6 col-xs-6" htmlFor="ledger_remarks">備考</label>
          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-6">
            <input className="form-control" type="text" name="ledger[remarks]" id="ledger_remarks" />
          </div>
        </div>
        {error ? <div className="alert alert-danger storage-error" role="alert">{error}</div> : null}
        <div className="form-group">
          <div className="form-actions">
            <div className="col-lg-offset-2 col-lg-6">
              <input type="submit" name="commit" value="登録する" className="btn btn-primary" data-disable-with="登録する" />
              <a className="btn" href="/ledgers/local">キャンセル</a>
            </div>
          </div>
        </div>
      </form>
    </PageFrame>
  );
}

export function FixedLedgerListPage() {
  const [page, setPage] = useState(1);

  useEffect(() => {
    const value = Number(new URLSearchParams(window.location.search).get("page") || "1");
    setPage(value === 2 ? 2 : 1);
  }, []);

  const pageRows = page === 2 ? FIXED_LEDGERS.slice(10) : FIXED_LEDGERS.slice(0, 10);

  return (
    <PageFrame>
      <div className="page-header">
        <h1>経費一覧</h1>
      </div>
      <div className="panel panel-default center-block">
        <div className="panel-heading">取引一覧</div>
        <div className="panel-body">
          <LedgerTable ledgers={pageRows} linkPrefix="/fixed_ledgers/show" />
          <nav>
            <ul className="pagination">
              {page === 2 ? (
                <>
                  <li className="page-item"><a rel="prev" className="page-link" href="/fixed_ledgers?hash_code=local">最初</a></li>
                  <li className="page-item"><a rel="prev" className="page-link" href="/fixed_ledgers?hash_code=local">前ページ</a></li>
                  <li className="page-item"><a className="page-link" href="/fixed_ledgers?hash_code=local">1</a></li>
                  <li className="page-item active"><a className="page-link">2</a></li>
                </>
              ) : (
                <>
                  <li className="page-item active"><a className="page-link">1</a></li>
                  <li className="page-item"><a rel="next" className="page-link" href="/fixed_ledgers?hash_code=local&page=2">2</a></li>
                  <li className="page-item"><a rel="next" className="page-link" href="/fixed_ledgers?hash_code=local&page=2">次ページ</a></li>
                  <li className="page-item"><a className="page-link" href="/fixed_ledgers?hash_code=local&page=2">最終</a></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </PageFrame>
  );
}

function DetailPage({
  title,
  record,
  backHref,
  loading = false,
  showId = true,
  onDiscard,
}: {
  title: string;
  record?: Ledger;
  backHref: string;
  loading?: boolean;
  showId?: boolean;
  onDiscard?: (code: number) => void;
}) {
  return (
    <PageFrame>
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      {loading ? null : record ? (
        <dl className="dl-horizontal">
          {showId ? (
            <>
              <dt><strong><span className="translation_missing" title="translation missing: ja.fixed_ledgers.show.id">Id</span>:</strong></dt>
              <dd>{record.id}</dd>
            </>
          ) : null}
          <dt><strong>コード:</strong></dt>
          <dd>{record.code}</dd>
          <dt><strong>タイトル:</strong></dt>
          <dd>{record.ledger_name}</dd>
          <dt><strong>種別:</strong></dt>
          <dd>{TYPE_LABELS[record.ledger_type]}</dd>
          <dt><strong>金額:</strong></dt>
          <dd>{record.cost}</dd>
          <dt><strong>備考:</strong></dt>
          <dd className="empty-remarks">{record.remarks}</dd>
        </dl>
      ) : (
        <div className="alert alert-warning" role="alert">指定された明細が見つかりません。</div>
      )}
      <a className="btn btn-default" href={backHref}>戻る</a>
      {record && onDiscard ? (
        <a
          className="btn btn-danger detail-discard"
          data-confirm="破棄してよろしいですか？"
          rel="nofollow"
          data-method="delete"
          href={`/ledgers/local/${record.code}`}
          onClick={(event) => {
            event.preventDefault();
            onDiscard(record.code);
          }}
        >
          破棄
        </a>
      ) : null}
    </PageFrame>
  );
}

export function FixedLedgerDetailPage() {
  const [record, setRecord] = useState<Ledger | undefined>(FIXED_LEDGERS[0]);

  useEffect(() => {
    const id = Number(window.location.pathname.split("/").filter(Boolean).pop());
    setRecord(FIXED_LEDGERS.find((ledger) => ledger.id === id));
  }, []);

  return <DetailPage title="経費照会" record={record} backHref="/fixed_ledgers?hash_code=local" />;
}

export function LedgerDetailPage() {
  const [record, setRecord] = useState<Ledger | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const code = Number(window.location.pathname.split("/").filter(Boolean).pop());
    setRecord(readLedgers().find((ledger) => ledger.code === code));
    setLoaded(true);
  }, []);

  function discard(code: number) {
    if (!window.confirm("破棄してよろしいですか？")) return;
    discardLedger(code);
    window.location.assign("/ledgers/local");
  }

  return (
    <DetailPage
      title="経費照会"
      record={record}
      backHref="/ledgers/local"
      loading={!loaded}
      showId={false}
      onDiscard={discard}
    />
  );
}
