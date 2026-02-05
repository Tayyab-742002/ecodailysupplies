"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.image;
  const secondaryImage = product.images?.[1] || product.images?.[2];
  const hasVariants = product.variants && product.variants.length > 1;
  const shouldShowPrice = product.basePrice !== 0;
  const displayPrice = product.basePrice;
  const hasDiscount = Number(product.discount) > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex flex-col h-full bg-white rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-300">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {/* Primary Image with zoom effect */}
          <Image
            src={primaryImage}
            alt={product.imageAlt || product.name}
            fill
            className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
              isHovered && secondaryImage ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Secondary Image (Hover) */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={product.imageAlt || product.name}
              fill
              className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Sale Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                {product.discount}% Off
              </span>
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-center gap-2 bg-black/90 backdrop-blur-sm text-white py-3 px-4 rounded-xl text-sm font-medium">
              <span>Quick View</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-1 p-4 pt-4">
          {/* Category or Variants indicator */}
          {hasVariants && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex -space-x-1">
                {product.variants!.slice(0, 3).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border-2 border-white bg-gray-200"
                    style={{
                      backgroundColor: i === 0 ? '#e5e7eb' : i === 1 ? '#d1d5db' : '#9ca3af'
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                {product.variants!.length} options
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className="text-sm lg:text-[15px] font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="mt-auto pt-2">
            {shouldShowPrice ? (
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                <span className="text-lg font-bold text-gray-900">
                  £{displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    £{(displayPrice / (1 - Number(product.discount) / 100)).toFixed(2)}
                  </span>
                )}
                <span className="text-[11px] text-gray-400 font-medium">
                  Ex VAT
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-500">
                View pricing
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
