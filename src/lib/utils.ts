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
    // This check is important because process.env is not available in the browser.
    // NEXT_PUBLIC_ variables are baked into the client bundle by Next.js.
    // This function is primarily for server-side access where we need to be strict.
    if (typeof process === 'undefined') {
        // In a browser context, we assume Next.js has handled the env var.
        // We return an empty string to avoid crashing the app, but rely on
        // service initialization to fail with a more specific error if needed.
        return '';
    }

    const value = process.env[variableName];

    if (!value) {
        const errorMessage = `FATAL ERROR: Environment variable '${variableName}' is not set. This is a required variable. Please check your .env, .env.local, or hosting provider's environment variable configuration.`;
        console.error(errorMessage);
        // Throw an error to halt execution immediately, preventing further runtime errors.
        throw new Error(errorMessage);
    }
    
    return value;
}
