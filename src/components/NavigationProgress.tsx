"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inProgressRef = useRef(false);

  const startProgress = () => {
    if (inProgressRef.current) return;
    inProgressRef.current = true;
    NProgress.start();
  };

  const doneProgress = () => {
    if (!inProgressRef.current) return;
    inProgressRef.current = false;
    NProgress.done();
  };

  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      minimum: 0.08,
      trickleSpeed: 120,
    });
  }, []);

  useEffect(() => {
    doneProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      startProgress();
    };

    const handlePopState = () => {
      startProgress();
    };

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      startProgress();
      // eslint-disable-next-line prefer-rest-params
      return originalPushState.apply(this, args as unknown as Parameters<History["pushState"]>);
    };

    history.replaceState = function (...args) {
      startProgress();
      // eslint-disable-next-line prefer-rest-params
      return originalReplaceState.apply(this, args as unknown as Parameters<History["replaceState"]>);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null;
}
