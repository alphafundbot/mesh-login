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
 * Throws an error if the variable is not set.
 * @param variableName The name of the environment variable.
 * @returns The value of the environment variable.
 */
export function getEnv(variableName: string): string {
    const value = process.env[variableName];

    // All environment variables are expected to be available in the Next.js environment.
    // NEXT_PUBLIC_ variables are exposed to the browser.
    // Server-only variables are available on the server.
    // If a variable is missing at the point of access, it's a critical configuration error.
    if (!value) {
        const errorMessage = `FATAL ERROR: Environment variable '${variableName}' is not set. This is a required variable. Please check your .env, .env.local, or hosting provider's environment variable configuration.`;
        console.error(errorMessage);
        // Throw an error to halt execution immediately, preventing further runtime errors.
        throw new Error(errorMessage);
    }
    
    return value;
}
