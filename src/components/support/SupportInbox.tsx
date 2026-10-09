import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Inbox, Loader2, RotateCcw, Send } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fmtTime, supportService, useSupportData, type ConversationStatus } from "@/lib/support-store";

const badge: Record<ConversationStatus, string> = {
  open: "bg-primary/15 text-primary",
  pending: "bg-accent text-accent-foreground",
  resolved: "bg-muted text-muted-foreground",
};

export function SupportInbox() {
  const { data, loading, error } = useSupportData(() => supportService.listConversations());
  const [sel, setSel] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationStatus | "all">("all");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const list = (data ?? []).filter((c) => filter === "all" || c.status === filter);
  const cur = data?.find((c) => c.id === sel) ?? null;

  useEffect(() => { if (cur) supportService.markRead(cur.id, "admin"); }, [cur]);

  const send = async () => {
    if (!cur || !reply.trim()) return;
    setSending(true);
    try { await supportService.sendAdminReply(cur.id, reply); setReply(""); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Reply failed"); }
    finally { setSending(false); }
  };
  const setStatus = async (s: ConversationStatus) => { if (cur) { await supportService.setStatus(cur.id, s); toast.success(`Conversation marked ${s}`); } };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <DashboardCard title="Support Inbox">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(["all", "open", "pending", "resolved"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
        {loading && <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>}
        {error && <p className="py-6 text-sm text-destructive">{error}</p>}
        <ul className="divide-y divide-border">
          {list.map((c) => {
            const last = c.messages[c.messages.length - 1];
            const unread = c.messages.filter((m) => m.role === "customer" && !m.read).length;
            return (
              <li key={c.id}>
                <button onClick={() => setSel(c.id)} className={`flex w-full gap-3 rounded-xl px-2 py-3 text-left hover:bg-muted ${sel === c.id ? "bg-muted" : ""}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">{c.customer.name[0]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><span className="truncate font-medium">{c.customer.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${badge[c.status]}`}>{c.status}</span></span>
                    <span className="block truncate text-xs text-muted-foreground">{c.customer.email ?? c.customer.id}</span>
                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">{last?.content}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1 text-[11px] text-muted-foreground">
                    {last && fmtTime(last.createdAt)}
                    {unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
                  </span>
                </button>
              </li>
            );
          })}
          {!loading && !list.length && <li className="py-6 text-center text-sm text-muted-foreground"><Inbox className="mx-auto mb-2 h-5 w-5" />No conversations</li>}
        </ul>
      </DashboardCard>
      <DashboardCard title={cur ? cur.customer.name : "Conversation"}>
        {!cur ? <p className="py-10 text-center text-sm text-muted-foreground">Select a conversation to view messages.</p> : (
          <>
            <div className="-mt-2 mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{cur.customer.email ?? cur.customer.id}{cur.customer.guest && " · guest"}</span>
              <div className="ml-auto">
                {cur.status === "resolved"
                  ? <Button size="sm" variant="outline" onClick={() => setStatus("open")}><RotateCcw className="mr-1 h-4 w-4" />Reopen</Button>
                  : <Button size="sm" variant="outline" onClick={() => setStatus("resolved")}><CheckCircle2 className="mr-1 h-4 w-4" />Mark resolved</Button>}
              </div>
            </div>
            <div className="max-h-96 space-y-3 overflow-y-auto rounded-2xl bg-muted/50 p-3">
              {cur.messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === "admin" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${m.role === "admin" ? "bg-primary text-primary-foreground" : "bg-card"}`}>{m.content}</div>
                  <span className="mt-1 text-[11px] text-muted-foreground">{m.senderName} · {fmtTime(m.createdAt)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Write a reply…" className="resize-none"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
              <Button onClick={send} disabled={!reply.trim() || sending}>{sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}Send Reply</Button>
            </div>
          </>
        )}
      </DashboardCard>
    </div>
  );
}
