"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

// ====== 設定 ======
const LS_KEY = "embed_chat_messages_v1";
const MAX_SEND_TURNS = 20; // ★送信する履歴の上限（増やすとコスト増・遅くなる）

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function EmbedPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  // ★ 自動スクロール用
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ★ 初回：localStorageから復元
  useEffect(() => {
    const saved = safeJsonParse<Msg[]>(localStorage.getItem(LS_KEY));
    if (Array.isArray(saved) && saved.length) {
      setMessages(saved);
    }
  }, []);

  // ★ messagesが変わるたびに保存
  useEffect(() => {
    // 空なら消す（好み）
    if (!messages.length) {
      localStorage.removeItem(LS_KEY);
      return;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(messages));
  }, [messages]);

  // ★ messages / thinking が変わったら最下部へ
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  // ★ APIに送る履歴（直近N件に制限）
  const outboundMessages = useMemo(() => {
    // 直近N件だけ送る（長文になりすぎるのを防ぐ）
    return messages.slice(-MAX_SEND_TURNS);
  }, [messages]);

  const clearChat = () => {
    if (thinking) return;
    setMessages([]);
    setInput("");
    localStorage.removeItem(LS_KEY);
  };

  const send = async (): Promise<void> => {
    const q = input.trim();
    if (!q || thinking) return;

    setInput("");
    setThinking(true);

    // ★ここで「確定した送信履歴」を作る（setStateの非同期ズレ対策）
    const nextMessages: Msg[] = [...messages, { role: "user", content: q }];

    // UIに反映
    setMessages(nextMessages);

    try {
      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // ✅互換重視：
        // - 今まで通り question も送る
        // - 追加で messages も送る（バックが対応していれば会話文脈を理解できる）
        body: JSON.stringify({
          question: q,
          messages: nextMessages.slice(-MAX_SEND_TURNS),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API error: ${res.status} ${res.statusText}\n${text}`);
      }

      const data: any = await res.json().catch(() => ({}));
      const answer =
        data?.answer ??
        data?.message ??
        data?.content ??
        (typeof data === "string" ? data : "");

      setMessages((m) => [
        ...m,
        { role: "assistant", content: answer || "（返答が取得できませんでした）" },
      ]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `エラー: ${e?.message ?? String(e)}` },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50">
      <div className="h-full w-full flex flex-col">
        <div className="px-4 pt-4">
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center overflow-hidden">
                  <Image
                    src="/chatbot_icon2.jpg"
                    alt="AI"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">
                    AI Assistant
                  </div>
                  <div className="text-[11px] opacity-90 leading-tight">
                    ご質問をどうぞ
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={thinking || messages.length === 0}
                  className="text-[11px] px-3 py-1 rounded-full bg-white/20 disabled:opacity-50"
                  title="会話を消去"
                >
                  クリア
                </button>
                <div className="text-[11px] px-2 py-1 rounded-full bg-white/20">
                  Online
                </div>
              </div>
            </div>

            <div className="h-[calc(100vh-190px)] overflow-y-auto px-4 py-4 space-y-3 bg-white">
              {messages.length === 0 && (
                <div className="text-sm text-slate-500">
                  例）「はたらくあさひかわとは？」など
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={[
                      "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-sky-500 text-white rounded-br-xl"
                        : "bg-slate-100 text-slate-800 rounded-bl-xl",
                    ].join(" ")}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 rounded-3xl rounded-bl-xl px-4 py-3 text-sm">
                    <span className="inline-flex gap-1">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse [animation-delay:120ms]">
                        ●
                      </span>
                      <span className="animate-pulse [animation-delay:240ms]">
                        ●
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="px-3 py-3 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:ring-2 focus:ring-sky-300"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="質問を入力…"
                />
                <button
                  onClick={send}
                  disabled={thinking}
                  className="h-11 w-11 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 text-white shadow-sm disabled:opacity-50 active:scale-95 transition"
                  aria-label="send"
                  type="button"
                >
                  ➤
                </button>
              </div>

              <div className="mt-2 text-[10px] text-slate-400 px-2">
                Enterで送信 / Escで閉じる（外側のウィンドウ）
              </div>

              {/* デバッグ用：送信履歴の件数 */}
              {/* <div className="mt-1 text-[10px] text-slate-400 px-2">
                送信する履歴: {outboundMessages.length} / 全体: {messages.length}
              </div> */}
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
