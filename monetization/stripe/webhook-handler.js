// Stripe Webhook Handler for SIM Monetization (Test Mode)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle SIM monetization event (stub)
  if (event.type === 'checkout.session.completed') {
    // TODO: Provision SIM access
    console.log('SIM Monetization Success (Test Mode):', event.data.object);
  }

  res.json({ received: true });
};