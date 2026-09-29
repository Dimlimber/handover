export const AREAS = [
  { key: 'financials', label: 'Financial records', weight: 30,
    advice: 'Buyers and their banks price what they can verify. Three clean years of statements, with personal expenses separated out, is the single biggest lift to price and to whether a sale closes.' },
  { key: 'owner', label: 'Dependence on you', weight: 25,
    advice: 'If the business cannot run without you, a buyer is buying a job, and pays less for it. Moving relationships and daily decisions to your team, even partly, changes what it is worth.' },
  { key: 'customers', label: 'Customers', weight: 15,
    advice: 'One large customer, or revenue that has to be won again every month, reads as risk. Showing who buys, how often and for how long turns it into a strength.' },
  { key: 'operations', label: 'Operations and paperwork', weight: 15,
    advice: 'Written-down processes and leases, contracts and licenses that transfer cleanly are what let a sale survive the buyer’s checks.' },
  { key: 'story', label: 'Your story and your price', weight: 15,
    advice: 'A price needs evidence behind it, and a buyer needs a clear reason to want the business and a believable path to growth. Listings that stall are often missing one or both.' },
];

const q = (id, area, text, labels) => ({
  id, area, text,
  options: labels.map((label, i) => ({ label, points: 3 - i })),
});

export const QUESTIONS = [
  q('f1', 'financials', 'Who prepares your financial statements?', [
    'An outside accountant, every year',
    'A bookkeeper, and an accountant does the taxes',
    'I do them myself',
    'We mostly just have tax returns',
  ]),
  q('f2', 'financials', 'How quickly could you hand over three years of profit-and-loss statements and tax returns?', [
    'This week',
    'Within a month',
    'More than a month',
    'I’m not sure they all exist',
  ]),
  q('f3', 'financials', 'Do personal or family expenses run through the business?', [
    'No',
    'A few, and I could list them',
    'Quite a few',
    'They would be hard to separate',
  ]),
  q('f4', 'financials', 'What has revenue done over the last three years?', [
    'Grown',
    'Held steady',
    'Gone up and down',
    'Declined',
  ]),
  q('o1', 'owner', 'If you were away for a month, what would happen?', [
    'It would run fine',
    'It would slow down but manage',
    'Problems would pile up',
    'It would stop',
  ]),
  q('o2', 'owner', 'Who holds the relationships with your key customers and suppliers?', [
    'Mostly my team',
    'My team and I share them',
    'Mostly me',
    'All me',
  ]),
  q('o3', 'owner', 'Is there someone who could run the business day to day?', [
    'Yes, and they already do',
    'Yes, with some training',
    'Maybe',
    'No',
  ]),
  q('c1', 'customers', 'How much of your revenue comes from your single largest customer?', [
    'Under 10%',
    '10% to 20%',
    '20% to 40%',
    'Over 40%',
  ]),
  q('c2', 'customers', 'How much of your revenue is repeat business or under contract?', [
    'Most of it',
    'About half',
    'Some',
    'Almost none',
  ]),
  q('c3', 'customers', 'What records do you keep on who buys, how much and how often?', [
    'It’s all in a system',
    'Spreadsheets',
    'Invoices only',
    'It’s in my head',
  ]),
  q('p1', 'operations', 'How much of how the business runs is written down?', [
    'Most of it',
    'Some of it',
    'Very little',
    'None of it',
  ]),
  q('p2', 'operations', 'Are your lease(s), contracts, licenses and permits current, and could they pass to a new owner?', [
    'Yes, I’ve checked',
    'I think so',
    'I’m not sure',
    'There are known problems',
  ]),
  q('s1', 'story', 'How did you arrive at the price you expect?', [
    'A professional valuation or a broker’s opinion',
    'Prices I’ve seen for businesses like mine',
    'I don’t have a number yet',
    'It’s what I need to retire',
  ]),
  q('s2', 'story', 'Could you explain in two minutes why a buyer should want your business, and where its growth would come from?', [
    'Yes, with numbers',
    'Yes, roughly',
    'I’d struggle',
    'I’ve never thought about it',
  ]),
];

export const PROFILE_QUESTIONS = [
  { id: 'industry', text: 'What kind of business is it?', options: [
    'Home and trade services', 'Manufacturing', 'Distribution or wholesale',
    'Retail', 'Restaurant or food', 'Healthcare or wellness',
    'Professional services', 'Automotive', 'Construction', 'Something else',
  ] },
  { id: 'revenue', text: 'Roughly what is its yearly revenue?', options: [
    'Under $500,000', '$500,000 to $1 million', '$1 million to $3 million',
    '$3 million to $10 million', 'Over $10 million',
  ] },
];

