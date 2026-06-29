'use client';

import { useState, useRef, useCallback, useEffect, type CSSProperties, type PointerEvent } from 'react';

const PEEK_HEIGHT_FALLBACK_PX = 12;

export type SheetSnap = 'collapsed' | 'expanded';

export function useMobileSheetDrag(enabled: boolean) {
  const [snap, setSnap] = useState<SheetSnap>('collapsed');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [collapsedOffset, setCollapsedOffset] = useState(0);
  const handleRef = useRef<HTMLDivElement>(null);

  const dragStartY = useRef(0);
  const startOffsetRef = useRef(0);
  const snapRef = useRef(snap);
  snapRef.current = snap;

  useEffect(() => {
    if (!enabled) return;

    const getViewportHeight = () =>
      window.visualViewport?.height ?? window.innerHeight;

    const update = () => {
      const peekHeight = handleRef.current?.offsetHeight ?? PEEK_HEIGHT_FALLBACK_PX;
      setCollapsedOffset(
        Math.max(0, getViewportHeight() - peekHeight),
      );
    };

    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);

    const handle = handleRef.current;
    const observer = handle ? new ResizeObserver(update) : null;
    if (handle && observer) observer.observe(handle);

    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [enabled]);

  const getSnapOffset = useCallback(
    (state: SheetSnap) => (state === 'collapsed' ? collapsedOffset : 0),
    [collapsedOffset],
  );

  const currentOffset = isDragging ? dragOffset : getSnapOffset(snap);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStartY.current = e.clientY;
      startOffsetRef.current = getSnapOffset(snapRef.current);
      setDragOffset(startOffsetRef.current);
      setIsDragging(true);
    },
    [enabled, getSnapOffset],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const deltaY = e.clientY - dragStartY.current;
      const next = Math.min(
        collapsedOffset,
        Math.max(0, startOffsetRef.current + deltaY),
      );
      setDragOffset(next);
    },
    [isDragging, collapsedOffset],
  );

  const endDrag = useCallback(
    (clientY: number) => {
      if (!isDragging) return;

      const deltaY = clientY - dragStartY.current;
      const halfScreen = (window.visualViewport?.height ?? window.innerHeight) / 2;
      const currentSnap = snapRef.current;

      if (currentSnap === 'collapsed' && deltaY < 0) {
        setSnap(Math.abs(deltaY) >= halfScreen ? 'expanded' : 'collapsed');
      } else if (currentSnap === 'expanded' && deltaY > 0) {
        setSnap(deltaY >= halfScreen ? 'collapsed' : 'expanded');
      }

      setIsDragging(false);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      endDrag(e.clientY);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [endDrag],
  );

  const handlePointerCancel = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      endDrag(e.clientY);
    },
    [endDrag],
  );

  const sheetStyle: CSSProperties | undefined = enabled
    ? {
        transform: `translateY(${currentOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
      }
    : undefined;

  return {
    handleRef,
    snap,
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    sheetStyle,
  };
}
