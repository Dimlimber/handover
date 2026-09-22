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
