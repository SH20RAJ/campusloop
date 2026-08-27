"use client";

import { usePresenceHeartbeat } from "@/hooks/use-presence";

/** Mounted once inside the authed shell to keep the viewer's presence fresh. */
export function PresenceHeartbeat() {
  usePresenceHeartbeat();
  return null;
}
