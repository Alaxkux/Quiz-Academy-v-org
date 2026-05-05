/* ================================================================
   QUIZ ACADEMY — QUIZ DATA
   All built-in courses. Users can also add custom ones via
   Course Builder or by uploading a PDF / JSON.
   ================================================================ */

export const QUIZ_DATA = {
  'IFT 203': {
    icon: '💻', color: 'rgba(108,142,255,.12)',
    description: 'Web Technologies — HTML, CSS & JavaScript',
    questions: [
      { q: 'What does HTML stand for?', opts: ['Hyper Text Markup Language','High Tech Modern Language','Home Tool Markup Language','Hyperlinks and Text Markup Language'], a: 0, difficulty: 'easy', explanation: 'HTML stands for Hyper Text Markup Language — the standard language for creating web content.' },
      { q: 'Which HTML tag is used for the largest heading?', opts: ['<h6>','<heading>','<h1>','<head>'], a: 2, difficulty: 'easy', explanation: '<h1> is the largest heading tag. Headings go from h1 (largest) to h6 (smallest).' },
      { q: 'What does CSS stand for?', opts: ['Creative Style Sheets','Cascading Style Sheets','Computer Style Sheets','Colorful Style Sheets'], a: 1, difficulty: 'easy', explanation: 'CSS stands for Cascading Style Sheets — it controls the visual presentation of HTML elements.' },
      { q: 'Which CSS property changes background color?', opts: ['color','bgcolor','background-color','background'], a: 2, difficulty: 'easy', explanation: 'background-color sets the background color. The color property only changes text color.' },
      { q: 'What is the correct way to declare a JavaScript variable?', opts: ['variable myVar','var myVar','v myVar','declare myVar'], a: 1, difficulty: 'easy', explanation: 'Variables are declared using var, let, or const.' },
      { q: 'Which symbol is used for single-line comments in JavaScript?', opts: ['//','/*','#','--'], a: 0, difficulty: 'easy', explanation: '// is for single-line comments. /* */ is for multi-line comments.' },
      { q: 'What is the correct HTML for a hyperlink?', opts: ['<a url="...">Link</a>','<a href="...">Link</a>','<a>url</a>','<link>url</link>'], a: 1, difficulty: 'medium', explanation: 'The <a> tag with href attribute creates a hyperlink.' },
      { q: 'Which CSS property controls text size?', opts: ['text-size','font-size','text-style','font-style'], a: 1, difficulty: 'easy', explanation: 'font-size controls text size.' },
      { q: 'What does DOM stand for?', opts: ['Document Object Model','Data Object Module','Display Object Manager','Document Order Model'], a: 0, difficulty: 'medium', explanation: 'DOM stands for Document Object Model.' },
      { q: 'Which HTML attribute specifies alternate text for an image?', opts: ['title','src','alt','longdesc'], a: 2, difficulty: 'easy', explanation: 'The alt attribute provides alternative text when an image cannot be displayed.' },
      { q: 'What does "em" unit represent in CSS?', opts: ['Height of letter E','Relative to font-size of element','Equal to 1 pixel','Percentage of parent width'], a: 1, difficulty: 'medium', explanation: '"em" is a relative unit equal to the font-size of the current element.' },
      { q: 'What is event bubbling in JavaScript?', opts: ['An event that fires repeatedly','Events propagating from child to parent','Events firing in reverse','A type of animation event'], a: 1, difficulty: 'hard', explanation: 'Event bubbling means an event on a child element propagates up through parent elements.' },
      { q: 'Which CSS selector selects all <p> inside a <div>?', opts: ['div + p','div > p','div p','div, p'], a: 2, difficulty: 'medium', explanation: '"div p" is the descendant selector.' },
      { q: 'What does the async attribute do on a <script> tag?', opts: ['Runs script after page loads','Loads and executes script asynchronously','Prevents script from running','Runs script multiple times'], a: 1, difficulty: 'hard', explanation: 'async downloads the script asynchronously while HTML continues parsing.' },
      { q: 'Which JavaScript method adds an element to the end of an array?', opts: ['add()','append()','push()','insert()'], a: 2, difficulty: 'easy', explanation: 'push() adds elements to the end of an array.' },
    ],
  },
  'IFT 201': {
    icon: '🛒', color: 'rgba(77,255,195,.1)',
    description: 'E-Business — E-Commerce Models & Digital Trade',
    questions: [
      { q: 'What does E-commerce stand for?', opts: ['Electronic Commerce','Easy Commerce','European Commerce','Enterprise Commerce'], a: 0, difficulty: 'easy', explanation: 'E-commerce stands for Electronic Commerce.' },
      { q: 'Which is NOT an e-business model?', opts: ['B2B','B2C','C2C','D2D'], a: 3, difficulty: 'easy', explanation: 'D2D is not a standard e-business model.' },
      { q: 'What is B2B e-commerce?', opts: ['Business to Business','Business to Bank','Buyer to Buyer','Business to Broker'], a: 0, difficulty: 'easy', explanation: 'B2B means Business to Business.' },
      { q: 'Most common payment method in e-commerce?', opts: ['Cash on Delivery','Credit/Debit Cards','Barter','Checks'], a: 1, difficulty: 'easy', explanation: 'Credit and debit cards remain the most widely used payment method.' },
      { q: 'What does SSL stand for?', opts: ['Secure Socket Layer','Simple Security Layer','Safe Site Login','Secure System Link'], a: 0, difficulty: 'medium', explanation: 'SSL stands for Secure Socket Layer.' },
      { q: 'Which is an example of C2C e-commerce?', opts: ['Amazon','eBay marketplace','Walmart','Dell'], a: 1, difficulty: 'easy', explanation: 'eBay is a classic C2C platform.' },
      { q: 'What is digital marketing?', opts: ['Marketing using digital technologies','Marketing digital products only','Marketing through digitization','Marketing for tech companies'], a: 0, difficulty: 'easy', explanation: 'Digital marketing uses digital channels to connect with customers.' },
      { q: 'Which is NOT a benefit of e-business?', opts: ['Global reach','Lower costs','Physical product inspection','24/7 availability'], a: 2, difficulty: 'easy', explanation: 'Physical product inspection is a limitation of e-commerce.' },
      { q: 'What is an online marketplace?', opts: ['A physical market online','Platform connecting buyers and sellers','An online advertisement','A social media platform'], a: 1, difficulty: 'easy', explanation: 'An online marketplace connects multiple sellers with buyers.' },
      { q: 'Which protocol is used for secure online transactions?', opts: ['HTTP','FTP','HTTPS','SMTP'], a: 2, difficulty: 'medium', explanation: 'HTTPS uses SSL/TLS encryption.' },
      { q: 'What does SEO stand for?', opts: ['Search Engine Optimization','Site Engine Operation','Secure Email Output','Social Engagement Outreach'], a: 0, difficulty: 'medium', explanation: 'SEO stands for Search Engine Optimization.' },
      { q: 'What is a clickthrough rate (CTR)?', opts: ['How fast a page loads','Ratio of clicks to impressions','Number of visitors per day','Percentage of returning users'], a: 1, difficulty: 'hard', explanation: 'CTR = (Clicks / Impressions) × 100.' },
      { q: 'Which strategy involves selling related products to increase sale value?', opts: ['Remarketing','Cross-selling','Affiliate marketing','Dropshipping'], a: 1, difficulty: 'medium', explanation: 'Cross-selling suggests related products to a customer.' },
      { q: 'What is dropshipping?', opts: ['Fast delivery service','Selling products without holding inventory','Shipping damaged goods','Bulk order discount'], a: 1, difficulty: 'medium', explanation: 'Dropshipping means selling without stocking inventory.' },
      { q: 'What is affiliate marketing?', opts: ['Marketing by friends','Earning commission by promoting others products','Selling your own products','Email marketing campaigns'], a: 1, difficulty: 'medium', explanation: 'Affiliate marketing earns commission by promoting another company\'s products.' },
    ],
  },
  'IFT 211': {
    icon: '📝', color: 'rgba(245,200,66,.1)',
    description: 'Computer Based Testing — CBT Systems & Assessment',
    questions: [
      { q: 'What does CBT stand for in education?', opts: ['Computer Based Training','Computer Based Testing','Core Business Technology','Central Business Tool'], a: 1, difficulty: 'easy', explanation: 'In education, CBT stands for Computer Based Testing.' },
      { q: 'Which is an advantage of CBT?', opts: ['Immediate feedback','Requires internet always','More expensive','Less secure'], a: 0, difficulty: 'easy', explanation: 'Immediate feedback is a major advantage.' },
      { q: 'Primary purpose of CBT in education?', opts: ['Entertainment','Assessment and evaluation','Social networking','Data storage'], a: 1, difficulty: 'easy', explanation: 'CBT is primarily used for assessment and evaluation.' },
      { q: 'Which is NOT essential for CBT?', opts: ['Computer system','Questions database','Physical textbooks','Software interface'], a: 2, difficulty: 'easy', explanation: 'Physical textbooks are not essential for CBT.' },
      { q: 'What is adaptive testing in CBT?', opts: ['Test that adapts to student performance','Test you can take anytime','Test with video questions','Test that changes daily'], a: 0, difficulty: 'medium', explanation: 'Adaptive testing adjusts question difficulty based on performance.' },
      { q: 'Which question type is easiest to auto-grade?', opts: ['Essay','Multiple choice','Oral examination','Project work'], a: 1, difficulty: 'easy', explanation: 'Multiple choice questions are easiest to auto-grade.' },
      { q: 'Key security feature in CBT?', opts: ['Open book policy','User authentication','No time limits','Public access'], a: 1, difficulty: 'medium', explanation: 'User authentication verifies the right person is taking the test.' },
      { q: 'How does CBT benefit examiners?', opts: ['Less preparation time','Automatic grading','No need for questions','Eliminates all cheating'], a: 1, difficulty: 'easy', explanation: 'Automatic grading saves significant time.' },
      { q: 'What is randomization in CBT?', opts: ['Random test dates','Random question order','Random grading','Random students'], a: 1, difficulty: 'medium', explanation: 'Randomization presents questions in different orders for each student.' },
      { q: 'Challenge of CBT?', opts: ['Too easy to use','Technical failures','Too much feedback','Too flexible'], a: 1, difficulty: 'easy', explanation: 'Technical failures can disrupt examinations.' },
      { q: 'What does LMS stand for?', opts: ['Learning Management System','Lecture Monitor Software','Laboratory Measurement Standard','Language Module Server'], a: 0, difficulty: 'medium', explanation: 'LMS stands for Learning Management System.' },
      { q: 'What is item banking in CBT?', opts: ['Saving money for CBT','Database of test questions','A type of security system','Banking questions during exam'], a: 1, difficulty: 'medium', explanation: 'Item banking stores a large pool of test questions.' },
      { q: 'Difference between formative and summative assessment?', opts: ['Formative is harder','Summative is ongoing, formative is final','Formative is ongoing, summative is final','No difference'], a: 2, difficulty: 'hard', explanation: 'Formative is ongoing; summative is at the end.' },
      { q: 'Which CBT question type tests higher-order thinking?', opts: ['True/False','Fill in the blank','Multiple choice','Case study analysis'], a: 3, difficulty: 'hard', explanation: 'Case study analysis tests higher levels of Bloom\'s Taxonomy.' },
      { q: 'What is proctoring in CBT?', opts: ['Creating questions','Monitoring exam-takers to prevent cheating','Grading answers','Publishing results'], a: 1, difficulty: 'medium', explanation: 'Proctoring monitors test-takers during an examination.' },
    ],
  },
  'ENT 211': {
    icon: '💼', color: 'rgba(255,107,138,.1)',
    description: 'Entrepreneurship — Business & Innovation',
    questions: [
      { q: 'What is entrepreneurship?', opts: ['Working for a company','Starting and managing a business','Investing in stocks','Teaching business'], a: 1, difficulty: 'easy', explanation: 'Entrepreneurship is the process of starting and managing a business.' },
      { q: 'Which is a characteristic of an entrepreneur?', opts: ['Risk aversion','Innovation','Dependence','Rigidity'], a: 1, difficulty: 'easy', explanation: 'Innovation is a core characteristic.' },
      { q: 'What is a business plan?', opts: ['Daily to-do list','Document outlining business strategy','Employee schedule','Product catalog'], a: 1, difficulty: 'easy', explanation: 'A business plan describes company goals and strategy.' },
      { q: 'Which is NOT a source of business capital?', opts: ['Personal savings','Bank loans','Investors','Customer complaints'], a: 3, difficulty: 'easy', explanation: 'Customer complaints are feedback, not capital.' },
      { q: 'What does SME stand for?', opts: ['Small Marketing Enterprise','Small and Medium Enterprises','Super Marketing Effort','Sales and Marketing Entity'], a: 1, difficulty: 'easy', explanation: 'SME stands for Small and Medium Enterprises.' },
      { q: 'What is a unique selling proposition (USP)?', opts: ['Cheapest price','What makes your product different','Your sales target','Your office location'], a: 1, difficulty: 'medium', explanation: 'A USP is what makes your product different from competitors.' },
      { q: 'Which is a fixed cost in business?', opts: ['Raw materials','Rent','Electricity based on usage','Sales commissions'], a: 1, difficulty: 'medium', explanation: 'Rent is a fixed cost.' },
      { q: 'What is market research?', opts: ['Selling in markets','Gathering information about customers and competitors','Marketing your research','Researching stock markets'], a: 1, difficulty: 'easy', explanation: 'Market research gathers information about customers and trends.' },
      { q: 'What is bootstrapping in entrepreneurship?', opts: ['Self-funding your business','Closing your business','Hiring quickly','Expanding rapidly'], a: 0, difficulty: 'medium', explanation: 'Bootstrapping means funding your business using personal savings.' },
      { q: 'What is a startup?', opts: ['Any new business','Young company seeking scalable business model','A government business','A large corporation'], a: 1, difficulty: 'medium', explanation: 'A startup is a young company seeking a scalable model.' },
      { q: 'What does ROI stand for?', opts: ['Rate of Income','Return on Investment','Revenue on Interest','Rate of Inflation'], a: 1, difficulty: 'medium', explanation: 'ROI = (Net Profit / Cost of Investment) × 100.' },
      { q: 'What is a SWOT analysis?', opts: ['Sales, Work, Output, Target','Strengths, Weaknesses, Opportunities, Threats','Strategy, Win, Optimize, Track','None of these'], a: 1, difficulty: 'medium', explanation: 'SWOT stands for Strengths, Weaknesses, Opportunities, Threats.' },
      { q: 'Difference between revenue and profit?', opts: ['They are the same','Revenue is total income; profit is what remains after expenses','Profit is higher than revenue','Revenue is only from products'], a: 1, difficulty: 'medium', explanation: 'Revenue is total income. Profit is what remains after deducting costs.' },
      { q: 'What is venture capital?', opts: ['Personal savings','Money from friends','Funding for startups with high growth potential','Government grants'], a: 2, difficulty: 'hard', explanation: 'Venture capital is financing for high-growth startups.' },
      { q: 'What is the break-even point?', opts: ['Maximum profit point','When total revenue equals total costs','When sales start declining','The first profitable month'], a: 1, difficulty: 'medium', explanation: 'Break-even is where total revenue equals total costs.' },
    ],
  },
  'General': {
    icon: '🎓', color: 'rgba(108,142,255,.06)',
    description: 'General Computing — IT Fundamentals',
    questions: [
      { q: 'What is an algorithm?', opts: ['A programming language','Step-by-step problem-solving procedure','A type of computer','A software application'], a: 1, difficulty: 'easy', explanation: 'An algorithm is a step-by-step set of instructions for solving a problem.' },
      { q: 'Which of these is an operating system?', opts: ['Microsoft Word','Windows','Chrome','Excel'], a: 1, difficulty: 'easy', explanation: 'Windows is an operating system.' },
      { q: 'What does RAM stand for?', opts: ['Random Access Memory','Read Access Memory','Rapid Access Memory','Run Access Memory'], a: 0, difficulty: 'easy', explanation: 'RAM stands for Random Access Memory.' },
      { q: 'What is cloud computing?', opts: ['Computing in the sky','Storing and accessing data over the internet','Weather prediction','A type of software'], a: 1, difficulty: 'easy', explanation: 'Cloud computing delivers services over the internet.' },
      { q: 'Which device is used for input?', opts: ['Monitor','Printer','Keyboard','Speaker'], a: 2, difficulty: 'easy', explanation: 'A keyboard is an input device.' },
      { q: 'What is binary code?', opts: ['Two programming languages','Code using 0s and 1s','Double coding','Code with two files'], a: 1, difficulty: 'easy', explanation: 'Binary code uses only 0 and 1.' },
      { q: 'What is a database?', opts: ['Base of data','Organized collection of data','Data at the bottom','Basic data'], a: 1, difficulty: 'easy', explanation: 'A database is an organized collection of data.' },
      { q: 'Which is a high-level programming language?', opts: ['Machine code','Assembly','Python','Binary'], a: 2, difficulty: 'easy', explanation: 'Python is a high-level language.' },
      { q: 'What does URL stand for?', opts: ['Universal Resource Locator','Uniform Resource Locator','United Resource Link','Universal Reference Link'], a: 1, difficulty: 'medium', explanation: 'URL stands for Uniform Resource Locator.' },
      { q: 'What is cybersecurity?', opts: ['Security for robots','Protecting systems from digital attacks','Internet speed','Computer hardware'], a: 1, difficulty: 'easy', explanation: 'Cybersecurity protects systems from digital attacks.' },
    ],
  },
  'MTH 101': {
    icon: '🧮', color: 'rgba(56,189,248,.1)',
    description: 'Mathematics — Algebra, Calculus & Statistics',
    questions: [
      { q: 'What is the derivative of x²?', opts: ['x','2x','x²','2'], a: 1, difficulty: 'easy', explanation: 'Using the power rule: d/dx(x²) = 2x.' },
      { q: 'What is the value of π to 2 decimal places?', opts: ['3.14','3.41','3.12','3.16'], a: 0, difficulty: 'easy', explanation: 'Pi (π) ≈ 3.14159...' },
      { q: 'Solve: 2x + 6 = 14. What is x?', opts: ['3','4','5','6'], a: 1, difficulty: 'easy', explanation: '2x = 8, so x = 4.' },
      { q: 'What is the integral of 1/x dx?', opts: ['x','ln|x| + C','1/x² + C','-1/x + C'], a: 1, difficulty: 'medium', explanation: '∫(1/x)dx = ln|x| + C.' },
      { q: 'What is 5! (5 factorial)?', opts: ['20','60','120','720'], a: 2, difficulty: 'easy', explanation: '5! = 120.' },
      { q: 'Mean of: 4, 8, 6, 10, 2?', opts: ['5','6','7','8'], a: 1, difficulty: 'easy', explanation: 'Mean = 30/5 = 6.' },
      { q: 'What is the Pythagorean theorem?', opts: ['a+b=c','a²+b²=c²','a²-b²=c²','ab=c²'], a: 1, difficulty: 'easy', explanation: 'a² + b² = c².' },
      { q: 'What is log₁₀(1000)?', opts: ['2','3','4','10'], a: 1, difficulty: 'medium', explanation: 'log₁₀(1000) = 3.' },
      { q: 'Quadratic formula for ax²+bx+c=0?', opts: ['x = (-b ± √(b²-4ac)) / 2a','x = (b ± √(b²+4ac)) / 2a','x = (-b ± √(b+4ac)) / 2a','x = b/2a'], a: 0, difficulty: 'medium', explanation: 'The quadratic formula.' },
      { q: 'What does standard deviation measure?', opts: ['Average value','Middle value','Spread of data from mean','Most frequent value'], a: 2, difficulty: 'medium', explanation: 'Standard deviation measures spread from the mean.' },
    ],
  },
  'PHY 101': {
    icon: '⚡', color: 'rgba(245,200,66,.1)',
    description: 'Physics — Mechanics, Waves & Electricity',
    questions: [
      { q: "What is Newton's First Law?", opts: ['F = ma','Object stays at rest or motion unless acted upon','For every action there is equal reaction','Energy cannot be created or destroyed'], a: 1, difficulty: 'easy', explanation: "Newton's First Law: Inertia." },
      { q: 'Unit of electric current?', opts: ['Volt','Ohm','Ampere','Watt'], a: 2, difficulty: 'easy', explanation: 'Amperes (A).' },
      { q: 'Speed of light in a vacuum?', opts: ['3 × 10⁶ m/s','3 × 10⁸ m/s','3 × 10¹⁰ m/s','3 × 10⁴ m/s'], a: 1, difficulty: 'medium', explanation: '3 × 10⁸ metres per second.' },
      { q: "What is Ohm's Law?", opts: ['P = IV','V = IR','E = mc²','F = ma'], a: 1, difficulty: 'easy', explanation: 'V = IR.' },
      { q: 'What type of wave is sound?', opts: ['Transverse wave','Electromagnetic wave','Longitudinal wave','Standing wave'], a: 2, difficulty: 'medium', explanation: 'Sound is a longitudinal wave.' },
      { q: 'What does E = mc² represent?', opts: ["Newton's Second Law",'Mass-energy equivalence','Gravitational potential energy','Kinetic energy'], a: 1, difficulty: 'medium', explanation: 'Mass-energy equivalence.' },
      { q: 'Unit of force?', opts: ['Joule','Watt','Newton','Pascal'], a: 2, difficulty: 'easy', explanation: 'Newtons (N).' },
      { q: 'Frequency of a wave with period 0.02s?', opts: ['2 Hz','20 Hz','50 Hz','200 Hz'], a: 2, difficulty: 'medium', explanation: 'f = 1/T = 50 Hz.' },
      { q: 'Which lens converges light rays?', opts: ['Concave lens','Convex lens','Plane lens','Diverging lens'], a: 1, difficulty: 'easy', explanation: 'A convex lens converges.' },
      { q: 'Formula for gravitational potential energy?', opts: ['½mv²','mgh','F×d','P×V'], a: 1, difficulty: 'easy', explanation: 'PE = mgh.' },
    ],
  },
  'BIO 101': {
    icon: '🔬', color: 'rgba(77,255,195,.1)',
    description: 'Biology — Cell Biology, Genetics & Ecology',
    questions: [
      { q: 'Powerhouse of the cell?', opts: ['Nucleus','Ribosome','Mitochondria','Chloroplast'], a: 2, difficulty: 'easy', explanation: 'Mitochondria produce ATP.' },
      { q: 'Process by which plants make food using sunlight?', opts: ['Respiration','Fermentation','Photosynthesis','Transpiration'], a: 2, difficulty: 'easy', explanation: 'Photosynthesis.' },
      { q: 'What carries genetic information in most organisms?', opts: ['RNA','DNA','Protein','Lipid'], a: 1, difficulty: 'easy', explanation: 'DNA carries genetic information.' },
      { q: 'Basic unit of life?', opts: ['Atom','Molecule','Cell','Organ'], a: 2, difficulty: 'easy', explanation: 'The cell is the basic unit of life.' },
      { q: 'What does DNA stand for?', opts: ['Deoxyribonucleic Acid','Dinitrogen Acid','Dextrose Nitrogen Acid','Dinuclear Acid'], a: 0, difficulty: 'easy', explanation: 'Deoxyribonucleic Acid.' },
      { q: 'Blood cells responsible for immune response?', opts: ['Red blood cells','Platelets','White blood cells','Plasma cells'], a: 2, difficulty: 'easy', explanation: 'White blood cells fight pathogens.' },
      { q: "Mendel's Law of Segregation?", opts: ['Traits blend in offspring','Each organism has two alleles that separate during gamete formation','Dominant traits always appear','Genes are linked on chromosomes'], a: 1, difficulty: 'medium', explanation: 'Alleles separate during gamete formation.' },
      { q: 'What is an ecosystem?', opts: ['All plants in an area','All animals in a region','Community of living organisms and their physical environment','A single species population'], a: 2, difficulty: 'medium', explanation: 'An ecosystem includes organisms and their environment.' },
      { q: 'Function of ribosomes?', opts: ['Cell division','Protein synthesis','Energy production','DNA replication'], a: 1, difficulty: 'medium', explanation: 'Ribosomes synthesize proteins.' },
      { q: 'What is homeostasis?', opts: ['Cell reproduction','Maintaining stable internal conditions','Genetic mutation','Energy release'], a: 1, difficulty: 'medium', explanation: 'Homeostasis maintains internal stability.' },
    ],
  },
  "IFT 212": {
    "icon": "💻",
    "color": "rgba(59, 130, 246, 0.1)",
    "description": "Computer Architecture & Organization — CPU Design, ISA & Instruction Cycles",
    "questions": [
      {
        "q": "What is the primary focus of Computer Architecture compared to Organization?",
        "opts": ["Physical interconnection", "Logical and functional design visible to the programmer", "Chip manufacturing", "High-level language syntax"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "Architecture defines the system's attributes as seen by a programmer, like instruction sets and word sizes."
      },
      {
        "q": "Which unit is the 'nerve center' of the CPU, generating timing signals?",
        "opts": ["ALU", "Program Counter", "Control Unit", "MAR"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "The Control Unit (CU) coordinates all hardware operations by generating timing and control signals."
      },
      {
        "q": "What defines the Von Neumann Architecture?",
        "opts": ["Separate data/instruction memory", "Shared bus and memory for data and instructions", "No registers", "Single-cycle execution"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "Von Neumann systems use a single physical memory and bus for both instructions and data."
      },
      {
        "q": "What does the 'opcode' in an instruction specify?",
        "opts": ["Data address", "Register number", "The specific operation to perform", "Execution time"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "The operation code (opcode) defines the specific task, such as addition or a jump."
      },
      {
        "q": "Which addressing mode embeds the operand value directly in the instruction?",
        "opts": ["Direct", "Indirect", "Indexed", "Immediate"],
        "a": 3,
        "difficulty": "medium",
        "explanation": "Immediate addressing includes the actual constant value within the instruction itself."
      },
      {
        "q": "In which cycle stage is an instruction translated into control signals?",
        "opts": ["Fetch", "Decode", "Execute", "Write-back"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "During the decode stage, the CU interprets the opcode and prepares the necessary hardware paths."
      },
      {
        "q": "Which register holds the address of the next instruction to be fetched?",
        "opts": ["Instruction Register", "Program Counter", "Accumulator", "Memory Data Register"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "The Program Counter (PC) tracks the memory location of the next instruction in the sequence."
      },
      {
        "q": "What is a major advantage of CISC over RISC?",
        "opts": ["Lower instruction count per program", "Easier pipelining", "Faster single-cycle execution", "Simpler hardware"],
        "a": 0,
        "difficulty": "hard",
        "explanation": "CISC uses complex instructions that do more per line, resulting in shorter programs in terms of instruction count."
      },
      {
        "q": "Which unit is specialized for non-integer, decimal math?",
        "opts": ["ALU", "FPU", "MMU", "AGU"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The Floating Point Unit (FPU) handles high-precision calculations involving real numbers."
      },
      {
        "q": "In Load/Store architecture, where must operands be for an ADD instruction?",
        "opts": ["In RAM", "In the stack", "In registers", "In the cache"],
        "a": 2,
        "difficulty": "hard",
        "explanation": "Load/Store architectures require data to be moved into registers before any arithmetic operation can occur."
      },
      {
        "q": "What is the 'Harvard Architecture' known for?",
        "opts": ["Unified memory for data and instructions", "Physically separate storage and signal pathways for instructions and data", "Lack of a Control Unit", "Exclusively using magnetic tape"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "Harvard architecture uses separate memory spaces, allowing the CPU to fetch an instruction and data simultaneously."
      },
      {
        "q": "Which register stores the instruction currently being decoded or executed?",
        "opts": ["Program Counter (PC)", "Memory Address Register (MAR)", "Instruction Register (IR)", "Accumulator (AC)"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "The IR holds the actual instruction bits so the Control Unit can decode them."
      },
      {
        "q": "What occurs during the 'Fetch' stage of the instruction cycle?",
        "opts": ["The ALU performs a calculation", "The result is written to RAM", "The instruction is moved from memory to the CPU", "The opcode is translated"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "Fetching is the process of retrieving an instruction from the memory address pointed to by the PC."
      },
      {
        "q": "What is the primary function of the Memory Address Register (MAR)?",
        "opts": ["To store data retrieved from memory", "To hold the address of the location in memory to be accessed", "To perform logical AND operations", "To count the number of instructions"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The MAR holds the specific memory coordinates that the CPU wants to read from or write to."
      },
      {
        "q": "Which type of ISA generally has a fixed instruction length?",
        "opts": ["CISC", "RISC", "Von Neumann", "Harvard"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "RISC (Reduced Instruction Set Computer) typically uses fixed-length instructions to simplify fetching and pipelining."
      },
      {
        "q": "What is the 'Von Neumann Bottleneck'?",
        "opts": ["Excessive CPU heat", "Limited throughput between the CPU and memory due to a shared bus", "Slow hard drive speeds", "Software bugs in the OS"],
        "a": 1,
        "difficulty": "hard",
        "explanation": "Because instructions and data share the same bus, the CPU often has to wait for one to finish before accessing the other."
      },
      {
        "q": "Which component is responsible for arithmetic operations and logical comparisons?",
        "opts": ["Control Unit", "Registers", "ALU", "Bus Interface"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "The Arithmetic Logic Unit (ALU) is the 'calculator' of the CPU."
      },
      {
        "q": "What does a 'Register Indirect' addressing mode use to find data?",
        "opts": ["A constant value in the instruction", "The value stored in a register as a memory address", "The Program Counter", "A direct link to the I/O port"],
        "a": 1,
        "difficulty": "hard",
        "explanation": "In indirect mode, the register doesn't hold the data itself, but rather the 'pointer' or address where the data lives."
      },
      {
        "q": "Which bus is used to specify which hardware device the CPU wants to communicate with?",
        "opts": ["Data Bus", "Address Bus", "Control Bus", "USB"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The Address Bus carries the location information for memory or I/O devices."
      },
      {
        "q": "What is the purpose of the 'Write-back' stage?",
        "opts": ["To fetch the next instruction", "To update memory or registers with the result of an operation", "To clear the cache", "To reset the Program Counter"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "Write-back is the final stage where the computed result is saved to its destination."
      },
      {
        "q": "In a 32-bit architecture, what does '32-bit' usually refer to?",
        "opts": ["The physical size of the CPU", "The width of the data registers and ALU", "The number of cores", "The speed of the fan"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "The word size (e.g., 32-bit) refers to the size of data the CPU can process internally at once."
      },
      {
        "q": "Which register acts as a buffer for data being sent to or received from memory?",
        "opts": ["MAR", "MDR", "PC", "IR"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The Memory Data Register (MDR) or Memory Buffer Register (MBR) holds the actual data payload."
      },
      {
        "q": "What defines a 'Superscalar' processor?",
        "opts": ["It can execute multiple instructions per clock cycle", "It has a very large clock speed", "It uses only one register", "It is waterproof"],
        "a": 0,
        "difficulty": "hard",
        "explanation": "Superscalar architectures have multiple execution units to process several instructions simultaneously."
      },
      {
        "q": "Which of the following is a characteristic of RISC?",
        "opts": ["Complex instructions taking multiple cycles", "Large number of addressing modes", "Emphasis on efficient pipelining", "Highly integrated microcode"],
        "a": 2,
        "difficulty": "medium",
        "explanation": "RISC focuses on simple, single-cycle instructions that are easy to pipeline for higher performance."
      },
      {
        "q": "What happens to the Program Counter (PC) after a fetch operation?",
        "opts": ["It resets to zero", "It stays the same", "It is incremented to point to the next instruction", "It is cleared"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "The PC automatically advances so the CPU knows where to go after the current instruction is done."
      },
      {
        "q": "Which part of the CPU decodes the instruction?",
        "opts": ["ALU", "Control Unit", "Main Memory", "System Bus"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "The Control Unit includes the decoder that interprets the instruction's bit pattern."
      },
      {
        "q": "What is 'Pipelining' in computer architecture?",
        "opts": ["Cooling the CPU with liquid", "Overlapping the execution of multiple instructions", "Connecting multiple CPUs together", "Increasing the size of the hard drive"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "Pipelining allows different stages of multiple instructions to happen at the same time, like an assembly line."
      },
      {
        "q": "Which addressing mode is most efficient for accessing arrays?",
        "opts": ["Immediate", "Direct", "Indexed", "Absolute"],
        "a": 2,
        "difficulty": "hard",
        "explanation": "Indexed addressing uses a base address plus an offset, which is ideal for stepping through array elements."
      },
      {
        "q": "What is the function of the 'Status Register' (Flags)?",
        "opts": ["To hold the CPU's serial number", "To store information about the outcome of the last ALU operation", "To control the power supply", "To store the user's password"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "Flags (like Zero, Carry, Negative) indicate the results of calculations for conditional branching."
      },
      {
        "q": "What type of memory is directly accessible by the CPU and very fast, but small?",
        "opts": ["Hard Drive", "Registers", "Optical Disk", "Cloud Storage"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "Registers are the fastest storage in the hierarchy, located inside the CPU itself."
      },
      {
        "q": "What is the 'Instruction Set'?",
        "opts": ["The manual for the computer", "the complete set of all the instructions in machine code that can be recognized and executed by a central processing unit", "A collection of software apps", "A group of programmers"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "The ISA is the interface between the hardware and the software."
      },
      {
        "q": "Which bus carries signals like 'Read' or 'Write' to memory?",
        "opts": ["Data Bus", "Address Bus", "Control Bus", "PCIe Bus"],
        "a": 2,
        "difficulty": "medium",
        "explanation": "The Control Bus manages the timing and synchronization of commands between components."
      },
      {
        "q": "What does 'Effective Address' mean?",
        "opts": ["The address of the CPU", "The actual physical address of an operand in memory", "A fake address used for testing", "The manufacturer's address"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The effective address is the final address calculated after applying addressing mode rules."
      },
      {
        "q": "In a CISC architecture, instructions are usually:",
        "opts": ["Variable length", "Fixed length", "Always 8 bits", "Only for math"],
        "a": 0,
        "difficulty": "medium",
        "explanation": "CISC instructions can vary in size because they can pack complex operations into a single command."
      },
      {
        "q": "What is a 'Branch' instruction used for?",
        "opts": ["To shut down the computer", "To change the flow of execution to a different part of the program", "To multiply two numbers", "To increase the clock speed"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "Branches (jumps) allow the program to skip instructions or loop based on conditions."
      },
      {
        "q": "Which architecture is common in modern microcontrollers for embedded systems?",
        "opts": ["Only Von Neumann", "Harvard Architecture", "Mainframe Architecture", "Vacuum Tube Architecture"],
        "a": 1,
        "difficulty": "hard",
        "explanation": "Harvard architecture is popular in microcontrollers because it allows simultaneous access to code and data."
      },
      {
        "q": "What is the 'Accumulator' (AC) used for?",
        "opts": ["Storing the total number of files", "Holding the intermediate results of arithmetic and logic operations", "Cooling the processor", "Managing network connections"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The Accumulator is a general-purpose register used as a primary workspace for the ALU."
      },
      {
        "q": "What does 'Word Alignment' refer to?",
        "opts": ["Storing data at memory addresses that are multiples of the word size", "Correcting spelling in a document", "Adjusting the screen resolution", "Aligning the CPU fan"],
        "a": 0,
        "difficulty": "hard",
        "explanation": "Alignment ensures that memory access is efficient by matching data boundaries to bus widths."
      },
      {
        "q": "Which component manages the interface between the CPU and external I/O devices?",
        "opts": ["ALU", "Control Unit", "I/O Controller/Module", "Instruction Register"],
        "a": 2,
        "difficulty": "medium",
        "explanation": "The I/O module acts as a bridge, translating internal CPU signals for external peripherals."
      },
      {
        "q": "What is the main goal of the 'Execute' phase?",
        "opts": ["To get a new instruction", "To carry out the operation specified by the instruction", "To turn off the power", "To delete data"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "Execution is the actual performance of the action, such as an ALU calculation or a jump."
      },
      {
        "q": "What is the primary function of the System Bus?",
        "opts": ["To provide power to the motherboard", "To act as a communication pathway between the CPU, memory, and I/O", "To store permanent user files", "To connect the computer to the internet"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "The system bus is the backbone that allows data, addresses, and control signals to move between major hardware components."
      },
      {
        "q": "Which register holds the data item currently being written to or read from memory?",
        "opts": ["Memory Buffer Register (MBR)", "Instruction Register (IR)", "Program Counter (PC)", "Status Register"],
        "a": 0,
        "difficulty": "medium",
        "explanation": "The MBR (also known as the Memory Data Register) acts as a gateway for all data entering or leaving the CPU."
      },
      {
        "q": "In a 'Big Endian' system, how is a multi-byte word stored in memory?",
        "opts": ["Least significant byte at the lowest address", "Most significant byte at the lowest address", "Bytes are stored in random order", "Only the first byte is stored"],
        "a": 1,
        "difficulty": "hard",
        "explanation": "Big Endian stores the 'big end' (most significant byte) first at the base memory address."
      },
      {
        "q": "What characterizes the 'Execute' phase of the instruction cycle?",
        "opts": ["Incrementing the Program Counter", "Retrieving the instruction from RAM", "The CPU performing the actual operation defined by the opcode", "Translating bits into control signals"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "The execute stage is where the work—such as an arithmetic calculation or data transfer—actually happens."
      },
      {
        "q": "What is 'Micro-architecture'?",
        "opts": ["The high-level software design", "The specific hardware implementation of an ISA", "The physical size of the computer case", "The type of operating system used"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "Micro-architecture refers to the internal organization of a processor that realizes a specific Instruction Set Architecture."
      },
      {
        "q": "Which addressing mode is used in the instruction 'ADD R1, R2'?",
        "opts": ["Immediate", "Direct", "Register", "Indirect"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "Register addressing specifies that the operands are located within the CPU's internal registers."
      },
      {
        "q": "What is the role of the 'Instruction Decoder'?",
        "opts": ["To perform mathematical additions", "To interpret the opcode and activate relevant hardware paths", "To store the program's output", "To speed up the clock rate"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The decoder translates the binary instruction into specific control signals for the ALU and other units."
      },
      {
        "q": "Which of these is a typical characteristic of a RISC processor?",
        "opts": ["Variable-length instructions", "Highly complex instructions", "One instruction per cycle execution goal", "Extensive use of microcode"],
        "a": 2,
        "difficulty": "medium",
        "explanation": "RISC designs aim for simplicity and speed by executing most instructions in a single clock cycle."
      },
      {
        "q": "What is the 'Word Size' of a computer?",
        "opts": ["The number of words in a text document", "The maximum number of bits the CPU can process as a single unit", "The physical length of the data bus in centimeters", "The size of the hard drive"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "Word size defines the internal register width and the capacity of the ALU."
      },
      {
        "q": "In the Von Neumann model, where are instructions stored?",
        "opts": ["In a separate 'Instruction-only' memory", "In the same memory as data", "Only within the CPU registers", "On an external server"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "A hallmark of Von Neumann architecture is that instructions and data share a single address space."
      },
      {
        "q": "Which signal is used to synchronize all CPU operations?",
        "opts": ["Data signal", "Address signal", "System Clock", "Interrupt signal"],
        "a": 2,
        "difficulty": "easy",
        "explanation": "The system clock provides periodic electrical pulses that pace the fetch-decode-execute cycle."
      },
      {
        "q": "What is an 'Interrupt' in computer organization?",
        "opts": ["A hardware failure", "A signal from a device that requires immediate CPU attention", "A way to delete memory", "A type of software virus"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "Interrupts allow I/O devices to alert the CPU that they are ready for data transfer."
      },
      {
        "q": "Which component is responsible for incrementing the Program Counter?",
        "opts": ["The ALU", "The Control Unit", "The RAM", "The I/O Controller"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The Control Unit manages the sequencing of the program by updating the PC."
      },
      {
        "q": "What does 'Orthogonality' in an ISA mean?",
        "opts": ["The instructions are very long", "Instructions and addressing modes can be used independently and consistently", "The CPU uses 90-degree wiring", "The architecture only supports integer math"],
        "a": 1,
        "difficulty": "hard",
        "explanation": "An orthogonal instruction set allows any addressing mode to be used with any instruction type."
      },
      {
        "q": "What is 'Memory-Mapped I/O'?",
        "opts": ["Using a map to find the RAM", "Treating I/O device registers as if they were memory addresses", "Storing the OS on a hard drive", "A way to increase cache size"],
        "a": 1,
        "difficulty": "hard",
        "explanation": "In memory-mapped I/O, the CPU uses the same instructions to access both RAM and peripherals."
      },
      {
        "q": "What is the purpose of a 'Buffer' in the CPU interface?",
        "opts": ["To permanently store data", "To temporarily hold data to compensate for speed differences", "To encrypt the data bus", "To increase the voltage"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "Buffers like the MBR bridge the speed gap between the fast CPU and slower main memory."
      },
      {
        "q": "Which register is typically used to store the results of ALU operations in a 0-address architecture?",
        "opts": ["The Accumulator", "The Stack", "General Purpose Registers", "The Program Counter"],
        "a": 1,
        "difficulty": "hard",
        "explanation": "Stack-based (0-address) architectures perform operations on the top items of a stack."
      },
      {
        "q": "What defines 'Computer Organization' specifically?",
        "opts": ["The programmer's interface", "How the architectural specifications are physically implemented", "The choice of programming language", "The user interface design"],
        "a": 1,
        "difficulty": "easy",
        "explanation": "Organization deals with the operational units and their interconnections (e.g., control signals, interfaces)."
      },
      {
        "q": "What is the function of the 'Carry Flag'?",
        "opts": ["To indicate a hardware error", "To record if an arithmetic operation resulted in a carry-out of the most significant bit", "To signal an internet connection", "To store the user's name"],
        "a": 1,
        "difficulty": "medium",
        "explanation": "The carry flag is a status bit used to handle multi-word arithmetic and overflows."
      },
      {
        "q": "Which bus width determines the maximum amount of addressable memory?",
        "opts": ["Data Bus", "Control Bus", "Address Bus", "Expansion Bus"],
        "a": 2,
        "difficulty": "medium",
        "explanation": "The number of lines on the address bus determines the total number of unique memory locations the CPU can reach."
      }
    ]
}
}

// Get all courses (built-in + custom from localStorage)
export function getAllCourses() {
  const custom = JSON.parse(localStorage.getItem('qa_custom_courses') || '{}')
  return { ...QUIZ_DATA, ...custom }
}

// Shuffle array
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Get questions for a quiz config
export function getQuestions(category, difficulty = 'all', count = 10) {
  const all    = getAllCourses()
  let   qs     = all[category]?.questions || []
  if (difficulty !== 'all') {
    const filtered = qs.filter(q => q.difficulty === difficulty)
    if (filtered.length) qs = filtered
  }
  return shuffle([...qs]).slice(0, count)
}

// Get random pool from all categories (Quick Play)
export function getRandomPool(count = 10) {
  const all  = getAllCourses()
  const pool = []
  Object.entries(all).forEach(([cat, d]) =>
    d.questions.forEach(q => pool.push({ ...q, _cat: cat }))
  )
  return shuffle(pool).slice(0, count)
}
