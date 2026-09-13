import type { VariantItemFull } from "@/utils/Types/common";

/** variant type id (string) -> selected value id */
export type SelectionMap = Record<string, number>;

/**
 * The API sends `options` as a list of {type_id, value_id} pairs, not an
 * object keyed by type id (see VariantItemFull) - this is the only place
 * that needs to know that; everything else here compares SelectionMaps.
 */
export function optionsToMap(options: VariantItemFull["options"]): SelectionMap {
  const map: SelectionMap = {};
  for (const { type_id, value_id } of options) {
    map[String(type_id)] = value_id;
  }
  return map;
}

function sameSet(a: SelectionMap, b: SelectionMap): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => a[k] === b[k]);
}

/**
 * Picks the variant item matching the shopper's current selection.
 *
 * A product can mix full combinations ("Size L + Color Black") with partial
 * ones ("Size L" alone, "Color Red" alone) - each is its own priced,
 * stockable item. Matching therefore tries, in order:
 *
 *  1. An item whose full set of dimensions equals `selected` exactly.
 *  2. An item priced on `justClickedTypeId` alone. This is what makes picking
 *     "Red" after "XL" fall back to the standalone Red item when no
 *     combined XL+Red item exists, instead of finding nothing.
 *  3. Any item that still carries the just-clicked pair, combined with
 *     whatever else - the closest available match rather than nothing.
 */
export function matchVariantItem(
  items: VariantItemFull[],
  selected: SelectionMap,
  justClickedTypeId?: string
): VariantItemFull | null {
  for (const it of items) {
    if (sameSet(optionsToMap(it.options), selected)) return it;
  }

  if (justClickedTypeId !== undefined && selected[justClickedTypeId] !== undefined) {
    const soloValue = selected[justClickedTypeId];

    for (const it of items) {
      if (sameSet(optionsToMap(it.options), { [justClickedTypeId]: soloValue })) return it;
    }
    for (const it of items) {
      if (optionsToMap(it.options)[justClickedTypeId] === soloValue) return it;
    }
  }

  return null;
}

/**
 * After the shopper clicks a value, decides the selection state to commit.
 *
 * When the attempted combination (everything previously selected, plus this
 * click) does not exist, the selection SNAPS to whatever item matching found
 * instead of keeping the stale, non-purchasable combination around - so a
 * dimension that does not fit visibly deselects rather than staying
 * highlighted next to something you cannot actually buy.
 */
export function selectionAfterClick(
  items: VariantItemFull[],
  current: SelectionMap,
  clickedTypeId: string,
  clickedValueId: number
): { selection: SelectionMap; item: VariantItemFull | null } {
  const attempted = { ...current, [clickedTypeId]: clickedValueId };
  const item = matchVariantItem(items, attempted, clickedTypeId);

  if (!item) {
    // No item carries this value at all (data inconsistency) - keep the
    // attempted state so the UI reflects the click, but there is nothing to
    // buy; callers should treat a null item as "unavailable".
    return { selection: attempted, item: null };
  }

  return { selection: optionsToMap(item.options), item };
}
