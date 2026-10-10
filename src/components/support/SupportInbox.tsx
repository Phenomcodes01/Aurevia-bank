import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Inbox,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  fmtTime,
  supportService,
  useSupportData,
  type ConversationStatus,
} from "@/lib/support-store";

const badge: Record<ConversationStatus, string> = {
  open: "bg-primary/15 text-primary",
  pending: "bg-accent text-accent-foreground",
  resolved: "bg-muted text-muted-foreground",
};

export function SupportInbox() {
  const { data, loading, error } = useSupportData(() =>
    supportService.listConversations(),
  );

  const [sel, setSel] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationStatus | "all">("all");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const list = (data ?? []).filter(
    (conversation) =>
      filter === "all" || conversation.status === filter,
  );

  const cur = data?.find((conversation) => conversation.id === sel) ?? null;

  useEffect(() => {
    if (cur) {
      supportService.markRead(cur.id, "admin");
    }
  }, [cur]);

  const openConversation = (id: string) => {
    setSel(id);
    setMobileChatOpen(true);
    setReply("");
  };

  const send = async () => {
    if (!cur || !reply.trim() || sending) return;

    setSending(true);

    try {
      await supportService.sendAdminReply(cur.id, reply.trim());
      setReply("");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Unable to send reply",
      );
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status: ConversationStatus) => {
    if (!cur) return;

    try {
      await supportService.setStatus(cur.id, status);
      toast.success(`Conversation marked ${status}`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Unable to update conversation",
      );
    }
  };

  return (
    <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)] lg:gap-6">
      {/* Conversation list */}
      <div className={mobileChatOpen ? "hidden lg:block" : "block"}>
        <DashboardCard title="Support Inbox">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {(["all", "open", "pending", "resolved"] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filter === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>

          {loading && (
            <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversations…
            </p>
          )}

          {error && (
            <p className="py-6 text-sm text-destructive">{error}</p>
          )}

          <ul className="divide-y divide-border">
            {list.map((conversation) => {
              const last =
                conversation.messages[conversation.messages.length - 1];

              const unread = conversation.messages.filter(
                (message) =>
                  message.role === "customer" && !message.read,
              ).length;

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className={`w-full min-w-0 rounded-xl p-3 text-left transition-colors hover:bg-muted sm:p-4 ${
                      sel === conversation.id ? "bg-muted" : ""
                    }`}
                  >
                    {/* Customer details */}
                    <span className="flex min-w-0 items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                        {conversation.customer.name[0]?.toUpperCase() ?? "?"}
                      </span>

                      <span className="min-w-0 flex-1">
                        {/* Name and timestamp */}
                        <span className="flex min-w-0 items-start justify-between gap-2">
                          <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-5">
                            {conversation.customer.name}
                          </span>

                          <span className="shrink-0 pt-0.5 text-[10px] text-muted-foreground">
                            {last && fmtTime(last.createdAt)}
                          </span>
                        </span>

                        {/* Email */}
                        <span className="mt-1 block break-all text-xs text-muted-foreground">
                          {conversation.customer.email ?? conversation.customer.id}
                        </span>

                        {/* Status and unread count */}
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${badge[conversation.status]}`}
                          >
                            {conversation.status}
                          </span>

                          {unread > 0 && (
                            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                              {unread} unread
                            </span>
                          )}
                        </span>

                        {/* Latest message */}
                        <span className="mt-2 block break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]">
                          {last?.content ?? "No messages yet"}
                        </span>
                      </span>
                    </span>
                  </button>

                </li>
              );
            })}

            {!loading && !list.length && (
              <li className="py-10 text-center text-sm text-muted-foreground">
                <Inbox className="mx-auto mb-2 h-6 w-6" />
                No conversations found.
              </li>
            )}
          </ul>
        </DashboardCard>
      </div>

      {/* Selected conversation */}
      <div className={mobileChatOpen ? "block" : "hidden lg:block"}>
        <DashboardCard
          title={cur ? cur.customer.name : "Conversation"}
          className="min-w-0"
        >
          {!cur ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Select a conversation
              </h3>

              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Choose a customer from the inbox to read and reply to their
                messages.
              </p>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div className="-mt-2 mb-4 flex min-w-0 flex-wrap items-center gap-3 border-b border-border pb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileChatOpen(false)}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Inbox
                </Button>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-muted-foreground">
                    {cur.customer.email ?? cur.customer.id}
                    {cur.customer.guest && " · Guest"}
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${badge[cur.status]}`}
                  >
                    {cur.status}
                  </span>
                </div>

                {cur.status === "resolved" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus("open")}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reopen
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus("resolved")}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Resolve
                  </Button>
                )}
              </div>

              {/* Messages */}
              <div className="flex max-h-[min(55vh,520px)] min-h-64 flex-col gap-4 overflow-y-auto overscroll-contain rounded-2xl bg-muted/40 p-3 sm:p-4 lg:max-h-[520px]">
                {cur.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex w-full min-w-0 flex-col ${
                      message.role === "admin"
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[85%] ${
                        message.role === "admin"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card"
                      }`}
                    >
                      {message.content}
                    </div>

                    <span className="mt-1 max-w-full break-words text-[10px] text-muted-foreground sm:text-[11px]">
                      {message.senderName} · {fmtTime(message.createdAt)}
                    </span>
                  </div>
                ))}

                {!cur.messages.length && (
                  <p className="m-auto py-8 text-center text-sm text-muted-foreground">
                    No messages in this conversation yet.
                  </p>
                )}
              </div>

              {/* Reply composer */}
              <form
                className="mt-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <Textarea
                  aria-label="Write a reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={3}
                  maxLength={5000}
                  placeholder="Write a reply…"
                  className="min-h-20 min-w-0 flex-1 resize-y sm:resize-none"
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                />

                <Button
                  type="submit"
                  disabled={!reply.trim() || sending}
                  className="w-full shrink-0 sm:w-auto"
                >
                  {sending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {sending ? "Sending…" : "Send Reply"}
                </Button>
              </form>

              <p className="mt-2 text-xs text-muted-foreground">
                Press Enter to send · Shift + Enter for a new line
              </p>
            </>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}