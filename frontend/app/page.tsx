// app/page.tsx
import Link from "next/link";

type Card = {
  title: string;
  desc: string;
  href: string;
  icon: string;
  badge?: { label: string; tone: "ok" | "warn" | "info" };
  external?: boolean;
};

const cards: Card[] = [
  {
    title: "埋め込みプレビュー",
    desc: "埋め込み用チャットUI（/embed）を確認",
    href: "/embed",
    icon: "🧩",
    badge: { label: "Preview", tone: "ok" },
    external: true, // 新しいタブで開く
  },
  {
    title: "チャット",
    desc: "質問 → 根拠検索 → 回答生成（RAG）をテスト",
    href: "/chat",
    icon: "💬",
    badge: { label: "Ready", tone: "ok" },
  },
  {
    title: "ファイル管理",
    desc: "PDF/ファイルのアップロード・一覧・再取り込み",
    href: "/ingest",
    icon: "📄",
    badge: { label: "Manage", tone: "info" },
  },
  {
    title: "Webサイト管理",
    desc: "サイト登録・状態確認・再ingestキュー",
    href: "/websites",
    icon: "🌐",
    badge: { label: "Ingest", tone: "info" },
  },
  // {
  //   title: "管理",
  //   desc: "全体設定・実行状況・メンテナンス",
  //   href: "/admin",
  //   icon: "🛠️",
  //   badge: { label: "Admin", tone: "warn" },
  // },
];

function Badge({
  tone,
  label,
}: {
  tone: "ok" | "warn" | "info";
  label: string;
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
      : tone === "warn"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/20"
      : "bg-sky-500/15 text-sky-300 border-sky-500/20";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}
    >
      {label}
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* 背景（薄いグラデ＋blur） */}
      <div className="pointer-events-none fixed inset-0 opacity-45">
        <div className="absolute -top-40 left-10 h-96 w-96 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute top-40 right-10 h-96 w-96 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        {/* Top bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-400">RAG Chatbot</div>
            <h1 className="text-2xl font-semibold tracking-tight">
              はたらくあさひかわ — 管理ダッシュボード
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* <Link
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              href="/embed"
              target="_blank"
              rel="noreferrer"
            >
              埋め込みプレビュー ↗
            </Link> */}
          </div>
        </div>

        {/* Hero */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                データ更新をここから一括管理
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                ファイル・サイト・チャット動作確認を、最短導線でまとめました。
              </p>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            // 外部扱い（別タブで開く）したいカード用
            if (c.external) {
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-2xl">{c.icon}</div>
                    {c.badge ? (
                      <Badge tone={c.badge.tone} label={c.badge.label} />
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <div className="text-base font-semibold">{c.title}</div>
                    <div className="mt-1 text-sm text-zinc-400">{c.desc}</div>
                  </div>

                  <div className="mt-4 text-sm text-zinc-300">
                    <span className="opacity-70 group-hover:opacity-100">
                      開く
                    </span>{" "}
                    ↗
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-2xl">{c.icon}</div>
                  {c.badge ? (
                    <Badge tone={c.badge.tone} label={c.badge.label} />
                  ) : null}
                </div>

                <div className="mt-4">
                  <div className="text-base font-semibold">{c.title}</div>
                  <div className="mt-1 text-sm text-zinc-400">{c.desc}</div>
                </div>

                <div className="mt-4 text-sm text-zinc-300">
                  <span className="opacity-70 group-hover:opacity-100">
                    開く
                  </span>{" "}
                  →
                </div>
              </Link>
            );
          })}
        </section>

        <footer className="mt-10 text-center text-xs text-zinc-500">
          © RAG Chatbot Dashboard
        </footer>
      </div>
    </div>
  );
}
