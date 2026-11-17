"use client";
import { useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { formatCurrency, t as tApi } from "@/utils/helpers";
import type { VariantItemFull, VariantOption, VariantOptionValue } from "@/utils/Types/common";

type Lang = "ar" | "en";

/**
 * The colour dimension, if the product has one: the variant type whose values
 * carry a hex swatch, or failing that one named "colour"/"لون".
 */
function findColorOption(options: VariantOption[] | undefined): VariantOption | null {
  if (!options?.length) return null;
  const bySwatch = options.find((o) => o.values.some((v) => v.meta?.code));
  if (bySwatch) return bySwatch;
  return (
    options.find((o) => {
      const name = `${tApi(o.name, "ar")} ${tApi(o.name, "en")}`.toLowerCase();
      return name.includes("لون") || name.includes("color") || name.includes("colour");
    }) ?? null
  );
}

const valueIdFor = (item: VariantItemFull, typeId: number) =>
  item.options?.find((o) => o.type_id === typeId)?.value_id;

const isOutOfStock = (item: VariantItemFull) => typeof item.quantity === "number" && item.quantity <= 0;

/**
 * Picks a purchasable combination (a variant item).
 *
 * When the product has a colour plus another dimension (usually size), the
 * colours come first as swatches: tapping one shows only that colour's sizes,
 * and tapping it again - or "all colours" - shows every combination again.
 * That is what customers expect from a clothing store, and the merchant's data
 * does not have to be a full size x colour grid for it to work: a colour shows
 * whichever sizes it actually has.
 *
 * Products with a single dimension, or none that is a colour, keep the flat
 * list of one card per combination.
 */
export default function ProductVariantPicker({
  options,
  items,
  selectedItem,
  onSelect,
  basePriceAfter,
  lang,
  labels,
  headerAction,
}: {
  options: VariantOption[] | undefined;
  items: VariantItemFull[];
  selectedItem: VariantItemFull | null;
  onSelect: (item: VariantItemFull) => void;
  basePriceAfter?: number;
  lang: Lang;
  labels: { color: string; allColors: string; chooseOption: string; outOfStock: string };
  /** Rendered beside the size heading - the size-guide link. */
  headerAction?: ReactNode;
}) {
  const colorOption = useMemo(() => findColorOption(options), [options]);
  const otherOptions = useMemo(
    () => (options ?? []).filter((o) => o.id !== colorOption?.id),
    [options, colorOption]
  );
  const [activeColorId, setActiveColorId] = useState<number | null>(null);

  // Only the colours some item is actually sold in, in the merchant's order.
  const colors = useMemo(() => {
    if (!colorOption) return [] as { value: VariantOptionValue; items: VariantItemFull[] }[];
    return colorOption.values
      .map((value) => ({ value, items: items.filter((it) => valueIdFor(it, colorOption.id) === value.id) }))
      .filter((c) => c.items.length > 0);
  }, [colorOption, items]);

  const splitByColor = Boolean(colorOption) && otherOptions.length > 0 && colors.length > 0;

  const valueName = (typeId: number, valueId: number) => {
    const option = options?.find((o) => o.id === typeId);
    const value = option?.values.find((v) => v.id === valueId);
    return value ? tApi(value.name, lang) : "";
  };

  /** The item's own dimensions, optionally leaving the colour out. */
  const labelFor = (item: VariantItemFull, withoutColor: boolean) => {
    const parts = (item.options ?? [])
      .filter((o) => !(withoutColor && o.type_id === colorOption?.id))
      .map((o) => valueName(o.type_id, o.value_id))
      .filter(Boolean);
    if (parts.length) return parts.join(" / ");
    // No structured options (an older payload): fall back to the attrs map.
    const attrs = Object.values(item.attrs ?? {}).map((v) => tApi(v, lang)).filter(Boolean);
    return attrs.join(" / ") || (colorOption ? valueName(colorOption.id, valueIdFor(item, colorOption.id) ?? -1) : "") || "—";
  };

  const swatchOf = (item: VariantItemFull): string | undefined => {
    if (!colorOption) return undefined;
    const valueId = valueIdFor(item, colorOption.id);
    return colorOption.values.find((v) => v.id === valueId)?.meta?.code;
  };

  const priceNote = (item: VariantItemFull) =>
    item.price_after && basePriceAfter && item.price_after !== basePriceAfter ? formatCurrency(item.price_after) : null;

  const pickColor = (colorValueId: number) => {
    if (activeColorId === colorValueId) {
      setActiveColorId(null);
      return;
    }
    setActiveColorId(colorValueId);
    // Keep the shopper's pick if it already is this colour; otherwise move to
    // the colour's first combination in stock, so price and photos follow.
    if (selectedItem && colorOption && valueIdFor(selectedItem, colorOption.id) === colorValueId) return;
    const ofColor = colors.find((c) => c.value.id === colorValueId)?.items ?? [];
    const next = ofColor.find((it) => !isOutOfStock(it)) ?? ofColor[0];
    if (next) onSelect(next);
  };

  const sizeCard = (item: VariantItemFull, withoutColor: boolean) => {
    const selected = selectedItem?.id === item.id;
    const soldOut = isOutOfStock(item);
    const swatch = !withoutColor ? swatchOf(item) : undefined;
    const note = priceNote(item);
    return (
      <button
        key={item.id}
        type="button"
        disabled={soldOut}
        onClick={() => onSelect(item)}
        title={soldOut ? labels.outOfStock : labelFor(item, withoutColor)}
        className={`min-w-[48px] h-10 px-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
          soldOut
            ? "border border-dashed border-gray-200 text-gray-300 bg-gray-50/40 cursor-not-allowed line-through"
            : selected
            ? "border-2 border-primary text-primary bg-primary/5 ring-2 ring-primary/20 font-bold"
            : "border border-gray-200 text-gray-800 bg-white hover:border-gray-400 hover:text-black"
        }`}
      >
        {swatch && <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: swatch }} />}
        <span>{labelFor(item, withoutColor)}</span>
        {note && <span className="text-[11px] text-gray-400 font-normal">({note})</span>}
      </button>
    );
  };

  if (!splitByColor) {
    const heading = options?.[0]?.name ? tApi(options[0].name, lang) : labels.chooseOption;
    return (
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-semibold text-gray-900">{heading}</p>
          {headerAction}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {items.map((item) => {
            const photo = item.images?.[0] || item.image;
            if (!photo) return sizeCard(item, false);
            const selected = selectedItem?.id === item.id;
            const soldOut = isOutOfStock(item);
            const note = priceNote(item);
            return (
              <button
                key={item.id}
                type="button"
                disabled={soldOut}
                onClick={() => onSelect(item)}
                title={labelFor(item, false)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all ${
                  selected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-gray-200 hover:border-gray-400 bg-white"
                } ${soldOut ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <img src={photo} alt={labelFor(item, false)} className="w-14 h-14 rounded-lg object-cover" />
                <span className="text-xs font-medium max-w-[80px] truncate">{labelFor(item, false)}</span>
                {note && <span className="text-[11px] text-gray-500 font-mono">{note}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const active = colors.find((c) => c.value.id === activeColorId) ?? null;
  const visibleItems = active ? active.items : items;
  const sizeHeading = otherOptions.map((o) => tApi(o.name, lang)).join(" / ");

  return (
    <div className="mt-5 space-y-4">
      {/* Colours */}
      <div>
        <div className="flex items-center justify-between mb-2.5 gap-3">
          <p className="text-sm font-semibold text-gray-900">
            {tApi(colorOption!.name, lang) || labels.color}
            {active && <span className="font-normal text-gray-500">: {tApi(active.value.name, lang)}</span>}
          </p>
          {active && (
            <button
              type="button"
              onClick={() => setActiveColorId(null)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
              {labels.allColors}
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {colors.map(({ value, items: ofColor }) => {
            const isActive = value.id === activeColorId;
            const soldOut = ofColor.every(isOutOfStock);
            const photo = ofColor.map((it) => it.images?.[0] || it.image).find(Boolean);
            const name = tApi(value.name, lang);
            return (
              <button
                key={value.id}
                type="button"
                onClick={() => pickColor(value.id)}
                title={soldOut ? `${name} — ${labels.outOfStock}` : name}
                aria-pressed={isActive}
                className={`relative rounded-full transition-all ${
                  isActive ? "ring-2 ring-offset-2 ring-primary" : "ring-1 ring-gray-200 hover:ring-gray-400"
                } ${soldOut ? "opacity-40" : ""}`}
              >
                {photo ? (
                  <img src={photo} alt={name} className="w-11 h-11 rounded-full object-cover" />
                ) : value.meta?.code ? (
                  <span className="block w-11 h-11 rounded-full border border-black/10" style={{ backgroundColor: value.meta.code }} />
                ) : (
                  <span className="flex items-center justify-center h-11 min-w-[44px] px-3 rounded-full text-xs font-medium bg-white">
                    {name}
                  </span>
                )}
                {soldOut && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="block w-full h-px bg-gray-500 rotate-45" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes: only the active colour's, or every combination when none is picked */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-semibold text-gray-900">{sizeHeading || labels.chooseOption}</p>
          {headerAction}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {visibleItems.map((item) => sizeCard(item, Boolean(active)))}
        </div>
      </div>
    </div>
  );
}
