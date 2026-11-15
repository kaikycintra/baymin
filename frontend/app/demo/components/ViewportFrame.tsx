import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders React children inside an iframe, so they see a real phone-sized viewport and your
 * existing @media (max-width: ...) rules apply. The children still belong to the same React tree,
 * so context, state and props work normally. The app's stylesheets are copied into the frame.
 *
 * Note on loading: React ignores DOM events that fire during its own commit phase, and an iframe's
 * "load" event can fire synchronously when the iframe is inserted. So we do not use onLoad. We attach
 * a native listener and also check immediately whether the frame is already loaded.
 */

const SRC_DOC =
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>';
const CLONE_ATTR = "data-viewport-clone";

function cloneStyles(target: Document): Promise<void> {
  target.head.querySelectorAll(`[${CLONE_ATTR}]`).forEach((node) => node.remove());
  const loading: Promise<void>[] = [];
  document.head.querySelectorAll<HTMLElement>('link[rel="stylesheet"], style').forEach((node) => {
    const copy = node.cloneNode(true) as HTMLElement;
    copy.setAttribute(CLONE_ATTR, "");
    if (copy instanceof HTMLLinkElement) {
      loading.push(
        new Promise<void>((resolve) => {
          copy.onload = () => resolve();
          copy.onerror = () => resolve();
        })
      );
    }
    target.head.appendChild(copy);
  });
  return Promise.all(loading).then(() => undefined);
}

interface Props {
  title: string;
  className?: string;
  children: ReactNode;
}

export function ViewportFrame({ title, className, children }: Props) {
  const cleanupRef = useRef<(() => void) | null>(null);
  const [mounted, setMounted] = useState(false);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  // Only create the iframe in the browser (never on the server).
  useEffect(() => setMounted(true), []);
  useEffect(() => () => cleanupRef.current?.(), []);

  const frameRef = useCallback((iframe: HTMLIFrameElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!iframe) return;

    let currentDoc: Document | null = null;
    let observer: MutationObserver | null = null;
    let timer: number | undefined;
    let token = 0;

    const syncStyles = (doc: Document) => {
      const mine = ++token;
      const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 2000));
      void Promise.race([cloneStyles(doc), timeout]).then(() => {
        if (mine === token) setReady(true);
      });
    };

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc || !doc.body || doc === currentDoc) return;
      currentDoc = doc;
      observer?.disconnect();
      if (!doc.documentElement.lang) doc.documentElement.lang = "en";

      syncStyles(doc);
      setBody(doc.body);

      // Keep styles in sync when the app's head changes (hot reload, lazily loaded route CSS).
      observer = new MutationObserver(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => syncStyles(doc), 120);
      });
      observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    };

    iframe.addEventListener("load", handleLoad);
    cleanupRef.current = () => {
      iframe.removeEventListener("load", handleLoad);
      observer?.disconnect();
      window.clearTimeout(timer);
      token++;
    };

    // The frame may already have loaded (load fired before this ref was attached).
    if (iframe.contentDocument?.readyState === "complete") handleLoad();
  }, []);

  return (
    <div className={className}>
      {mounted && (
        <iframe
          ref={frameRef}
          title={title}
          srcDoc={SRC_DOC}
          style={{ visibility: ready ? "visible" : "hidden" }}
        />
      )}
      {body && createPortal(children, body)}
    </div>
  );
}
