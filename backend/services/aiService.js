// Seed data and helper methods for AI services


// 1. Categorize Complaint with LLM API (Gemini) or Keyword Fallback
export const categorizeComplaint = async (description, imageUrl) => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are an AI civic coordinator. Analyze the following civic complaint description and optional image. 
      Classify the complaint into one of these categories: "Road Repair", "Street Lighting", "Waste Management", "Traffic Signage", "Sanitation & Sewage", or "uncategorized".
      Also assign a priority rating: "high", "medium", or "low".
      
      Complaint description: "${description}"
      ${imageUrl ? `Image URL: ${imageUrl}` : ''}
      
      Respond STRICTLY in JSON format with exactly two keys: "category" and "priority". Do not wrap in markdown blocks.
      Example: {"category": "Road Repair", "priority": "high"}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Parse the JSON output from the model
        const jsonText = responseText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed.category && parsed.priority) {
          return {
            category: parsed.category,
            priority: parsed.priority.toLowerCase()
          };
        }
      }
    } catch (e) {
      console.warn('AI API Call failed, running keyword fallback classifier:', e.message);
    }
  }

  // Fallback keyword-based categorization logic
  const text = description.toLowerCase();
  let category = 'uncategorized';
  let priority = 'medium';

  if (text.includes('pothole') || text.includes('road') || text.includes('street paving') || text.includes('asphalt')) {
    category = 'Road Repair';
    priority = 'high';
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('litter')) {
    category = 'Waste Management';
    priority = 'medium';
  } else if (text.includes('streetlight') || text.includes('lamp') || text.includes('light') || text.includes('dark')) {
    category = 'Street Lighting';
    priority = 'medium';
  } else if (text.includes('drain') || text.includes('sewage') || text.includes('spill') || text.includes('water leak') || text.includes('pipes')) {
    category = 'Sanitation & Sewage';
    priority = 'high';
  } else if (text.includes('sign') || text.includes('zebra') || text.includes('crossing') || text.includes('traffic')) {
    category = 'Traffic Signage';
    priority = 'low';
  }

  return { category, priority };
};

// 2. Detect duplicate complaints using distance proximity and text similarity
export const detectDuplicate = (newComplaint, nearbyComplaints = []) => {
  const DISTANCE_THRESHOLD = 0.00055; // Roughly 50-60 meters in lat/lng units
  const SIMILARITY_THRESHOLD = 0.35; // 35% word overlap

  const newLat = newComplaint.location?.lat;
  const newLng = newComplaint.location?.lng;
  const newWords = new Set(newComplaint.description.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  for (const oldComp of nearbyComplaints) {
    // Skip checking if it is already resolved/rejected
    if (oldComp.status === 'resolved' || oldComp.status === 'rejected') continue;

    // Proximity check
    const oldLat = oldComp.location?.lat;
    const oldLng = oldComp.location?.lng;
    
    if (Math.abs(newLat - oldLat) <= DISTANCE_THRESHOLD && Math.abs(newLng - oldLng) <= DISTANCE_THRESHOLD) {
      // Proximity matched, now check description similarity
      const oldWords = new Set(oldComp.description.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      
      // Calculate intersection size
      let intersection = 0;
      for (const word of newWords) {
        if (oldWords.has(word)) {
          intersection++;
        }
      }
      
      const union = new Set([...newWords, ...oldWords]);
      const similarity = union.size > 0 ? intersection / union.size : 0;
      
      if (similarity >= SIMILARITY_THRESHOLD) {
        // AI flags as duplicate
        return oldComp._id;
      }
    }
  }

  return null;
};

// 3. Recommend Opportunities based on user's past interest tags
export const recommendOpportunities = (userBadges = [], userHistory = [], allOpportunities = []) => {
  // Extract user's past interested categories
  const interestCategories = new Set();
  
  // Feed from badges
  userBadges.forEach(b => {
    if (b.name.toLowerCase().includes('eco') || b.name.toLowerCase().includes('green')) {
      interestCategories.add('Environment');
    }
  });

  // Feed from activity logs
  userHistory.forEach(act => {
    if (act.title.toLowerCase().includes('tree') || act.title.toLowerCase().includes('cleanup') || act.title.toLowerCase().includes('park')) {
      interestCategories.add('Environment');
    }
    if (act.title.toLowerCase().includes('food') || act.title.toLowerCase().includes('kitchen') || act.title.toLowerCase().includes('soup')) {
      interestCategories.add('Social Support');
    }
    if (act.title.toLowerCase().includes('teach') || act.title.toLowerCase().includes('math') || act.title.toLowerCase().includes('school')) {
      interestCategories.add('Education');
    }
  });

  // Default fallback if no history
  if (interestCategories.size === 0) {
    interestCategories.add('Environment');
    interestCategories.add('Social Support');
  }

  // Score opportunities
  return allOpportunities.map(opp => {
    let score = 0.1; // Baseline score
    
    if (interestCategories.has(opp.category)) {
      score += 0.8;
    }
    
    return { opp, score };
  })
  .sort((a, b) => b.score - a.score)
  .map(item => item.opp);
};
