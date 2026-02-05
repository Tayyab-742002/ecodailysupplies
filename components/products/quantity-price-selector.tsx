"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PricingTier } from "@/types/product";

interface QuantityPriceSelectorProps {
  pricingTiers: PricingTier[];
  basePrice: number;
  variantPriceAdjustment?: number;
  onQuantityChange?: (quantity: number) => void;
  initialQuantity?: number; // For products with quantity options (base quantity)
  baseQuantity?: number; // Base quantity from quantity option (for calculating total)
  quantityOptionPrice?: number; // Price per unit from selected quantity option (takes priority)
  showQuantityInput?: boolean; // Whether to show the quantity input field
  minQuantity?: number; // Minimum allowed quantity (defaults to 1)
}

export function QuantityPriceSelector({
  pricingTiers,
  basePrice,
  variantPriceAdjustment = 0,
  onQuantityChange,
  initialQuantity = 1,
  baseQuantity = 0, // If set, this is the base from quantity option
  quantityOptionPrice, // Price per unit from selected quantity option
  showQuantityInput = true,
  minQuantity = 1, // Minimum allowed quantity
}: QuantityPriceSelectorProps) {
  // Calculate the actual quantity to display (base + additional)
  // Ensure it's at least the minimum quantity
  const displayQuantity = Math.max(
    minQuantity,
    baseQuantity > 0 ? baseQuantity + (initialQuantity - 1) : initialQuantity
  );

  const [quantity, setQuantity] = useState(displayQuantity);
  const [quantityInput, setQuantityInput] = useState<string>(
    displayQuantity.toString()
  );

  // Update quantity when initialQuantity, baseQuantity, or minQuantity changes
  useEffect(() => {
    const newDisplayQuantity = Math.max(
      minQuantity,
      baseQuantity > 0 ? baseQuantity + (initialQuantity - 1) : initialQuantity
    );
    setQuantity(newDisplayQuantity);
    setQuantityInput(newDisplayQuantity.toString());
  }, [initialQuantity, baseQuantity, minQuantity]);

  // Calculate the active tier and price based on quantity
  // Priority: quantity option price > pricing tiers > base price
  const { activeTier, pricePerUnit, totalPrice, savings } = useMemo(() => {
    const adjustedBasePrice = basePrice + variantPriceAdjustment;

    // If quantity option has a specific price, use it (highest priority)
    if (quantityOptionPrice !== undefined && quantityOptionPrice > 0) {
      const total = quantityOptionPrice * quantity;
      const baseTotal = adjustedBasePrice * quantity;
      const savingsAmount = Math.max(0, baseTotal - total);

      return {
        activeTier: null, // No tier when using quantity option price
        pricePerUnit: quantityOptionPrice,
        totalPrice: total,
        savings: savingsAmount,
      };
    }

    // If no tiers, use base price
    if (!pricingTiers || pricingTiers.length === 0) {
      return {
        activeTier: null,
        pricePerUnit: adjustedBasePrice,
        totalPrice: adjustedBasePrice * quantity,
        savings: 0,
      };
    }

    // Find the appropriate tier based on quantity
    // Sort tiers by minQuantity descending to find the highest applicable tier
    const sortedTiers = [...pricingTiers].sort(
      (a, b) => b.minQuantity - a.minQuantity
    );
    const tier = sortedTiers.find((t) => {
      const minMatch = quantity >= t.minQuantity;
      const maxMatch = t.maxQuantity ? quantity <= t.maxQuantity : true;
      return minMatch && maxMatch;
    });

    if (!tier) {
      return {
        activeTier: null,
        pricePerUnit: adjustedBasePrice,
        totalPrice: adjustedBasePrice * quantity,
        savings: 0,
      };
    }

    // Calculate price per unit using discount percentage
    const unitPrice =
      tier.discount > 0
        ? adjustedBasePrice * (1 - tier.discount / 100)
        : adjustedBasePrice;

    const total = unitPrice * quantity;
    const baseTotal = adjustedBasePrice * quantity;
    const savingsAmount = Math.max(0, baseTotal - total);

    return {
      activeTier: tier,
      pricePerUnit: unitPrice,
      totalPrice: total,
      savings: savingsAmount,
    };
  }, [
    quantity,
    pricingTiers,
    basePrice,
    variantPriceAdjustment,
    quantityOptionPrice,
  ]);

  // Sync input when quantity changes externally
  useEffect(() => {
    setQuantityInput(quantity.toString());
  }, [quantity]);

  const handleQuantityChange = (value: string) => {
    // Allow empty string for easier editing
    setQuantityInput(value);

    // Only update if it's a valid number
    if (value === "") {
      return; // Allow empty temporarily
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= minQuantity) {
      setQuantity(numValue);
      onQuantityChange?.(numValue);
    }
  };

  const handleQuantityBlur = () => {
    // When user leaves the field, ensure it has a valid value (at least minQuantity)
    const numValue = parseInt(quantityInput, 10);
    if (isNaN(numValue) || numValue < minQuantity) {
      const enforcedQuantity = minQuantity;
      setQuantityInput(enforcedQuantity.toString());
      setQuantity(enforcedQuantity);
      onQuantityChange?.(enforcedQuantity);
    } else {
      setQuantityInput(numValue.toString());
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Input - Premium Style */}
      {showQuantityInput && (
        <div className="space-y-3">
          <Label
            htmlFor="quantity"
            className="text-xs font-bold uppercase tracking-wider text-gray-900"
          >
            Quantity
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="quantity"
              type="text"
              inputMode="numeric"
              min={minQuantity.toString()}
              value={quantityInput}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers and empty string
                if (value === "" || /^\d+$/.test(value)) {
                  handleQuantityChange(value);
                }
              }}
              onBlur={handleQuantityBlur}
              className="w-24 h-11 text-center text-lg font-bold border border-gray-300 focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-primary rounded-xl transition-shadow"
              aria-label={`Quantity (minimum ${minQuantity})`}
            />
            {baseQuantity > 0 && (
              <span className="text-sm text-gray-500">
                (Base: {baseQuantity})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Price Display - Premium Style */}
      <div className="space-y-3 rounded-xl border border-gray-300 bg-gray-50/60 p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            £{pricePerUnit.toFixed(2)}
          </span>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            per unit
          </span>
          <span className="text-xs text-gray-400">
            Ex VAT
          </span>
        </div>
        {quantity > 1 && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-300">
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total:
            </span>
            <span className="text-xl font-bold text-gray-900">
              £{totalPrice.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">
              Ex VAT
            </span>
          </div>
        )}
        {activeTier && (
          <div className="mt-3 flex items-center gap-2 flex-wrap pt-3 border-t border-gray-300">
            {activeTier.label && (
              <div className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                {activeTier.label}
              </div>
            )}
            {savings > 0 && (
              <div className="text-sm font-bold text-primary uppercase tracking-wide">
                Save £{savings.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
