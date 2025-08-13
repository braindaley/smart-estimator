'use client';

import LoanQualificationEnhanced from './LoanQualificationEnhanced';

/**
 * LoanQualification Component
 * 
 * A multi-step loan qualification checker that analyzes bank data
 * to determine loan eligibility and terms. This component now uses
 * the enhanced version with comprehensive error handling, loading states,
 * and improved user experience.
 * 
 * @param {Object} props - Component props
 * @param {string} props.userId - Unique identifier for the user
 * @param {Function} [props.onComplete] - Callback when qualification check is complete
 * 
 * @example
 * <LoanQualification 
 *   userId="user123"
 *   onComplete={(results) => console.log('Qualification:', results)}
 * />
 */
export default function LoanQualification({ userId, onComplete }) {
  // Use the enhanced version with all improvements
  return <LoanQualificationEnhanced userId={userId} onComplete={onComplete} />;
}