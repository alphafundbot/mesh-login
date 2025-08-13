import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Node } from '@/lib/types'; // Assuming Node type is in a types file

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

// Function to determine node color based on status
export function getNodeColor(node: Node): string {
  if (node.health < 0.3) return 'red';
  if (node.revenue > 1000) return 'gold';
  if (node.latency > 200) return 'orange';
  return 'green';
}

