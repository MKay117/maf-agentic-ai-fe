// export function camelToNormal(str) {
//   if (!str) return "";
//   return str
//     .replace(/_/g, " ")
//     .replace(/([a-z])([A-Z])/g, "$1 $2")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// }

// export function getStatusColor(status) {
//   if (!status) return "text.primary";
//   const lower = status.toLowerCase();
//   if (lower.includes("started")) return "blue";
//   if (lower.includes("completed")) return "green";
//   if (lower.includes("success")) return "green";
//   return "red";
// }

// export function cleanBullet(text) {
//   return text.replace(/^[-•]\s*/, "").trim();
// }

// export function parseSuccessReview(summaryText) {
//   if (!summaryText)
//     return {
//       executive: [],
//       bestPractice: [],
//       strengths: [],
//       recommendations: [],
//     };
//   const lines = summaryText.split("\n").map((l) => l.trim());
//   const result = {
//     executive: [],
//     bestPractice: [],
//     strengths: [],
//     recommendations: [],
//   };
//   let current = "executive";

//   for (const line of lines) {
//     if (!line || line.startsWith("---")) continue;
//     const lower = line.toLowerCase();
//     if (lower.startsWith("# stage 1")) current = "executive";
//     else if (lower.startsWith("# stage 2")) current = "strengths";
//     else if (lower.startsWith("# stage 3")) current = "bestPractice";
//     else if (lower.startsWith("# stage 4")) current = "recommendations";
//     else if (!line.startsWith("#")) result[current].push(line);
//   }
//   return result;
// }

// export function extractSimilarityScore(summary) {
//   if (!summary) return null;
//   const text = typeof summary === "string" ? summary : summary?.summary;
//   if (!text) return null;
//   const match = text.match(/(\d+)%/);
//   return match ? parseInt(match[1], 10) : null;
// }

// export function getSimilarityColor(score) {
//   if (score < 20) return "error";
//   if (score < 60) return "warning";
//   return "success";
// }

// export function extractAgentScores(events) {
//   if (!events || !Array.isArray(events)) return null;
//   const evalEvent = events
//     .slice()
//     .reverse()
//     .find((e) => e?.payload?.overall);
//   return evalEvent ? evalEvent.payload.overall : null;
// }

export function camelToNormal(str) {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getStatusColor(status) {
  if (!status) return "text.primary";
  const lower = status.toLowerCase();
  if (lower.includes("started")) return "blue";
  if (lower.includes("completed")) return "green";
  if (lower.includes("success")) return "green";
  return "red";
}

export function cleanBullet(text) {
  return text.replace(/^[-•]\s*/, "").trim();
}

export function parseSuccessReview(summaryText) {
  if (!summaryText)
    return {
      executive: [],
      bestPractice: [],
      strengths: [],
      recommendations: [],
    };
  const lines = summaryText.split("\n").map((l) => l.trim());
  const result = {
    executive: [],
    bestPractice: [],
    strengths: [],
    recommendations: [],
  };
  let current = "executive";

  for (const line of lines) {
    if (!line || line.startsWith("---")) continue;
    const lower = line.toLowerCase();
    if (lower.startsWith("# stage 1")) current = "executive";
    else if (lower.startsWith("# stage 2")) current = "strengths";
    else if (lower.startsWith("# stage 3")) current = "bestPractice";
    else if (lower.startsWith("# stage 4")) current = "recommendations";
    else if (!line.startsWith("#")) result[current].push(line);
  }
  return result;
}

export function extractSimilarityScore(summary) {
  if (!summary) return null;
  const text = typeof summary === "string" ? summary : summary?.summary;
  if (!text) return null;
  const match = text.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : null;
}

export function getSimilarityColor(score) {
  if (score < 20) return "error";
  if (score < 60) return "warning";
  return "success";
}

/**
 * Extracts scores from either:
 * 1. Live Stream Events (evaluating_agent_responses)
 * 2. Static Log Object (review_scores.overall)
 */
export function extractAgentScores(events, staticReview) {
  // 1. Try Live Events first (Highest Priority during streaming)
  if (events && Array.isArray(events) && events.length > 0) {
    const evalEvent = events
      .slice()
      .reverse()
      .find((e) => e?.payload?.overall);
    if (evalEvent) return evalEvent.payload.overall;
  }

  // 2. Try Static Log (Azure Blob JSON structure)
  // The backend saves the context as: ctx.review_scores.overall
  if (staticReview?.review_scores?.overall) {
    return staticReview.review_scores.overall;
  }

  return null;
}
