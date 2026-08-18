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

export function dev_log(fn: () => void) {
  const env = import.meta.env.VITE_ENV;
  if (env !== "production") {
    fn();
  }
}

export function getDynamicToken() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const xtoken = import.meta.env.VITE_X_TOKEN;
  return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${xtoken}${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
}