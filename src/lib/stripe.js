// src/lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Get your publishable key from: https://dashboard.stripe.com/apikeys
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createCheckoutSession(product, userId) {
  const stripe = await stripePromise;
  
  // Call your Firebase Function to create checkout session
  const response = await fetch('https://us-central1-your-project.cloudfunctions.net/createStripeCheckout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: product.id,
      productName: product.name,
      amount: product.pricing.basePrice * 100, // Stripe uses cents
      currency: 'usd',
      userId: userId
    })
  });

  const { sessionId } = await response.json();
  
  // Redirect to Stripe Checkout
  const result = await stripe.redirectToCheckout({ sessionId });
  
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export default stripePromise;