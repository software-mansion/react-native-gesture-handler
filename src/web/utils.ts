export function isPointerInBounds(
  view: HTMLElement,
  { x, y }: { x: number; y: number }
): boolean {
  const rect: DOMRect = view.getBoundingClientRect();

  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
