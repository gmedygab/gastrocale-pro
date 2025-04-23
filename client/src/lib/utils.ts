import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Convert units if needed (e.g., g to kg for display)
export function formatQuantity(quantity: number | string, unit: string): string {
  const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  
  // Convert grams to kg if over 1000g
  if (unit === 'g' && numQuantity >= 1000) {
    return `${(numQuantity / 1000).toFixed(1)} kg`;
  }
  
  // Convert ml to L if over 1000ml
  if (unit === 'ml' && numQuantity >= 1000) {
    return `${(numQuantity / 1000).toFixed(1)} L`;
  }
  
  // Handle decimal places for small quantities
  if (numQuantity < 1 && numQuantity > 0) {
    return `${numQuantity.toFixed(2)} ${unit}`;
  }
  
  // Handle integer quantities
  if (Number.isInteger(numQuantity)) {
    return `${numQuantity} ${unit}`;
  }
  
  // Default format with one decimal place
  return `${numQuantity.toFixed(1)} ${unit}`;
}

// Format recipe category for display
export function formatCategory(category: string): string {
  const categories: Record<string, string> = {
    main: 'Main Dish',
    appetizer: 'Appetizer',
    dessert: 'Dessert',
    cocktail: 'Cocktail',
    beverage: 'Beverage',
    salad: 'Salad',
    sauce: 'Sauce',
    soup: 'Soup',
    side: 'Side Dish',
    breakfast: 'Breakfast',
  };
  
  return categories[category] || category;
}

// Format subcategory for display
export function formatSubcategory(subcategory: string): string {
  return subcategory
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
