import React, { useContext } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthContext } from '../context/AuthContext';

// Old key
const stripePublicKey = 'pk_live_51RHXUrAr8nVhZRNRUo3igmOmSYodkk9N7VLJJY04AnuLWZlQWHqrchOydh7mt1rHxspduK6k0LTNNg9ZfzutAjd100QNCrgxud';
// New key
// const stripePublicKey = 'pk_live_51RHXUrAr8nVhZRNRDKXNqgJm4WzQbkM7Ww2aUQ5G3YLFzEEDTTqk2J0lJ31iYPISlPF9AQb4x3KHe5LTkzYivQPp00SbFFkSVg';


export const StripeWrapper = ({ children }: any) => {
  const { stripeAccountId } = useContext(AuthContext);

  // 🟨 Mientras no haya sesión iniciada, no renderizamos StripeProvider (ni nada si no deseas)
  if (!stripeAccountId) {
    return <>{children}</>; // Solo envuelve si no hay stripeAccountId aún
  }

  return (
    <StripeProvider
      publishableKey={stripePublicKey}
      stripeAccountId={stripeAccountId}
    >
      {children}
    </StripeProvider>
  );
};
