import jwt from 'jsonwebtoken';

/**
 * Wraps an async express route handler to forward unhandled rejections to next()
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Generate a JWT signed token with user id and role
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'civicconnect_secret_fallback_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Keyword-based AI-style category and priority suggestion
 * Categories: Pothole, Water leakage, Broken streetlight, Garbage overflow, Other
 * Priority: High, Medium, Low
 */
export const suggestCategoryAndPriority = (text = '') => {
  const content = String(text).toLowerCase();

  let category = 'Other';
  let priority = 'Low';
  let confidence = 70;

  // Category detection
  if (
    content.includes('pothole') ||
    content.includes('crater') ||
    content.includes('road cave') ||
    content.includes('asphalt crack') ||
    content.includes('road repair') ||
    content.includes('damaged road')
  ) {
    category = 'Pothole';
    confidence = 95;
  } else if (
    content.includes('water leak') ||
    content.includes('pipe burst') ||
    content.includes('sewage') ||
    content.includes('drain') ||
    content.includes('flooding') ||
    content.includes('water overflow') ||
    content.includes('gutter')
  ) {
    category = 'Water leakage';
    confidence = 92;
  } else if (
    content.includes('streetlight') ||
    content.includes('street light') ||
    content.includes('lamp') ||
    content.includes('dark street') ||
    content.includes('light pole') ||
    content.includes('blackout')
  ) {
    category = 'Broken streetlight';
    confidence = 94;
  } else if (
    content.includes('garbage') ||
    content.includes('trash') ||
    content.includes('waste') ||
    content.includes('dump') ||
    content.includes('litter') ||
    content.includes('debris') ||
    content.includes('bin overflow')
  ) {
    category = 'Garbage overflow';
    confidence = 90;
  }

  // Priority detection
  const highRiskKeywords = [
    'danger',
    'hazard',
    'accident',
    'urgent',
    'injury',
    'deep',
    'hospital',
    'school',
    'fire',
    'electric',
    'spark',
    'exposed wire',
    'severe',
    'child',
    'major'
  ];

  const mediumRiskKeywords = [
    'broken',
    'damaged',
    'overflow',
    'smell',
    'blocked',
    'nuisance',
    'night',
    'dark',
    'traffic',
    'delay'
  ];

  if (highRiskKeywords.some((word) => content.includes(word))) {
    priority = 'High';
  } else if (category === 'Pothole' && (content.includes('main road') || content.includes('busy') || content.includes('swerving'))) {
    priority = 'High';
  } else if (category === 'Water leakage' && (content.includes('burst') || content.includes('drinking water'))) {
    priority = 'High';
  } else if (mediumRiskKeywords.some((word) => content.includes(word)) || category !== 'Other') {
    priority = 'Medium';
  }

  return {
    category,
    priority,
    confidence
  };
};

/**
 * Standard badge list and eligibility evaluator
 */
export const evaluateBadges = (points = 0, eventsCompleted = 0, resolvedReports = 0) => {
  const badges = [];

  if (points >= 10 || resolvedReports >= 1) {
    badges.push({
      id: 'b-civic-starter',
      name: 'Active Citizen',
      icon: 'sparkles',
      description: 'Submitted your first civic report or earned initial points'
    });
  }

  if (resolvedReports >= 1) {
    badges.push({
      id: 'b-civic-guardian',
      name: 'Civic Guardian',
      icon: 'shield',
      description: 'Reported an issue that was successfully resolved'
    });
  }

  if (eventsCompleted >= 1) {
    badges.push({
      id: 'b-eco-volunteer',
      name: 'Community Helper',
      icon: 'heart',
      description: 'Successfully completed a community volunteer activity'
    });
  }

  if (eventsCompleted >= 3) {
    badges.push({
      id: 'b-eco-warrior',
      name: 'Eco Warrior',
      icon: 'forest',
      description: 'Completed 3 or more community volunteer drives'
    });
  }

  if (points >= 500) {
    badges.push({
      id: 'b-change-maker',
      name: 'Change Maker',
      icon: 'award',
      description: 'Accumulated over 500 civic engagement points'
    });
  }

  if (points >= 1000) {
    badges.push({
      id: 'b-city-hero',
      name: 'Civic Champion',
      icon: 'crown',
      description: 'Reached max milestone of 1,000 civic points'
    });
  }

  return badges;
};

/**
 * Computes reward progress percentage towards the 1,000 points tier
 */
export const calculateRewardProgress = (rewardPoints = 0) => {
  const target = 1000;
  const current = Math.max(0, Number(rewardPoints) || 0);
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  let tier = 'Citizen';
  if (current >= 1000) tier = 'Civic Champion';
  else if (current >= 600) tier = 'Gold Contributor';
  else if (current >= 300) tier = 'Silver Contributor';
  else if (current >= 100) tier = 'Bronze Contributor';

  return {
    currentPoints: current,
    targetPoints: target,
    percentage,
    remainingPoints: remaining,
    tier
  };
};
