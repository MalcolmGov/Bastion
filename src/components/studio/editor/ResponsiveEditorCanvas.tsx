'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// A real browsing context makes Tailwind media queries respond to the canvas width.
export function ResponsiveEditorCanvas({
  width,
  dark,
  children,
}: {
  width: number;
  dark: boolean;
  children: ReactNode;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState({ width: 1280, height: 700 });
  useEffect(() => {
    const parent = frame.current?.parentElement?.parentElement?.parentElement;
    if (!parent) return;
    const resize = () =>
      setSize({
        width: Math.max(240, parent.clientWidth - 48),
        height: Math.max(400, parent.clientHeight - 48),
      });
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  const frameWidth = width + 2;
  const scale = Math.min(1, size.width / frameWidth);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!target) return;
    const doc = target.ownerDocument;
    const syncStyles = () => {
      doc.head
        .querySelectorAll('[data-editor-style]')
        .forEach((node) => node.remove());
      document.head
        .querySelectorAll('style, link[rel="stylesheet"]')
        .forEach((node) => {
          const copy = node.cloneNode(true) as HTMLElement;
          copy.setAttribute('data-editor-style', '');
          doc.head.appendChild(copy);
        });
      doc.documentElement.className = document.documentElement.className;
      doc.body.style.margin = '0';
      doc.documentElement.classList.toggle('dark', dark);
    };
    syncStyles();
    const observer = new MutationObserver(syncStyles);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [target, dark]);
  useEffect(() => {
    if (target) {
      target.ownerDocument.documentElement.classList.toggle('dark', dark);
    }
  }, [dark, target]);
  return (
    <div
      className="mx-auto shrink-0"
      style={{ width: frameWidth * scale, height: size.height }}
    >
      <div
        style={{
          width: frameWidth,
          height: size.height / scale,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <iframe
          ref={frame}
          title="Page editing canvas"
          sandbox="allow-same-origin"
          srcDoc="<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'></head><body><div id='editor-root'></div></body></html>"
          onLoad={() =>
            setTarget(
              frame.current?.contentDocument?.getElementById('editor-root') ||
                null,
            )
          }
          style={{ width: frameWidth, height: size.height / scale }}
          className="block shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm"
        />
        {target &&
          createPortal(
            <div
              onClickCapture={(event) => {
                if ((event.target as HTMLElement).closest('a'))
                  event.preventDefault();
              }}
              onSubmitCapture={(event) => event.preventDefault()}
            >
              {children}
            </div>,
            target,
          )}
      </div>
    </div>
  );
}
