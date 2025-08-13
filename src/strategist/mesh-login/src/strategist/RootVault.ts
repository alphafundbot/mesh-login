// src/strategist/RootVault.ts

import { RootIdentity } from './RootIdentity'; // Assuming RootIdentity is in the same directory

export class RootVault {
  private vault: any[] = [];

  constructor() {
    // Optional: Load initial assets from a secure source
    // this.loadInitialAssets();
  }

  /**
   * Stores an asset in the root vault if the strategist is the root.
   * @param asset The asset to store.
   * @param strategistId The ID of the strategist attempting to store the asset.
   * @returns true if the asset was stored, false otherwise.
   */
  storeAsset(asset: any, strategistId: string): boolean {
    if (RootIdentity.isRoot(strategistId)) {
      this.vault.push(asset);
      console.log(`Root strategist ${strategistId} stored an asset.`);
      return true;
    }
    console.warn(`Unauthorized attempt to store asset by strategist ${strategistId}.`);
    return false;
  }

  /**
   * Retrieves an asset from the root vault by ID if the strategist is the root.
   * @param assetId The ID of the asset to retrieve.
   * @param strategistId The ID of the strategist attempting to retrieve the asset.
   * @returns The asset if found and authorized, otherwise undefined.
   */
  retrieveAsset(assetId: string, strategistId: string): any | undefined {
    if (RootIdentity.isRoot(strategistId)) {
      const asset = this.vault.find(a => a.id === assetId);
      if (asset) {
        console.log(`Root strategist ${strategistId} retrieved asset ${assetId}.`);
        return asset;
      }
      console.warn(`Root strategist ${strategistId} attempted to retrieve non-existent asset ${assetId}.`);
      return undefined;
    }
    console.warn(`Unauthorized attempt to retrieve asset ${assetId} by strategist ${strategistId}.`);
    return undefined;
  }

  /**
   * Returns the contents of the root vault if the strategist is the root.
   * @param strategistId The ID of the strategist attempting to audit the vault.
   * @returns An array of vault assets if authorized, otherwise an empty array.
   */
  auditVault(strategistId: string): any[] {
    if (RootIdentity.isRoot(strategistId)) {
      console.log(`Root strategist ${strategistId} audited the vault.`);
      return this.vault;
    }
    console.warn(`Unauthorized attempt to audit vault by strategist ${strategistId}.`);
    return [];
  }

  // Optional: Method to load initial assets (placeholder)
  // private loadInitialAssets(): void {
  //   // Implement secure loading logic here
  // }
}