export const gestures: Record<number, any> = {};

export function getHandler(tag: number) {
  if (tag in gestures) {
    return gestures[tag];
  }

  throw new Error(`No handler for tag ${tag}`);
}

export function getNodes() {
  return { ...gestures };
}
