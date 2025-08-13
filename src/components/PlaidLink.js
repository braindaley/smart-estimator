'use client';

import PlaidLinkEnhanced from './PlaidLinkEnhanced';

/**
 * PlaidLink Component
 * 
 * A reusable component for connecting bank accounts via Plaid Link.
 * Now uses the enhanced version with comprehensive error handling and debugging.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback function called when bank connection succeeds
 * @param {string} props.userId - Unique identifier for the user
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.buttonText] - Custom text for the button (defaults to "Connect Bank Account")
 * @param {boolean} [props.disabled] - Whether the button should be disabled
 * 
 * @example
 * <PlaidLink
 *   userId="user123"
 *   onSuccess={(metadata) => console.log('Connected!', metadata)}
 *   className="w-full"
 * />
 */
export default function PlaidLink(props) {
  // Use the enhanced version with comprehensive error handling and debugging
  return <PlaidLinkEnhanced {...props} />;
}