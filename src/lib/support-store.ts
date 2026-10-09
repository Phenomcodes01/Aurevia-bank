/**
 * Customer-support data layer.
 *
 * All UI (customer widget + admin inbox) talks ONLY to `supportService`.
 * Today it is backed by browser storage (local, same-device only — no real
 * delivery between customers and staff). To go live, replace the bodies of
 * the functions in `supportService` with calls to a real backend:
 *   - getMyConversation(identity)        -> GET  /support/conversations/mine
 *   - sendCustomerMessage(identity, txt) -> POST /support/conversations/mine/messages
 *   - listConversations()                -> GET  /admin/support/conversations   (admin only)
 *   - markRead(id, role)                 -> POST /support/conversations/:id/read
 *   - sendAdminReply(id, txt)            -> POST /admin/support/conversations/:id/messages
 *   - setStatus(id, status)              -> PATCH /admin/support/conversations/:id
 * Authorization (customers see only their own conversation; admin endpoints
 * require a verified admin role) MUST be enforced by that backend.
 */
import { useEffect, useState } from "react";

export type SupportRole = "customer" | "admin";
export type ConversationStatus = "open" | "pending" | "resolved";

export interface SupportIdentity { id: string; name: string; email?: string; guest: boolean }

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  role: SupportRole;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface SupportConversation {
  id: string;
  customer: SupportIdentity;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

const KEY = "aurevia-support";
const GUEST_KEY = "aurevia-support-guest";
const EVT = "aurevia-support-change";
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Sample conversations for previewing the inbox. Delete when connecting a backend.
function sample(): SupportConversation[] {
  const t = (m: number) => new Date(Date.now() - m * 60000).toISOString();
  const mk = (id: string, c: SupportIdentity, status: ConversationStatus, msgs: [SupportRole, string, number][]): SupportConversation => ({
    id, customer: c, status, createdAt: t(msgs[0]![2]), updatedAt: t(msgs[msgs.length - 1]![2]),
    messages: msgs.map(([role, content, m]) => ({ id: uid(), conversationId: id, senderId: role === "admin" ? "admin" : c.id, senderName: role === "admin" ? "Aurevia Support" : c.name, role, content, createdAt: t(m), read: role === "admin" })),
  });
  return [
    mk("sample-1", { id: "jordan@aurevia.example", name: "Jordan Lee", email: "jordan@aurevia.example", guest: false }, "open", [["customer", "Hi, my card payment was declined at a store this morning. Can you check?", 42]]),
    mk("sample-2", { id: "priya@aurevia.example", name: "Priya Shah", email: "priya@aurevia.example", guest: false }, "pending", [["customer", "How long do international transfers take?", 300], ["admin", "Usually 1–3 business days. Which country are you sending to?", 280]]),
  ];
}

function read(): SupportConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  const s = sample();
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}
function write(list: SupportConversation[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}
const delay = () => new Promise((r) => setTimeout(r, 250));

export function guestIdentity(): SupportIdentity {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) { id = "guest-" + uid(); localStorage.setItem(GUEST_KEY, id); }
  return { id, name: "Guest " + id.slice(6, 10).toUpperCase(), guest: true };
}

export const supportService = {
  async getMyConversation(me: SupportIdentity): Promise<SupportConversation | null> {
    await delay();
    return read().find((c) => c.customer.id === me.id) ?? null;
  },
  async sendCustomerMessage(me: SupportIdentity, content: string): Promise<SupportMessage> {
    const text = content.trim();
    if (!text) throw new Error("Message cannot be empty");
    if (text.length > 2000) throw new Error("Message is too long (max 2000 characters)");
    await delay();
    const list = read();
    let conv = list.find((c) => c.customer.id === me.id);
    const now = new Date().toISOString();
    if (!conv) { conv = { id: uid(), customer: me, status: "open", createdAt: now, updatedAt: now, messages: [] }; list.unshift(conv); }
    const msg: SupportMessage = { id: uid(), conversationId: conv.id, senderId: me.id, senderName: me.name, role: "customer", content: text, createdAt: now, read: false };
    conv.messages.push(msg); conv.updatedAt = now; if (conv.status === "resolved") conv.status = "open"; else conv.status = "open";
    write(list);
    return msg;
  },
  async listConversations(): Promise<SupportConversation[]> {
    await delay();
    return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async markRead(conversationId: string, reader: SupportRole) {
    const list = read();
    const c = list.find((x) => x.id === conversationId);
    if (!c) return;
    let changed = false;
    c.messages.forEach((m) => { if (m.role !== reader && !m.read) { m.read = true; changed = true; } });
    if (changed) write(list);
  },
  async sendAdminReply(conversationId: string, content: string) {
    const text = content.trim();
    if (!text) throw new Error("Reply cannot be empty");
    await delay();
    const list = read();
    const c = list.find((x) => x.id === conversationId);
    if (!c) throw new Error("Conversation not found");
    const now = new Date().toISOString();
    c.messages.push({ id: uid(), conversationId, senderId: "admin", senderName: "Aurevia Support", role: "admin", content: text, createdAt: now, read: false });
    c.updatedAt = now; c.status = "pending";
    write(list);
  },
  async setStatus(conversationId: string, status: ConversationStatus) {
    const list = read();
    const c = list.find((x) => x.id === conversationId);
    if (!c) throw new Error("Conversation not found");
    c.status = status; c.updatedAt = new Date().toISOString();
    write(list);
  },
};

/** Re-runs `load` whenever support data changes (same tab or another tab). */
export function useSupportData<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const run = () => load().then((d) => { if (live) { setData(d); setError(null); } }).catch((e) => live && setError(String(e?.message ?? e)));
    run();
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) run(); };
    window.addEventListener(EVT, run); window.addEventListener("storage", onStorage);
    return () => { live = false; window.removeEventListener(EVT, run); window.removeEventListener("storage", onStorage); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error, loading: data === undefined && !error };
}

export const fmtTime = (iso: string) => new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
