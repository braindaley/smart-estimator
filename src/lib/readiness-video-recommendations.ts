// Video recommendation logic based on readiness tool responses

export interface ReadinessFormData {
  [key: string]: {
    [field: string]: any;
    points?: number;
  };
}

export interface VideoRecommendation {
  title: string;
  reason: string;
  priority: number; // Lower number = higher priority
}

// All available videos
export const ALL_VIDEOS = [
  "Debt Settlement vs. Consolidation",
  "Dealing with Debt Collectors: Know Your Rights",
  "Debt Relief Checklist",
  "What Is a Debt Settlement Plan",
  "What is Settlement? How Does It Really Work?",
  "Intro to Plaid",
  "Why Some Debt Plans Fail",
  "The Secret Shame of Debt"
];

// Default videos (shown when no specific recommendations)
export const DEFAULT_VIDEOS = [
  "Debt Settlement vs. Consolidation",
  "Dealing with Debt Collectors: Know Your Rights",
  "Debt Relief Checklist",
  "What Is a Debt Settlement Plan"
];

export function getPersonalizedVideoRecommendations(formData: ReadinessFormData): {
  recommendedVideos: string[];
  recommendations: VideoRecommendation[];
} {
  const recommendations: VideoRecommendation[] = [];

  // Q6 Payment confidence = 2 (Somewhat Confident)
  if (formData.step6?.payment_confidence === 'somewhat_confident') {
    recommendations.push({
      title: "What is Settlement? How Does It Really Work?",
      reason: "To build confidence in the debt settlement process",
      priority: 1
    });
    recommendations.push({
      title: "Intro to Plaid",
      reason: "To understand financial verification requirements",
      priority: 2
    });
  }

  // Q7 Emergency plan = 'Ask for flexibility'
  if (formData.step7?.emergency_expense_handling === 'payment_flexibility') {
    recommendations.push({
      title: "Why Some Debt Plans Fail",
      reason: "To address risk factors and improve success chances",
      priority: 1
    });
    recommendations.push({
      title: "Dealing with Debt Collectors: Know Your Rights",
      reason: "To build resilience when requesting payment flexibility",
      priority: 2
    });
  }

  // Q8 Nervous about collection calls
  if (formData.step8?.collection_calls_preparedness === 'nervous_manage') {
    recommendations.push({
      title: "Dealing with Debt Collectors: Know Your Rights",
      reason: "To help manage collection call anxiety and know your rights",
      priority: 1
    });
  }

  // Q9 Stress management = 'Avoidant'
  if (formData.step9?.stress_management_approach === 'avoid') {
    recommendations.push({
      title: "The Secret Shame of Debt",
      reason: "To address avoidance patterns and emotional aspects of debt",
      priority: 1
    });
  }

  // Remove duplicates and sort by priority
  const uniqueRecommendations = recommendations.reduce((acc, current) => {
    const existing = acc.find(item => item.title === current.title);
    if (!existing) {
      acc.push(current);
    } else if (current.priority < existing.priority) {
      // Keep the higher priority (lower number) recommendation
      existing.priority = current.priority;
      existing.reason = current.reason;
    }
    return acc;
  }, [] as VideoRecommendation[]);

  // Sort by priority
  uniqueRecommendations.sort((a, b) => a.priority - b.priority);

  // Get recommended video titles
  const recommendedVideoTitles = uniqueRecommendations.map(r => r.title);

  // Fill remaining slots with default videos (up to 4 total)
  const remainingSlots = 4 - recommendedVideoTitles.length;
  const additionalVideos = DEFAULT_VIDEOS
    .filter(video => !recommendedVideoTitles.includes(video))
    .slice(0, remainingSlots);

  const finalVideoList = [...recommendedVideoTitles, ...additionalVideos];

  return {
    recommendedVideos: finalVideoList,
    recommendations: uniqueRecommendations
  };
}

export function getVideoRecommendationExplanation(recommendations: VideoRecommendation[]): string {
  if (recommendations.length === 0) {
    return "These videos provide general information about debt settlement to help you make informed decisions.";
  }

  if (recommendations.length === 1) {
    return `We recommend "${recommendations[0].title}" ${recommendations[0].reason.toLowerCase()}.`;
  }

  const videoList = recommendations.map(r => `"${r.title}"`).join(', ');
  return `Based on your responses, we've personalized your video recommendations: ${videoList}. These will help address specific areas identified in your assessment.`;
}