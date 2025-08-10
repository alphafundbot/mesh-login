import * as process from 'process';

export const SuiteSecrets = {
  metamask_wallet: {
    seed: process.env.METAMASK_SEED,
    network: "mainnet", // Example static property
  },
  firebase: {
    api_key: process.env.FIREBASE_API_KEY,
    service_account: "firebase-adminsdk.json", // Example static property
  },
  upwork: {
    session_token: process.env.UPWORK_SESSION_TOKEN,
  },
  cloudflare: {
    api_token: process.env.CLOUDFLARE_API_TOKEN,
    global_api_key: process.env.CLOUDFLARE_GLOBAL_API_KEY,
    email: process.env.CLOUDFLARE_EMAIL,
    zone_id: process.env.CLOUDFLARE_ZONE_ID,
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    domain: "thinairai.store", // Example static property
  },
  godaddy: {
    api_key: process.env.GODADDY_API_KEY,
    domain: "thinairai.store", // Example static property
  },
  github: {
    access_token: process.env.GITHUB_TOKEN,
  },
  fiverr: {
    api_token: process.env.FIVERR_API_TOKEN,
  },
  stripe: {
    cli_token: process.env.STRIPE_CLI_TOKEN,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  gumroad: {
    api_key: process.env.GUMROAD_API_KEY,
    webhook_url: "https://yourdomain.com/gumroad-webhook", // Example static property
  },
  whop: {
    api_key: process.env.WHOP_API_KEY,
    session_token: process.env.WHOP_SESSION_TOKEN,
  },
  // Future secrets would be added here
};

// This structure is designed to be used with a SecretsVault
// for secure loading, encryption, and access control.
// Archetype-bound usage would be implemented by logic
// that consumes these secrets and checks strategist archetypes.