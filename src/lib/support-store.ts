/**
 * Aurevia Bank — Customer Support Data Layer
 *
 * Customer chat and admin inbox communicate through the Laravel API.
 *
 * Customer authentication:
 *   aurevia_api_token
 *
 * Administrator authentication:
 *   aurevia_admin_api_token
 *
 * All authorization must also be enforced by the Laravel backend.
 */

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export type SupportRole = "customer" | "admin";

export type ConversationStatus =
  | "open"
  | "pending"
  | "resolved";

export interface SupportIdentity {
  id: string;
  name: string;
  email?: string;
  guest: boolean;
}

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

const CUSTOMER_TOKEN_KEY = "aurevia_api_token";
const ADMIN_TOKEN_KEY = "aurevia_admin_api_token";

const EVT = "aurevia-support-change";

/**
 * Get an authentication token from localStorage.
 */
function getToken(key: string, label: string): string {
  if (typeof window === "undefined") {
    throw new Error("Support is unavailable.");
  }

  const token = localStorage.getItem(key);

  if (!token) {
    throw new Error(
      `Please sign in to your ${label} account to use support.`
    );
  }

  return token;
}

/**
 * Customer authentication.
 *
 * Guest access is intentionally disabled.
 */
function getCustomerToken(me?: SupportIdentity): string {
  if (me?.guest) {
    throw new Error(
      "Please sign in to your Aurevia account to contact support."
    );
  }

  return getToken(CUSTOMER_TOKEN_KEY, "customer");
}

/**
 * Administrator authentication.
 */
function getAdminToken(): string {
  return getToken(ADMIN_TOKEN_KEY, "administrator");
}

/**
 * Notify components that support data has changed.
 */
function notifySupportChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVT));
  }
}

/**
 * Convert a Laravel message response into the frontend format.
 */
function normalizeMessage(
  message: Record<string, unknown>
): SupportMessage {
  return {
    id: String(message.id),
    conversationId: String(message.conversationId),
    senderId: String(message.senderId),
    senderName: String(message.senderName ?? "Aurevia Support"),
    role: message.role as SupportRole,
    content: String(message.content ?? ""),
    createdAt: String(message.createdAt ?? new Date().toISOString()),
    read: Boolean(message.read),
  };
}

/**
 * Convert a Laravel conversation response into the frontend format.
 */
function normalizeConversation(
  conversation: Record<string, unknown>
): SupportConversation {
  const customer =
    (conversation.customer as Record<string, unknown>) ?? {};

  const messages = Array.isArray(conversation.messages)
    ? conversation.messages
    : [];

  return {
    id: String(conversation.id),

    customer: {
      id: String(customer.id),
      name: String(customer.name ?? "Customer"),
      email: customer.email
        ? String(customer.email)
        : undefined,
      guest: false,
    },

    status: conversation.status as ConversationStatus,

    createdAt: String(
      conversation.createdAt ?? new Date().toISOString()
    ),

    updatedAt: String(
      conversation.updatedAt ?? new Date().toISOString()
    ),

    messages: messages.map((message) =>
      normalizeMessage(
        message as Record<string, unknown>
      )
    ),
  };
}

/**
 * Extract a conversation from the Laravel response.
 */
function normalizeConversationResponse(
  response: { conversation: Record<string, unknown> }
): SupportConversation {
  return normalizeConversation(response.conversation);
}

/**
 * Customer and administrator support service.
 */
