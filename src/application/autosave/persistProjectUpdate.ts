/** Run one project persistence operation and normalize the missing-project failure. */
export async function persistProjectUpdate<T>(
  update: () => Promise<T | null>,
  failureCode: string,
): Promise<T> {
  const saved = await update();
  if (!saved) throw new Error(failureCode);
  return saved;
}
