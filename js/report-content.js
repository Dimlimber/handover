import { INDUSTRY_LENS } from './questions.js';

// What the written report says about each question.
// title: the action, as an instruction. why: why a buyer cares. fix: what to do about it.
export const CONTENT = {
  f1: {
    title: 'Have an outside accountant prepare three years of statements',
    why: 'Buyers and their lenders trust numbers an outside accountant has prepared. Statements you prepare yourself, or tax returns on their own, get picked apart.',
    fix: 'Ask an outside accountant to compile your last three years of statements. You don’t need a full audit; a “compilation” or “review” is enough for most buyers. Allow four to eight weeks.',
  },
  f2: {
    title: 'Put three years of financials in one folder',
    why: 'A buyer’s first request is three years of profit-and-loss statements and tax returns. Slow or patchy answers are one of the most common reasons early interest fades.',
    fix: 'Gather three years of profit-and-loss statements, balance sheets and business tax returns into one folder now, and check that the statements agree with the returns. Where they don’t, find out why before a buyer does.',
  },
  f3: {
    title: 'Document every personal expense in the books',
    why: 'Personal and family costs run through the business lower its reported profit. A buyer will only add them back to your earnings if each one is documented.',
    fix: 'List every personal, family and one-off expense from the last three years, with the invoice or statement line that proves it. And stop running new ones through the business from today: every clean month makes your earnings easier to believe.',
  },
  f4: {
    title: 'Explain your revenue, year by year',
    why: 'Buyers pay for where the business is heading. Steady is fine if it’s explained. A decline, or a zigzag, needs a reason and a plan.',
    fix: 'Write one page covering each of the last three years: what revenue did, why, and what you did about it. If recent months are improving, show them separately.',
  },
  o1: {
    title: 'Test the business without you',
    why: 'This is the question buyers care about most, and they ask it a dozen different ways. If the business stops when you do, they are buying a job, and they pay less for a job.',
    fix: 'Take a real two-week break in the next three months. When you’re back, write down everything that went wrong or waited for you. That list is your plan.',
  },
  o2: {
    title: 'Share your key relationships',
    why: 'If customers and suppliers deal only with you, a buyer fears they will leave when you do.',
    fix: 'Introduce a second person to each of your ten largest customers and your key suppliers, and have that person lead the next routine conversation with each.',
  },
  o3: {
    title: 'Put a day-to-day manager in place',
    why: 'A manager who will stay gives a buyer confidence that the business carries on. Without one, expect a lower price and a longer handover that ties you in.',
    fix: 'Name the person, and give them real authority over one part of the business now. Consider a bonus that pays out if they stay through a sale. If there is no one, that hire may be the best investment you make before selling.',
  },
  c1: {
    title: 'Secure your largest customer',
    why: 'A customer above about a fifth of revenue worries buyers and lenders. They ask what happens if that customer leaves.',
    fix: 'You can’t shrink a big customer, but you can make them safer: a written contract or renewal, more than one contact on each side, and a record of how long they have been with you. Growing your other accounts brings the percentage down too.',
  },
  c2: {
    title: 'Measure your repeat revenue',
    why: 'Revenue that comes back without being won again is worth more than revenue that starts from zero each month.',
    fix: 'Work out what share of last year’s revenue came from customers who also bought the year before. It’s often higher than owners expect, and buyers love the number. Where you can, move regulars onto service agreements or contracts.',
  },
  c3: {
    title: 'Build a customer sales record',
    why: 'A buyer will ask who your customers are, what they spend and how long they have stayed. A clean customer list is evidence. Memory isn’t.',
    fix: 'Export three years of sales by customer from your invoicing or accounting system into one spreadsheet. That alone answers most of a buyer’s questions about customers.',
  },
  p1: {
    title: 'Write down how the business runs',
    why: 'Written processes show a buyer that the business can be taught to someone new.',
    fix: 'Start with the ten tasks that only you, or one other person, know how to do. A one-page checklist for each is enough.',
  },
  p2: {
    title: 'Check that your lease(s) and contracts can transfer',
    why: 'A lease that can’t be passed on, or a license that doesn’t transfer, can stop a sale in its final weeks.',
    fix: 'Read the assignment clause in your lease and your main contracts, and check that licenses and permits are current and can pass to a new owner. Speak to your landlord early: a lease with years left to run adds value.',
  },
  s1: {
    title: 'Put evidence behind your price',
    why: 'An asking price with nothing behind it either scares buyers away or leaves money on the table.',
    fix: 'Base your number on what the business earns once the books are recast, and on what similar businesses have actually sold for. We give you an indicative range in the free review. A broker or a certified appraiser can give a formal opinion.',
  },
  s2: {
    title: 'Write your one-page story',
    why: 'Buyers look at dozens of businesses. The ones they pursue have a clear reason to exist and an obvious way to grow.',
    fix: 'Write one page: what you do and for whom, why customers choose you, why the business earns what it earns, and three realistic ways a new owner could grow it.',
  },
};

