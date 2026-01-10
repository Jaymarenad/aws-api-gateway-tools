/**
 * Requirements addressed:
 * - Provide deterministic, testable selection rules for name-based AWS resources.
 * - Prefer exact name match; otherwise accept a single result; otherwise error.
 */

export const findUniqueByName = <T extends { name?: string }>(opts: {
  items: T[];
  name: string;
  label: string;
}): T => {
  const { items, name, label } = opts;

  const exact = items.filter((i) => i.name === name);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) {
    throw new Error(
      `Ambiguous ${label}: multiple results match name '${name}'.`,
    );
  }

  if (items.length === 1) return items[0];
  if (!items.length) throw new Error(`Unable to find ${label} '${name}'.`);

  throw new Error(
    `Ambiguous ${label}: multiple results match query for '${name}'.`,
  );
};
