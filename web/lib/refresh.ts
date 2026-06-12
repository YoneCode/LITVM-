"use client";

import { useEffect } from "react";

/**
 * Tiny global event bus to force an immediate on-chain re-read after a
 * transaction confirms (rather than waiting for the 15s poll). Module-level
 * EventTarget so any component can trigger it and any hook can subscribe.
 */
const bus = typeof window !== "undefined" ? new EventTarget() : null;
const EVENT = "litvm:refresh";

export function triggerRefresh() {
  bus?.dispatchEvent(new Event(EVENT));
}

/** Subscribe a loader to refresh requests. */
export function useRefreshSignal(onRefresh: () => void) {
  useEffect(() => {
    if (!bus) return;
    const handler = () => onRefresh();
    bus.addEventListener(EVENT, handler);
    return () => bus.removeEventListener(EVENT, handler);
  }, [onRefresh]);
}