// ---------- industry versions ----------
// Some questions only make sense for some businesses ("your single largest customer" means little to a
// restaurant). Each industry sees the same 14 questions, in the same five areas and on the same
// four-step scale (best answer first), but in words that fit how that business earns its money.
// So scores compare across industries, and report links keep working. "Something else" sees the
// default wording.
export const INDUSTRY_LENS = {
  'Home and trade services': 'trades',
  'Manufacturing': 'maker',
  'Distribution or wholesale': 'distribution',
  'Retail': 'retail',
  'Restaurant or food': 'food',
  'Healthcare or wellness': 'health',
  'Professional services': 'professional',
  'Automotive': 'auto',
  'Construction': 'construction',
};

const TEAM = ['Mostly my team', 'My team and I share them', 'Mostly me', 'All me'];
const WINS = ['My team does', 'My team and I share it', 'Mostly me', 'Only me'];
const OWN_WORK = ['Very little', 'Less than half', 'About half or more', 'Nearly all of it'];
const SHARE_10 = ['Under 10%', '10% to 20%', '20% to 40%', 'Over 40%'];
const SHARE_20 = ['Under 20%', '20% to 40%', '40% to 60%', 'Over 60%'];
const HOW_MUCH = ['Most of it', 'About half', 'Some', 'Almost none'];

// question id -> industry -> { text, options? } (options, when given, replace the default four)
export const VARIANTS = {
  f4: {
    retail: { text: 'What have sales done over the last three years?' },
    food: { text: 'What have sales done over the last three years?' },
  },
  o2: {
    trades: { text: 'Who prices and sells the bigger jobs?', options: WINS },
    construction: { text: 'Who finds, prices and wins the work?', options: WINS },
    health: { text: 'How much of the revenue comes from patients or clients you see yourself?', options: OWN_WORK },
    professional: { text: 'How much of the client work do you do yourself?', options: OWN_WORK },
    food: { text: 'Who holds the relationships with your suppliers, your regulars and your landlord?', options: TEAM },
    retail: { text: 'Who holds the relationships with your suppliers and your best customers?', options: TEAM },
    auto: { text: 'Who do your regular customers and fleet accounts deal with?', options: TEAM },
  },
  o3: {
    trades: { text: 'Is there a service or operations manager who could run the business day to day?' },
    construction: { text: 'Is there a project manager or superintendent who could run the jobs day to day?' },
    retail: { text: 'Is there a store manager who could run the store day to day?' },
    food: { text: 'Is there a manager or head chef who could run the place day to day?' },
    health: { text: 'Is there a practice manager or another practitioner who could run the practice day to day?' },
    auto: { text: 'Is there a shop foreman or service manager who could run the shop day to day?' },
  },
  c1: {
    trades: { text: 'How much of your revenue comes from your largest single account, such as a builder, property manager or commercial client?', options: SHARE_10 },
    construction: { text: 'How much of your revenue comes from your largest client or general contractor?', options: SHARE_10 },
    professional: { text: 'How much of your revenue comes from your single largest client?', options: SHARE_10 },
    retail: { text: 'How much of your sales depend on a single brand, supplier or marketplace, such as Amazon?', options: SHARE_20 },
    food: { text: 'How much of your sales come through delivery apps such as DoorDash or Uber Eats?', options: SHARE_10 },
    health: { text: 'How much of your revenue comes from your largest payer or referral source, such as one insurer, Medicare or a referring practice?', options: SHARE_20 },
    auto: { text: 'How much of your revenue comes from your largest account, such as a fleet, an insurer or a dealership?', options: SHARE_10 },
  },
  c2: {
    trades: { text: 'How much of your revenue comes from service agreements and repeat customers?', options: HOW_MUCH },
    construction: { text: 'How far ahead is your work booked with signed contracts?', options: ['Six months or more', 'Three to six months', 'One to three months', 'Less than a month'] },
    maker: { text: 'How much of your revenue comes from repeat orders or contracts?', options: HOW_MUCH },
    distribution: { text: 'How much of your revenue comes from repeat orders or contracts?', options: HOW_MUCH },
    professional: { text: 'How much of your revenue comes from retainers and repeat clients?', options: HOW_MUCH },
    retail: { text: 'How much of your sales come from repeat customers?', options: HOW_MUCH },
    food: { text: 'How much of your business comes from regulars, repeat catering and standing orders?', options: HOW_MUCH },
    health: { text: 'How much of your revenue comes from returning patients or clients, memberships or care plans?', options: HOW_MUCH },
    auto: { text: 'How much of your work comes from repeat customers and fleet accounts?', options: HOW_MUCH },
  },
  c3: {
    trades: { text: 'What records do you keep on your customers and jobs?', options: ['All in field-service software', 'Spreadsheets', 'Invoices only', 'It’s in my head'] },
    construction: { text: 'How do you win most of your work?', options: ['Repeat clients and negotiated work', 'A mix of repeat clients and bids', 'Mostly competitive bids', 'Whatever comes in'] },
    professional: { text: 'What records do you keep on clients, hours and billing?', options: ['All in a practice or billing system', 'Spreadsheets', 'Invoices only', 'It’s in my head'] },
    retail: { text: 'What records do you keep on sales and stock?', options: ['Sales and stock in one system', 'Sales in a system, stock counted by hand', 'Register totals and spreadsheets', 'Very little'] },
    food: { text: 'What sales records do you keep?', options: ['Sales by day and by item, in a POS system', 'Daily totals from the register', 'Mostly bank deposits', 'Very little'] },
    health: { text: 'How do you track visits and billing?', options: ['In a practice management system', 'Scheduling software and spreadsheets', 'Paper, and the billing service’s reports', 'Very little is tracked'] },
    auto: { text: 'What records do you keep on customers, vehicles and repair orders?', options: ['All in shop-management software', 'Spreadsheets', 'Paper repair orders', 'Very little'] },
  },
  p1: {
    trades: { text: 'How much of how the business runs is written down, such as pricing, dispatch and job checklists?' },
    construction: { text: 'How much of how you run a job is written down, such as estimating, safety and project checklists?' },
    maker: { text: 'How much of how the business runs is written down, such as quoting, production steps and quality checks?' },
    distribution: { text: 'How much of how the business runs is written down, such as purchasing, warehouse routines and pricing?' },
    professional: { text: 'How much of how the work gets done is written down, such as client onboarding, templates and billing?' },
    retail: { text: 'How much of how the store runs is written down, such as opening, closing, ordering and pricing?' },
    food: { text: 'How much of how the kitchen and the floor run is written down, such as recipes, prep lists, opening and closing?' },
    health: { text: 'How much of how the practice runs is written down, such as scheduling, billing and patient intake?' },
    auto: { text: 'How much of how the shop runs is written down, such as estimates, repair checklists and parts ordering?' },
  },
  p2: {
    trades: { text: 'Are your trade licenses, insurance, lease and service agreements current, and could they pass to a new owner?' },
    construction: { text: 'Are your contractor licenses, bonding, insurance and contracts current, and could they pass to a new owner?' },
    maker: { text: 'Are your leases, customer contracts, permits and certifications current, and could they pass to a new owner?' },
    distribution: { text: 'Are your leases and your supplier and distribution agreements current, and could they pass to a new owner?' },
    professional: { text: 'Are your lease, client contracts and professional licenses current, and could they pass to a new owner?' },
    retail: { text: 'Are your lease and supplier agreements current, and could they pass to a new owner?' },
    food: { text: 'Are your lease, liquor license and health permits current, and could they pass to a new owner?' },
    health: { text: 'Are your licenses, payer contracts and lease current, and could they pass to a new owner?' },
    auto: { text: 'Are your lease, environmental permits and any dealer or franchise agreements current, and could they pass to a new owner?' },
  },
};