// ---------- industry versions ----------
// The report's words for the industry versions of a question (see VARIANTS in questions.js).
// Any part not given here falls back to the default above.
export const CONTENT_VARIANTS = {
  f4: {
    retail: { title: 'Explain your sales, year by year', fix: 'Write one page covering each of the last three years: what sales did, why, and what you did about it. If recent months are improving, show them separately.' },
    food: { title: 'Explain your sales, year by year', fix: 'Write one page covering each of the last three years: what sales did, why, and what you did about it. If recent months are improving, show them separately.' },
  },
  o2: {
    trades: {
      title: 'Hand over pricing and selling',
      why: 'If you price and sell the bigger jobs yourself, a buyer wonders where the work will come from once you leave.',
      fix: 'Write down how you price the common jobs. Then let a second person quote and close some of them with you in the room, and later without you.',
    },
    construction: {
      title: 'Let others win the work',
      why: 'If you find, price and win the work yourself, a buyer wonders where the next jobs will come from once you leave.',
      fix: 'Bring an estimator or project manager into your bids now. Let them price the next few jobs with you reviewing, and introduce them to your best clients.',
    },
    health: {
      title: 'Spread the patient load',
      why: 'If most of the revenue comes from patients or clients you see yourself, a buyer is buying your time, and it leaves with you.',
      fix: 'Move some regular patients or clients to other practitioners over the coming months, and have new ones book with the practice rather than with you by name.',
    },
    professional: {
      title: 'Share the client work',
      why: 'If you do most of the client work yourself, a buyer is buying your time, and clients may follow you out of the door.',
      fix: 'Hand a few client relationships to a colleague now, with you in the background, so clients get used to working with someone else. Track how much of the billed work others do each month.',
    },
    food: {
      why: 'If suppliers, regulars and your landlord deal only with you, a buyer fears the goodwill leaves when you do.',
      fix: 'Have your manager or head chef take over the regular calls with your main suppliers, and introduce them to your landlord and your best regulars.',
    },
    retail: {
      why: 'If suppliers and your best customers deal only with you, a buyer fears they will leave when you do.',
      fix: 'Have a manager take over the regular orders with your main suppliers, and introduce them to your best customers.',
    },
    auto: {
      why: 'If regular customers and fleet accounts deal only with you, a buyer fears they will leave when you do.',
      fix: 'Have your service manager or foreman handle estimates and follow-up for your regulars and fleet accounts, with you in the background.',
    },
  },
  c1: {
    trades: {
      title: 'Secure your largest account',
      why: 'One account above about a fifth of revenue, such as a builder or property manager, worries buyers and lenders. They ask what happens if it leaves.',
      fix: 'You can’t shrink a big account, but you can make it safer: a written agreement, more than one contact on each side, and a record of how long you have worked together. Growing your other work brings the percentage down too.',
    },
    construction: {
      title: 'Secure your largest client',
      why: 'One client or general contractor above about a fifth of revenue worries buyers and lenders. They ask what happens if that relationship ends.',
      fix: 'Put your record with that client on paper: past jobs, repeat work and who you deal with there. Meanwhile, bid for work with two or three other clients to bring the percentage down.',
    },
    professional: {
      title: 'Secure your largest client',
      why: 'A client above about a fifth of revenue worries buyers. They ask what happens if that client leaves.',
      fix: 'You can’t shrink a big client, but you can make it safer: a written engagement or retainer, more than one contact on each side, and a record of how long you have worked together.',
    },
    retail: {
      title: 'Reduce your reliance on one brand or channel',
      why: 'If one brand, supplier or marketplace drives most of your sales, a buyer worries about what happens if its terms change or it walks away.',
      fix: 'Work out your sales by brand, supplier and channel for the last twelve months. Where one dominates, get the terms in writing and grow the next few.',
    },
    food: {
      title: 'Know your delivery-app share',
      why: 'Delivery apps take a large commission and keep the customer details. Buyers look at how much of your sales depend on them.',
      fix: 'Work out what share of the last twelve months’ sales came through each app, and what the commission cost you. Where it makes sense, move regulars to direct ordering or pickup.',
    },
    health: {
      title: 'Spread your payers and referral sources',
      why: 'If one insurer, program or referral source brings in most of the revenue, a change in its rates or rules hits the whole business, and buyers price that in.',
      fix: 'Work out your revenue by payer and referral source for the last twelve months. Where one is large, check your contract terms and start building the next two or three.',
    },
    auto: {
      title: 'Secure your largest account',
      why: 'One fleet, insurer or dealership above about a fifth of revenue worries buyers. They ask what happens if that account leaves.',
      fix: 'Get the arrangement in writing if it isn’t, make sure more than one person on your side knows the account, and keep a record of how long it has been with you.',
    },
  },
  c2: {
    trades: {
      title: 'Grow your service agreements',
      why: 'Maintenance agreements and repeat customers bring revenue back without it being won again. Buyers of trade businesses look for them.',
      fix: 'Count your active service agreements and what they bring in each year, and offer one to every customer you visit. Work out what share of last year’s revenue came from repeat customers.',
    },
    construction: {
      title: 'Build and document your backlog',
      why: 'Buyers of construction businesses look first at signed work ahead. A thin backlog makes next year’s revenue a guess.',
      fix: 'Keep a simple backlog schedule: every signed job, its value and when it will be billed. Update it every month, so you can show a buyer the work already won.',
    },
    maker: {
      fix: 'Work out what share of last year’s revenue came from customers who also bought the year before, and put regular orders onto contracts or blanket orders where you can.',
    },
    distribution: {
      fix: 'Work out what share of last year’s revenue came from customers who also bought the year before, and put regular orders onto contracts or standing orders where you can.',
    },
    professional: {
      title: 'Measure your recurring client work',
      why: 'Retainers and repeat clients bring fees back without them being won again, and buyers value that.',
      fix: 'Work out what share of last year’s fees came from clients who also paid the year before, and move repeat clients onto retainers where you can.',
    },
    retail: {
      title: 'Measure your repeat customers',
      why: 'Sales from customers who come back are worth more than sales that have to be won again every day.',
      fix: 'If your POS or loyalty program records customers, work out what share of last year’s sales came from people who bought more than once. If it doesn’t, start recording it now.',
    },
    food: {
      title: 'Show that people come back',
      why: 'Regulars, repeat catering and standing orders make sales steadier and easier to believe.',
      fix: 'Use your POS, loyalty program or card data to estimate how many customers come back each month. List your regular catering and standing orders, with what each brings in a year.',
    },
    health: {
      title: 'Measure your returning patients and clients',
      why: 'Returning patients, memberships and ongoing care plans make revenue steadier, and buyers pay more for steady.',
      fix: 'Work out what share of last year’s revenue came from people seen more than once, and how many are on memberships or care plans today.',
    },
    auto: {
      title: 'Measure your repeat customers',
      why: 'Customers and fleets who come back make revenue steadier and easier to believe.',
      fix: 'Use your shop-management system to work out what share of last year’s revenue came from repeat customers and fleet accounts.',
    },
  },
  c3: {
    trades: {
      title: 'Keep every customer and job on record',
      why: 'A buyer will ask who your customers are, what work you did for them and how often they call you back. A clean record is evidence. Memory isn’t.',
      fix: 'Put every customer and job into field-service or accounting software, and export three years of jobs by customer into one spreadsheet.',
    },
    construction: {
      title: 'Win more work you don’t have to bid for',
      why: 'Repeat clients and negotiated work usually carry better margins and more certainty than competitive bids. Buyers look at where your work comes from.',
      fix: 'List the last three years of jobs by client and by how each was won. Then put your effort into the clients who came back.',
    },
    professional: {
      title: 'Record clients, hours and billing',
      why: 'A buyer will ask who your clients are, what each pays and how long they have stayed. A clean record is evidence. Memory isn’t.',
      fix: 'Put time and billing into one system, and export three years of fees by client into one spreadsheet.',
    },
    retail: {
      title: 'Track sales and stock together',
      why: 'A buyer will ask what sells, what doesn’t and what the stock on your shelves is really worth.',
      fix: 'Run sales and stock from one system, and do a full stock count before you list. Keep three years of sales by product line.',
    },
    food: {
      title: 'Keep sales records a buyer can check',
      why: 'A buyer will ask for sales by day, by item and by season, and will want them to match your bank deposits and tax returns.',
      fix: 'Make sure your POS keeps sales by day and by item, and keep three years of reports. Match monthly sales to bank deposits: that match is what buyers and lenders check first.',
    },
    health: {
      title: 'Put visits and billing in one system',
      why: 'A buyer will ask how many patients or clients you see, what each visit brings in and who pays. Clean records answer that in minutes.',
      fix: 'Keep visits, billing and payments in one practice management system, and export three years of visits and revenue by payer into one spreadsheet.',
    },
    auto: {
      title: 'Keep every repair order on record',
      why: 'A buyer will ask how many cars you see, what an average repair order is worth and how often customers return.',
      fix: 'Put customers, vehicles and repair orders into shop-management software, and export three years of repair orders into one spreadsheet.',
    },
  },
  p2: {
    trades: {
      title: 'Check that licenses and agreements can transfer',
      why: 'Trade licenses are often held by a person, not the business. A buyer needs to know who will hold them after you.',
      fix: 'Check which licenses are in your name and whether a manager could qualify for them. Read the assignment clauses in your lease and your service agreements.',
    },
    construction: {
      title: 'Check that licenses, bonding and contracts can transfer',
      why: 'Contractor licenses are often tied to a person, and bonding often rests on the owner’s personal guarantee. A buyer needs to know what carries over.',
      fix: 'Check which licenses are held in your name, what your surety needs for a change of owner, and whether your contracts can be assigned.',
    },
    maker: {
      fix: 'Read the assignment clauses in your leases and main customer contracts, and check that permits and certifications can pass to a new owner. Speak to your landlord early: a lease with years left to run adds value.',
    },
    distribution: {
      fix: 'Read the assignment clauses in your leases and your supplier and distribution agreements: exclusive territories often need the supplier’s approval for a new owner.',
    },
    professional: {
      title: 'Check what can pass to a new owner',
      why: 'In some professions only a licensed person can own the firm, and client contracts may need consent to transfer.',
      fix: 'Check your profession’s rules on who can own the firm, and read the assignment clauses in your client contracts and your lease.',
    },
    retail: {
      fix: 'Read the assignment clause in your lease and speak to your landlord early. Check which supplier or brand agreements need approval for a new owner.',
    },
    food: {
      title: 'Check that your lease and licenses can transfer',
      why: 'A lease that can’t be passed on, or a liquor license that doesn’t transfer in time, can stop a sale in its final weeks.',
      fix: 'Read the assignment clause in your lease and speak to your landlord early. Ask your state or local liquor authority how a transfer works and how long it takes: in some places it takes months.',
    },
    health: {
      title: 'Check what can pass to a new owner',
      why: 'Licenses and payer contracts often don’t pass to a new owner on their own. A buyer needs to know what it will take.',
      fix: 'List your licenses, payer contracts and your lease, and check what each needs for a change of owner. Some need the new owner to apply again, which takes time, so start early.',
    },
    auto: {
      title: 'Check that your lease and permits can transfer',
      why: 'A lease, environmental permit or dealer agreement that can’t be passed on can stop a sale late.',
      fix: 'Read the assignment clause in your lease, check your environmental permits and any past issues on the site, and ask how any dealer or franchise agreement handles a new owner.',
    },
  },
};

// The report's words for one question, as a given industry sees it.
export function contentFor(id, industry) {
  const lens = INDUSTRY_LENS[industry];
  const v = (lens && CONTENT_VARIANTS[id] && CONTENT_VARIANTS[id][lens]) || {};
  return { ...CONTENT[id], ...v };
}
