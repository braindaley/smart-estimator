// Utility functions for readiness tool disqualification logic

export interface ReadinessFormData {
  [key: string]: {
    [field: string]: any;
    points?: number;
  };
}

export function checkDisqualification(formData: ReadinessFormData): {
  isDisqualified: boolean;
  disqualificationReasons: string[];
} {
  const reasons: string[] = [];

  // Q4: Very important credit score - cannot afford drop
  if (formData.step4?.credit_score_importance === 'very_important') {
    reasons.push('Credit score is critically important in the next 1-2 years');
  }

  // Q6: Not confident in payment ability
  if (formData.step6?.payment_confidence === 'not_confident') {
    reasons.push('Lack of confidence in making monthly payments');
  }

  // Q8: Not prepared for collection calls
  if (formData.step8?.collection_calls_preparedness === 'not_prepared') {
    reasons.push('Not prepared to handle increased collection calls');
  }

  // Q7: Emergency plan is credit card AND low payment confidence
  if (formData.step7?.emergency_expense_handling === 'credit_card' &&
      formData.step6?.points && formData.step6.points <= 2) {
    reasons.push('Emergency plan relies on credit cards with low payment confidence');
  }

  return {
    isDisqualified: reasons.length > 0,
    disqualificationReasons: reasons
  };
}

export function getDisqualificationMessage(reasons: string[]): string {
  if (reasons.length === 0) return '';

  if (reasons.length === 1) {
    return `Based on your responses, debt settlement may not be appropriate at this time due to: ${reasons[0]}. We recommend addressing this concern before considering debt settlement.`;
  }

  const lastReason = reasons[reasons.length - 1];
  const otherReasons = reasons.slice(0, -1).join(', ');

  return `Based on your responses, debt settlement may not be appropriate at this time due to: ${otherReasons}, and ${lastReason}. We recommend addressing these concerns before considering debt settlement.`;
}