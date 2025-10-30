# Momentum Score Documentation

## Overview
The Momentum Score is a comprehensive assessment tool that evaluates a user's suitability for debt settlement programs. The score is calculated based on five key factors, with a maximum possible score of 35 points.

## Score Components

### 1. Debt Amount (Maximum: 11 points)

The debt amount component evaluates the total debt the user has enrolled. Higher debt amounts within the eligible range receive more points.

| Debt Amount Range | Points Awarded |
|-------------------|----------------|
| Below $11,250 | 0 pts |
| $11,250 - $13,749 | 0 pts |
| $13,750 - $16,999 | 2 pts |
| $17,000 - $21,999 | 4 pts |
| $22,000 - $36,999 | 11 pts |
| $37,000+ | 10 pts |

**Implementation:** `mapDebtAmountToPoints()` in [src/lib/calculations.ts](../src/lib/calculations.ts)

### 2. Number of Creditors (Maximum: 8 points)

This component measures the complexity of the user's debt situation based on the number of different creditors.

| Number of Creditors | Points Awarded |
|---------------------|----------------|
| 1-2 creditors | 1 pt |
| 3-5 creditors | 8 pts |
| 6-10 creditors | 6 pts |
| 10+ creditors | 4 pts |

**Implementation:** `mapCreditorsToPoints()` in [src/lib/calculations.ts](../src/lib/calculations.ts)

### 3. Payment Status (Maximum: 8 points)

The payment status indicates the urgency and severity of the user's debt situation.

| Payment Status | Points Awarded |
|----------------|----------------|
| Current | 2 pts |
| Late | 8 pts |
| Collections | 6 pts |

**Implementation:** `mapPaymentStatusToPoints()` in [src/lib/calculations.ts](../src/lib/calculations.ts)

### 4. Steady Income (Maximum: 6 points)

This binary component assesses whether the user has a steady source of income.

| Income Status | Points Awarded |
|---------------|----------------|
| Has steady income | 6 pts |
| No steady income | 0 pts |

**Implementation:** `mapIncomeToPoints()` in [src/lib/calculations.ts](../src/lib/calculations.ts)

### 5. Credit Score (Maximum: 2 points)

The credit score component considers the user's FICO score to assess their overall credit health.

| FICO Score Range | Points Awarded |
|------------------|----------------|
| 720+ (Prime) | 1 pt |
| 690-719 (Good) | 1 pt |
| 580-689 (Fair) | 2 pts |
| Below 580 (Subprime) | 1 pt |

**Implementation:** `mapCreditScoreToPoints()` in [src/lib/calculations.ts](../src/lib/calculations.ts)

## Total Score Calculation

The total Momentum Score is calculated by summing all five components:

```
Total Score = Debt Points + Creditor Points + Payment Points + Income Points + Credit Points
Maximum Possible Score = 11 + 8 + 8 + 6 + 2 = 35 points
```

## Interpretation

A higher Momentum Score indicates that debt settlement is a better fit for the user. The score helps assess:
- Financial hardship level
- Debt complexity
- Ability to sustain monthly payments
- Overall program suitability

## Usage

The momentum score is calculated using the `calculateMomentumScore()` function in [src/lib/calculations.ts](../src/lib/calculations.ts):

```typescript
interface MomentumScoreInput {
    debtAmountEstimate: number;
    creditorCountEstimate: number;
    debtPaymentStatus: string;
    hasSteadyIncome: boolean;
    userFicoScoreEstimate: number;
}

const result = calculateMomentumScore({
    debtAmountEstimate: 25000,
    creditorCountEstimate: 4,
    debtPaymentStatus: 'late',
    hasSteadyIncome: true,
    userFicoScoreEstimate: 650
});

// result.score = 27 (11 + 8 + 8 + 6 + 2)
```

## Display

The Momentum Score is displayed across the application in [src/components/MomentumScoreSection.tsx](../src/components/MomentumScoreSection.tsx), showing:
- Smart Estimator score (max 35 points)
- Readiness score (max 35 points)
- Your Plan score (max 35 points)
- Combined total (max 70 points)
