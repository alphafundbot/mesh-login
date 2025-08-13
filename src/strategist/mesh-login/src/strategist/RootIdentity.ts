// src/strategist/RootIdentity.ts

/**
 * The unique identifier for the sovereign root strategist account.
 */
export const ROOT_ACCOUNT_ID = "uSccg10iTfXkHCRdNuFVzgDwlW43";

/**
 * Checks if a given account ID belongs to the sovereign root strategist.
 * @param accountId The account ID to check.
 * @returns True if the account ID matches the root account ID, false otherwise.
 */
export function isRoot(accountId: string): boolean {
  return accountId === ROOT_ACCOUNT_ID;
}