// area key -> industry -> advice (the rest use AREAS[].advice)
export const AREA_ADVICE = {
  customers: {
    trades: 'One large account, or work that has to be won again every week, reads as risk. Service agreements and repeat customers, on record, turn it into a strength.',
    construction: 'Buyers look at how much work is already signed, how you win it and how much depends on one client. A clear backlog turns that into a strength.',
    professional: 'One large client, or fees that have to be won again every month, read as risk. Retainers and repeat clients, on record, turn it into a strength.',
    retail: 'Buyers look at how much depends on one brand or channel, and how many customers come back. Sales records that show it turn it into a strength.',
    food: 'Buyers look at how steady your sales are, how much comes through delivery apps and how many people come back. Records that show it turn it into a strength.',
    health: 'Buyers look at how your revenue spreads across payers and referral sources, and how many patients or clients return. Clean records turn that into a strength.',
    auto: 'One large account, or customers who don’t come back, reads as risk. Repair orders on record, with repeat customers and fleets, turn it into a strength.',
  },
};

const lensOf = (industry) => INDUSTRY_LENS[industry] || null;

// The 14 questions in the words a given industry sees (same ids, areas and points).
export function questionsFor(industry) {
  const lens = lensOf(industry);
  if (!lens) return QUESTIONS;
  return QUESTIONS.map((question) => {
    const v = VARIANTS[question.id] && VARIANTS[question.id][lens];
    if (!v) return question;
    return {
      ...question,
      text: v.text || question.text,
      options: v.options ? v.options.map((label, i) => ({ label, points: 3 - i })) : question.options,
    };
  });
}

// The five areas with the advice a given industry sees.
export function areasFor(industry) {
  const lens = lensOf(industry);
  return AREAS.map((area) => {
    const advice = lens && AREA_ADVICE[area.key] && AREA_ADVICE[area.key][lens];
    return advice ? { ...area, advice } : area;
  });
}
