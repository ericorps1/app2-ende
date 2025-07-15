import React, { useContext } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthContext } from '../context/AuthContext';

const stripePublicKey = 'pk_test_51RHXUyAcHsnqDT52c8XwdDgYDBYfxCSXVl3htjeXO0uVQynX6ekTgSQ92P2XJid8Jtemx3RRrIdUkTo1GrFez6Sd005MRtMOMs';

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
