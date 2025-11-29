// --- Progress Management Utility Functions ---
const STORAGE_KEY = "lmsProgress"; // Global constant for storage key
const PASS_SCORE = 3; // Global constant for passing quiz score

// Helper to safely load all progress
function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    // Use a consistent, internal key for loading
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error loading progress from localStorage:", e);
    return {};
  }
}

// 1. Initialize LocalStorage
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  }
}

// 2. Get Progress (Uses loadProgress helper)
function getProgress(courseId) {
  const allProgress = loadProgress();
  // IMPORTANT: Ensure the ID is a string for consistent object key access
  const id = courseId.toString();
  // Return initialized object if course never started
  return allProgress[id] || { completedLessons: [], quizScore: null };
}

// 3. Save Lesson Progress (Refined to use loadProgress)
function completeLesson(courseId, lessonId) {
  const allProgress = loadProgress();
  const id = courseId.toString();

  let courseProgress = getProgress(courseId); // Safely get/init progress

  if (!courseProgress.completedLessons.includes(lessonId)) {
    courseProgress.completedLessons.push(lessonId);
    courseProgress.completedLessons.sort((a, b) => a - b); // Keep sorted

    allProgress[id] = courseProgress; // Update the full map
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    return true;
  }
  return false;
}

// 4. Save Quiz Score (Refined to use loadProgress)
function saveQuizScore(courseId, score) {
  const allProgress = loadProgress();
  const id = courseId.toString();

  let courseProgress = getProgress(courseId); // Safely get/init progress

  courseProgress.quizScore = score;

  allProgress[id] = courseProgress; // Update the full map
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
}

// 5. Calculate Course Completion Percentage (CRITICAL LOGIC FIX)
function calculateCourseProgress(courseId) {
  // Uses global coursesData from data.js
  const course = coursesData.find((c) => c.id === courseId);
  if (!course) return 0;

  const progress = getProgress(courseId);
  const totalLessons = course.lessons.length;
  const completedLessons = progress.completedLessons.length;

  // FIX: The quiz unit is counted as complete if a score is recorded (attempted),
  // regardless of pass/fail. The UI handles the pass/fail status visually.
  const quizAttempted = progress.quizScore !== null;

  // Total steps = number of lessons + 1 (for the quiz)
  const totalUnits = totalLessons + (course.quiz.length > 0 ? 1 : 0);

  if (totalUnits === 0) return 0;

  let completedUnits = completedLessons + (quizAttempted ? 1 : 0);

  // Return calculation, ensuring the ceiling is 100%
  return Math.min(100, Math.floor((completedUnits / totalUnits) * 100));
}

// 6. Global Init
document.addEventListener("DOMContentLoaded", () => {
  initStorage();

  // Mobile Menu Logic
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (btn && menu) {
    btn.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
  }
});
