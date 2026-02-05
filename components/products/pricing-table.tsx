import { PricingTier } from "@/types/product";

interface PricingTableProps {
  tiers: PricingTier[];
  basePrice: number;
  variantPriceAdjustment?: number;
}

export function PricingTable({
  tiers,
  basePrice,
  variantPriceAdjustment = 0,
}: PricingTableProps) {
  const adjustedBasePrice = basePrice + variantPriceAdjustment;

  // If no tiers provided, show base price only
  const displayTiers = tiers && tiers.length > 0 ? tiers : [];

  // Calculate the actual price per unit for each tier using discount percentage
  const getTierPrice = (tier: PricingTier): number => {
    // Apply discount percentage to base price
    if (tier.discount > 0) {
      return adjustedBasePrice * (1 - tier.discount / 100);
    }

    // No discount, return base price
    return adjustedBasePrice;
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-300 bg-linear-to-r from-gray-50 to-gray-100">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
              Price per Unit <span className="font-normal text-gray-500">(Ex VAT)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {displayTiers.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No pricing tiers configured
              </td>
            </tr>
          ) : (
            <>
              {/* Show base price row first */}
              <tr className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 font-bold text-sm text-gray-900 uppercase tracking-wide">
                  1+ units
                </td>
                <td className="px-4 py-4">
                  <span className="text-lg font-bold text-gray-900">
                    £{adjustedBasePrice.toFixed(2)}
                  </span>
                </td>
              </tr>
              {/* Show tier rows */}
              {displayTiers.map((tier, index) => {
                const quantityRange = tier.maxQuantity
                  ? `${tier.minQuantity}–${tier.maxQuantity} units`
                  : `${tier.minQuantity}+ units`;

                const tierPrice = getTierPrice(tier);

                return (
                  <tr
                    key={index}
                    className="border-b border-gray-300 transition-colors hover:bg-primary/5 last:border-0"
                  >
                    <td className="px-4 py-4 font-bold text-sm text-gray-900 uppercase tracking-wide">
                      {quantityRange}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-bold text-primary">
                          £{tierPrice.toFixed(2)}
                        </span>
                        {tier.discount > 0 && (
                          <span className="inline-flex items-center justify-center bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {tier.discount}% Off
                          </span>
                        )}
                        {tier.label && (
                          <span className="inline-flex items-center justify-center bg-gray-100 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-300 uppercase tracking-wider">
                            {tier.label}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