export const supportService = {
  /**
   * Retrieve the authenticated customer's conversation.
   */
  async getMyConversation(
    me: SupportIdentity
  ): Promise<SupportConversation | null> {
    const token = getCustomerToken(me);

    const response = await apiRequest<{
      conversation: Record<string, unknown> | null;
    }>("/support/conversations/mine", {
      method: "GET",
      token,
    });

    if (!response.conversation) {
      return null;
    }

    return normalizeConversation(response.conversation);
  },

  /**
   * Send a customer message.
   */
  async sendCustomerMessage(
    me: SupportIdentity,
    content: string
  ): Promise<SupportMessage> {
    const text = content.trim();

    if (!text) {
      throw new Error("Message cannot be empty.");
    }

    if (text.length > 5000) {
      throw new Error(
        "Message is too long (maximum 5000 characters)."
      );
    }

    const token = getCustomerToken(me);

    const response = await apiRequest<{
      message: string;
      conversation: Record<string, unknown>;
    }>("/support/conversations/mine/messages", {
      method: "POST",
      token,
      body: JSON.stringify({
        content: text,
      }),
    });

    const conversation =
      normalizeConversationResponse(response);

    notifySupportChange();

    const messages = conversation.messages;

    if (messages.length === 0) {
      throw new Error(
        "The server did not return the sent message."
      );
    }

    return messages[messages.length - 1];
  },

  /**
   * Retrieve every support conversation for the admin inbox.
   */
  async listConversations(): Promise<SupportConversation[]> {
    const token = getAdminToken();

    const response = await apiRequest<{
      conversations: Record<string, unknown>[];
    }>("/admin/support/conversations", {
      method: "GET",
      token,
    });

    return (response.conversations ?? []).map(
      normalizeConversation
    );
  },

  /**
   * Mark incoming messages as read.
   *
   * The backend determines which messages the authenticated
   * customer or administrator is permitted to mark as read.
   */
  async markRead(
    conversationId: string,
    reader: SupportRole
  ): Promise<void> {
    const token =
      reader === "admin"
        ? getAdminToken()
        : getCustomerToken();

    await apiRequest<{ message: string }>(
      `/support/conversations/${encodeURIComponent(
        conversationId
      )}/read`,
      {
        method: "POST",
        token,
      }
    );

    notifySupportChange();
  },

  /**
   * Send an administrator reply.
   */
  async sendAdminReply(
    conversationId: string,
    content: string
  ): Promise<void> {
    const text = content.trim();

    if (!text) {
      throw new Error("Reply cannot be empty.");
    }

    if (text.length > 5000) {
      throw new Error(
        "Reply is too long (maximum 5000 characters)."
      );
    }

    const token = getAdminToken();

    await apiRequest<{
      message: string;
      conversation: Record<string, unknown>;
    }>(
      `/admin/support/conversations/${encodeURIComponent(
        conversationId
      )}/messages`,
      {
        method: "POST",
        token,
        body: JSON.stringify({
          content: text,
        }),
      }
    );

    notifySupportChange();
  },

  /**
   * Update a conversation's status.
   */
  async setStatus(
    conversationId: string,
    status: ConversationStatus
  ): Promise<void> {
    const token = getAdminToken();

    await apiRequest<{
      message: string;
      conversation: Record<string, unknown>;
    }>(
      `/admin/support/conversations/${encodeURIComponent(
        conversationId
      )}`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify({
          status,
        }),
      }
    );

    notifySupportChange();
  },
};

/**
 * Refreshes support data when notified and periodically checks
 * for messages sent by the other participant.
 */
export function useSupportData<T>(
  load: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    let loadingRequest = false;

    const run = async () => {
      // Avoid overlapping requests if a previous request is slow.
      if (loadingRequest) {
        return;
      }

      loadingRequest = true;

      try {
        const result = await load();

        if (live) {
          setData(result);
          setError(null);
        }
      } catch (e: unknown) {
        if (live) {
          setError(
            e instanceof Error
              ? e.message
              : "Unable to load support data."
          );
        }
      } finally {
        loadingRequest = false;
      }
    };

    void run();

    const interval = window.setInterval(() => {
      void run();
    }, 5000);

    window.addEventListener(EVT, run);

    return () => {
      live = false;
      window.clearInterval(interval);
      window.removeEventListener(EVT, run);
    };

    // The caller controls when this effect should reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    error,
    loading: data === undefined && !error,
  };
}

/**
 * Guests are not permitted to use the live support service.
 *
 * Retained for compatibility with existing component imports.
 */
export function guestIdentity(): SupportIdentity {
  return {
    id: "",
    name: "Guest",
    guest: true,
  };
}

/**
 * Format a message timestamp for display.
 */
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });