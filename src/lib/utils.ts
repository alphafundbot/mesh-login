import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

/**
 * Returns the value of an environment variable.
 * Throws an error if the variable is not set on the server during build time.
 * Returns an empty string if called on the client for a server-only variable.
 * @param variableName The name of the environment variable.
 * @returns The value of the environment variable.
 */
export function getEnv(variableName: string): string {
    const value = process.env[variableName];

    // On the server, variables are available during the build process.
    // If a variable is missing and it's not a NEXT_PUBLIC_ variable, it's a critical configuration error.
    if (typeof window === 'undefined' && !value && !variableName.startsWith('NEXT_PUBLIC_')) {
        const errorMessage = `FATAL ERROR: Environment variable ${variableName} is not set. This is required for server-side operations and build processes.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    // On the client, Next.js exposes env vars prefixed with NEXT_PUBLIC_.
    // If it's not a public var, it will be undefined.
    return value || '';
}
