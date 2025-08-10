typescriptreact
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getPlaidData } from '../lib/sofi-api';
import { getVaultHoldings } from '../lib/vault-api';
import { getStripeCardDetails, getStripeCustomerDetails } from '../lib/stripe-api'; // Assuming getStripeCustomerDetails exists
import { fetchStrategistCredentials } from '../lib/credential-vault'; // Assuming this path

export const FinancialIdentityOverlay: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [bankBalance, setBankBalance] = useState<string>('0');
  const [vaultAssets, setVaultAssets] = useState<any[]>([]);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [stripeCustomer, setStripeCustomer] = useState<any>(null); // State for Stripe customer
  const [credentials, setCredentials] = useState<any>(null); // State for credentials


  useEffect(() => {
    async function hydrate() {
      const creds = await fetchStrategistCredentials('QUANTUM'); // Fetch credentials
      setCredentials(creds);

      if (!creds) {
        console.error("Credentials not available.");
        return;
      }

      // MetaMask
      if (creds.permissions.includes('view_wallet') && (window as any).ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider((window as any).ethereum);
          const accounts = await provider.send('eth_requestAccounts', []);
           if (accounts.length > 0) {
            const balance = await provider.getBalance(accounts[0]);
            setWalletBalance(ethers.utils.formatEther(balance));
           }
        } catch (error) {
           console.error("Error fetching MetaMask balance:", error);
        }
      }

      // SoFi via Plaid
      if (creds.permissions.includes('view_bank') && creds.plaidToken) {
        try {
            const bank = await getPlaidData(creds.plaidToken); // Pass token if needed
            setBankBalance(bank.balance);
        } catch (error) {
            console.error("Error fetching SoFi data:", error);
        }
      }

      // Vaults
      if (creds.permissions.includes('view_vault') && creds.vaultId) {
        try {
          const vault = await getVaultHoldings(creds.vaultId); // Pass vault ID if needed
          setVaultAssets(vault);
        } catch (error) {
          console.error("Error fetching vault holdings:", error);
        }
      }

      // Stripe Issuing
      if (creds.permissions.includes('view_card') && creds.stripeKey) {
        try {
          const card = await getStripeCardDetails(creds.stripeKey); // Pass key if needed
          setCardDetails(card);
        } catch (error) {
           console.error("Error fetching Stripe card details:", error);
        }
      }

       // Stripe Customer
       if (creds.permissions.includes('view_customer') && creds.stripeKey) { // Assuming 'view_customer' permission
         try {
           const customer = await getStripeCustomerDetails(creds.stripeKey); // Pass key if needed
           setStripeCustomer(customer);
         } catch (error) {
            console.error("Error fetching Stripe customer details:", error);
         }
       }
    }

    hydrate();
  }, []); // Rerun effect if credentials change? Depends on how creds are managed.


  if (!credentials) {
      return <div>Loading credentials...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧬 Financial Identity Overlay</h2>

      {credentials.permissions.includes('view_wallet') && (
        <section style={{ marginBottom: '2rem' }}>
          <h3>🦊 MetaMask Wallet</h3>
          <p>Balance: Ξ {walletBalance}</p>
        </section>
      )}

      {credentials.permissions.includes('view_bank') && (
        <section style={{ marginBottom: '2rem' }}>
          <h3>🏦 SoFi Bank</h3>
          <p>Balance: ${bankBalance}</p>
        </section>
      )}

      {credentials.permissions.includes('view_vault') && (
        <section style={{ marginBottom: '2rem' }}>
          <h3>🏰 Vault Holdings</h3>
          <ul>
            {vaultAssets.map((asset, i) => (
              <li key={i}>{asset.name}: {asset.amount}</li>
            ))}
          </ul>
        </section>
      )}

      {credentials.permissions.includes('view_card') && (
        <section style={{ marginBottom: '2rem' }}>
          <h3>💳 Stripe Issuing Card</h3>
          {cardDetails ? (
            <div>
              <p>Cardholder: {cardDetails.cardholder}</p>
              <p>Last 4: **** **** **** {cardDetails.last4}</p>
              <p>Status: {cardDetails.status}</p>
              <p>Balance: ${cardDetails.balance}</p>
            </div>
          ) : (
            <p>Loading card details...</p>
          )}
        </section>
      )}

      {credentials.permissions.includes('view_customer') && ( // Render if has permission
         <section>
           <h3>👤 Stripe Customer</h3>
           {stripeCustomer ? (
             <div>
               <p>Customer ID: {stripeCustomer.id}</p>
               <p>Name: {stripeCustomer.name || 'N/A'}</p>
               <p>Email: {stripeCustomer.email || 'N/A'}</p>
               {/* Add more customer details as needed */}
             </div>
           ) : (
             <p>Loading customer details...</p>
           )}
         </section>
       )}
    </div>
  );
};