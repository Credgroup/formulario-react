import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function productsToString(products: string[]): string {
  return products
    .map((item) => item)
    .join(", ")
    .trim();
}
