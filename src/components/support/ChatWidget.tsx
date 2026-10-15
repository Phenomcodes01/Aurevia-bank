import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
AlertCircle,
Check,
CheckCheck,
Loader2,
MessageCircle,
Minus,
Send,
ShieldAlert,
X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import {
fmtTime,
supportService,
useSupportData,
type SupportIdentity,
} from "@/lib/support-store";
import logo from "@/assets/aurevia-a-logo.png";

const CUSTOMER_TOKEN_KEY = "aurevia_api_token";

interface AuthenticatedUser {
id: number | string;
name: string;
email: string;
role: string;
status: string;
}

export function ChatWidget() {
const path = useRouterState({
select: (s) => s.location.pathname,
});

const [open, setOpen] = useState(false);
const [me, setMe] = useState<SupportIdentity | null>(null);
const [checkingAuth, setCheckingAuth] = useState(true);
const [authError, setAuthError] = useState<string | null>(null);

useEffect(() => {
let cancelled = false;


const verifyCustomer = async () => {
  setCheckingAuth(true);
  setMe(null);
  setAuthError(null);
  setOpen(false);

  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);

  if (!token) {
    if (!cancelled) {
      setCheckingAuth(false);
    }
    return;
  }

  try {
    const response = await apiRequest<
      AuthenticatedUser | { user: AuthenticatedUser }
    >("/user", {
      method: "GET",
      token,
    });

    const user =
      "user" in response ? response.user : response;

    if (
      user.role !== "customer" ||
      user.status !== "active"
    ) {
      throw new Error(
        "Only active customer accounts can use customer support."
      );
    }

    if (!cancelled) {
      setMe({
        id: String(user.id),
        name: user.name,
        email: user.email,
        guest: false,
      });
    }
  } catch {
    if (!cancelled) {
      setMe(null);
      setAuthError(
        "Please sign in to your active customer account to use support."
      );
    }
  } finally {
    if (!cancelled) {
      setCheckingAuth(false);
    }
  }
};

void verifyCustomer();

return () => {
  cancelled = true;
};


}, [path]);

if (path.startsWith("/admin")) {
return null;
}

// Do not render the chat launcher for guests or unverified sessions.
if (checkingAuth || !me) {
return null;
}

return ( <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
{authError && ( <span className="sr-only" role="status">
{authError} </span>
)}


  {open && (
    <ChatPanel
      key={me.id}
      me={me}
      onMinimize={() => setOpen(false)}
      onClose={() => setOpen(false)}
    />
  )}

  {!open && (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open customer support chat"
      className="grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  )}
</div>


);
}

function ChatPanel({
me,
onMinimize,
onClose,
}: {
me: SupportIdentity;
onMinimize: () => void;
onClose: () => void;
}) {
const {
data: conv,
loading,
error,
} = useSupportData(
() => supportService.getMyConversation(me),
[me.id]
);

const [text, setText] = useState("");
const [sending, setSending] = useState(false);
const [sendErr, setSendErr] = useState<string | null>(null);

const endRef = useRef<HTMLDivElement>(null);
const msgs = conv?.messages ?? [];

useEffect(() => {
endRef.current?.scrollIntoView({ block: "end" });
}, [msgs.length]);

useEffect(() => {
if (conv) {
void supportService
.markRead(conv.id, "customer")
.catch(() => {
// The next refresh can retry marking messages as read.
});
}
}, [conv?.id, msgs.length]);

const send = async () => {
if (!text.trim() || sending) {
return;
}

setSending(true);
setSendErr(null);

try {
  await supportService.sendCustomerMessage(me, text);
  setText("");
} catch (e) {
  setSendErr(
    e instanceof Error
      ? e.message
      : "Message could not be sent. Please try again."
  );
} finally {
  setSending(false);
}


};

const last = msgs[msgs.length - 1];

return ( <div
   role="dialog"
   aria-label="Aurevia Bank customer support"
   className="flex h-[min(560px,calc(100dvh-6rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg sm:w-[370px]"
 > <div className="flex items-center gap-3 bg-gradient-primary px-4 py-3 text-primary-foreground"> <img
       src={logo}
       alt=""
       className="h-9 w-9 rounded-xl bg-background object-contain p-0.5"
     />


    <div className="min-w-0 flex-1">
      <p className="text-xs opacity-80">Aurevia Bank</p>
      <p className="font-display font-semibold leading-tight">
        Customer Support
      </p>
    </div>

    <button
      onClick={onMinimize}
      aria-label="Minimize chat"
      className="rounded-lg p-1.5 hover:bg-primary-foreground/15"
    >
      <Minus className="h-4 w-4" />
    </button>

    <button
      onClick={onClose}
      aria-label="Close chat"
      className="rounded-lg p-1.5 hover:bg-primary-foreground/15"
    >
      <X className="h-4 w-4" />
    </button>
  </div>

  <div className="flex items-start gap-2 border-b border-border bg-muted/60 px-4 py-2 text-xs text-muted-foreground">
    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    Never share passwords, PINs, OTPs or full card details in chat.
    We will never ask for them.
  </div>

  <div className="flex-1 space-y-3 overflow-y-auto p-4">
    {loading && (
      <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading conversation…
      </p>
    )}

    {error && (
      <p className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Couldn't load messages: {error}
      </p>
    )}

    {!loading && !error && !msgs.length && (
      <div className="py-8 text-center text-sm text-muted-foreground">
        <MessageCircle className="mx-auto mb-2 h-8 w-8 text-primary" />
        Hi {me.name.split(" ")[0]}! How can we help you today?
      </div>
    )}

    {msgs.map((m) => {
      const mine = m.role === "customer";

      return (
        <div
          key={m.id}
          className={`flex flex-col ${
            mine ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
              mine
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-muted text-foreground"
            }`}
          >
            {m.content}
          </div>

          <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            {!mine && "Support · "}
            {fmtTime(m.createdAt)}
            {mine &&
              (m.read ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : (
                <Check className="h-3 w-3" />
              ))}
          </span>
        </div>
      );
    })}

    {last?.role === "customer" && (
      <p className="text-center text-xs text-muted-foreground">
        Sent · awaiting a reply from our team
      </p>
    )}

    <div ref={endRef} />
  </div>

  <div className="border-t border-border p-3">
    {sendErr && (
      <p className="mb-2 flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3.5 w-3.5" />
        {sendErr}
      </p>
    )}

    <div className="flex items-end gap-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={1}
        maxLength={5000}
        placeholder="Type your message…"
        aria-label="Message"
        className="max-h-28 min-h-10 resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send();
          }
        }}
      />

      <Button
        size="icon"
        onClick={() => void send()}
        disabled={!text.trim() || sending}
        aria-label="Send message"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>

    <p className="mt-1 text-[11px] text-muted-foreground">
      Enter to send · Shift+Enter for a new line
    </p>
  </div>
</div>


);
}
