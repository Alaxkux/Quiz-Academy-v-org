/* ================================================================
   QUIZ ACADEMY — DATA v4
   Updated: 20 levels with unique names, realistic XP thresholds,
   all quiz data, achievements, themes, quotes
   ================================================================ */

// ── QUOTES ──
const QUOTES = [
  { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
  { text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King' },
  { text: 'Education is not preparation for life; education is life itself.', author: 'John Dewey' },
  { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
  { text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' },
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { text: 'The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.', author: 'Brian Herbert' },
  { text: 'Intelligence plus character — that is the goal of true education.', author: 'Martin Luther King Jr.' },
  { text: 'Knowledge is power. Information is liberating.', author: 'Kofi Annan' }
];

// ── THEMES ──
const THEMES = [
  { id: 'midnight', name: 'Midnight', dots: ['#07090E','#6C8EFF','#4DFFC3'], scheme: 'dark' },
  { id: 'aurora',   name: 'Aurora',   dots: ['#060E0A','#3DFF9A','#7BFFD4'], scheme: 'dark' },
  { id: 'sunset',   name: 'Sunset',   dots: ['#0E0806','#FF7A45','#56CFB2'], scheme: 'dark' },
  { id: 'ocean',    name: 'Ocean',    dots: ['#060A10','#38BDF8','#4ADE80'], scheme: 'dark' },
  { id: 'nebula',   name: 'Nebula',   dots: ['#08060E','#B57BFF','#4DFFC3'], scheme: 'dark' },
  { id: 'snow',     name: 'Snow',     dots: ['#F4F6FA','#4F6EFF','#10B981'], scheme: 'light' },
  { id: 'paper',    name: 'Paper',    dots: ['#F5F0E8','#D4651A','#2D7A4F'], scheme: 'light' },
  { id: 'rose',     name: 'Rose',     dots: ['#FFF0F5','#E8417A','#10B981'], scheme: 'light' }
];

// ── 20 LEVELS — realistic XP, unique names ──
// XP needed grows quadratically — early levels fast, later levels need real dedication
const LEVELS = [
  { level: 1,  xpRequired: 0,      title: 'Newcomer',      emoji: '🌱' },
  { level: 2,  xpRequired: 150,    title: 'Curious',       emoji: '👀' },
  { level: 3,  xpRequired: 400,    title: 'Eager',         emoji: '📖' },
  { level: 4,  xpRequired: 800,    title: 'Apprentice',    emoji: '✏️' },
  { level: 5,  xpRequired: 1400,   title: 'Student',       emoji: '🎒' },
  { level: 6,  xpRequired: 2200,   title: 'Thinker',       emoji: '💭' },
  { level: 7,  xpRequired: 3200,   title: 'Scholar',       emoji: '📚' },
  { level: 8,  xpRequired: 4500,   title: 'Analyst',       emoji: '🔍' },
  { level: 9,  xpRequired: 6000,   title: 'Strategist',    emoji: '♟️' },
  { level: 10, xpRequired: 8000,   title: 'Expert',        emoji: '🧩' },
  { level: 11, xpRequired: 10500,  title: 'Specialist',    emoji: '⚗️' },
  { level: 12, xpRequired: 13500,  title: 'Adept',         emoji: '🔬' },
  { level: 13, xpRequired: 17000,  title: 'Virtuoso',      emoji: '🎯' },
  { level: 14, xpRequired: 21000,  title: 'Authority',     emoji: '🏛️' },
  { level: 15, xpRequired: 26000,  title: 'Mastermind',    emoji: '🧠' },
  { level: 16, xpRequired: 32000,  title: 'Prodigy',       emoji: '⚡' },
  { level: 17, xpRequired: 39000,  title: 'Luminary',      emoji: '✨' },
  { level: 18, xpRequired: 47000,  title: 'Sage',          emoji: '🦉' },
  { level: 19, xpRequired: 56000,  title: 'Oracle',        emoji: '🔮' },
  { level: 20, xpRequired: 66000,  title: 'Transcendent',  emoji: '👑' }
];

function getLevelInfo(xp) {
  let current = LEVELS[0], next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const xpIntoLevel    = next ? xp - current.xpRequired : 0;
  const xpForNextLevel = next ? next.xpRequired - current.xpRequired : 1;
  const progress       = next ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;
  return { current, next, progress, xpIntoLevel, xpForNextLevel };
}

// ── SMART XP CALCULATOR ──
// XP is based on score quality — poor scores give very little, great scores give much more
// This keeps progression slow and meaningful
function calculateXP(percentage, questionCount, isDailyChallenge, difficulty) {
  if (percentage < 30) return 0; // Too low — no XP reward

  // Base XP per correct answer, scaled by difficulty
  const diffMulti = { easy: 8, medium: 12, hard: 18, all: 10, mixed: 11 };
  const base = Math.floor((percentage / 100) * questionCount * (diffMulti[difficulty] || 10));

  // Performance bonus — rewards high scorers significantly more
  let perfBonus = 0;
  if (percentage === 100) perfBonus = Math.round(base * 0.8);      // 80% bonus for perfect
  else if (percentage >= 90) perfBonus = Math.round(base * 0.5);   // 50% bonus for 90%+
  else if (percentage >= 75) perfBonus = Math.round(base * 0.25);  // 25% bonus for 75%+
  else if (percentage >= 60) perfBonus = Math.round(base * 0.1);   // 10% bonus for 60%+

  const dailyBonus = isDailyChallenge ? 50 : 0;
  return base + perfBonus + dailyBonus;
}

// ── SMART AVERAGE SCORE ──
// Uses exponential moving average so recent scores matter more
// But never makes 100% truly impossible
function calculateSmartAverage(history) {
  if (!history || !history.length) return 0;
  if (history.length === 1) return history[0].percentage;

  // Exponential moving average — more recent quizzes weight more
  // Weight: most recent = 0.3 decay factor
  const alpha = 0.25; // smoothing factor
  let avg = history[0].percentage;
  for (let i = 1; i < history.length; i++) {
    avg = alpha * history[i].percentage + (1 - alpha) * avg;
  }
  return Math.round(avg);
}

// ── ACHIEVEMENTS ──
const ACHIEVEMENTS = [
  { id: 'first_quiz',        name: 'First Steps',       icon: '🎯', desc: 'Complete your first quiz',              req: 'Take 1 quiz' },
  { id: 'perfect_score',     name: 'Perfectionist',     icon: '⭐', desc: 'Score 100% on any quiz',               req: 'Score 100%' },
  { id: 'streak_3',          name: 'On a Roll',         icon: '🔥', desc: 'Maintain a 3-day streak',              req: '3 days in a row' },
  { id: 'streak_7',          name: 'Week Warrior',      icon: '💥', desc: 'Maintain a 7-day streak',              req: '7 days in a row' },
  { id: 'streak_30',         name: 'Iron Will',         icon: '🌟', desc: '30-day learning streak',               req: '30 days in a row' },
  { id: 'quiz_5',            name: 'Getting Started',   icon: '📖', desc: 'Complete 5 quizzes',                   req: 'Take 5 quizzes' },
  { id: 'quiz_10',           name: 'Quiz Enthusiast',   icon: '📚', desc: 'Complete 10 quizzes',                  req: 'Take 10 quizzes' },
  { id: 'quiz_50',           name: 'Knowledge Seeker',  icon: '🧠', desc: 'Complete 50 quizzes',                  req: 'Take 50 quizzes' },
  { id: 'quiz_100',          name: 'Century Club',      icon: '💯', desc: 'Complete 100 quizzes',                 req: 'Take 100 quizzes' },
  { id: 'points_500',        name: 'Point Earner',      icon: '💰', desc: 'Earn 500 total points',                req: 'Accumulate 500 pts' },
  { id: 'points_1000',       name: 'Point Collector',   icon: '💎', desc: 'Earn 1,000 total points',              req: 'Accumulate 1000 pts' },
  { id: 'points_5000',       name: 'Point Hoarder',     icon: '💍', desc: 'Earn 5,000 total points',              req: 'Accumulate 5000 pts' },
  { id: 'level_5',           name: 'Rising Star',       icon: '🌠', desc: 'Reach Level 5 — Student',              req: 'Reach Level 5' },
  { id: 'level_10',          name: 'Expert Badge',      icon: '🏅', desc: 'Reach Level 10 — Expert',              req: 'Reach Level 10' },
  { id: 'level_15',          name: 'Mastermind',        icon: '🧩', desc: 'Reach Level 15 — Mastermind',          req: 'Reach Level 15' },
  { id: 'level_20',          name: 'Transcendent',      icon: '👑', desc: 'Reach the maximum Level 20',           req: 'Reach Level 20' },
  { id: 'leaderboard_top10', name: 'Top Performer',     icon: '🏆', desc: 'Rank in the top 10 on leaderboard',   req: 'Rank top 10' },
  { id: 'daily_7',           name: 'Daily Devotee',     icon: '📅', desc: 'Complete 7 daily challenges',          req: 'Complete 7 daily challenges' },
  { id: 'all_categories',    name: 'Well Rounded',      icon: '🌐', desc: 'Play all original quiz categories',    req: 'Try every category' },
  { id: 'speed_demon',       name: 'Speed Demon',       icon: '⚡', desc: 'Finish a quiz in under 1 minute',      req: 'Finish in under 60s' },
  { id: 'comeback_kid',      name: 'Comeback Kid',      icon: '📈', desc: 'Score 80%+ after previously scoring below 50%', req: 'Bounce back strong' },
  { id: 'mistake_reviewer',  name: 'Self Improver',     icon: '🔍', desc: 'Review your mistakes after a quiz',    req: 'Use Review Mistakes' }
];

// ── QUIZ DATA (unchanged from v3) ──
const QUIZ_DATA = {
  'IFT 203': {
    icon: '💻', color: 'rgba(108,142,255,.12)',
    description: 'Web Technologies — HTML, CSS & JavaScript',
    questions: [
      { q: 'What does HTML stand for?', opts: ['Hyper Text Markup Language','High Tech Modern Language','Home Tool Markup Language','Hyperlinks and Text Markup Language'], a: 0, difficulty: 'easy', explanation: 'HTML stands for Hyper Text Markup Language — the standard language for creating web content.' },
      { q: 'Which HTML tag is used for the largest heading?', opts: ['<h6>','<heading>','<h1>','<head>'], a: 2, difficulty: 'easy', explanation: '<h1> is the largest heading tag. Headings go from h1 (largest) to h6 (smallest).' },
      { q: 'What does CSS stand for?', opts: ['Creative Style Sheets','Cascading Style Sheets','Computer Style Sheets','Colorful Style Sheets'], a: 1, difficulty: 'easy', explanation: 'CSS stands for Cascading Style Sheets — it controls the visual presentation of HTML elements.' },
      { q: 'Which CSS property changes background color?', opts: ['color','bgcolor','background-color','background'], a: 2, difficulty: 'easy', explanation: 'background-color sets the background color. The color property only changes text color.' },
      { q: 'What is the correct way to declare a JavaScript variable?', opts: ['variable myVar','var myVar','v myVar','declare myVar'], a: 1, difficulty: 'easy', explanation: 'Variables are declared using var, let, or const. var myVar is classic syntax.' },
      { q: 'Which symbol is used for single-line comments in JavaScript?', opts: ['//','/*','#','--'], a: 0, difficulty: 'easy', explanation: '// is for single-line comments. /* */ is for multi-line comments.' },
      { q: 'What is the correct HTML for a hyperlink?', opts: ['<a url="...">Link</a>','<a href="...">Link</a>','<a>url</a>','<link>url</link>'], a: 1, difficulty: 'medium', explanation: 'The <a> tag with href attribute creates a hyperlink. href stands for Hypertext Reference.' },
      { q: 'Which CSS property controls text size?', opts: ['text-size','font-size','text-style','font-style'], a: 1, difficulty: 'easy', explanation: 'font-size controls text size. text-size does not exist in CSS.' },
      { q: 'What does DOM stand for?', opts: ['Document Object Model','Data Object Module','Display Object Manager','Document Order Model'], a: 0, difficulty: 'medium', explanation: 'DOM stands for Document Object Model — a programming interface representing the page as a tree of objects.' },
      { q: 'Which HTML attribute specifies alternate text for an image?', opts: ['title','src','alt','longdesc'], a: 2, difficulty: 'easy', explanation: 'The alt attribute provides alternative text when an image cannot be displayed. Important for accessibility.' },
      { q: 'What does "em" unit represent in CSS?', opts: ['Height of letter E','Relative to font-size of element','Equal to 1 pixel','Percentage of parent width'], a: 1, difficulty: 'medium', explanation: '"em" is a relative unit equal to the font-size of the current element. If font-size is 16px, 1em = 16px.' },
      { q: 'What is event bubbling in JavaScript?', opts: ['An event that fires repeatedly','Events propagating from child to parent','Events firing in reverse','A type of animation event'], a: 1, difficulty: 'hard', explanation: 'Event bubbling means an event on a child element propagates up through parent elements — the default browser behavior.' },
      { q: 'Which CSS selector selects all <p> inside a <div>?', opts: ['div + p','div > p','div p','div, p'], a: 2, difficulty: 'medium', explanation: '"div p" is the descendant selector — selects all <p> elements anywhere inside a <div>.' },
      { q: 'What does the async attribute do on a <script> tag?', opts: ['Runs script after page loads','Loads and executes script asynchronously','Prevents script from running','Runs script multiple times'], a: 1, difficulty: 'hard', explanation: 'async downloads the script asynchronously while HTML continues parsing, then executes immediately.' },
      { q: 'Which JavaScript method adds an element to the end of an array?', opts: ['add()','append()','push()','insert()'], a: 2, difficulty: 'easy', explanation: 'push() adds elements to the end of an array and returns the new length.' }
    ]
  },
  'IFT 201': {
    icon: '🛒', color: 'rgba(77,255,195,.1)',
    description: 'E-Business — E-Commerce Models & Digital Trade',
    questions: [
      { q: 'What does E-commerce stand for?', opts: ['Electronic Commerce','Easy Commerce','European Commerce','Enterprise Commerce'], a: 0, difficulty: 'easy', explanation: 'E-commerce stands for Electronic Commerce — buying and selling over the internet.' },
      { q: 'Which is NOT an e-business model?', opts: ['B2B','B2C','C2C','D2D'], a: 3, difficulty: 'easy', explanation: 'D2D is not a standard e-business model. Main models are B2B, B2C, and C2C.' },
      { q: 'What is B2B e-commerce?', opts: ['Business to Business','Business to Bank','Buyer to Buyer','Business to Broker'], a: 0, difficulty: 'easy', explanation: 'B2B means Business to Business — transactions conducted between companies.' },
      { q: 'Most common payment method in e-commerce?', opts: ['Cash on Delivery','Credit/Debit Cards','Barter','Checks'], a: 1, difficulty: 'easy', explanation: 'Credit and debit cards remain the most widely used payment method in e-commerce globally.' },
      { q: 'What does SSL stand for?', opts: ['Secure Socket Layer','Simple Security Layer','Safe Site Login','Secure System Link'], a: 0, difficulty: 'medium', explanation: 'SSL stands for Secure Socket Layer — a protocol encrypting data between browser and server.' },
      { q: 'Which is an example of C2C e-commerce?', opts: ['Amazon','eBay marketplace','Walmart','Dell'], a: 1, difficulty: 'easy', explanation: 'eBay is a classic C2C platform where individuals buy and sell directly to each other.' },
      { q: 'What is digital marketing?', opts: ['Marketing using digital technologies','Marketing digital products only','Marketing through digitization','Marketing for tech companies'], a: 0, difficulty: 'easy', explanation: 'Digital marketing uses digital channels — social media, email, search engines — to connect with customers.' },
      { q: 'Which is NOT a benefit of e-business?', opts: ['Global reach','Lower costs','Physical product inspection','24/7 availability'], a: 2, difficulty: 'easy', explanation: 'Physical product inspection is a limitation — customers cannot touch items before buying online.' },
      { q: 'What is an online marketplace?', opts: ['A physical market online','Platform connecting buyers and sellers','An online advertisement','A social media platform'], a: 1, difficulty: 'easy', explanation: 'An online marketplace connects multiple sellers with buyers on one platform.' },
      { q: 'Which protocol is used for secure online transactions?', opts: ['HTTP','FTP','HTTPS','SMTP'], a: 2, difficulty: 'medium', explanation: 'HTTPS uses SSL/TLS encryption to secure data transmitted between browser and server.' },
      { q: 'What does SEO stand for?', opts: ['Search Engine Optimization','Site Engine Operation','Secure Email Output','Social Engagement Outreach'], a: 0, difficulty: 'medium', explanation: 'SEO stands for Search Engine Optimization — improving website visibility in search results.' },
      { q: 'What is a clickthrough rate (CTR)?', opts: ['How fast a page loads','Ratio of clicks to impressions','Number of visitors per day','Percentage of returning users'], a: 1, difficulty: 'hard', explanation: 'CTR = (Clicks / Impressions) × 100. It measures how often people click an ad after seeing it.' },
      { q: 'Which strategy involves selling related products to increase sale value?', opts: ['Remarketing','Cross-selling','Affiliate marketing','Dropshipping'], a: 1, difficulty: 'medium', explanation: 'Cross-selling suggests related products to a customer.' },
      { q: 'What is dropshipping?', opts: ['Fast delivery service','Selling products without holding inventory','Shipping damaged goods','Bulk order discount'], a: 1, difficulty: 'medium', explanation: 'Dropshipping is a fulfilment method where the seller does not stock inventory — orders go directly to a third-party supplier.' },
      { q: 'What is affiliate marketing?', opts: ['Marketing by friends','Earning commission by promoting others products','Selling your own products','Email marketing campaigns'], a: 1, difficulty: 'medium', explanation: 'Affiliate marketing earns commission by promoting another company\'s products and driving sales.' }
    ]
  },
  'IFT 211': {
    icon: '📝', color: 'rgba(245,200,66,.1)',
    description: 'Computer Based Testing — CBT Systems & Assessment',
    questions: [
      { q: 'What does CBT stand for in education?', opts: ['Computer Based Training','Computer Based Testing','Core Business Technology','Central Business Tool'], a: 1, difficulty: 'easy', explanation: 'In education, CBT stands for Computer Based Testing.' },
      { q: 'Which is an advantage of CBT?', opts: ['Immediate feedback','Requires internet always','More expensive','Less secure'], a: 0, difficulty: 'easy', explanation: 'Immediate feedback is a major advantage — results are generated instantly.' },
      { q: 'Primary purpose of CBT in education?', opts: ['Entertainment','Assessment and evaluation','Social networking','Data storage'], a: 1, difficulty: 'easy', explanation: 'CBT is primarily used for assessment and evaluation of student knowledge.' },
      { q: 'Which is NOT essential for CBT?', opts: ['Computer system','Questions database','Physical textbooks','Software interface'], a: 2, difficulty: 'easy', explanation: 'Physical textbooks are not essential for CBT.' },
      { q: 'What is adaptive testing in CBT?', opts: ['Test that adapts to student performance','Test you can take anytime','Test with video questions','Test that changes daily'], a: 0, difficulty: 'medium', explanation: 'Adaptive testing adjusts question difficulty in real-time based on the test-taker\'s performance.' },
      { q: 'Which question type is easiest to auto-grade?', opts: ['Essay','Multiple choice','Oral examination','Project work'], a: 1, difficulty: 'easy', explanation: 'Multiple choice questions are easiest to auto-grade because they have a single definitive answer.' },
      { q: 'Key security feature in CBT?', opts: ['Open book policy','User authentication','No time limits','Public access'], a: 1, difficulty: 'medium', explanation: 'User authentication verifies the right person is taking the test, preventing impersonation.' },
      { q: 'How does CBT benefit examiners?', opts: ['Less preparation time','Automatic grading','No need for questions','Eliminates all cheating'], a: 1, difficulty: 'easy', explanation: 'Automatic grading saves significant time and reduces human error.' },
      { q: 'What is randomization in CBT?', opts: ['Random test dates','Random question order','Random grading','Random students'], a: 1, difficulty: 'medium', explanation: 'Randomization presents questions in different orders for each student, reducing answer sharing.' },
      { q: 'Challenge of CBT?', opts: ['Too easy to use','Technical failures','Too much feedback','Too flexible'], a: 1, difficulty: 'easy', explanation: 'Technical failures can disrupt examinations.' },
      { q: 'What does LMS stand for?', opts: ['Learning Management System','Lecture Monitor Software','Laboratory Measurement Standard','Language Module Server'], a: 0, difficulty: 'medium', explanation: 'LMS stands for Learning Management System.' },
      { q: 'What is item banking in CBT?', opts: ['Saving money for CBT','Database of test questions','A type of security system','Banking questions during exam'], a: 1, difficulty: 'medium', explanation: 'Item banking stores a large pool of test questions for creating varied assessments.' },
      { q: 'Difference between formative and summative assessment?', opts: ['Formative is harder','Summative is ongoing, formative is final','Formative is ongoing, summative is final','No difference'], a: 2, difficulty: 'hard', explanation: 'Formative is ongoing (during learning); summative is at the end to measure final achievement.' },
      { q: 'Which CBT question type tests higher-order thinking?', opts: ['True/False','Fill in the blank','Multiple choice','Case study analysis'], a: 3, difficulty: 'hard', explanation: 'Case study analysis tests analysis, evaluation, and creation — higher levels of Bloom\'s Taxonomy.' },
      { q: 'What is proctoring in CBT?', opts: ['Creating questions','Monitoring exam-takers to prevent cheating','Grading answers','Publishing results'], a: 1, difficulty: 'medium', explanation: 'Proctoring monitors test-takers during an examination — physically or via webcam.' }
    ]
  },
  'ENT 211': {
    icon: '💼', color: 'rgba(255,107,138,.1)',
    description: 'Entrepreneurship — Business & Innovation',
    questions: [
      { q: 'What is entrepreneurship?', opts: ['Working for a company','Starting and managing a business','Investing in stocks','Teaching business'], a: 1, difficulty: 'easy', explanation: 'Entrepreneurship is the process of starting, organizing, and managing a business venture.' },
      { q: 'Which is a characteristic of an entrepreneur?', opts: ['Risk aversion','Innovation','Dependence','Rigidity'], a: 1, difficulty: 'easy', explanation: 'Innovation is a core characteristic — entrepreneurs find new ways to solve problems.' },
      { q: 'What is a business plan?', opts: ['Daily to-do list','Document outlining business strategy','Employee schedule','Product catalog'], a: 1, difficulty: 'easy', explanation: 'A business plan describes company goals, strategy, market analysis, and financial projections.' },
      { q: 'Which is NOT a source of business capital?', opts: ['Personal savings','Bank loans','Investors','Customer complaints'], a: 3, difficulty: 'easy', explanation: 'Customer complaints are feedback, not capital.' },
      { q: 'What does SME stand for?', opts: ['Small Marketing Enterprise','Small and Medium Enterprises','Super Marketing Effort','Sales and Marketing Entity'], a: 1, difficulty: 'easy', explanation: 'SME stands for Small and Medium Enterprises.' },
      { q: 'What is a unique selling proposition (USP)?', opts: ['Cheapest price','What makes your product different','Your sales target','Your office location'], a: 1, difficulty: 'medium', explanation: 'A USP is what makes your product or service different from competitors.' },
      { q: 'Which is a fixed cost in business?', opts: ['Raw materials','Rent','Electricity based on usage','Sales commissions'], a: 1, difficulty: 'medium', explanation: 'Rent is a fixed cost — it stays the same regardless of production volume.' },
      { q: 'What is market research?', opts: ['Selling in markets','Gathering information about customers and competitors','Marketing your research','Researching stock markets'], a: 1, difficulty: 'easy', explanation: 'Market research gathers and analyzes information about customers, competitors, and trends.' },
      { q: 'What is bootstrapping in entrepreneurship?', opts: ['Self-funding your business','Closing your business','Hiring quickly','Expanding rapidly'], a: 0, difficulty: 'medium', explanation: 'Bootstrapping means funding your business using personal savings and revenue, without external investors.' },
      { q: 'What is a startup?', opts: ['Any new business','Young company seeking scalable business model','A government business','A large corporation'], a: 1, difficulty: 'medium', explanation: 'A startup is a young company founded to develop a unique, scalable product or service.' },
      { q: 'What does ROI stand for?', opts: ['Rate of Income','Return on Investment','Revenue on Interest','Rate of Inflation'], a: 1, difficulty: 'medium', explanation: 'ROI = (Net Profit / Cost of Investment) × 100.' },
      { q: 'What is a SWOT analysis?', opts: ['Sales, Work, Output, Target','Strengths, Weaknesses, Opportunities, Threats','Strategy, Win, Optimize, Track','None of these'], a: 1, difficulty: 'medium', explanation: 'SWOT stands for Strengths, Weaknesses, Opportunities, Threats — a strategic planning framework.' },
      { q: 'Difference between revenue and profit?', opts: ['They are the same','Revenue is total income; profit is what remains after expenses','Profit is higher than revenue','Revenue is only from products'], a: 1, difficulty: 'medium', explanation: 'Revenue is total income. Profit is what remains after deducting all costs.' },
      { q: 'What is venture capital?', opts: ['Personal savings','Money from friends','Funding for startups with high growth potential','Government grants'], a: 2, difficulty: 'hard', explanation: 'Venture capital is financing for startups with high growth potential, in exchange for equity.' },
      { q: 'What is the break-even point?', opts: ['Maximum profit point','When total revenue equals total costs','When sales start declining','The first profitable month'], a: 1, difficulty: 'medium', explanation: 'The break-even point is where total revenue exactly equals total costs — neither profit nor loss.' }
    ]
  },
  'General': {
    icon: '🎓', color: 'rgba(108,142,255,.06)',
    description: 'General Computing — IT Fundamentals',
    questions: [
      { q: 'What is an algorithm?', opts: ['A programming language','Step-by-step problem-solving procedure','A type of computer','A software application'], a: 1, difficulty: 'easy', explanation: 'An algorithm is a finite set of step-by-step instructions for solving a problem.' },
      { q: 'Which of these is an operating system?', opts: ['Microsoft Word','Windows','Chrome','Excel'], a: 1, difficulty: 'easy', explanation: 'Windows is an operating system — software that manages hardware and provides services for programs.' },
      { q: 'What does RAM stand for?', opts: ['Random Access Memory','Read Access Memory','Rapid Access Memory','Run Access Memory'], a: 0, difficulty: 'easy', explanation: 'RAM stands for Random Access Memory — the main working memory of a computer.' },
      { q: 'What is cloud computing?', opts: ['Computing in the sky','Storing and accessing data over the internet','Weather prediction','A type of software'], a: 1, difficulty: 'easy', explanation: 'Cloud computing delivers computing services over the internet.' },
      { q: 'Which device is used for input?', opts: ['Monitor','Printer','Keyboard','Speaker'], a: 2, difficulty: 'easy', explanation: 'A keyboard is an input device. Monitors and speakers are output devices.' },
      { q: 'What is binary code?', opts: ['Two programming languages','Code using 0s and 1s','Double coding','Code with two files'], a: 1, difficulty: 'easy', explanation: 'Binary code uses only 0 and 1. Every computer operation is represented in binary.' },
      { q: 'What is a database?', opts: ['Base of data','Organized collection of data','Data at the bottom','Basic data'], a: 1, difficulty: 'easy', explanation: 'A database is an organized collection of structured data stored electronically.' },
      { q: 'Which is a high-level programming language?', opts: ['Machine code','Assembly','Python','Binary'], a: 2, difficulty: 'easy', explanation: 'Python is a high-level language close to human language.' },
      { q: 'What does URL stand for?', opts: ['Universal Resource Locator','Uniform Resource Locator','United Resource Link','Universal Reference Link'], a: 1, difficulty: 'medium', explanation: 'URL stands for Uniform Resource Locator — the address used to access resources on the internet.' },
      { q: 'What is cybersecurity?', opts: ['Security for robots','Protecting systems from digital attacks','Internet speed','Computer hardware'], a: 1, difficulty: 'easy', explanation: 'Cybersecurity protects computer systems, networks, and data from digital attacks.' },
      { q: 'What does CPU stand for?', opts: ['Central Processing Unit','Computer Power Unit','Core Processing Utility','Central Program Unit'], a: 0, difficulty: 'easy', explanation: 'CPU stands for Central Processing Unit — the brain of the computer.' },
      { q: 'Difference between hardware and software?', opts: ['No difference','Hardware is physical; software is programs','Software is physical; hardware is programs','Hardware is cheaper'], a: 1, difficulty: 'easy', explanation: 'Hardware is physical components. Software is programs and operating systems.' },
      { q: 'What is a firewall?', opts: ['A type of virus','Security system monitoring network traffic','Physical barrier in server rooms','Email filtering software'], a: 1, difficulty: 'medium', explanation: 'A firewall monitors and controls network traffic based on security rules.' },
      { q: 'What does IP address stand for?', opts: ['Internet Protocol address','Internal Processing address','Internet Provider address','Input Protocol address'], a: 0, difficulty: 'medium', explanation: 'IP stands for Internet Protocol. An IP address is a unique numerical label for each networked device.' },
      { q: 'What is open source software?', opts: ['Free software only','Software with publicly available source code','Software for open businesses','Operating system software'], a: 1, difficulty: 'medium', explanation: 'Open source software has source code anyone can inspect, modify, and distribute.' }
    ]
  },
  'MTH 101': {
    icon: '🧮', color: 'rgba(56,189,248,.1)',
    description: 'Mathematics — Algebra, Calculus & Statistics',
    questions: [
      { q: 'What is the derivative of x²?', opts: ['x','2x','x²','2'], a: 1, difficulty: 'easy', explanation: 'Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹. So d/dx(x²) = 2x.' },
      { q: 'What is the value of π to 2 decimal places?', opts: ['3.14','3.41','3.12','3.16'], a: 0, difficulty: 'easy', explanation: 'Pi (π) ≈ 3.14159... The first two decimal places give 3.14.' },
      { q: 'Solve: 2x + 6 = 14. What is x?', opts: ['3','4','5','6'], a: 1, difficulty: 'easy', explanation: '2x = 14 - 6 = 8, so x = 8/2 = 4.' },
      { q: 'What is the integral of 1/x dx?', opts: ['x','ln|x| + C','1/x² + C','-1/x + C'], a: 1, difficulty: 'medium', explanation: 'The integral of 1/x is the natural logarithm: ∫(1/x)dx = ln|x| + C.' },
      { q: 'What is 5! (5 factorial)?', opts: ['20','60','120','720'], a: 2, difficulty: 'easy', explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.' },
      { q: 'Mean of: 4, 8, 6, 10, 2?', opts: ['5','6','7','8'], a: 1, difficulty: 'easy', explanation: 'Mean = (4+8+6+10+2)/5 = 30/5 = 6.' },
      { q: 'What is the Pythagorean theorem?', opts: ['a+b=c','a²+b²=c²','a²-b²=c²','ab=c²'], a: 1, difficulty: 'easy', explanation: 'In a right-angled triangle: a² + b² = c², where c is the hypotenuse.' },
      { q: 'What is log₁₀(1000)?', opts: ['2','3','4','10'], a: 1, difficulty: 'medium', explanation: 'log₁₀(1000) = log₁₀(10³) = 3.' },
      { q: 'Quadratic formula for ax²+bx+c=0?', opts: ['x = (-b ± √(b²-4ac)) / 2a','x = (b ± √(b²+4ac)) / 2a','x = (-b ± √(b+4ac)) / 2a','x = b/2a'], a: 0, difficulty: 'medium', explanation: 'The quadratic formula x = (-b ± √(b²-4ac)) / 2a solves any quadratic equation.' },
      { q: 'What does standard deviation measure?', opts: ['Average value','Middle value','Spread of data from mean','Most frequent value'], a: 2, difficulty: 'medium', explanation: 'Standard deviation measures how spread out numbers are from the mean.' }
    ]
  },
  'PHY 101': {
    icon: '⚡', color: 'rgba(245,200,66,.1)',
    description: 'Physics — Mechanics, Waves & Electricity',
    questions: [
      { q: "What is Newton's First Law?", opts: ['F = ma','Object stays at rest or motion unless acted upon by force','For every action there is equal reaction','Energy cannot be created or destroyed'], a: 1, difficulty: 'easy', explanation: "Newton's First Law (Inertia): an object at rest stays at rest unless acted on by external force." },
      { q: 'Unit of electric current?', opts: ['Volt','Ohm','Ampere','Watt'], a: 2, difficulty: 'easy', explanation: 'Electric current is measured in Amperes (A).' },
      { q: 'Speed of light in a vacuum?', opts: ['3 × 10⁶ m/s','3 × 10⁸ m/s','3 × 10¹⁰ m/s','3 × 10⁴ m/s'], a: 1, difficulty: 'medium', explanation: 'The speed of light (c) is approximately 3 × 10⁸ metres per second.' },
      { q: "What is Ohm's Law?", opts: ['P = IV','V = IR','E = mc²','F = ma'], a: 1, difficulty: 'easy', explanation: "Ohm's Law: V = IR, where V is voltage, I is current, and R is resistance." },
      { q: 'What type of wave is sound?', opts: ['Transverse wave','Electromagnetic wave','Longitudinal wave','Standing wave'], a: 2, difficulty: 'medium', explanation: 'Sound is a longitudinal wave — particles vibrate parallel to the direction of propagation.' },
      { q: 'What does E = mc² represent?', opts: ["Newton's Second Law",'Mass-energy equivalence','Gravitational potential energy','Kinetic energy'], a: 1, difficulty: 'medium', explanation: "Einstein's E = mc² states energy equals mass times speed of light squared." },
      { q: 'Unit of force?', opts: ['Joule','Watt','Newton','Pascal'], a: 2, difficulty: 'easy', explanation: 'Force is measured in Newtons (N). 1 Newton = 1 kg·m/s².' },
      { q: 'Frequency of a wave with period 0.02s?', opts: ['2 Hz','20 Hz','50 Hz','200 Hz'], a: 2, difficulty: 'medium', explanation: 'Frequency = 1/Period = 1/0.02 = 50 Hz.' },
      { q: 'Which lens converges light rays?', opts: ['Concave lens','Convex lens','Plane lens','Diverging lens'], a: 1, difficulty: 'easy', explanation: 'A convex (converging) lens causes light rays to meet at a focal point.' },
      { q: 'Formula for gravitational potential energy?', opts: ['½mv²','mgh','F×d','P×V'], a: 1, difficulty: 'easy', explanation: 'Gravitational PE = mgh, where m is mass, g is gravity (9.8 m/s²), and h is height.' }
    ]
  },
  'BIO 101': {
    icon: '🔬', color: 'rgba(77,255,195,.1)',
    description: 'Biology — Cell Biology, Genetics & Ecology',
    questions: [
      { q: 'Powerhouse of the cell?', opts: ['Nucleus','Ribosome','Mitochondria','Chloroplast'], a: 2, difficulty: 'easy', explanation: 'Mitochondria produce ATP through cellular respiration, providing energy for cells.' },
      { q: 'Process by which plants make food using sunlight?', opts: ['Respiration','Fermentation','Photosynthesis','Transpiration'], a: 2, difficulty: 'easy', explanation: 'Photosynthesis converts light energy, water, and CO₂ into glucose and oxygen.' },
      { q: 'What carries genetic information in most organisms?', opts: ['RNA','DNA','Protein','Lipid'], a: 1, difficulty: 'easy', explanation: 'DNA (Deoxyribonucleic acid) carries the genetic blueprint in a double-helix structure.' },
      { q: 'Basic unit of life?', opts: ['Atom','Molecule','Cell','Organ'], a: 2, difficulty: 'easy', explanation: 'The cell is the basic structural, functional, and biological unit of all living organisms.' },
      { q: 'What does DNA stand for?', opts: ['Deoxyribonucleic Acid','Dinitrogen Acid','Dextrose Nitrogen Acid','Dinuclear Acid'], a: 0, difficulty: 'easy', explanation: 'DNA stands for Deoxyribonucleic Acid, named for its sugar component (deoxyribose).' },
      { q: 'Blood cells responsible for immune response?', opts: ['Red blood cells','Platelets','White blood cells','Plasma cells'], a: 2, difficulty: 'easy', explanation: 'White blood cells (leukocytes) identify and destroy pathogens.' },
      { q: "Mendel's Law of Segregation?", opts: ['Traits blend in offspring','Each organism has two alleles that separate during gamete formation','Dominant traits always appear','Genes are linked on chromosomes'], a: 1, difficulty: 'medium', explanation: 'Law of Segregation: two alleles separate during gamete formation so each gamete carries only one.' },
      { q: 'What is an ecosystem?', opts: ['All plants in an area','All animals in a region','Community of living organisms and their physical environment','A single species population'], a: 2, difficulty: 'medium', explanation: 'An ecosystem is living organisms interacting with their non-living environment as a system.' },
      { q: 'Function of ribosomes?', opts: ['Cell division','Protein synthesis','Energy production','DNA replication'], a: 1, difficulty: 'medium', explanation: 'Ribosomes are the sites of protein synthesis — they translate mRNA into proteins.' },
      { q: 'What is homeostasis?', opts: ['Cell reproduction','Maintaining stable internal conditions','Genetic mutation','Energy release'], a: 1, difficulty: 'medium', explanation: 'Homeostasis is maintaining a stable internal environment (temperature, pH, fluid balance).' }
    ]
  },
  'CHM 101': {
    icon: '⚗️', color: 'rgba(181,123,255,.1)',
    description: 'Chemistry — Atomic Structure, Bonding & Reactions',
    questions: [
      { q: 'How many elements are in the periodic table?', opts: ['98','108','118','128'], a: 2, difficulty: 'easy', explanation: 'The periodic table contains 118 confirmed elements, from Hydrogen (1) to Oganesson (118).' },
      { q: 'Chemical formula for water?', opts: ['HO','H₂O','H₂O₂','HO₂'], a: 1, difficulty: 'easy', explanation: 'Water is H₂O — two hydrogen atoms bonded to one oxygen atom.' },
      { q: 'Atomic number of Carbon?', opts: ['4','6','8','12'], a: 1, difficulty: 'easy', explanation: 'Carbon has atomic number 6, meaning it has 6 protons in its nucleus.' },
      { q: 'Which bond involves sharing of electrons?', opts: ['Ionic bond','Covalent bond','Metallic bond','Hydrogen bond'], a: 1, difficulty: 'easy', explanation: 'A covalent bond involves two atoms sharing electrons.' },
      { q: 'pH of pure water at 25°C?', opts: ['0','5','7','14'], a: 2, difficulty: 'easy', explanation: 'Pure water is neutral with pH 7. Below 7 is acidic, above 7 is basic.' },
      { q: "Avogadro's number?", opts: ['6.022 × 10²³','3.14 × 10²³','9.109 × 10²³','1.602 × 10²³'], a: 0, difficulty: 'medium', explanation: "Avogadro's number is 6.022 × 10²³ — the number of particles in one mole of a substance." },
      { q: 'What is an exothermic reaction?', opts: ['Reaction that absorbs heat','Reaction that releases heat','Reaction needing a catalyst','Reaction with no energy change'], a: 1, difficulty: 'medium', explanation: 'An exothermic reaction releases heat into the surroundings. Combustion is a common example.' },
      { q: 'Law of conservation of mass?', opts: ['Mass increases in reactions','Mass decreases in reactions','Mass is neither created nor destroyed','Mass depends on temperature'], a: 2, difficulty: 'medium', explanation: 'Mass cannot be created or destroyed in a chemical reaction.' },
      { q: "Gas making up most of Earth's atmosphere?", opts: ['Oxygen','Carbon dioxide','Nitrogen','Argon'], a: 2, difficulty: 'easy', explanation: "Earth's atmosphere is approximately 78% nitrogen, 21% oxygen." },
      { q: 'What is an isotope?', opts: ['Different element with same properties','Same element with different neutrons','Same element with different protons','Different element with same atomic mass'], a: 1, difficulty: 'medium', explanation: 'Isotopes are atoms of the same element with the same protons but different numbers of neutrons.' }
    ]
  },
  'GEO 101': {
    icon: '🌍', color: 'rgba(77,255,195,.08)',
    description: 'Geography — Physical & Human Geography',
    questions: [
      { q: 'Largest continent by area?', opts: ['Africa','North America','Asia','Europe'], a: 2, difficulty: 'easy', explanation: 'Asia is the largest continent, covering about 44.6 million km².' },
      { q: 'Longest river in the world?', opts: ['Amazon','Nile','Mississippi','Yangtze'], a: 1, difficulty: 'easy', explanation: 'The Nile River in Africa is generally recognized as the longest river at approximately 6,650 km.' },
      { q: 'Capital of Nigeria?', opts: ['Lagos','Kano','Abuja','Ibadan'], a: 2, difficulty: 'easy', explanation: 'Abuja is the capital of Nigeria, replacing Lagos in 1991.' },
      { q: 'What causes seasons on Earth?', opts: ["Earth's distance from Sun","Earth's axial tilt",'Solar flares','Moon gravitational pull'], a: 1, difficulty: 'medium', explanation: "Earth's axial tilt (23.5°) causes seasons." },
      { q: 'What is the Ring of Fire?', opts: ['Volcanic region around Pacific Ocean','The equatorial zone','A desert in Africa','Fire mountains in Asia'], a: 0, difficulty: 'medium', explanation: "The Ring of Fire surrounds the Pacific Ocean with 75% of the world's volcanoes." },
      { q: 'Driest continent?', opts: ['Asia','Africa','Antarctica','Australia'], a: 2, difficulty: 'medium', explanation: 'Antarctica is the driest continent — technically a cold desert.' },
      { q: 'What is the Greenwich Meridian?', opts: ['Equator line','Prime meridian (0° longitude)','Tropic of Cancer','International Date Line'], a: 1, difficulty: 'medium', explanation: 'The Greenwich Meridian runs through Greenwich, London at 0° longitude.' },
      { q: 'What is urbanization?', opts: ['Forest conservation','Movement of people from rural to urban areas','Agricultural development','Industrial decline'], a: 1, difficulty: 'easy', explanation: 'Urbanization is the shift of rural populations to cities, driven by economic opportunities.' },
      { q: 'What is a tsunami?', opts: ['Heavy rainfall','Powerful ocean wave caused by seismic activity','Tropical storm','Desert windstorm'], a: 1, difficulty: 'easy', explanation: 'A tsunami is a series of massive ocean waves caused by undersea earthquakes or volcanic eruptions.' },
      { q: 'What is the Sahara Desert?', opts: ["World's largest cold desert","World's largest hot desert","Africa's only desert","A desert in the Middle East"], a: 1, difficulty: 'easy', explanation: "The Sahara is the world's largest hot desert at about 9.2 million km²." }
    ]
  },
  'ENG 101': {
    icon: '📖', color: 'rgba(232,65,122,.1)',
    description: 'English Language — Grammar, Vocabulary & Writing',
    questions: [
      { q: 'What is a noun?', opts: ['A describing word','A person, place, thing, or idea','An action word','A connecting word'], a: 1, difficulty: 'easy', explanation: 'A noun names a person (teacher), place (Lagos), thing (book), or idea (freedom).' },
      { q: 'Plural of "datum"?', opts: ['Datums','Datae','Data','Datas'], a: 2, difficulty: 'medium', explanation: '"Data" is the plural of "datum" (from Latin).' },
      { q: 'What is an adjective?', opts: ['A word describing a noun or pronoun','An action word','A connecting word','A naming word'], a: 0, difficulty: 'easy', explanation: 'An adjective modifies a noun or pronoun — e.g., "tall building".' },
      { q: 'Difference between "its" and "it\'s"?', opts: ['"Its" is contraction; "it\'s" is possessive','"It\'s" is contraction of "it is"; "its" is possessive','They are interchangeable','"Its" is plural; "it\'s" is singular'], a: 1, difficulty: 'medium', explanation: '"It\'s" = contraction of "it is". "Its" = possessive pronoun.' },
      { q: 'What is a simile?', opts: ['Comparing two things using "like" or "as"','Direct comparison without "like" or "as"','Exaggeration for effect','Attributing human qualities to objects'], a: 0, difficulty: 'easy', explanation: 'A simile compares using "like" or "as" — e.g., "brave as a lion".' },
      { q: 'What is the active voice?', opts: ['Subject receives the action','Subject performs the action','No clear subject','Verb is in past tense'], a: 1, difficulty: 'medium', explanation: 'Active voice: the subject performs the action — generally clearer and more direct.' },
      { q: 'Correct subject-verb agreement?', opts: ['The team are playing well','The team is playing well','The teams is playing well','The team am playing well'], a: 1, difficulty: 'medium', explanation: '"Team" as a collective noun is treated as singular: "The team is playing well."' },
      { q: 'What is a metaphor?', opts: ['Using "like" or "as"','Saying something IS something else','Repeating the same sound','Giving human traits to objects'], a: 1, difficulty: 'easy', explanation: 'A metaphor says one thing IS another: "Life is a journey". No "like" or "as".' },
      { q: 'What is the Oxford comma?', opts: ['Comma after last item in list','Comma before last item in list','Comma after introductory phrase','Comma before quotation marks'], a: 1, difficulty: 'hard', explanation: 'The Oxford comma is placed before the final conjunction: "apples, oranges, and bananas."' },
      { q: 'What is onomatopoeia?', opts: ['Comparison using "like" or "as"','Repetition of consonant sounds','Words imitating the sound they describe','Exaggeration for emphasis'], a: 2, difficulty: 'medium', explanation: 'Onomatopoeia: words that sound like what they describe — buzz, splash, crackle, sizzle.' }
    ]
  },
  'ECO 201': {
    icon: '📊', color: 'rgba(108,142,255,.1)',
    description: 'Economics — Micro & Macroeconomics Fundamentals',
    questions: [
      { q: 'What is supply and demand?', opts: ['Government control of prices','Relationship between product availability and consumer desire','How banks control money','How taxes affect spending'], a: 1, difficulty: 'easy', explanation: 'Supply is how much producers offer; demand is how much consumers want. Their interaction determines price.' },
      { q: 'What is GDP?', opts: ['Gross Domestic Product — total value of goods and services produced','Government Debt Percentage','Global Development Plan','Growth Development Percentage'], a: 0, difficulty: 'easy', explanation: 'GDP measures the total monetary value of all goods and services produced in a country.' },
      { q: 'What is inflation?', opts: ['Increase in production','Rise in general price level over time','Decrease in unemployment','Increase in exports'], a: 1, difficulty: 'easy', explanation: 'Inflation is a sustained increase in the general price level, reducing purchasing power.' },
      { q: 'Law of diminishing returns?', opts: ['Adding inputs always increases output equally','At some point, adding more input yields less additional output','Revenue always increases with production','Costs always decrease with scale'], a: 1, difficulty: 'medium', explanation: 'Diminishing returns: adding more of one input while keeping others fixed eventually yields smaller output increases.' },
      { q: 'What is a monopoly?', opts: ['Market with many sellers','Market with one dominant seller','Market with two sellers','Government-owned business'], a: 1, difficulty: 'easy', explanation: 'A monopoly is where a single seller dominates with significant control over price.' },
      { q: 'What is fiscal policy?', opts: ['Central bank interest rate decisions','Government spending and taxation decisions','Trade agreements','Corporate pricing strategy'], a: 1, difficulty: 'medium', explanation: 'Fiscal policy refers to government decisions about spending and taxation.' },
      { q: 'What is opportunity cost?', opts: ['Cost of buying an opportunity','Value of the next best alternative foregone','Total cost of production','Cost of missed profits'], a: 1, difficulty: 'medium', explanation: 'Opportunity cost is the value of the best alternative you give up when making a choice.' },
      { q: 'What is a recession?', opts: ['Period of economic growth','Two or more consecutive quarters of negative GDP growth','When inflation is high','When unemployment is low'], a: 1, difficulty: 'medium', explanation: 'A recession is technically two consecutive quarters of negative economic growth.' },
      { q: 'What is comparative advantage?', opts: ['Being best at producing everything','Producing a good at lower opportunity cost than others','Having the most resources','Being first to market'], a: 1, difficulty: 'hard', explanation: 'Comparative advantage means producing at a lower opportunity cost than others.' },
      { q: 'What is monetary policy?', opts: ['Government tax decisions','Central bank control of money supply and interest rates','Import and export regulations','Company dividend policy'], a: 1, difficulty: 'medium', explanation: "Monetary policy is the central bank's control of money supply and interest rates." }
    ]
  },
  'PSY 101': {
    icon: '🧠', color: 'rgba(181,123,255,.12)',
    description: 'Psychology — Human Behaviour & Mental Processes',
    questions: [
      { q: 'Father of psychology?', opts: ['Sigmund Freud','Wilhelm Wundt','William James','Ivan Pavlov'], a: 1, difficulty: 'medium', explanation: 'Wilhelm Wundt established the first experimental psychology laboratory in 1879.' },
      { q: "What is Maslow's Hierarchy of Needs?", opts: ['A theory of personality disorders','A motivational theory of human needs in pyramid form','A theory of cognitive development','A model of emotional intelligence'], a: 1, difficulty: 'medium', explanation: "Maslow's Hierarchy arranges needs: physiological → safety → love → esteem → self-actualisation." },
      { q: 'What is classical conditioning?', opts: ['Learning through rewards and punishment','Learning by association between stimuli','Learning by observing others','Learning through trial and error'], a: 1, difficulty: 'medium', explanation: 'Classical conditioning: a neutral stimulus becomes associated with an unconditioned stimulus.' },
      { q: 'What is cognitive dissonance?', opts: ['Multiple personalities','Mental discomfort from conflicting beliefs','Memory loss','Inability to learn'], a: 1, difficulty: 'hard', explanation: 'Cognitive dissonance is mental discomfort when holding contradictory beliefs.' },
      { q: 'What does IQ measure?', opts: ['Emotional intelligence','Social skills','General cognitive ability','Memory capacity only'], a: 2, difficulty: 'easy', explanation: 'IQ (Intelligence Quotient) measures general cognitive ability including reasoning and problem-solving.' },
      { q: "Unconscious mind according to Freud?", opts: ['The conscious thinking part','Thoughts outside awareness that influence behaviour','The decision-making centre','Short-term memory store'], a: 1, difficulty: 'medium', explanation: "Freud's unconscious contains thoughts and desires outside conscious awareness that still influence behaviour." },
      { q: 'What is positive reinforcement?', opts: ['Punishing bad behaviour','Adding something desirable to increase behaviour','Removing something unpleasant','Ignoring unwanted behaviour'], a: 1, difficulty: 'easy', explanation: 'Positive reinforcement adds a pleasant stimulus to increase the likelihood of a behaviour recurring.' },
      { q: 'What is the placebo effect?', opts: ['Side effects of real medicine','Improvement from believing a treatment is effective','Rejection of medical treatment','A type of hypnosis'], a: 1, difficulty: 'medium', explanation: 'The placebo effect: real improvement from an inactive treatment due to belief in its effectiveness.' },
      { q: 'What is short-term memory?', opts: ['Memory lasting decades','Limited capacity memory holding information briefly','Emotional memory','Procedural skill memory'], a: 1, difficulty: 'easy', explanation: 'Short-term (working) memory holds limited information briefly. Capacity is approximately 7±2 chunks.' },
      { q: 'What is social psychology?', opts: ['Individual mental disorders','Study of how people think and behave in social situations','Study of child development','Study of brain structures'], a: 1, difficulty: 'easy', explanation: 'Social psychology examines how thoughts, feelings, and behaviours are influenced by others.' }
    ]
  },
  'HIS 101': {
    icon: '🏛️', color: 'rgba(255,122,69,.1)',
    description: 'History — World History & African History',
    questions: [
      { q: 'When did Nigeria gain independence?', opts: ['1957','1960','1963','1966'], a: 1, difficulty: 'easy', explanation: 'Nigeria gained independence from British rule on October 1, 1960.' },
      { q: 'First President of independent Nigeria?', opts: ['Nnamdi Azikiwe','Tafawa Balewa','Obafemi Awolowo','Ahmadu Bello'], a: 0, difficulty: 'medium', explanation: 'Dr. Nnamdi Azikiwe became Nigeria\'s first President on October 1, 1963.' },
      { q: 'What was the Transatlantic Slave Trade?', opts: ['Trade of goods across the Atlantic','Forced transportation of Africans to Americas as enslaved labour','European trade route to India','South American trade network'], a: 1, difficulty: 'easy', explanation: 'The Transatlantic Slave Trade forced an estimated 12-15 million Africans to the Americas.' },
      { q: 'What was the Berlin Conference of 1884-85?', opts: ['Peace treaty after WWI','Meeting where European powers divided Africa','Formation of the African Union','End of slavery in Africa'], a: 1, difficulty: 'medium', explanation: 'The Berlin Conference formalised the "Scramble for Africa" — European powers divided Africa without African input.' },
      { q: 'When did World War II end?', opts: ['1943','1944','1945','1946'], a: 2, difficulty: 'easy', explanation: 'WWII ended in 1945 — Germany surrendered May 8 and Japan September 2.' },
      { q: 'Who was Nelson Mandela?', opts: ['First President of Kenya','South African anti-apartheid leader and first democratically elected President','Nigerian independence leader','Ghanaian independence leader'], a: 1, difficulty: 'easy', explanation: 'Nelson Mandela was imprisoned 27 years for fighting apartheid, then became South Africa\'s first democratically elected President.' },
      { q: 'What was the Cold War?', opts: ['A war in Arctic regions','Geopolitical tension between USA and USSR after WWII','A war between China and Japan','Economic competition between EU and USA'], a: 1, difficulty: 'medium', explanation: 'The Cold War (1947-1991) was ideological tension between USA (capitalism) and USSR (communism).' },
      { q: 'When was the United Nations founded?', opts: ['1919','1939','1945','1955'], a: 2, difficulty: 'medium', explanation: 'The United Nations was founded on October 24, 1945, following WWII.' },
      { q: 'What is colonialism?', opts: ['Free trade between nations','Practice of acquiring control over another country and exploiting it','Cultural exchange programme','Military alliance'], a: 1, difficulty: 'easy', explanation: 'Colonialism is a nation acquiring and maintaining control over another territory, exploiting its resources.' },
      { q: 'Who was Kwame Nkrumah?', opts: ['First President of Nigeria','First President of Ghana and pan-African leader','South African freedom fighter','Kenyan independence leader'], a: 1, difficulty: 'medium', explanation: 'Kwame Nkrumah led Ghana to independence from Britain in 1957 and was a major advocate of Pan-Africanism.' }
    ]
  },
  'CSC 201': {
    icon: '💾', color: 'rgba(56,189,248,.1)',
    description: 'Computer Science — Data Structures & Algorithms',
    questions: [
      { q: 'What is a data structure?', opts: ['A programming language','A way of organising and storing data for efficient access','A type of computer hardware','A software design pattern'], a: 1, difficulty: 'easy', explanation: 'A data structure is a format for organising and storing data. Examples: arrays, linked lists, stacks, trees.' },
      { q: 'What is Big O notation?', opts: ['A grade for code quality','A way to describe algorithm time/space complexity','A type of loop','A database query language'], a: 1, difficulty: 'medium', explanation: 'Big O notation describes the upper bound of algorithm complexity as input grows.' },
      { q: 'What is a stack?', opts: ['First In, First Out (FIFO)','Last In, First Out (LIFO)','Random access structure','Sorted list'], a: 1, difficulty: 'easy', explanation: 'A stack follows LIFO (Last In, First Out). Operations are push (add) and pop (remove).' },
      { q: 'What is a queue?', opts: ['Last In, First Out','First In, First Out (FIFO)','Sorted priority structure','Random access'], a: 1, difficulty: 'easy', explanation: 'A queue follows FIFO (First In, First Out) like a queue of people.' },
      { q: 'What is recursion?', opts: ['A type of loop','A function that calls itself','A sorting algorithm','A data storage method'], a: 1, difficulty: 'medium', explanation: 'Recursion is a technique where a function calls itself to solve a smaller instance of the same problem.' },
      { q: 'What is binary search?', opts: ['Searching all elements one by one','Dividing sorted data in half to find target','Searching using two pointers','A database query'], a: 1, difficulty: 'medium', explanation: 'Binary search works on sorted arrays by repeatedly halving the search space. Time complexity: O(log n).' },
      { q: 'What is a linked list?', opts: ['List stored in array','Sequence of nodes where each points to next','A sorted array','A fixed-size list'], a: 1, difficulty: 'medium', explanation: 'A linked list is a linear structure where each node contains data and a pointer to the next node.' },
      { q: 'What does OOP stand for?', opts: ['Output Oriented Programming','Object Oriented Programming','Open Online Processing','Operational Order of Programs'], a: 1, difficulty: 'easy', explanation: 'OOP (Object-Oriented Programming) bundles data and behaviour in objects.' },
      { q: 'What is a hash table?', opts: ['A sorted array','Data structure using hash function for fast key-value lookup','A type of encryption','A database index'], a: 1, difficulty: 'hard', explanation: 'A hash table uses a hash function to map keys to array indices for O(1) average-case lookup.' },
      { q: 'Difference between tree and graph?', opts: ['No difference','Tree is hierarchical graph with no cycles; graph can have cycles','Graph has no connections','Trees are for numbers; graphs for text'], a: 1, difficulty: 'hard', explanation: 'A tree is a connected, acyclic graph with hierarchy. A graph is more general and can have cycles.' }
    ]
  }
};
