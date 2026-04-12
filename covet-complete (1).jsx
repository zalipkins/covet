import { useState, useEffect } from "react";

// ─── Button helpers ────────────────────────────────────────────────────────
const CB = (slug, ticker) => ({ label: `Buy ${ticker}`, url: `https://coinbase.com/price/${slug}`, t: "crypto" });
const YF = (ticker) => ({ label: `Trade ${ticker}`, url: `https://finance.yahoo.com/quote/${ticker}`, t: "stock" });
const FORGE = { label: "Pre-IPO Shares", url: "https://forgeplatform.com/", t: "preipo" };
const REP = { label: "Invest", url: "https://republic.com/", t: "republic" };
const WEB = (url) => ({ label: "View", url, t: "view" });
const EXITED = { label: "Exited", url: null, t: "exit" };

// ─── Tag dot colors ─────────────────────────────────────────────────────────
const DOT = {
  blue:"#60a5fa",violet:"#a78bfa",indigo:"#818cf8",purple:"#c084fc",
  red:"#f87171",green:"#4ade80",orange:"#fb923c",yellow:"#fbbf24",
  amber:"#f59e0b",pink:"#f472b6",teal:"#2dd4bf",neutral:"#9ca3af",
};

const BTN_BG = { crypto:"#92400e", stock:"#1e3a5f", preipo:"#3b1f6e", republic:"#064e3b", view:"#1c1c1c", exit:"#1a1a1a" };
const BTN_FG = { crypto:"#fbbf24", stock:"#60a5fa", preipo:"#a78bfa", republic:"#34d399", view:"#888", exit:"#404040" };

// ─────────────────────────────────────────────────────────────────────────────
// NAVAL RAVIKANT — complete portfolio
// ─────────────────────────────────────────────────────────────────────────────
const naval = {
  id:"naval", name:"Naval Ravikant", handle:"@naval",
  title:"AngelList · MetaStable · Spearhead",
  netWorth:"~$120M", category:"Crypto · Startups · Philosophy",
  thesis:"Specific knowledge and leverage compound like interest. Own equity in technology and ideas — never time.",
  keyNumber:{label:"Unicorns backed",value:"17+"},
  tag:"Philosopher King", tagColor:"blue",
  portfolio:[
    // FOUNDED / CO-FOUNDED
    {name:"Epinions",cat:"Founded",detail:"Co-founded 1999. Consumer product reviews. Merged with DealTime → Shopping.com. IPO Oct 2004 at $750M. Naval's first major company.",btn:EXITED},
    {name:"Vast.com",cat:"Founded",detail:"Co-founded. Auto shopping network and classified ads platform.",btn:null},
    {name:"The Hit Forge",cat:"Founded",detail:"$20M early-stage VC fund (2007). Naval as Managing Partner. Invested in Twitter, Uber, Stack Overflow. His first investment vehicle.",btn:null},
    {name:"AngelList",cat:"Founded",detail:"Co-founded 2010 with Babak Nivi. $4B+ valuation (2022). Supports $170B+ in assets. Participated in ~28% of all high-quality early-stage VC deals.",btn:WEB("https://angel.co")},
    {name:"MetaStable Capital",cat:"Founded",detail:"Crypto hedge fund (2014) with Lucas Ryan and Joshua Seims. $69M AUM by 2017. 500%+ returns by 2017. Backed by a16z, Sequoia, USV, Founders Fund, Bessemer. Holds BTC, ETH, Monero, Zcash.",btn:null},
    {name:"CoinList",cat:"Founded",detail:"Co-founded 2017 with Protocol Labs. ICO compliance platform and token launch platform spun from AngelList.",btn:WEB("https://coinlist.co")},
    {name:"Spearhead",cat:"Founded",detail:"$100M fund (2017) giving founders $1M each to angel invest. Third cohort: $100M. Spearhead founders have backed Neuralink, Opendoor, Rippling, Scale AI, PillPack.",btn:WEB("https://spearhead.co")},
    {name:"Airchat",cat:"Founded",detail:"Voice-first social app (2023). Described himself as 'a big investor.'",btn:null},
    // CRYPTO (personal + MetaStable fund holdings)
    {name:"Ethereum (ETH)",cat:"Crypto",detail:"Personal holding at ~$0.30 (2015-2016 range post-launch). Never sold. Advisor to Ethereum Foundation.",btn:CB("ethereum","ETH")},
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"Via MetaStable Capital fund. MetaStable owns BTC as primary holding.",btn:CB("bitcoin","BTC")},
    {name:"Monero (XMR)",cat:"Crypto",detail:"Via MetaStable Capital. MetaStable was reported to own ~1% of total Monero supply.",btn:null},
    {name:"Zcash (ZEC)",cat:"Crypto",detail:"Via MetaStable Capital. Confirmed per multiple sources including line from Wikipedia.",btn:CB("zcash","ZEC")},
    // ADVISOR ROLES (confirmed PitchBook / official bios)
    {name:"StarkWare",cat:"Private",detail:"Advisor. ZK-proof layer 2 company. Confirmed in PitchBook bio.",btn:FORGE},
    {name:"Stellar Development Foundation",cat:"Private",detail:"Advisor. Non-profit supporting Stellar blockchain network. Confirmed PitchBook.",btn:null},
    {name:"bloXroute Labs",cat:"Private",detail:"Advisor. Blockchain distribution network — faster transaction propagation. Confirmed PitchBook.",btn:null},
    {name:"Republic",cat:"Private",detail:"Advisor. Equity crowdfunding platform. Confirmed PitchBook.",btn:REP},
    {name:"HireAthena",cat:"Private",detail:"Advisor. Confirmed PitchBook.",btn:null},
    {name:"IdeaFlow",cat:"Private",detail:"Advisor. Confirmed PitchBook.",btn:null},
    {name:"BranchOut",cat:"Private",detail:"Advisor. Professional networking on Facebook.",btn:null},
    // CANONICAL PORTFOLIO (Almanack bio + 50+ sources)
    {name:"Uber",cat:"Private",detail:"Pre-seed via The Hit Forge fund (2007). One of the greatest angel bets in VC history.",btn:YF("UBER")},
    {name:"Twitter / X",cat:"Private",detail:"Pre-IPO angel via The Hit Forge fund.",btn:null},
    {name:"Foursquare",cat:"Private",detail:"Location check-in pioneer. Pivoted to enterprise location intelligence.",btn:FORGE},
    {name:"Poshmark",cat:"Private",detail:"Secondhand fashion marketplace. IPO'd then acquired by Naver.",btn:EXITED},
    {name:"Postmates",cat:"Private",detail:"Food delivery. Acquired by Uber (2020) for $2.65B.",btn:EXITED},
    {name:"Thumbtack",cat:"Private",detail:"Marketplace for local services.",btn:FORGE},
    {name:"Notion",cat:"Private",detail:"All-in-one workspace. $10B+ valuation.",btn:FORGE},
    {name:"SnapLogic",cat:"Private",detail:"Enterprise AI integration platform. Naval is current board member.",btn:FORGE},
    {name:"Opendoor",cat:"Private",detail:"iBuying pioneer. Public company (OPEN).",btn:YF("OPEN")},
    {name:"Clubhouse",cat:"Private",detail:"Audio social. Early. Still operating.",btn:null},
    {name:"Stack Overflow",cat:"Private",detail:"Developer Q&A platform. Acquired by Prosus (2021) for $1.8B.",btn:EXITED},
    {name:"Bolt",cat:"Private",detail:"Checkout and payments unicorn.",btn:FORGE},
    {name:"OpenDNS",cat:"Private",detail:"Internet security. Acquired by Cisco (2015) for $635M.",btn:EXITED},
    {name:"Yammer",cat:"Private",detail:"Enterprise social. Acquired by Microsoft (2012) for $1.2B.",btn:EXITED},
    {name:"Clearview AI",cat:"Private",detail:"Facial recognition company. Confirmed position.",btn:null},
    {name:"Wanelo",cat:"Private",detail:"Social shopping platform. Naval is board member.",btn:null},
    {name:"Wish.com",cat:"Private",detail:"E-commerce platform.",btn:null},
    // ADDITIONAL CONFIRMED
    {name:"Perplexity",cat:"Private",detail:"Early investor across multiple rounds. AI search unicorn challenging Google.",btn:FORGE},
    {name:"OpenSea",cat:"Private",detail:"Early investor. NFT marketplace. $13.3B peak valuation.",btn:FORGE},
    {name:"Eight Sleep",cat:"Private",detail:"Smart sleep system. Health-focused consumer hardware. Unicorn.",btn:FORGE},
    {name:"Anchorage Digital",cat:"Private",detail:"First federally chartered crypto bank. Advisor/investor.",btn:FORGE},
    {name:"HoneyBook",cat:"Private",detail:"Series A investor (2014 confirmed, $10M round). SMB client management. $2.4B valuation by 2021.",btn:FORGE},
    {name:"Blowfish",cat:"Private",detail:"Web3 security — alerts users to dangerous blockchain transactions.",btn:null},
    {name:"Alchemy",cat:"Private",detail:"Web3 developer platform. The 'AWS of blockchain'.",btn:FORGE},
    {name:"Primer",cat:"Private",detail:"AI-powered workflows. Enterprise automation.",btn:FORGE},
    {name:"NexHealth",cat:"Private",detail:"Healthcare SaaS connecting patients and providers.",btn:FORGE},
    {name:"Hebbia",cat:"Private",detail:"AI research tool for finance and legal.",btn:FORGE},
    {name:"Stonks",cat:"Private",detail:"Social investing platform.",btn:null},
    {name:"Magic",cat:"Private",detail:"On-demand personal assistant service.",btn:null},
    {name:"Flipagram",cat:"Private",detail:"Short video app. Acquired by Toutiao (ByteDance predecessor) (2017).",btn:EXITED},
    {name:"Descript",cat:"Private",detail:"AI-powered podcast and video editing.",btn:FORGE},
    {name:"Shef",cat:"Private",detail:"Home chef marketplace. March 1, 2023 investment (confirmed).",btn:null},
    {name:"Zaarly",cat:"Private",detail:"Proximity-based local services marketplace. Crunchbase confirmed.",btn:null},
    {name:"Wheels",cat:"Private",detail:"Shared electric mobility platform. Crunchbase confirmed. $37M raised.",btn:null},
    {name:"Vurb",cat:"Private",detail:"Local discovery app. Crunchbase confirmed.",btn:null},
    {name:"Visually",cat:"Private",detail:"Content creation platform for businesses. Crunchbase confirmed.",btn:null},
    {name:"Unsplash",cat:"Private",detail:"Copyright-free photography platform. Crunchbase confirmed.",btn:null},
    // EXITS (named in transcript exits list)
    {name:"Udemy",cat:"Private",detail:"Online learning platform. Portfolio exit via IPO (UDMY). Crunchbase confirmed.",btn:EXITED},
    {name:"Teachable",cat:"Private",detail:"Course creator platform. Portfolio exit. Transcript confirmed.",btn:EXITED},
    {name:"Streamlabs",cat:"Private",detail:"Streaming tools for creators. Portfolio exit. Transcript confirmed.",btn:EXITED},
    {name:"Trusted",cat:"Private",detail:"Portfolio exit. Transcript confirmed exit list.",btn:EXITED},
    {name:"Fieldbook",cat:"Private",detail:"Database/spreadsheet tool. Portfolio exit. Transcript confirmed exit list.",btn:EXITED},
    // 2024–2026 (Harmonic / PitchBook confirmed)
    {name:"Quill Notes",cat:"Private",detail:"AI notes app. Most recent investment (Feb 2026). Seed stage.",btn:null},
    {name:"Quanta",cat:"Private",detail:"Compute infrastructure. Series A (Dec 2025).",btn:null},
    {name:"Thermopylae Aerospace",cat:"Private",detail:"Defense/aerospace. 2025.",btn:null},
    {name:"Tako",cat:"Private",detail:"AI-powered social discovery. $5.75M seed (Oct 2024).",btn:null},
    {name:"The ePlane Company",cat:"Private",detail:"Indian air taxi startup. Series B (Nov 2024).",btn:FORGE},
    {name:"Mystiko Network",cat:"Private",detail:"ZK-proof privacy layer for blockchain (Mar 2024).",btn:null},
    {name:"Belfort",cat:"Private",detail:"Sep 2025. Undisclosed.",btn:null},
    // 2025 active (Harmonic data)
    {name:"Extropic",cat:"Private",detail:"AI hardware / thermodynamic computing. 2025 active.",btn:null},
    {name:"Cal.com",cat:"Private",detail:"Open-source scheduling infrastructure. 2025 active.",btn:null},
    {name:"Nomic AI",cat:"Private",detail:"Data maps and embeddings. 2025 active.",btn:null},
    {name:"Chroma",cat:"Private",detail:"Open-source vector database for AI apps. 2025 active.",btn:null},
    {name:"OpenBB",cat:"Private",detail:"Open-source financial terminal. 2025 active.",btn:null},
    {name:"Atomic Semi",cat:"Private",detail:"Defense/aerospace semiconductors. 2025 active.",btn:null},
    {name:"Mindstate Design Labs",cat:"Private",detail:"Psychedelic medicine R&D. 2025 active.",btn:null},
    {name:"dWallet Labs",cat:"Private",detail:"Decentralized key management. 2025 active.",btn:null},
    {name:"Vibe Bio",cat:"Private",detail:"Community-funded rare disease biotech. 2025 active.",btn:null},
    {name:"Pylon",cat:"Private",detail:"B2B customer support platform. 2025 active.",btn:null},
    {name:"The Coterie",cat:"Private",detail:"2025 active.",btn:null},
    {name:"Darwinium",cat:"Private",detail:"Cybersecurity / fraud prevention. 2025 active.",btn:null},
    {name:"Andalusia Labs",cat:"Private",detail:"Crypto security infrastructure. 2025 active.",btn:null},
    {name:"Webstudio",cat:"Private",detail:"Open-source website builder. 2025 active.",btn:null},
    {name:"NocoDB",cat:"Private",detail:"Open-source Airtable alternative. 2025 active.",btn:null},
    {name:"Monad Foundation",cat:"Private",detail:"High-performance EVM blockchain. 2025 active.",btn:null},
    {name:"Patented.ai",cat:"Private",detail:"AI IP/patent tooling. 2025 active.",btn:null},
  ],
  recent:[
    {deal:"Quill Notes",date:"Feb 2026",note:"Seed — most recent confirmed"},
    {deal:"Quanta",date:"Dec 2025",note:"Series A"},
    {deal:"Belfort",date:"Sep 2025",note:"Undisclosed"},
    {deal:"The ePlane Company",date:"Nov 2024",note:"Series B — India"},
    {deal:"Tako",date:"Oct 2024",note:"$5.75M seed"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BALAJI SRINIVASAN — complete portfolio
// ─────────────────────────────────────────────────────────────────────────────
const balaji = {
  id:"balaji", name:"Balaji Srinivasan", handle:"@balajis",
  title:"Counsyl · Earn.com · Network School",
  netWorth:">$150M", category:"Crypto · Biotech · Sovereignty",
  thesis:"Network states will replace nation states. Bitcoin is the exit. Bet on decentralization before the mainstream does.",
  keyNumber:{label:"Portfolio companies",value:"297+"},
  tag:"Techno-Sovereigntist", tagColor:"violet",
  portfolio:[
    // FOUNDED
    {name:"Counsyl",cat:"Founded",detail:"Genomics startup. Sold to Myriad Genetics for $375M.",btn:EXITED},
    {name:"Earn.com / 21.co",cat:"Founded",detail:"Crypto social/email. Acquired by Coinbase for ~$120M (2018).",btn:EXITED},
    {name:"Teleport",cat:"Founded",detail:"Remote work platform. Acquired by Topia.",btn:EXITED},
    {name:"Network School",cat:"Founded",detail:"Private island campus near Singapore (Forest City, Malaysia). 550+ enrollment (Sep 2024). Expanding to Miami/Dubai/Tokyo.",btn:WEB("https://ns.com")},
    {name:"Balaji Fund",cat:"Founded",detail:"Dec 2023. Backed by Naval, Coinbase CEO Brian Armstrong, Fred Wilson.",btn:null},
    {name:"Coin Center",cat:"Founded",detail:"Co-founded. Leading US crypto policy research/advocacy non-profit.",btn:WEB("https://coincenter.org")},
    // CRYPTO (official bio)
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"Publicly predicted $1M BTC. Major personal position. Ran a $1M BTC prediction bet (2023).",btn:CB("bitcoin","BTC")},
    {name:"Ethereum (ETH)",cat:"Crypto",detail:"Early investor. Significant holdings. Co-invested heavily in ETH ecosystem companies.",btn:CB("ethereum","ETH")},
    {name:"Solana (SOL)",cat:"Crypto",detail:"Official bio investment. Long position. Frequently co-invests with Toly/Solana ecosystem.",btn:CB("solana","SOL")},
    {name:"Avalanche (AVAX)",cat:"Crypto",detail:"Official bio investment.",btn:CB("avalanche","AVAX")},
    {name:"Chainlink (LINK)",cat:"Crypto",detail:"Oracle network. Official bio investment.",btn:CB("chainlink","LINK")},
    {name:"NEAR Protocol",cat:"Crypto",detail:"Official bio investment.",btn:CB("near-protocol","NEAR")},
    {name:"Polygon (MATIC)",cat:"Crypto",detail:"Official bio investment. Ethereum L2 scaling.",btn:CB("polygon","MATIC")},
    {name:"Zcash (ZEC)",cat:"Crypto",detail:"Privacy coin. Official bio investment. Long-term privacy conviction.",btn:CB("zcash","ZEC")},
    {name:"XMTP",cat:"Crypto",detail:"Decentralized messaging protocol. Official bio.",btn:null},
    // OFFICIAL BIO COMPANIES
    {name:"Alchemy",cat:"Private",detail:"Web3 developer platform — the 'AWS of blockchain'.",btn:FORGE},
    {name:"Anduril",cat:"Private",detail:"Defense AI systems. Now $28B+ valuation. Early investor.",btn:FORGE},
    {name:"Benchling",cat:"Private",detail:"Lab data management for biotech. Unicorn.",btn:FORGE},
    {name:"CoinTracker",cat:"Private",detail:"Crypto tax/portfolio tracking.",btn:FORGE},
    {name:"Digital Ocean",cat:"Private",detail:"Cloud infrastructure for developers. Public (DOCN).",btn:YF("DOCN")},
    {name:"Luma",cat:"Private",detail:"AI 3D model generation / event platform.",btn:FORGE},
    {name:"OpenGov",cat:"Private",detail:"Cloud software for government. Acquired by Cox Enterprises.",btn:EXITED},
    {name:"OpenSea",cat:"Private",detail:"NFT marketplace. $13.3B peak valuation.",btn:FORGE},
    {name:"Orchid Health",cat:"Private",detail:"Reproductive genomics. Official bio.",btn:null},
    {name:"Paradigm",cat:"Private",detail:"Crypto-focused VC. One of the top crypto investment firms.",btn:null},
    {name:"Perplexity",cat:"Private",detail:"AI search engine. $20B valuation. Multiple rounds.",btn:FORGE},
    {name:"Polychain Capital",cat:"Private",detail:"Crypto hedge fund. Top-tier crypto-native VC.",btn:null},
    {name:"Polymarket",cat:"Private",detail:"Prediction markets. Multiple rounds.",btn:FORGE},
    {name:"Prospera",cat:"Private",detail:"Special economic zone in Honduras. Charter city experiment.",btn:null},
    {name:"Replit",cat:"Private",detail:"Online IDE / AI coding platform. Unicorn.",btn:FORGE},
    {name:"StarkWare",cat:"Private",detail:"ZK-proof L2. Pioneer of ZK technology. Early position.",btn:FORGE},
    {name:"Stedi",cat:"Private",detail:"EDI/B2B data exchange infrastructure.",btn:FORGE},
    {name:"Superhuman",cat:"Private",detail:"Fast email client. Unicorn.",btn:FORGE},
    {name:"Valar Atomic",cat:"Private",detail:"Micro nuclear reactors. Official bio.",btn:null},
    {name:"Varda Space",cat:"Private",detail:"In-orbit manufacturing. Official bio.",btn:FORGE},
    {name:"Zora",cat:"Crypto",detail:"On-chain creative economy / NFT protocol.",btn:null},
    // EXTENDED SPEAKING BIO (Bitcoin Asia 2025 + others)
    {name:"Celestia",cat:"Crypto",detail:"Modular data availability layer for blockchains.",btn:null},
    {name:"Culdesac",cat:"Private",detail:"Car-free neighborhoods. Urban development.",btn:FORGE},
    {name:"Dapper Labs",cat:"Crypto",detail:"NBA Top Shot, CryptoKitties, Flow blockchain.",btn:FORGE},
    {name:"Deel",cat:"Private",detail:"Global HR and payroll platform. $12B+ valuation.",btn:FORGE},
    {name:"Espresso Systems",cat:"Crypto",detail:"Rollup confirmation layer / ZK infrastructure.",btn:null},
    {name:"Farcaster",cat:"Crypto",detail:"Decentralized social protocol on Ethereum.",btn:null},
    {name:"Hadrian",cat:"Private",detail:"CNC machining for aerospace and defense.",btn:FORGE},
    {name:"Infinita",cat:"Private",detail:"Network state infrastructure.",btn:null},
    {name:"Instadapp",cat:"Crypto",detail:"DeFi aggregation and management.",btn:null},
    {name:"Minicircle",cat:"Private",detail:"Gene therapy / longevity. Startup in Próspera.",btn:null},
    {name:"Mirror",cat:"Crypto",detail:"Decentralized publishing on Ethereum.",btn:null},
    {name:"Nucleus Genomics",cat:"Private",detail:"Genomics and ancestry.",btn:null},
    {name:"Omada Health",cat:"Private",detail:"Digital chronic disease management. IPO candidate.",btn:FORGE},
    {name:"Republic",cat:"Private",detail:"Equity crowdfunding platform.",btn:REP},
    {name:"Roam Research",cat:"Private",detail:"Networked note-taking tool.",btn:null},
    {name:"Synthesis",cat:"Private",detail:"Accelerated learning for kids (spun out of SpaceX school).",btn:FORGE},
    {name:"Vitalia",cat:"Private",detail:"Longevity city / network state in Honduras.",btn:null},
    {name:"VoteAgora",cat:"Private",detail:"Crypto governance tooling.",btn:null},
    // OLDER CONFIRMED (from bios + reports)
    {name:"Cameo",cat:"Private",detail:"Celebrity video messages. Former unicorn.",btn:FORGE},
    {name:"Eight Sleep",cat:"Private",detail:"Smart sleep system. Health tech.",btn:FORGE},
    {name:"EPNS (Push Protocol)",cat:"Crypto",detail:"Decentralized notifications for Web3.",btn:null},
    {name:"Gitcoin",cat:"Crypto",detail:"Open source funding via quadratic funding.",btn:null},
    {name:"Golden",cat:"Private",detail:"Decentralized knowledge graph.",btn:null},
    {name:"Lambda School (Bloom Institute)",cat:"Private",detail:"Income share agreement coding bootcamp. Rebranded.",btn:null},
    {name:"Levels Health",cat:"Private",detail:"Continuous glucose monitoring for metabolic health.",btn:FORGE},
    {name:"Messari",cat:"Private",detail:"Crypto research and data platform.",btn:FORGE},
    {name:"OnDeck",cat:"Private",detail:"Network for ambitious builders.",btn:null},
    {name:"Skiff",cat:"Private",detail:"Privacy-first collaborative docs. Acquired by Notion (2024).",btn:EXITED},
    {name:"Soylent",cat:"Private",detail:"Nutritionally complete food products.",btn:null},
    {name:"Stability AI",cat:"Private",detail:"Open-source AI / Stable Diffusion.",btn:FORGE},
    {name:"Enhanced Games",cat:"Private",detail:"Olympic-style athletics competition allowing performance-enhancing drugs. Confirmed in Bitcoin Asia 2025 extended speaking bio.",btn:null},
    {name:"Clubhouse",cat:"Private",detail:"Audio social network.",btn:null},
    // PRESS-RELEASE CONFIRMED RECENT (all verified by The Block, CoinDesk, Bloomberg, Fortune, etc.)
    {name:"ZODL / Zcash Open Dev Lab",cat:"Crypto",detail:"$25M seed (Mar 2026). Paradigm, a16z, Winklevoss. ZK-proof Zcash ecosystem. Most recent investment.",btn:null},
    {name:"Project Eleven",cat:"Private",detail:"$20M Series A (Jan 2026). Castle Island led. Post-quantum cryptography security for Bitcoin.",btn:null},
    {name:"Reason Robotics",cat:"Private",detail:"Most recent per PitchBook (Dec 2025).",btn:null},
    {name:"Arctus Aerospace",cat:"Private",detail:"$2.6M pre-seed (Nov 2025). Version One confirmed. High-altitude UAVs, Bangalore.",btn:null},
    {name:"0xbow / Privacy Pools",cat:"Crypto",detail:"$3.5M seed (Nov 2025). The Block confirmed. Ethereum Privacy Pools compliant mixer.",btn:null},
    {name:"NOICE",cat:"Crypto",detail:"Undisclosed (Oct 2025). Social network on Base. Coinbase Ventures + Balaji. Crypto-Fundraising confirmed.",btn:null},
    {name:"Notch",cat:"Private",detail:"Oct 23, 2025. Crunchbase confirmed.",btn:null},
    {name:"fomo",cat:"Private",detail:"$17M Series A (Nov 2025). Crunchbase confirmed.",btn:null},
    {name:"Emergent",cat:"Private",detail:"Series A (Aug 11, 2025). Crunchbase confirmed.",btn:null},
    {name:"Trepa",cat:"Private",detail:"$420K pre-seed (Aug 2025). CoinCarp confirmed.",btn:null},
    {name:"Blueprint / Bryan Johnson",cat:"Private",detail:"Longevity protocol company (Oct 2025). Crunchbase confirmed.",btn:null},
    {name:"Inversion Capital",cat:"Private",detail:"$26.5M seed (Sep 2025). Dragonfly led. Blockchain PE firm acquiring telecoms/financial services.",btn:null},
    {name:"ZAR",cat:"Private",detail:"$7M seed (Apr 2025). CoinCarp confirmed. CeFi payments.",btn:null},
    {name:"Octane",cat:"Private",detail:"$6.75M seed (Apr 2025). AI blockchain cybersecurity. 'Strategic angels including Balaji Srinivasan.'",btn:null},
    {name:"Pluralis Research",cat:"Private",detail:"$7.6M seed (Mar 2025). Fortune confirmed. 'Prominent crypto investor Balaji Srinivasan.'",btn:null},
    {name:"Level",cat:"Crypto",detail:"$2.6M undisclosed (Mar 2025). DeFi. Crypto-Fundraising confirmed.",btn:null},
    {name:"Prime Intellect",cat:"Private",detail:"$15M (Feb 2025). Founders Fund led. Explicitly listed as 'Balaji Srinivasan (Network School)'.",btn:null},
    {name:"Catena Labs",cat:"Private",detail:"$18M seed (May 2025). a16z crypto led. AI-native bank, Circle co-founder Sean Neville.",btn:null},
    {name:"Helius",cat:"Private",detail:"$9.5M Series A (Feb 2024). The Block confirmed. Co-invested with Toly and Kyle Samani.",btn:null},
    // EXITS (Tracxn confirmed)
    {name:"Magna",cat:"Private",detail:"Portfolio exit. Tracxn confirmed.",btn:EXITED},
    {name:"Opyn",cat:"Private",detail:"DeFi options protocol. Portfolio exit. Tracxn confirmed.",btn:EXITED},
    {name:"Arcana",cat:"Private",detail:"Portfolio exit. Tracxn confirmed.",btn:EXITED},
    // NON-CRYPTO / DEFENSE / MEDIA
    {name:"ZeroMark",cat:"Private",detail:"Defense AI, anti-drone. a16z's Katherine Boyle led. 'Balaji Srinivasan' listed as angel.",btn:null},
    {name:"River Platform",cat:"Private",detail:"$1.6M (Oct 2024). Events platform for Tim Ferriss, All-In Podcast, Solana Foundation.",btn:null},
    {name:"Smashing",cat:"Private",detail:"$3.4M seed (Jun 2024). Social media burnout app.",btn:null},
    {name:"CitizenX",cat:"Private",detail:"$800K pre-seed (Jan 2024). Citizenship investment platform. Network State thesis.",btn:null},
    {name:"Parallax",cat:"Private",detail:"$4.5M seed (Sep 2023).",btn:null},
    {name:"Stack (Loyalty)",cat:"Crypto",detail:"Loyalty points as onchain primitive.",btn:null},
    {name:"Quillette",cat:"Private",detail:"Long-form journalism platform. Ideologically aligned media play.",btn:null},
    {name:"PropEquity",cat:"Private",detail:"Very early investment (board member). Real estate data analytics platform, India.",btn:null},
  ],
  recent:[
    {deal:"ZODL / Zcash Open Dev Lab",date:"Mar 2026",note:"$25M seed — Paradigm, a16z"},
    {deal:"Project Eleven",date:"Jan 2026",note:"$20M — post-quantum crypto"},
    {deal:"Reason Robotics",date:"Dec 2025",note:"Most recent PitchBook"},
    {deal:"Arctus Aerospace",date:"Nov 2025",note:"$2.6M pre-seed — confirmed"},
    {deal:"0xbow / Privacy Pools",date:"Nov 2025",note:"$3.5M seed — The Block"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// VITALIK BUTERIN — complete portfolio
// ─────────────────────────────────────────────────────────────────────────────
const vitalik = {
  id:"vitalik", name:"Vitalik Buterin", handle:"@VitalikButerin",
  title:"Ethereum Founder · Thiel Fellow 2014",
  netWorth:"~$1.04B", category:"Crypto · ZK Proofs · Privacy",
  thesis:"Fund Ethereum infrastructure, ZK proofs, privacy, and hard science markets undervalue. Not optimizing for financial return.",
  keyNumber:{label:"ETH held",value:"240,042"},
  tag:"Benevolent Maximalist", tagColor:"indigo",
  portfolio:[
    {name:"Ethereum",cat:"Founded",detail:"Whitepaper 2013. Launched 2015. ~240,042 ETH (~$1B+). Has not sold for personal gain since 2018. $12.33M in Aave V3.",btn:CB("ethereum","ETH")},
    {name:"Bitcoin Magazine",cat:"Founded",detail:"Co-founded 2011 at age 17. First serious Bitcoin journalism.",btn:null},
    {name:"Balvi Philanthropic Fund",cat:"Founded",detail:"$1.14B SHIB → India COVID relief. $665M → Future of Life Institute. Multiple $10-15M science grants.",btn:null},
    {name:"Polymarket",cat:"Private",detail:"$45M Series B (May 2024). His largest single investment. Prediction markets as information infrastructure.",btn:FORGE},
    {name:"StarkWare",cat:"Private",detail:"$6M seed (May 2018). ZK-proof L2 pioneer. Long-held position since founding.",btn:FORGE},
    {name:"Aztec Labs",cat:"Private",detail:"$17M Series A (Oct 2021). Privacy-first ZK rollup.",btn:null},
    {name:"Nomic Foundation / Hardhat",cat:"Private",detail:"$15M (Feb 2022). Core Ethereum developer tooling infrastructure.",btn:null},
    {name:"MegaETH",cat:"Private",detail:"$20M seed (Jun 2024). High-performance EVM chain targeting 100K+ TPS.",btn:null},
    {name:"RISE Chain",cat:"Private",detail:"$3.2M seed (Sep 2024). Another high-performance L2.",btn:null},
    {name:"Daimo",cat:"Private",detail:"$2M seed (Mar 2024). Stablecoin-native payments app on-chain.",btn:null},
    {name:"Kakarot Labs",cat:"Private",detail:"Jun 2023. ZK-EVM implementation. Acquired.",btn:EXITED},
    {name:"Nocturne Labs",cat:"Private",detail:"$6M seed (Oct 2023). Shut down Jun 2024. Privacy protocol.",btn:EXITED},
    {name:"Rarimo",cat:"Private",detail:"Angel (Nov/Dec 2024). Decentralized identity and privacy protocol.",btn:null},
    {name:"0xbow / Privacy Pools",cat:"Private",detail:"Undisclosed (Apr 2025). Ethereum-compliant privacy mixing.",btn:null},
    {name:"Etherealize",cat:"Private",detail:"Grant 2024 + $40M raise Sep 2025. Electric Capital, Paradigm led. Institutional ETH access.",btn:null},
    {name:"Varro Life Sciences",cat:"Private",detail:"$20M (Oct 2024). Pathogen biosensor technology.",btn:null},
    {name:"Orchid",cat:"Private",detail:"2023. Reproductive genomics startup.",btn:null},
    {name:"Swift Solar",cat:"Private",detail:"Perovskite solar cells. Clean energy. Per Tracxn.",btn:null},
    // TOKEN HOLDINGS (on-chain confirmed)
    {name:"STRK (StarkNet Tokens)",cat:"Crypto",detail:"Unlocked 845,205 STRK in May 2024. Has not sold. From StarkWare/StarkNet relationship.",btn:null},
    {name:"WHITE Token",cat:"Crypto",detail:"~$1.16M gifted token holding. Retained, not sold.",btn:null},
    {name:"MOODENG (Memecoin)",cat:"Crypto",detail:"~$442K. Gifted memecoin. Retained.",btn:null},
    {name:"Aave V3 (DeFi)",cat:"Crypto",detail:"$12.33M deposited in Aave V3. Largest active DeFi position. On-chain confirmed.",btn:null},
    // Philanthropy positions (significant)
    {name:"UC San Diego ($15M USDC)",cat:"Philanthropy",detail:"2023. Airborne disease prevention research.",btn:null},
    {name:"University of Maryland ($9.4M)",cat:"Philanthropy",detail:"2022. UV light sterilization research.",btn:null},
    {name:"SENS Research Foundation",cat:"Philanthropy",detail:"$2.4M (2018) + $50K (2020). Anti-aging research.",btn:null},
    {name:"Future of Life Institute ($665M)",cat:"Philanthropy",detail:"SHIB donation to AI/existential risk research.",btn:null},
  ],
  recent:[
    {deal:"Etherealize",date:"Sep 2025",note:"$40M raise — institutional Ethereum"},
    {deal:"0xbow / Privacy Pools",date:"Apr 2025",note:"Undisclosed — privacy"},
    {deal:"Varro Life Sciences",date:"Oct 2024",note:"$20M biosensors"},
    {deal:"Rarimo",date:"Nov 2024",note:"Angel — identity"},
    {deal:"Daimo",date:"Mar 2024",note:"$2M seed — stablecoin wallet"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TOLY — complete portfolio
// ─────────────────────────────────────────────────────────────────────────────
const toly = {
  id:"toly", name:"Anatoly Yakovenko", handle:"@aeyakovenko",
  title:"Solana Co-Founder",
  netWorth:"$250M–$800M", category:"Solana Ecosystem",
  thesis:"Solana is the Nasdaq of blockchains. One global state machine running at the speed of light.",
  keyNumber:{label:"Solana TPS (peak)",value:"65,000+"},
  tag:"Solana Maximalist", tagColor:"purple",
  portfolio:[
    {name:"Solana",cat:"Founded",detail:"Co-founded 2017. Invented Proof of History. Estimated 5-10% supply. $250M-$800M estimated value.",btn:CB("solana","SOL")},
    {name:"Solana Foundation",cat:"Founded",detail:"Non-profit supporting ecosystem development worldwide.",btn:null},
    {name:"Jito Labs",cat:"Private",detail:"MEV infrastructure + liquid staking. Dominant market position in Solana MEV.",btn:null},
    {name:"Helius",cat:"Private",detail:"$9.5M Series A (Feb 2024, co-invested with Balaji). Premier Solana RPC provider.",btn:null},
    {name:"Chaos Labs",cat:"Private",detail:"$55M Series A. On-chain risk management for DeFi protocols.",btn:null},
    {name:"Solayer",cat:"Private",detail:"Pre-seed + $12M seed. Solana restaking protocol.",btn:null},
    {name:"Squads",cat:"Private",detail:"$5.7M. Smart account and multisig infrastructure for Solana.",btn:null},
    {name:"Zama",cat:"Private",detail:"$73M. Fully homomorphic encryption (FHE) for blockchain.",btn:FORGE},
    {name:"io.net",cat:"Private",detail:"Decentralized GPU network. Significant Series A. Key Solana ecosystem pillar.",btn:FORGE},
    {name:"Oobit",cat:"Private",detail:"$25M Series A. Led by Tether and Toly. Crypto payments.",btn:null},
    {name:"Drift Protocol",cat:"Crypto",detail:"Solana-native perpetuals DEX. Major ecosystem position.",btn:null},
    {name:"Ellipsis Labs",cat:"Private",detail:"Solana AMM infrastructure. Phoenix DEX.",btn:null},
    {name:"Fragmetric",cat:"Crypto",detail:"Solana restaking protocol.",btn:null},
    {name:"Infinex",cat:"Crypto",detail:"Kain Warwick's non-custodial exchange frontend.",btn:null},
    {name:"Blockcast",cat:"Private",detail:"Data broadcast infrastructure for Solana.",btn:null},
    {name:"Fuse Energy",cat:"Private",detail:"Decentralized physical infrastructure (DePIN) for energy.",btn:null},
    {name:"Merit Systems",cat:"Private",detail:"$10M seed (Jan 2025). a16z + Balaji co-invested. Digital government payments.",btn:null},
    {name:"FrodoBots AI",cat:"Private",detail:"Seed (Feb 2025). AI-powered robotics.",btn:null},
    {name:"Tab",cat:"Crypto",detail:"Jan 2024. Crypto financial product, Solana-native. Confirmed by Crunchbase investment timeline.",btn:null},
    {name:"Slingshot Finance",cat:"Crypto",detail:"Solana-native trading aggregator.",btn:null},
    {name:"worm.wtf",cat:"Crypto",detail:"$4.5M (Dec 2025). Most recent confirmed (CryptoRank).",btn:null},
    {name:"Asgard Finance",cat:"Crypto",detail:"$2.2M (Dec 2025).",btn:null},
    {name:"Ryder",cat:"Private",detail:"$3.2M (Oct 2025). Hardware wallet / security device.",btn:null},
    {name:"Inference / Kuzco",cat:"Private",detail:"$11.8M (Oct 2025). Distributed AI inference on Solana.",btn:null},
    {name:"BULK",cat:"Crypto",detail:"$8M (Sep 2025). Solana ecosystem.",btn:null},
    {name:"Pulse",cat:"Crypto",detail:"Nov 2024.",btn:null},
    {name:"USDO / OpenDelta",cat:"Crypto",detail:"Nov 2024. Decentralized stablecoin.",btn:null},
  ],
  recent:[
    {deal:"worm.wtf",date:"Dec 2025",note:"$4.5M — CryptoRank confirmed"},
    {deal:"Asgard Finance",date:"Dec 2025",note:"$2.2M"},
    {deal:"Ryder",date:"Oct 2025",note:"$3.2M hardware wallet"},
    {deal:"Inference / Kuzco",date:"Oct 2025",note:"$11.8M distributed AI"},
    {deal:"Merit Systems",date:"Jan 2025",note:"$10M seed w/ Balaji + a16z"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// THIEL — complete portfolio
// ─────────────────────────────────────────────────────────────────────────────
const thiel = {
  id:"thiel", name:"Peter Thiel", handle:"@peterthiel",
  title:"Founders Fund · Palantir · PayPal Mafia",
  netWorth:"$27.5B", category:"Deep Tech · Defense · AI",
  thesis:"Zero to One. Monopolies, not competition. Singular contrarian founders who create entirely new categories.",
  keyNumber:{label:"Palantir shares held",value:"68.87M"},
  tag:"Contrarian Kingmaker", tagColor:"red",
  portfolio:[
    // FOUNDED / VEHICLES
    {name:"PayPal",cat:"Founded",detail:"Co-founded 1998. CEO. Sold to eBay $1.5B (2002). Spawned the PayPal Mafia (Musk, Hoffman, Levchin, Chen, Rabois). Returned ~$55M to Thiel personally.",btn:EXITED},
    {name:"Palantir (PLTR)",cat:"Founded",detail:"Co-founded 2003, chairman since. IPO 2020 at $20B. Now $300B+ market cap. Thiel holds 68.87M shares = ~$10.3B (Mar 2026). Most valuable business he ever helped start.",btn:YF("PLTR")},
    {name:"Founders Fund",cat:"Founded",detail:"Co-founded 2005 with Ken Howery and Luke Nosek. $17B+ AUM. Closed $4.6B late-stage growth fund (Apr 2025) — firm's largest raise ever.",btn:null},
    {name:"Valar Ventures",cat:"Founded",detail:"Co-founded 2010. Fintech-focused, international. 20+ portfolio companies across global fintech.",btn:null},
    {name:"Mithril Capital",cat:"Founded",detail:"Co-founded 2012 with Jim O'Neill and Ajay Royan. $1.3B+ AUM. Growth-stage. Invests in companies beyond startup stage ready to scale.",btn:null},
    {name:"Thiel Capital",cat:"Founded",detail:"Founded 2011. Personal family office. Incubated Founders Fund, Mithril, Valar, Thiel Fellowship, Breakout Labs. Sponsors Crescendo Equity Partners.",btn:null},
    {name:"Thiel Macro",cat:"Founded",detail:"Public markets hedge fund. One of Thiel's 8 investment vehicles for deploying capital across public equities.",btn:null},
    {name:"Clarium Capital",cat:"Founded",detail:"Global macro hedge fund, San Francisco. Earlier vehicle. Wound down after peak.",btn:null},
    {name:"America's Frontier Fund",cat:"Founded",detail:"Co-founded with Eric Schmidt. Deep tech and national security focus.",btn:null},
    {name:"Pronomos Capital",cat:"Founded",detail:"Anchor backer. VC-style fund for experimental charter cities in vacant lands. Backed Próspera (Honduras), Praxis.",btn:null},
    {name:"1517 Fund",cat:"Founded",detail:"Backed fund (founded by former Thiel Fellowship directors). Targets dropouts and deep-tech scientists. Portfolio: Luminar, Loom, Atom Computing, Durin Mining.",btn:null},
    {name:"Thiel Fellowship",cat:"Founded",detail:"$100K to skip college and build. 13.79% unicorn hit rate. $750B+ value created. Alumni: Vitalik (ETH), Dylan Field (Figma), Austin Russell (Luminar), Lucy Guo (Scale AI), Laura Deming (Longevity Fund), Chris Olah (Anthropic), Robert Habermeier (Polkadot).",btn:null},
    // FOUNDERS FUND portfolio (confirmed)
    {name:"SpaceX",cat:"Private",detail:"First institutional investor. FF. $350B+ current valuation. Position alone worth more than FF's total AUM.",btn:FORGE},
    {name:"Anduril",cat:"Private",detail:"Led $1B of $2.5B Series G (2025). Largest FF investment in history. Defense AI and autonomous systems. Palmer Luckey — Thiel's mentee.",btn:FORGE},
    {name:"Stripe",cat:"Private",detail:"Early FF position. $50B+ valuation. One of the greatest VC bets in history.",btn:FORGE},
    {name:"OpenAI",cat:"Private",detail:"Founders Fund original backer. Sam Altman — Thiel mentored.",btn:FORGE},
    {name:"Neuralink",cat:"Private",detail:"Brain-computer interfaces. Founders Fund.",btn:FORGE},
    {name:"Rippling",cat:"Private",detail:"HR/finance platform. $13.5B+ valuation. FF.",btn:FORGE},
    {name:"Ramp",cat:"Private",detail:"Corporate spend management. $16B valuation. FF.",btn:FORGE},
    {name:"Airbnb",cat:"Private",detail:"Early FF position. Public (ABNB).",btn:YF("ABNB")},
    {name:"Spotify",cat:"Private",detail:"Pre-IPO FF position. Public (SPOT).",btn:YF("SPOT")},
    {name:"Lyft",cat:"Private",detail:"Pre-IPO FF position. Public (LYFT).",btn:YF("LYFT")},
    {name:"Nubank",cat:"Private",detail:"Brazilian neobank. $50B+ market cap. FF. Public (NU).",btn:YF("NU")},
    {name:"DeepMind",cat:"Private",detail:"AI research lab. FF. Acquired by Google for $500M (2014).",btn:EXITED},
    {name:"Varda Space Industries",cat:"Private",detail:"In-orbit pharmaceutical manufacturing. Contrarian and unique FF bet.",btn:FORGE},
    {name:"Pudgy Penguins",cat:"Crypto",detail:"Leading NFT brand. Founders Fund. Luca Netz.",btn:null},
    {name:"Cognition AI",cat:"Private",detail:"AI coding agent 'Devin'. 2024 unicorn. FF.",btn:FORGE},
    {name:"SentientAGI",cat:"Private",detail:"$85M UAE seed (2024). Open-source sovereign AI for Gulf nations. FF led.",btn:null},
    {name:"Netic",cat:"Private",detail:"AI for SMBs. FF led $23M Series B (late 2025).",btn:null},
    {name:"Wish.com",cat:"Private",detail:"E-commerce platform. FF position.",btn:null},
    {name:"Valinor",cat:"Private",detail:"FF portfolio company.",btn:null},
    {name:"General Matter",cat:"Private",detail:"Nuclear fuel company. FF portfolio.",btn:null},
    {name:"ZocDoc",cat:"Private",detail:"Doctor appointment booking platform. FF.",btn:FORGE},
    {name:"Flexport",cat:"Private",detail:"Digital freight / logistics. Unicorn. FF.",btn:FORGE},
    {name:"Asana",cat:"Private",detail:"Work management. Public (ASAN). FF and Thiel personal.",btn:YF("ASAN")},
    // MITHRIL CAPITAL portfolio (confirmed)
    {name:"Helion Energy",cat:"Private",detail:"Fusion energy. $425M round (Jan 2025). Mithril board member.",btn:FORGE},
    {name:"Oklo",cat:"Private",detail:"Nuclear microreactor. Public (OKLO). Mithril board member.",btn:YF("OKLO")},
    {name:"BlackSky",cat:"Private",detail:"Dual-use satellite geospatial intelligence. Public (BKSY). Mithril.",btn:YF("BKSY")},
    {name:"Invivyd",cat:"Private",detail:"Monoclonal antibody therapies. Mithril.",btn:null},
    {name:"Forsight Robotics",cat:"Private",detail:"Israeli eye surgery robotics. Mithril.",btn:null},
    {name:"Fractyl Health",cat:"Private",detail:"Metabolic disease (GLP-1 alternative). IPO 2024. Mithril.",btn:YF("GUTS")},
    {name:"Paxos",cat:"Crypto",detail:"Blockchain infrastructure and stablecoin issuer. Mithril and FF.",btn:FORGE},
    {name:"Auris Health",cat:"Private",detail:"Surgical robotics — considered one of Mithril's best deals. Acquired by J&J.",btn:EXITED},
    // VALAR VENTURES portfolio (full confirmed list)
    {name:"Wise (TransferWise)",cat:"Private",detail:"Global money transfer. $11B+ valuation. Valar flagship.",btn:FORGE},
    {name:"N26",cat:"Private",detail:"German neobank. $9B+ valuation. Valar.",btn:FORGE},
    {name:"Qonto",cat:"Private",detail:"French business banking. Unicorn. Valar.",btn:FORGE},
    {name:"Bitpanda",cat:"Private",detail:"Austrian crypto/investment platform. Valar.",btn:FORGE},
    {name:"Xero",cat:"Private",detail:"Cloud accounting software. Public in Australia. Valar.",btn:null},
    {name:"Kuda Bank",cat:"Private",detail:"Nigerian neobank. Valar.",btn:null},
    {name:"Novo",cat:"Private",detail:"US small business banking. Valar.",btn:null},
    {name:"Treecard",cat:"Private",detail:"Green debit card — plants trees. Valar.",btn:null},
    {name:"Fortú",cat:"Private",detail:"Latin American fintech. Valar.",btn:null},
    {name:"Bukuwarung",cat:"Private",detail:"Indonesian SMB bookkeeping app. Valar.",btn:null},
    {name:"Maplerad",cat:"Private",detail:"African fintech payments infrastructure. Valar.",btn:null},
    {name:"Albo",cat:"Private",detail:"Mexican neobank. Valar.",btn:null},
    {name:"Mondu",cat:"Private",detail:"B2B BNPL. Valar.",btn:null},
    {name:"Moss",cat:"Private",detail:"German corporate spend management. Valar.",btn:null},
    {name:"Taxfix",cat:"Private",detail:"Tax filing app (Germany/UK). Valar.",btn:null},
    {name:"Ivy",cat:"Private",detail:"Open banking payments. Valar.",btn:null},
    {name:"Baraka",cat:"Private",detail:"UAE retail investing platform. Valar.",btn:null},
    {name:"Syfe Group",cat:"Private",detail:"Singapore digital wealth manager. Valar.",btn:null},
    {name:"Atoa",cat:"Private",detail:"UK open banking payments. Valar.",btn:null},
    {name:"Hero",cat:"Private",detail:"UK pharmacy platform. Valar.",btn:null},
    {name:"Regate",cat:"Private",detail:"French accounting automation. Valar.",btn:null},
    {name:"Tagomi",cat:"Private",detail:"Institutional crypto trading platform. Acquired by Coinbase (2020).",btn:EXITED},
    {name:"Layer1",cat:"Crypto",detail:"Bitcoin mining infrastructure. Valar.",btn:null},
    {name:"Vauld",cat:"Private",detail:"Crypto lending platform. Valar. Bankrupt 2022.",btn:EXITED},
    {name:"BlockFi",cat:"Private",detail:"Crypto lending. Valar held 19%. Bankrupt Nov 2022.",btn:EXITED},
    // 1517 FUND portfolio (Thiel-backed fund)
    {name:"Luminar Technologies",cat:"Private",detail:"LiDAR for autonomous vehicles. 1517 Fund. Austin Russell — Thiel Fellow. Public (LAZR).",btn:YF("LAZR")},
    {name:"Loom",cat:"Private",detail:"Screen recording and video messaging. 1517 Fund. Acquired by Atlassian for $975M.",btn:EXITED},
    {name:"Atom Computing",cat:"Private",detail:"Quantum computing. 1517 Fund.",btn:null},
    {name:"Durin Mining Technologies",cat:"Private",detail:"Critical minerals. 1517 Fund.",btn:null},
    // PERSONAL / THIEL CAPITAL direct
    {name:"Facebook / Meta",cat:"Private",detail:"$500K for 10.2% → sold $1.1B+ post-IPO. Most famous angel bet ever. Now holds ~10K shares.",btn:YF("META")},
    {name:"LinkedIn",cat:"Private",detail:"Early investor (Founders Fund bio). Acquired by Microsoft $26B (2016).",btn:EXITED},
    {name:"Yelp",cat:"Private",detail:"Early investor. Confirmed multiple sources.",btn:YF("YELP")},
    {name:"Clearview AI",cat:"Private",detail:"Facial recognition. 2017, one of its first outside investors.",btn:null},
    {name:"AbCellera Biologics (ABCL)",cat:"Private",detail:"14.36M shares (SEC filing). AI antibody discovery. Board member.",btn:YF("ABCL")},
    {name:"Etched",cat:"Private",detail:"Transformer-specific ASIC chip. $5B valuation ($500M raise). Named in press release alongside Bryan Johnson and Balaji Srinivasan.",btn:FORGE},
    {name:"Panacea Financial",cat:"Private",detail:"Arkansas-based fintech for medical practitioners (doctors). Thiel Capital. Wikipedia confirmed.",btn:null},
    {name:"SILQ",cat:"Private",detail:"Riyadh-based B2B commerce platform for Gulf and South Asia (merger of Bangladesh Shop-Up + Saudi Sary). Thiel Capital. Wikipedia confirmed.",btn:null},
    {name:"Neo",cat:"Private",detail:"Canadian fintech. Thiel Capital. Wikipedia confirmed.",btn:null},
    {name:"Gaia",cat:"Private",detail:"London-based fertility care startup. Thiel Capital. Wikipedia confirmed.",btn:null},
    {name:"NAGA Group",cat:"Private",detail:"Hamburg-based trading/fintech. Thiel acquired stake via Elevat3 + Founders Fund + Apeiron Group (bought from Fosun International, 2022).",btn:null},
    {name:"Heidelberger Beteiligungsholding / SQD.AI",cat:"Crypto",detail:"German company being renamed SQD.AI Strategies AG — first dedicated German crypto holding treasury. Thiel holds shares through the firm.",btn:null},
    {name:"Crescendo Equity Partners",cat:"Private",detail:"Seoul-based private equity — mid-cap manufacturing and tech in Asia. Co-founded with Peter Thiel's sponsorship (2012). Matt Danzeisen on investment committee.",btn:null},
    {name:"Olsam",cat:"Private",detail:"London-based e-commerce aggregator startup. Valar portfolio.",btn:null},
    {name:"Praxis",cat:"Private",detail:"City-state company exploring Greenland as a possible location. Backed through Pronomos Capital.",btn:null},
    {name:"BitPay",cat:"Crypto",detail:"Bitcoin payment processing. Led $2M round in 2014 — his first crypto investment.",btn:EXITED},
    {name:"Block.one / EOS",cat:"Crypto",detail:"Blockchain platform. Confirmed PANews.",btn:null},
    {name:"Bullish",cat:"Crypto",detail:"Institutional crypto exchange. Pre-IPO backer. Public via SPAC.",btn:null},
    {name:"BitMine Immersion Technologies (BMNR)",cat:"Crypto",detail:"Thiel disclosed 9.1% stake mid-2025. Company became the largest corporate ETH holder with 1.2M+ Ethereum tokens.",btn:YF("BMNR")},
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"FF bought $15-20M BTC (2017). Sold $1.8B worth (Mar 2022) ahead of crash. Re-entered $200M+ in BTC+ETH (Summer 2023) below $30K.",btn:CB("bitcoin","BTC")},
  ],
  recent:[
    {deal:"Anduril Series G",date:"2025",note:"Led $1B — largest FF investment ever"},
    {deal:"Netic (AI for SMBs)",date:"Late 2025",note:"FF led $23M Series B"},
    {deal:"SentientAGI",date:"2024",note:"$85M UAE seed — FF led"},
    {deal:"Helion Energy",date:"Jan 2025",note:"$425M fusion — via Mithril"},
    {deal:"BitMine stake",date:"Mid-2025",note:"9.1% — ETH treasury play"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BRYAN JOHNSON — complete portfolio
// ─────────────────────────────────────────────────────────────────────────────
const bryan = {
  id:"bryan", name:"Bryan Johnson", handle:"@bryan_johnson",
  title:"Blueprint · OS Fund · Kernel",
  netWorth:"~$400M", category:"Longevity · Biotech · AI",
  thesis:"Don't die. The company that solves aging will be worth more than any company that has ever existed.",
  keyNumber:{label:"Daily protocols run",value:"111"},
  tag:"Longevity Evangelist", tagColor:"green",
  portfolio:[
    {name:"Braintree / Venmo",cat:"Founded",detail:"Founded 2007. Sold to PayPal for $800M (2013). The capital base for everything since.",btn:EXITED},
    {name:"OS Fund",cat:"Founded",detail:"$100M personal fund (2014). 44 portfolio companies. Moonshot science bets only.",btn:null},
    {name:"Kernel",cat:"Founded",detail:"$154M personal investment (2016). Non-invasive brain-computer interface company.",btn:null},
    {name:"Blueprint Protocol",cat:"Founded",detail:"$60M raised (Oct 2025). Investors: Naval, Balaji, Winklevoss twins, Kim Kardashian, Logan Paul, Alex Hormozi, Ari Emanuel. Bryan is the test subject.",btn:WEB("https://blueprint.bryanjohnson.com")},
    // OS FUND portfolio (confirmed)
    {name:"Ginkgo Bioworks (DNA)",cat:"Private",detail:"Synthetic biology platform. Now publicly traded on NYSE (DNA).",btn:YF("DNA")},
    {name:"Atomwise",cat:"Private",detail:"AI-powered drug discovery. Raised $174M total.",btn:FORGE},
    {name:"twoXAR / Aria",cat:"Private",detail:"AI drug discovery. Acquired/pivoted.",btn:null},
    {name:"Catalog",cat:"Private",detail:"DNA data storage — trillion bits per gram capacity.",btn:null},
    {name:"Matternet",cat:"Private",detail:"Medical drone delivery in Switzerland.",btn:null},
    {name:"Synthego",cat:"Private",detail:"CRISPR genomics tools company. Acquired by Perceptive Biosciences (Jun 2025).",btn:EXITED},
    {name:"Pivot Bio",cat:"Private",detail:"Nitrogen-fixing microbes replacing chemical fertilizer.",btn:FORGE},
    {name:"Arzeda",cat:"Private",detail:"Computational protein design / enzyme engineering.",btn:null},
    {name:"NuMat Technologies",cat:"Private",detail:"Metal-organic framework materials for gas storage.",btn:null},
    {name:"Vicarious",cat:"Private",detail:"AI robotics. Acquired by Alphabet (SoftBank intermediary).",btn:EXITED},
    {name:"JUST Egg / Eat Just",cat:"Private",detail:"Plant-based eggs. Unicorn. First cultivated meat product approval.",btn:FORGE},
    {name:"Human Longevity Inc.",cat:"Private",detail:"Genomics and longevity data platform.",btn:FORGE},
    {name:"Planetary Resources",cat:"Private",detail:"Asteroid mining. Acquired by ConsenSys.",btn:EXITED},
    {name:"Synthetic Genomics",cat:"Private",detail:"J. Craig Venter's synthetic biology company.",btn:null},
    {name:"Emerald Therapeutics",cat:"Private",detail:"Drug discovery platform. OS Fund confirmed via Wikipedia and Golden.",btn:null},
    {name:"uBiome",cat:"Private",detail:"Human microbiome sequencing database. OS Fund. Confirmed by SynBioBeta and CB Insights.",btn:null},
    {name:"Verge Genomics",cat:"Private",detail:"AI-powered neurodegenerative disease drug discovery.",btn:FORGE},
    {name:"Truvian Health",cat:"Private",detail:"Automated blood testing at patient scale.",btn:FORGE},
    {name:"Elysium Health",cat:"Private",detail:"Longevity supplements (NAD+ via Basis). Science-backed.",btn:null},
    {name:"Tempo Automation",cat:"Private",detail:"PCB manufacturing automation. IPO Nov 2022.",btn:EXITED},
    // Personal angel
    {name:"Etched",cat:"Private",detail:"$5B valuation. Transformer-specific ASIC chip. Co-invested with Thiel and Balaji (confirmed press release).",btn:FORGE},
    {name:"Apollo Research",cat:"Private",detail:"Jan 2026. AI safety research organization.",btn:null},
    {name:"Stable",cat:"Private",detail:"Seed (Jul 2025). Undisclosed sector.",btn:null},
    {name:"Steven.com",cat:"Private",detail:"AI/media company. Confirmed by PitchBook as Bryan Johnson portfolio company.",btn:null},
  ],
  recent:[
    {deal:"Apollo Research",date:"Jan 2026",note:"AI safety"},
    {deal:"Stable",date:"Jul 2025",note:"Seed"},
    {deal:"Blueprint raise",date:"Oct 2025",note:"$60M total — notable investor roster"},
    {deal:"Synthego exit",date:"Jun 2025",note:"OS Fund exit — Perceptive Biosciences"},
    {deal:"Etched (co-invest)",date:"2025",note:"$5B valuation w/ Thiel + Balaji"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TIM FERRISS — complete portfolio
// ─────────────────────────────────────────────────────────────────────────────
const ferriss = {
  id:"ferriss", name:"Tim Ferriss", handle:"@tferriss",
  title:"Author · Angel · Saisei Foundation",
  netWorth:"~$100M+", category:"Consumer · Wellness · Startups",
  thesis:"Back founders building things I personally use. Consumer and lifestyle businesses where credibility drives distribution.",
  keyNumber:{label:"Disclosed portfolio companies",value:"50+"},
  tag:"Self-Experimenter", tagColor:"orange",
  portfolio:[
    {name:"Saisei Foundation",cat:"Founded",detail:"Psychedelic research philanthropy. $3M+ personal. Organized $17M for Johns Hopkins (US first). $1M to MAPS Capstone Challenge. Founded Imperial College London program.",btn:null},
    {name:"Uber",cat:"Private",detail:"Pre-seed advisor when ~10 employees. One of the greatest advisor equity positions in VC history.",btn:YF("UBER")},
    {name:"Facebook / Meta",cat:"Private",detail:"Early investment. Massive return.",btn:YF("META")},
    {name:"Twitter / X",cat:"Private",detail:"Early investment. Published portfolio.",btn:null},
    {name:"Shopify",cat:"Private",detail:"First advisor with ~5 employees. Now $150B+ company.",btn:YF("SHOP")},
    {name:"Duolingo",cat:"Private",detail:"Led Series A. IPO'd at $11B+. ~50x+ return.",btn:YF("DUOL")},
    {name:"Airbnb",cat:"Private",detail:"Early angel.",btn:YF("ABNB")},
    {name:"Alibaba",cat:"Private",detail:"Early. Published portfolio.",btn:YF("BABA")},
    {name:"SpaceX",cat:"Private",detail:"Investor. Published portfolio.",btn:FORGE},
    {name:"AngelList",cat:"Private",detail:"Early investor. Published portfolio. Frequent co-investor with Naval.",btn:null},
    {name:"Wealthfront",cat:"Private",detail:"Robo-advisor. Early investor. Published portfolio.",btn:FORGE},
    {name:"Nextdoor",cat:"Private",detail:"Neighborhood social. Public (KIND). Published portfolio.",btn:YF("KIND")},
    {name:"TaskRabbit",cat:"Private",detail:"First advisor. Acquired by IKEA (2017).",btn:EXITED},
    {name:"CLEAR",cat:"Private",detail:"First advisor. Biometric identity. IPO'd (YOU).",btn:YF("YOU")},
    {name:"Automattic",cat:"Private",detail:"WordPress parent company. $7.5B valuation. Published portfolio.",btn:FORGE},
    {name:"Blue Bottle Coffee",cat:"Private",detail:"Early investor. Acquired by Nestlé ~$500M (2017).",btn:EXITED},
    {name:"Commonwealth Fusion Systems",cat:"Private",detail:"Plasma fusion energy. Long-term bet. MIT spin-out.",btn:FORGE},
    {name:"Maui Nui Venison",cat:"Private",detail:"Regenerative wild deer harvesting. Published portfolio.",btn:null},
    {name:"LALO Tequila",cat:"Private",detail:"Published portfolio.",btn:null},
    {name:"Huckberry",cat:"Private",detail:"Outdoor/adventure lifestyle brand. Published portfolio.",btn:null},
    {name:"NoRedInk",cat:"Private",detail:"Writing education platform. Published portfolio.",btn:null},
    {name:"The Way",cat:"Private",detail:"Published portfolio.",btn:null},
    {name:"Harbor",cat:"Private",detail:"Securities tokenization. Published portfolio.",btn:null},
    {name:"OpenSea",cat:"Private",detail:"Series A (2021). NFT marketplace. $13.3B peak.",btn:FORGE},
    {name:"Zendrive",cat:"Private",detail:"Telematics / driver safety. TechCrunch confirmed (2013).",btn:null},
    {name:"Haus",cat:"Private",detail:"Low-ABV aperitifs. $7.1M seed (2019).",btn:null},
    {name:"Rosebud",cat:"Private",detail:"AI journaling app. Jun 2025. TechCrunch confirmed.",btn:null},
    {name:"Oboe",cat:"Private",detail:"Music tech. Oct 2024.",btn:null},
    {name:"SkyKick",cat:"Private",detail:"Cloud SaaS for IT. Exit Sep 2024.",btn:EXITED},
    // From Crunchbase / Wellfound (all confirmed database entries)
    {name:"Evernote",cat:"Private",detail:"Note-taking app. Crunchbase confirmed Ferriss investment.",btn:null},
    {name:"Posterous",cat:"Private",detail:"Blogging platform. Acquired by Twitter (2012). Crunchbase confirmed.",btn:EXITED},
    {name:"RescueTime",cat:"Private",detail:"Time tracking and productivity software. Crunchbase confirmed.",btn:null},
    {name:"BranchOut",cat:"Private",detail:"Professional networking on Facebook. Crunchbase confirmed.",btn:null},
    {name:"about.me",cat:"Private",detail:"Personal landing page platform. Acquired by AOL. Crunchbase confirmed.",btn:EXITED},
    {name:"DailyBurn",cat:"Private",detail:"Fitness tracking and video workouts. Crunchbase confirmed.",btn:null},
    {name:"CreativeLive",cat:"Private",detail:"Online learning platform for creatives. Crunchbase confirmed.",btn:null},
    {name:"Soma Water",cat:"Private",detail:"Design-forward water filtration carafe. Crunchbase confirmed.",btn:null},
    {name:"The Hustle",cat:"Private",detail:"Business newsletter/media. Acquired by HubSpot. Crunchbase confirmed.",btn:EXITED},
    {name:"Shift",cat:"Private",detail:"Desktop app for managing multiple accounts/apps. Crunchbase confirmed.",btn:null},
    {name:"Reputation.com",cat:"Private",detail:"Online reputation management SaaS. Crunchbase confirmed.",btn:null},
    {name:"Trippy",cat:"Private",detail:"Social travel recommendations. Crunchbase confirmed.",btn:null},
    {name:"Shyp",cat:"Private",detail:"On-demand package shipping. Shut down 2018. Crunchbase confirmed.",btn:EXITED},
    // Psychedelic research
    {name:"Johns Hopkins CPCR",cat:"Philanthropy",detail:"Organized $17M donation. US's first dedicated psychedelic research center.",btn:null},
    {name:"Imperial College London",cat:"Philanthropy",detail:"Funded world's first psychedelic research center.",btn:null},
    {name:"MAPS Capstone ($1M)",cat:"Philanthropy",detail:"$1M personal donation to MDMA therapy trials.",btn:null},
  ],
  recent:[
    {deal:"Rosebud",date:"Jun 2025",note:"AI journaling — TechCrunch confirmed"},
    {deal:"SkyKick",date:"Sep 2024",note:"Exit event"},
    {deal:"Oboe",date:"Oct 2024",note:"Music tech"},
    {deal:"OpenSea Series A",date:"2021",note:"NFT marketplace"},
    {deal:"Haus seed",date:"2019",note:"$7.1M — aperitifs"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ICONS DATA
// ─────────────────────────────────────────────────────────────────────────────
const lebron = {
  id:"lebron", name:"LeBron James", handle:"King James",
  title:"NBA All-Time Scorer · First Active Player Billionaire",
  netWorth:"~$1.76B", category:"Sports · Media · Consumer",
  thesis:"Every partnership converts to equity. Never take a check when you can take a stake.",
  keyNumber:{label:"Fenway stake value",value:"$141.9M"},
  tag:"Equity First", tagColor:"yellow",
  portfolio:[
    {name:"SpringHill Company",cat:"Founded",detail:"$725M valuation (2021). Merged SpringHill Entertainment, Uninterrupted, Robot Company. Netflix, Disney, HBO content. Serena Williams on board.",btn:null},
    {name:"LRMR Ventures",cat:"Founded",detail:"Family office with Maverick Carter (CEO), Rich Paul, Randy Mims.",btn:null},
    {name:"Hana Kuma",cat:"Founded",detail:"Emmy-nominated production co-founded 2022 with Naomi Osaka + Maverick Carter. Backed by Epic Games, Nike, FSG, The Players Fund.",btn:null},
    {name:"UNKNWN",cat:"Founded",detail:"Designer retail store co-founded in Miami (2011).",btn:null},
    {name:"Ladder",cat:"Founded",detail:"Health/wellness brand co-founded with Arnold Schwarzenegger (2018). Acquired by Beachbody (2020).",btn:EXITED},
    {name:"Fenway Sports Group (1%)",cat:"Private",detail:"FSG valued $14.19B (Jul 2025). Started as 2% Liverpool (2011, $6.5M) → 1% FSG (2021). Owns Red Sox, Liverpool FC, Penguins, NESN, RFK Racing. Stake worth ~$141.9M.",btn:null},
    {name:"WHOOP",cat:"Private",detail:"Series G (Mar 2026). $575M at $10.1B valuation. Named in official WHOOP press release alongside Ronaldo.",btn:FORGE},
    {name:"Beats by Dre",cat:"Private",detail:"Equity via endorsement. $30M check when Apple acquired for $3B. 'Biggest equity payout in sports history' per ESPN.",btn:EXITED},
    {name:"AC Milan",cat:"Private",detail:"Via Main Street Advisors (Aug 2022) alongside Drake, Jimmy Iovine, New York Yankees. €1.2B total RedBird deal.",btn:null},
    {name:"Blaze Pizza",cat:"Private",detail:"<$1M invested 2012. Worth $35M+ by 2017. Owned 19+ franchise locations. Exited April 2025.",btn:EXITED},
    {name:"Lobos 1707",cat:"Private",detail:"Tequila/mezcal via Main Street Advisors (2020, press release confirmed). Exited April 2025.",btn:EXITED},
    {name:"Tonal",cat:"Private",detail:"Connected home gym. Equity stake.",btn:FORGE},
    {name:"Calm",cat:"Private",detail:"Meditation/sleep app. Unicorn. Equity stake.",btn:FORGE},
    {name:"Lyft",cat:"Private",detail:"Equity stake + ambassador partnership.",btn:YF("LYFT")},
    {name:"StatusPRO",cat:"Private",detail:"Series A (Feb 2024). Sports VR training and analytics. Co-invested with Drake.",btn:null},
    {name:"Fantasy Life",cat:"Private",detail:"Led $7M seed (Jul 2025) via LRMR Ventures. Matthew Berry's fantasy sports platform.",btn:null},
    {name:"MADE Hoops",cat:"Private",detail:"Basketball platform. Nov 2025. Via LRMR Ventures.",btn:null},
  ],
  recent:[
    {deal:"WHOOP Series G",date:"Mar 2026",note:"$575M — named in official press release"},
    {deal:"MADE Hoops",date:"Nov 2025",note:"Via LRMR Ventures"},
    {deal:"Fantasy Life (led)",date:"Jul 2025",note:"$7M seed"},
    {deal:"StatusPRO",date:"Feb 2024",note:"Series A w/ Drake"},
    {deal:"Blaze + Lobos exits",date:"Apr 2025",note:"Both confirmed via CB Insights"},
  ],
};

const jayz = {
  id:"jayz", name:"Jay-Z", handle:"Shawn Carter",
  title:"Roc Nation · MarcyPen Capital Partners",
  netWorth:"~$2.5B", category:"Media · Spirits · Consumer VC",
  thesis:"Taste arbitrage. Buy what the financial establishment undervalues. Use cultural credibility to increase market value.",
  keyNumber:{label:"MarcyPen AUM",value:"$900M+"},
  tag:"Culture Arbitrageur", tagColor:"amber",
  portfolio:[
    {name:"Roc Nation",cat:"Founded",detail:"Founded 2008. Music labels, sports management (De Bruyne, Barkley, LaMelo Ball), publishing, touring, film/TV. Live Nation partnership.",btn:null},
    {name:"40/40 Club",cat:"Founded",detail:"Luxury sports bar chain in NYC. Founded 2003 with Juan Perez.",btn:null},
    {name:"Rocawear",cat:"Founded",detail:"Founded 1999. Sold to Iconix Brand Group for $204M (2007).",btn:EXITED},
    {name:"MarcyPen Capital Partners",cat:"Founded",detail:"Formed Dec 2024 via merger of Marcy Venture Partners (2018) + Pendulum Holdings. $900M AUM. Korea $500M cultural fund (Hanwha MOU, Dec 2025).",btn:null},
    {name:"Arrive (Roc Nation VC)",cat:"Founded",detail:"VC arm of Roc Nation. Invested in Sweetgreen, Kopi Kenangan.",btn:null},
    {name:"Armand de Brignac",cat:"Private",detail:"Acquired 2014. Sold 50% to LVMH (2021) for ~$300-600M. Still holds 50%. Created from Cristal boycott.",btn:null},
    {name:"D'Ussé Cognac",cat:"Private",detail:"50/50 with Bacardi since 2012. $750M deal (2023). Retains significant stake.",btn:null},
    {name:"Tidal",cat:"Private",detail:"Sold 80% to Block/Jack Dorsey for $297M (2021). Retains ~20% + Block (SQ) board seat.",btn:YF("XYZ")},
    {name:"Uber",cat:"Private",detail:"$2M in 2013 → ~$70M at IPO. Patient hold.",btn:YF("UBER")},
    {name:"Oatly",cat:"Private",detail:"Participated in $200M round (2020) w/ Oprah, Natalie Portman. Oatly IPO'd 2021.",btn:YF("OTLY")},
    {name:"Impossible Foods",cat:"Private",detail:"2019 $300M round alongside Serena Williams, Katy Perry. Plant-based meat.",btn:FORGE},
    {name:"JetSmarter",cat:"Private",detail:"'Uber for private jets.' Acquired by Vista Global (2019) → merged into XO platform.",btn:EXITED},
    {name:"Flowhub",cat:"Private",detail:"Cannabis payment software. $19M personal investment (2021).",btn:FORGE},
    {name:"Monogram (cannabis)",cat:"Private",detail:"Chief visionary officer 2020. Cut ties Dec 2022 before TPCO's $587M net loss. Dodged the worst of it.",btn:EXITED},
    {name:"Brooklyn Nets",cat:"Private",detail:"$1M investment (2004). Sold 2013 when he became sports agent. Team now $3.5B.",btn:EXITED},
    {name:"Stellar Pizza",cat:"Private",detail:"Robot pizza truck by ex-SpaceX engineers. Led $16.5M round (2022).",btn:null},
    // MarcyPen / Marcy Venture Partners portfolio
    {name:"Savage X Fenty",cat:"Private",detail:"Led $70M round for Rihanna's lingerie company. MarcyPen flagship.",btn:FORGE},
    {name:"StockX",cat:"Private",detail:"Sneaker/streetwear resale marketplace. $3.8B valuation.",btn:FORGE},
    {name:"Therabody",cat:"Private",detail:"Percussion therapy tools. Acquired by Therabody group.",btn:null},
    {name:"Simulate (Nuggs)",cat:"Private",detail:"Plant-based chicken. Acquired by Ahimsa Companies (Oct 2024).",btn:EXITED},
    {name:"Partake Foods",cat:"Private",detail:"Allergen-free cookies and snacks.",btn:null},
    {name:"Bitski",cat:"Crypto",detail:"NFT marketplace. San Francisco-based.",btn:null},
    {name:"Spatial Labs (sLABS)",cat:"Private",detail:"Web3/metaverse incubator by Iddris Sandu. $19M deal.",btn:null},
    {name:"Hungry Marketplace",cat:"Private",detail:"Food-tech corporate catering. $270M valuation.",btn:FORGE},
    {name:"Merit Beauty",cat:"Private",detail:"Clean beauty brand.",btn:null},
    {name:"Our Place",cat:"Private",detail:"Cookware brand (Always Pan). Direct-to-consumer.",btn:null},
    {name:"Babylist",cat:"Private",detail:"Baby registry/marketplace.",btn:FORGE},
    {name:"Wheels",cat:"Private",detail:"Electric transportation / e-scooters.",btn:null},
    {name:"Madison Reed",cat:"Private",detail:"$33M round (2022). Hair color brand.",btn:FORGE},
    {name:"Greenwood Bank",cat:"Private",detail:"Banking for Black and Latino communities (via Pendulum merger).",btn:null},
    {name:"Adwoa Beauty",cat:"Private",detail:"Haircare for textured hair (via Pendulum merger).",btn:null},
    {name:"Gemini",cat:"Crypto",detail:"Crypto exchange. IPO'd September 2025 on NASDAQ at $1.22B market cap.",btn:YF("GMNI")},
    {name:"K Health",cat:"Private",detail:"AI-powered primary care. Unicorn.",btn:FORGE},
    {name:"The Long Drink",cat:"Private",detail:"Finnish long drink brand. MarcyPen. May 2024.",btn:null},
    {name:"Rebel",cat:"Private",detail:"Led $25M Series B (Nov 2025). Recommerce. 2,640% growth in 3 years.",btn:null},
    {name:"GLD Jewelry",cat:"Private",detail:"MarcyPen acquired majority stake (Jul 2025). Leading DTC jewelry brand.",btn:null},
    {name:"Altro",cat:"Private",detail:"Fintech. MarcyPen portfolio company. Named in transcript research.",btn:null},
    {name:"Setter",cat:"Private",detail:"Home services platform. MarcyPen portfolio company.",btn:null},
    {name:"Away Luggage",cat:"Private",detail:"Premium travel luggage brand. Early personal investment. Confirmed transcript.",btn:FORGE},
    {name:"Social Equity Ventures",cat:"Private",detail:"Cannabis fund backing minority entrepreneurs in legal cannabis industry. Jay-Z founded to support Black and Brown cannabis operators.",btn:null},
    {name:"Rebelstork",cat:"Private",detail:"$18M Series A (Sep 2024). Co-invested with Serena Ventures. Baby/kids overstock platform.",btn:null},
    {name:"111Skin",cat:"Private",detail:"Luxury skincare. MarcyPen and SKKY Partners both invested.",btn:null},
  ],
  recent:[
    {deal:"Rebel Series B (led)",date:"Nov 2025",note:"$25M — MarcyPen lead"},
    {deal:"GLD Jewelry (majority)",date:"Jul 2025",note:"Acquired controlling stake"},
    {deal:"Korea $500M fund",date:"Dec 2025",note:"Hanwha Group MOU — K-culture IP"},
    {deal:"Gemini IPO",date:"Sep 2025",note:"NASDAQ — MarcyPen position public"},
    {deal:"The Long Drink",date:"May 2024",note:"MarcyPen"},
  ],
};

const rihanna = {
  id:"rihanna", name:"Rihanna", handle:"Robyn Fenty",
  title:"Fenty Beauty · Savage X Fenty · First Female Musician Billionaire",
  netWorth:"~$1.4B", category:"Beauty · Fashion · Consumer",
  thesis:"Demand equity, not royalties. Ownership is wealth. Royalties are income.",
  keyNumber:{label:"Fenty Beauty rev. 2024",value:"$450M"},
  tag:"Equity > Royalty", tagColor:"pink",
  portfolio:[
    {name:"Fenty Beauty",cat:"Founded",detail:"50/50 with LVMH's Kendo. Launched Sep 2017 with 40 foundation shades. Industry-transforming. $100M first 40 days. $450M net sales (2024). LVMH exploring sale of its stake (Reuters Oct 2025). Valued $1-2B.",btn:WEB("https://fentybeauty.com")},
    {name:"Savage X Fenty",cat:"Founded",detail:"~30% stake. Launched 2018 with TechStyle. $1B valuation (2022 Series C, $125M, L Catterton + LVMH's Arnaud as shareholder). Jay-Z's MarcyPen invested. CEO departed Aug 2024. IPO speculation ongoing.",btn:WEB("https://savagex.com")},
    {name:"Fenty Skin",cat:"Founded",detail:"Launched 2020. Skincare complement to Fenty Beauty. Available at Sephora globally.",btn:WEB("https://fentyskin.com")},
    {name:"Fenty Hair",cat:"Founded",detail:"Launched June 2024. Key new category expansion into haircare.",btn:WEB("https://fentyhair.com")},
    {name:"Fenty Maison (LVMH)",cat:"Founded",detail:"Launched 2019. First Black woman to lead an LVMH luxury fashion house. Shut down 2021 — strategic resource reallocation.",btn:EXITED},
    {name:"Clara Lionel Foundation",cat:"Founded",detail:"Non-profit for education and global crisis relief. Named after her grandparents.",btn:null},
    {name:"Tidal",cat:"Private",detail:"Founding artist-shareholder alongside Jay-Z, Beyoncé, and others (2015). Still holds position.",btn:null},
    {name:"Puma (Creative Director)",cat:"Private",detail:"Creative Director of Puma women's line since 2014. Paused 2017-2023. Fenty x Puma relaunched 2023.",btn:YF("PUM.DE")},
  ],
  recent:[
    {deal:"Fenty Hair launch",date:"Jun 2024",note:"New haircare category — Sephora"},
    {deal:"Super Bowl LVII",date:"Feb 2023",note:"$5.6M earned media — mid-show Fenty product placement"},
    {deal:"Savage X Fenty Bridal",date:"Apr 2025",note:"New collection targeting wedding market"},
    {deal:"Smurfs film + Fenty collab",date:"2025",note:"Smurfette voice actress + Smurf Crew Collection"},
    {deal:"LVMH stake sale exploration",date:"Oct 2025",note:"Reuters confirmed — could trigger valuation event"},
  ],
};

const reynolds = {
  id:"reynolds", name:"Ryan Reynolds", handle:"@VancityReynolds",
  title:"Maximum Effort · Wrexham AFC · Alpine F1",
  netWorth:"~$350M", category:"Sports · Consumer · Media",
  thesis:"Marketing as equity. Every business is a marketing company first. Build the brand, own the upside.",
  keyNumber:{label:"Mint Mobile exit",value:"$1.35B"},
  tag:"Marketing as Equity", tagColor:"red",
  portfolio:[
    {name:"Maximum Effort",cat:"Founded",detail:"Co-founded with George Dewey (2018). Film production + marketing agency. Behind Deadpool, Free Guy, Welcome to Wrexham. Marketing arm acquired by MNTN (June 2021) for equity in MNTN. Reynolds stays as CCO of both.",btn:null},
    {name:"MNTN",cat:"Private",detail:"CTV (Connected TV) advertising platform that acquired Maximum Effort's marketing arm June 2021. Reynolds holds equity + serves as Chief Creative Officer. MNTN partnered with Alpine F1 team (logo on cars). Backed by A-Grade Investments.",btn:FORGE},
    {name:"R.R. McReynolds Company",cat:"Founded",detail:"Holding company for sports investments with Rob McElhenney. Owns Wrexham AFC stake, Necaxa stake.",btn:null},
    {name:"Mint Mobile",cat:"Private",detail:"Bought 25% stake (2019). T-Mobile acquired for $1.35B (FCC approved Apr 2024). Reynolds netted ~$300-340M.",btn:EXITED},
    {name:"Aviation Gin",cat:"Private",detail:"Acquired 2018. Sold to Diageo for up to $610M (2020). Reynolds retains ongoing equity stake. Still serves as face.",btn:null},
    {name:"Wrexham AFC",cat:"Private",detail:"Bought with McElhenney for ~$2.5M (2020). Welcome to Wrexham on Disney+. Valued $450-500M by 2025. Three consecutive promotions.",btn:null},
    {name:"BONDS Flying Roos SailGP",cat:"Private",detail:"Co-owner with Hugh Jackman (Jun 2025, confirmed BusinessWire press release). Three-time SailGP champions.",btn:null},
    {name:"Alpine F1 Team (24%)",cat:"Private",detail:"Bought 24% with McElhenney consortium (2023).",btn:null},
    {name:"Club Necaxa (Liga MX)",cat:"Private",detail:"Significant minority stake (Apr 2024, Variety confirmed) alongside Eva Longoria, Kate Upton, Justin Verlander, OBJ. 'Necaxa' docuseries on FX/Disney+ premiered Aug 2025.",btn:null},
    {name:"La Equidad (Colombia)",cat:"Private",detail:"Jan 2025 alongside Eva Longoria and Kate Upton. Colombian football club.",btn:null},
    {name:"Wealthsimple",cat:"Private",detail:"Canadian fintech. Participated in 2021 round at $5B CAD valuation.",btn:null},
    {name:"1Password",cat:"Private",detail:"Password manager. 2022 round at $6.8B valuation.",btn:FORGE},
    {name:"Bending Spoons",cat:"Private",detail:"Italian mobile app company (Elytra, Splice, Filmic). Series D (Sep 2022).",btn:FORGE},
    {name:"Homage",cat:"Private",detail:"Vintage-inspired sports apparel. Invested May 2024. Maximum Effort rep joined board.",btn:null},
    {name:"FuboTV",cat:"Private",detail:"Received $10M in FUBO stock via Maximum Effort collaboration deal (2022). Now merged with Hulu + Live TV.",btn:null},
    {name:"Nuvei",cat:"Private",detail:"Canadian fintech. Invested Apr 2023 at ~$42/share. Advent International took private Nov 2024 at $34/share — likely a loss.",btn:EXITED},
    {name:"Match Group (Board)",cat:"Private",detail:"Joined board of Match Group (Tinder, Match.com, Hinge, OkCupid).",btn:YF("MTCH")},
    {name:"Ottawa Senators (failed bid)",cat:"Private",detail:"Prepared $1B+ bid with Remington Group (2023). Did not proceed. Not an investment.",btn:null},
  ],
  recent:[
    {deal:"BONDS Flying Roos SailGP",date:"Jun 2025",note:"Co-owner w/ Hugh Jackman — BusinessWire"},
    {deal:"La Equidad (Colombia)",date:"Jan 2025",note:"Football equity"},
    {deal:"Homage (vintage apparel)",date:"May 2024",note:"Equity + board seat"},
    {deal:"Club Necaxa (Mexico)",date:"Apr 2024",note:"'Significant' minority — Variety"},
    {deal:"Nuvei exit",date:"Nov 2024",note:"Taken private at $34 vs ~$42 entry — loss"},
  ],
};

const kim = {
  id:"kim", name:"Kim Kardashian", handle:"@KimKardashian",
  title:"SKIMS · SKKY Partners",
  netWorth:"~$1.7–1.9B", category:"Fashion · Beauty · Consumer PE",
  thesis:"Equity in your own brand beats every licensing deal. Build it, own it, then scale it globally.",
  keyNumber:{label:"SKIMS valuation",value:"$5B"},
  tag:"Build and Own", tagColor:"neutral",
  portfolio:[
    {name:"SKIMS",cat:"Founded",detail:"Co-founded 2019 with Jens Grede (CEO). $5B valuation (Nov 2025, Goldman Sachs $225M round confirmed by official press release). Revenue expected $1B+ in 2025. 18 US stores + 2 Mexico franchise. Kim owns ~35% = ~$1.67B on paper.",btn:WEB("https://skims.com")},
    {name:"KKW Beauty → SKKN by Kim",cat:"Founded",detail:"Launched 2017. $100M first year. Coty bought 20% for $200M (2020). Rebranded SKKN 2022. Shut down Jun 2025. Folded into SKIMS.",btn:EXITED},
    {name:"SKKY Partners",cat:"Founded",detail:"Co-founded 2022 with ex-Carlyle Jay Sammons. Angela Ahrendts (ex-Apple retail) as senior advisor. Dual-HQ Boston + LA.",btn:null},
    {name:"NikeSkims",cat:"Private",detail:"Announced Feb 2025. Nike's first-ever co-branded outside label. Seven collections, 58 silhouettes. First drop sold out in hours. Ongoing product launches.",btn:WEB("https://nikeskims.com")},
    {name:"Skims Beauty (2026)",cat:"Founded",detail:"Launching 2026 under Diarrha N'Diaye (ex-Ami Colé founder). Fragrance, makeup, skincare. Folding in all KKW/SKKN work.",btn:null},
    {name:"SKKY: 111Skin",cat:"Private",detail:"'Significant' minority stake (Jan 2025). First confirmed SKKY deal — reported Business of Fashion. Luxury skincare from Harley Street plastic surgeon.",btn:null},
    {name:"SKKY: Truff",cat:"Private",detail:"Truffle-infused hot sauce brand. Cult following among foodies.",btn:null},
    {name:"Coty stake (repurchased)",cat:"Private",detail:"Coty had 20% of KKW/SKKN since 2020 ($200M). Repurchased March 2025. All beauty now unified.",btn:YF("COTY")},
    {name:"Hulu / The Kardashians",cat:"Private",detail:"$100M+ family deal. Kim's individual cut ~$7.5-8.3M/season. 'All's Fair' (legal drama, 2025). Criminal justice reform work.",btn:null},
  ],
  recent:[
    {deal:"SKIMS $5B raise",date:"Nov 2025",note:"$225M — Goldman Sachs (official press release)"},
    {deal:"111Skin (SKKY Partners)",date:"Jan 2025",note:"First confirmed SKKY deal — Business of Fashion"},
    {deal:"Coty stake buyback",date:"Mar 2025",note:"Consolidating all beauty under SKIMS"},
    {deal:"NikeSkims launch",date:"Sep 2025",note:"Seven collections — first drop sold out"},
    {deal:"SKKN shutdown",date:"Jun 2025",note:"Folded into SKIMS beauty 2026 strategy"},
  ],
};

const ronaldo = {
  id:"ronaldo", name:"Cristiano Ronaldo", handle:"@Cristiano",
  title:"CR7 Empire · Football's First Billionaire",
  netWorth:"~$1.4B", category:"Sports · Tech · Hospitality · Media",
  thesis:"Build a brand so powerful it operates without you. 660M followers is the most powerful distribution channel in the world.",
  keyNumber:{label:"Instagram followers",value:"660M+"},
  tag:"Global Brand Machine", tagColor:"green",
  portfolio:[
    {name:"CR7 Brand",cat:"Founded",detail:"Clothing (JBS Textile Group, ~$40M/year), fragrances (Eden Parfums, ~$20M/year), shoes, eyewear, accessories. Investment vehicle CR7 Lifestyle holds €20M+ equity capital.",btn:null},
    {name:"Pestana CR7 Hotels (50%)",cat:"Founded",detail:"€40-75M invested since 2016. 6 cities: Funchal, Lisbon, Madrid, Marrakech, NYC, Paris (dev). 800+ rooms. $200M combined revenue. 50/50 with Pestana Hotel Group.",btn:null},
    {name:"Insparya",cat:"Founded",detail:"Hair transplant clinic chain co-founded 2019. Spain and Portugal.",btn:null},
    {name:"CR7 Crunch Fitness",cat:"Founded",detail:"Gym chain partnership with Crunch Fitness. Spain and Portugal.",btn:null},
    {name:"Erakulis",cat:"Founded",detail:"Fitness and wellness app. €788K EU funding.",btn:null},
    {name:"UR.MARV Film Studio",cat:"Founded",detail:"50-50 JV with filmmaker Matthew Vaughn (Apr 10, 2025). Two action films already produced. Third in development.",btn:null},
    {name:"UR Cristiano",cat:"Founded",detail:"YouTube channel launched August 2024. Personal brand media content. Part of broader media empire alongside Medialivre.",btn:WEB("https://youtube.com/@URCristiano")},
    {name:"WHOOP",cat:"Private",detail:"Investor and global ambassador since May 2024. Series G (Mar 2026, $575M, $10.1B) — named alongside LeBron in official WHOOP press release.",btn:FORGE},
    {name:"Perplexity AI",cat:"Private",detail:"Invested December 2025 (confirmed Bloomberg). $20B valuation. Launched interactive Ronaldo Hub on platform. Used in speeches and public announcements.",btn:FORGE},
    {name:"WOW FC (MMA)",cat:"Private",detail:"Joined as shareholder (Nov 27, 2025, confirmed Bleacher Report + own X post). Spanish MMA promotion co-owned with UFC champion Ilia Topuria.",btn:null},
    {name:"Medialivre",cat:"Private",detail:"~30% stake in Portuguese media (formerly Cofina). Acquired Nov 2023 for €56.8M. Owns: Correio da Manhã, Record, Jornal de Negócios, Sábado, TV Guia, Flash, Máxima.",btn:null},
    {name:"Vista Alegre Atlantis (10%)",cat:"Private",detail:"€17.3M for 10% stake in luxury Portuguese porcelain/crystal brand. Plus 30% of Vista Alegre Spain. Expanding to Middle East and Asia.",btn:null},
    {name:"Ursu9 (50%)",cat:"Private",detail:"Alkaline water brand. 50% stake partnership with Francisco Ferreira.",btn:null},
    {name:"Tatel Restaurant Chain",cat:"Private",detail:"Spanish/Mediterranean luxury restaurants via Mabel Capital (with Rafa Nadal, Enrique Iglesias, Pau Gasol). Madrid, Ibiza, Abu Dhabi, Beverly Hills, Mexico City, Doha, Bahrain, Riyadh. Joined Marble Hospital Group (MHG) Feb 2025.",btn:null},
    {name:"TOTÓ Restaurant",cat:"Private",detail:"Italian restaurant chain in Madrid. Via Marble Hospital Group (Feb 2025 investment).",btn:null},
    {name:"Padel City",cat:"Private",detail:"Sports center (€5M+, 2023/2024). Acquired Lisbon Racket Centre (2024). Plans for Spain.",btn:null},
    {name:"Urby",cat:"Private",detail:"Portuguese smart cities / IoT startup. €6M round (2020).",btn:null},
    {name:"Advanced Recovery for Athletes (AVA)",cat:"Private",detail:"Recovery technology announced Dec 2024 with Brazilian company Avanutri.",btn:null},
    {name:"Nike Lifetime Deal",cat:"Private",detail:"One of three athletes ever (Jordan, LeBron, Ronaldo). ~$1B total deal. $20M+/year regardless of playing status.",btn:null},
    {name:"Binance",cat:"Crypto",detail:"NFT/crypto partnership. ForeverSkills NFT series (Dec 2024). CR7 NFT collections.",btn:CB("bitcoin","BTC")},
  ],
  recent:[
    {deal:"WHOOP Series G",date:"Mar 2026",note:"$575M — named in official press release"},
    {deal:"Perplexity AI",date:"Dec 2025",note:"Equity + global partnership — Bloomberg confirmed"},
    {deal:"WOW FC (MMA)",date:"Nov 2025",note:"Shareholder — Bleacher Report confirmed"},
    {deal:"TOTÓ / Marble Hospital Group",date:"Feb 2025",note:"Restaurant group investor"},
    {deal:"UR.MARV Film Studio",date:"Apr 2025",note:"50/50 JV with Matthew Vaughn"},
  ],
};

const serena = {
  id:"serena", name:"Serena Williams", handle:"@serenawilliams",
  title:"Serena Ventures · 23-Time Grand Slam Champion",
  netWorth:"~$340M", category:"VC · Women's Sports · Consumer",
  thesis:"The underfunding of women and founders of color is a pricing inefficiency. That's the trade.",
  keyNumber:{label:"Unicorns backed",value:"16+"},
  tag:"Pricing Inefficiency", tagColor:"teal",
  portfolio:[
    {name:"Serena Ventures",cat:"Founded",detail:"Founded 2014. $111M debut fund (2022). 85+ companies. 16+ unicorns. 79% underrepresented founders, 54% women, 47% Black. Run by Beth Ferreira.",btn:null},
    {name:"Wyn Beauty",cat:"Founded",detail:"Cosmetics/beauty brand founded 2024.",btn:null},
    {name:"Will Perform",cat:"Founded",detail:"Pain relief/performance brand launched Dec 2022. Available at Target and Walmart.",btn:null},
    {name:"S by Serena (HSN)",cat:"Founded",detail:"Fashion collaboration line.",btn:null},
    {name:"MasterClass",cat:"Private",detail:"Found when 8 people in a garage in San Francisco. Now $2.75B+ valuation.",btn:FORGE},
    {name:"Impossible Foods",cat:"Private",detail:"2019 $300M round alongside Jay-Z, Katy Perry.",btn:FORGE},
    {name:"Noom",cat:"Private",detail:"Subscription weight management app. Unicorn.",btn:FORGE},
    {name:"Karat",cat:"Private",detail:"Engineer hiring platform. Unicorn.",btn:FORGE},
    {name:"Esusu",cat:"Private",detail:"Rent reporting / credit building platform (2021). Unicorn.",btn:FORGE},
    {name:"HUED",cat:"Private",detail:"Healthcare platform connecting people of color with culturally competent providers.",btn:null},
    {name:"Parfait",cat:"Private",detail:"AI-powered customizable wig platform. Founded by Black women.",btn:null},
    {name:"Teal Health",cat:"Private",detail:"At-home cervical cancer screening (Teal Wand). $10M raise (Jan 2025, w/ Emerson Collective, LabCorp).",btn:null},
    {name:"Unrivaled Basketball",cat:"Private",detail:"3-on-3 women's basketball league founded by Breanna Stewart and Napheesa Collier. Series B — $340M valuation.",btn:null},
    {name:"Rebelstork",cat:"Private",detail:"$18M Series A (Sep 2024). Co-invested with Jay-Z's MarcyPen. Overstock marketplace for baby products.",btn:null},
    {name:"Wile Women",cat:"Private",detail:"Women-focused wellness and supplement brand.",btn:null},
    {name:"Fiveable",cat:"Private",detail:"Social learning platform for AP courses.",btn:null},
    {name:"Bitski",cat:"Crypto",detail:"NFT marketplace. Serena Ventures portfolio. Exited May 2024.",btn:EXITED},
    {name:"Lolli",cat:"Private",detail:"Bitcoin rewards shopping. Exit July 2025.",btn:EXITED},
    {name:"Pachama",cat:"Private",detail:"Forest carbon offset marketplace. Acquired by Carbon Direct (Nov 2025).",btn:EXITED},
    {name:"Nara Organics",cat:"Private",detail:"Nov 2025. Most recent confirmed (PitchBook).",btn:null},
    {name:"Cincoro Tequila",cat:"Private",detail:"Angel investment (May 2024). Luxury tequila brand.",btn:null},
    {name:"SpringHill Company",cat:"Private",detail:"Sits on the board of directors of LeBron James's media company.",btn:null},
    {name:"Miami Dolphins (NFL)",cat:"Private",detail:"Minority owner since 2009 with sister Venus. First Black women to own an NFL minority stake.",btn:null},
    {name:"Angel City FC (NWSL)",cat:"Private",detail:"Co-founded 2020 with Alexis Ohanian. Ohanian sold controlling stake to Bob Iger (2024). Serena + daughters Olympia and Adira still hold shares.",btn:null},
    {name:"Los Angeles Golf Club (TGL)",cat:"Private",detail:"Co-owner with Venus Williams and Alexis Ohanian. Tiger Woods + Rory McIlroy's virtual golf league.",btn:null},
    {name:"Toronto Tempo (WNBA)",cat:"Private",detail:"Joined ownership Mar 3, 2025 (confirmed WNBA official press release). Canada's first WNBA team. Begins play 2026.",btn:null},
  ],
  recent:[
    {deal:"Nara Organics",date:"Nov 2025",note:"Angel — PitchBook confirmed"},
    {deal:"Toronto Tempo (WNBA)",date:"Mar 2025",note:"Official owner — WNBA press release"},
    {deal:"Teal Health",date:"Jan 2025",note:"$10M w/ Emerson Collective, LabCorp"},
    {deal:"Unrivaled Basketball",date:"2024",note:"Series B — $340M valuation"},
    {deal:"Rebelstork",date:"Sep 2024",note:"$18M Series A w/ MarcyPen"},
  ],
};

const snoop = {
  id:"snoop", name:"Snoop Dogg", handle:"@SnoopDogg",
  title:"Casa Verde Capital · Death Row Records",
  netWorth:"~$160M", category:"Cannabis · Tech · Music",
  thesis:"Invest in what you know. Be early, stay patient. Cannabis was criminalized for decades and is now a multi-billion dollar industry.",
  keyNumber:{label:"Casa Verde portfolio",value:"$300M"},
  tag:"Cannabis Pioneer", tagColor:"yellow",
  portfolio:[
    {name:"Casa Verde Capital",cat:"Founded",detail:"Co-founded 2015 with Karan Wadhera and Ted Chung. Cannabis-exclusive VC. $300M portfolio. $100M Fund II (Dec 2020).",btn:null},
    {name:"Death Row Records",cat:"Founded",detail:"Acquired 2022 for ~$50M. Pulled entire catalog from streaming. Repositioned as metaverse/NFT label.",btn:null},
    {name:"Leafs by Snoop",cat:"Founded",detail:"One of first celebrity cannabis brands (2015). Licensed partners in legal markets.",btn:null},
    {name:"Merry Jane",cat:"Founded",detail:"Cannabis digital media platform (2015). News, video, editorial.",btn:null},
    {name:"Snoop Doggie Doggs",cat:"Founded",detail:"Pet products brand. Dog food, accessories, toys.",btn:null},
    {name:"Snoopadelic Films",cat:"Founded",detail:"TV shows, films, documentaries production company.",btn:null},
    {name:"Doggystyle Records",cat:"Founded",detail:"Independent record label from mid-1990s. Publishing revenue.",btn:null},
    {name:"19 Crimes Wine",cat:"Private",detail:"Co-owns wine brand with Treasury Wine Estates. Snoop Cali Red and Snoop Cali Rosé lines.",btn:null},
    {name:"Indoggo Gin",cat:"Private",detail:"Co-owns strawberry-flavored gin brand.",btn:null},
    {name:"Still G.I.N.",cat:"Private",detail:"Premium spirits brand co-founded with Dr. Dre.",btn:null},
    {name:"Reddit",cat:"Private",detail:"Invested 2014. Reddit IPO'd March 2024 at $20B+ market cap.",btn:YF("RDDT")},
    {name:"Klarna",cat:"Private",detail:"Swedish payments giant. Minority shareholder. $15B+ valuation (2024).",btn:FORGE},
    {name:"Robinhood",cat:"Private",detail:"Pre-IPO investor. Backed before the 2021 GameStop retail trading moment.",btn:YF("HOOD")},
    // Casa Verde portfolio (named investments)
    {name:"Dutchie",cat:"Private",detail:"Dispensary operating platform. Point-of-sale, e-commerce, payments.",btn:FORGE},
    {name:"Eaze",cat:"Private",detail:"Cannabis delivery platform. One of the first cannabis e-commerce services.",btn:null},
    {name:"Vangst",cat:"Private",detail:"Cannabis industry recruiting platform.",btn:null},
    {name:"Proper Sleep",cat:"Private",detail:"CBD-focused sleep products.",btn:null},
    {name:"AceCann",cat:"Private",detail:"Led $15M round. First Casa Verde EU investment. Medical cannabis, Lisbon, Portugal.",btn:null},
    {name:"Tsumo Snacks",cat:"Private",detail:"Cannabis-infused tortilla chips.",btn:null},
    {name:"Oxford Cannabinoid Technologies",cat:"Private",detail:"UK medical cannabis research company. 2018.",btn:null},
  ],
  recent:[
    {deal:"Paris Olympics (NBC)",date:"Summer 2024",note:"Most-watched NBC correspondent at the Games"},
    {deal:"Super Bowl LIX halftime",date:"Feb 2025",note:"Performed with Dr. Dre — massive brand activation"},
    {deal:"AceCann (Portugal)",date:"2021",note:"Led $15M — first EU cannabis investment"},
    {deal:"Reddit IPO",date:"Mar 2024",note:"2014 position went public at $20B+ market cap"},
    {deal:"Tsumo Snacks",date:"2022",note:"Casa Verde — cannabis-infused chips"},
  ],
};

const kutcher = {
  id:"kutcher", name:"Ashton Kutcher", handle:"@aplusk",
  title:"A-Grade Investments · Sound Ventures",
  netWorth:"~$200M", category:"Tech · Consumer · Early VC",
  thesis:"Find platforms with network effects for activities not yet internetted. Back them before anyone else sees it.",
  keyNumber:{label:"Total investments made",value:"175+"},
  tag:'"Internet for X"', tagColor:"blue",
  portfolio:[
    {name:"A-Grade Investments",cat:"Founded",detail:"Co-founded 2010 with Guy Oseary and Ron Burkle. David Geffen + Mark Cuban added capital (2012). Turned $30M into $250M by 2016 (Forbes cover story).",btn:null},
    {name:"Sound Ventures",cat:"Founded",detail:"Second fund with Guy Oseary. $100K-$10M checks. Seed to growth stage. 175+ total investments.",btn:null},
    {name:"Thorn",cat:"Founded",detail:"Non-profit co-founded with Demi Moore (2012). Tech to detect and disrupt child sex trafficking. 10,000+ victims identified. Partners: Google, Twitter, Facebook. Defines his public identity.",btn:WEB("https://thorn.org")},
    // Major exits
    {name:"Uber",cat:"Private",detail:"$500K early angel → tens of millions. One of the best individual angel bets in tech history.",btn:YF("UBER")},
    {name:"Airbnb",cat:"Private",detail:"$2.5M early A-Grade investment. Massive IPO return.",btn:YF("ABNB")},
    {name:"Spotify",cat:"Private",detail:"$3M pre-IPO via A-Grade.",btn:YF("SPOT")},
    {name:"Skype",cat:"Private",detail:"A-Grade position. Microsoft acquired for $8.5B.",btn:EXITED},
    {name:"Shazam",cat:"Private",detail:"Music recognition. Apple acquired for $400M.",btn:EXITED},
    {name:"Foursquare",cat:"Private",detail:"Location intelligence. A-Grade position.",btn:null},
    {name:"Duolingo",cat:"Private",detail:"Language learning. Led Series A via A-Grade. IPO'd at $5B+.",btn:YF("DUOL")},
    // Sound Ventures portfolio
    {name:"Robinhood",cat:"Private",detail:"Commission-free trading. IPO'd. Sound Ventures.",btn:YF("HOOD")},
    {name:"Airtable",cat:"Private",detail:"No-code database. $11.7B valuation. Sound Ventures.",btn:FORGE},
    {name:"Brex",cat:"Private",detail:"Corporate spend management. $12B+ valuation.",btn:FORGE},
    {name:"Flexport",cat:"Private",detail:"Digital freight / logistics. Unicorn.",btn:FORGE},
    {name:"Affirm",cat:"Private",detail:"Buy now, pay later. IPO'd.",btn:YF("AFRM")},
    {name:"Bird",cat:"Private",detail:"E-scooter company. IPO'd, then delisted.",btn:EXITED},
    {name:"OpenSea",cat:"Private",detail:"NFT marketplace. $13.3B peak valuation.",btn:FORGE},
    {name:"SoundCloud",cat:"Private",detail:"Music streaming / discovery.",btn:null},
    {name:"Beyond Meat",cat:"Private",detail:"Plant-based meat. IPO'd.",btn:YF("BYND")},
    {name:"MoonPay",cat:"Crypto",detail:"Crypto payments onramp. $3.4B valuation.",btn:FORGE},
    {name:"Pearpop",cat:"Private",detail:"Creator collaboration platform.",btn:null},
    {name:"Veldskoen Shoes",cat:"Private",detail:"South African leather shoe brand.",btn:null},
    {name:"The Fabricant",cat:"Private",detail:"Digital fashion company.",btn:null},
    {name:"Steakholder Foods",cat:"Private",detail:"3D-printed cultivated meat.",btn:null},
  ],
  recent:[
    {deal:"Sound Ventures (active)",date:"Ongoing",note:"$100K–$10M range per deal"},
    {deal:"MoonPay",date:"2021",note:"$3.4B valuation — crypto payments"},
    {deal:"Affirm",date:"2021",note:"Pre-IPO — buy now pay later"},
    {deal:"Airtable",date:"2021",note:"$11.7B no-code database"},
    {deal:"Shazam exit",date:"2018",note:"Apple acquired for $400M"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED DATA
// ─────────────────────────────────────────────────────────────────────────────
const ALL = {
  visionaries: [naval, balaji, vitalik, toly, thiel, bryan, ferriss],
  icons: [lebron, jayz, rihanna, reynolds, kim, ronaldo, serena, snoop, kutcher],
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function InvestBtn({ btn, small }) {
  if (!btn || !btn.url) {
    if (btn && btn.t === "exit") {
      return (
        <span style={{ fontSize: 9, color: "#404040", background: "#141414", padding: "3px 8px", borderRadius: 3, whiteSpace: "nowrap", border: "1px solid #222", letterSpacing: "0.06em" }}>
          EXITED
        </span>
      );
    }
    return null;
  }
  const bg = BTN_BG[btn.t] || "#1a1a1a";
  const fg = "#f5c842";
  return (
    <a href={btn.url} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-block",
      background: "#1a1000",
      color: "#f5c842",
      border: "1px solid #f5c842",
      borderRadius: 3,
      padding: small ? "3px 8px" : "4px 10px",
      fontSize: small ? 9 : 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textDecoration: "none",
      whiteSpace: "nowrap",
      cursor: "pointer",
      flexShrink: 0,
    }}>
      {btn.label} ↗
    </a>
  );
}

function CategoryGroup({ cat, items, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!items || items.length === 0) return null;
  const catColors = {
    Founded: "#f59e0b", Crypto: "#6366f1", Private: "#64748b",
    Philanthropy: "#10b981", Public: "#3b82f6",
  };
  const color = catColors[cat] || "#64748b";
  return (
    <div style={{ marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 10px", background: "#0d0d0d", border: "none", borderLeft: `2px solid ${color}`,
        cursor: "pointer", marginBottom: open ? 0 : 0,
      }}>
        <span style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {cat}
        </span>
        <span style={{ fontSize: 9, color: "#404040", fontFamily: "monospace" }}>
          {items.length} positions {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 10px",
              borderBottom: "1px solid #0f0f0f",
              background: i % 2 === 0 ? "#080808" : "#090909",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#ddd", marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: "#585858", lineHeight: 1.5 }}>{item.detail}</div>
              </div>
              <InvestBtn btn={item.btn} small />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioCart({ investor, onClose }) {
  const [amount, setAmount] = useState(1000);

  // Classify investable positions by platform
  const investable = investor.portfolio.filter(p => p.btn && p.btn.t !== "exit" && p.btn.url);
  const byCoin = investable.filter(p => p.btn.t === "crypto");
  const byStock = investable.filter(p => p.btn.t === "stock");
  const byForge = investable.filter(p => p.btn.t === "preipo");
  const byRep = investable.filter(p => p.btn.t === "republic");
  const total = investable.length;
  const perPos = total > 0 ? (amount / total).toFixed(2) : 0;

  const Section = ({ label, items, color, platform, url }) => {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color, border: `1px solid ${color}`, background: "#080808", padding: "3px 10px", borderRadius: 3, textDecoration: "none", fontWeight: 700 }}>
            Open {platform} ↗
          </a>
        </div>
        {items.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: i % 2 === 0 ? "#080808" : "#0a0a0a", borderBottom: "1px solid #111" }}>
            <div>
              <span style={{ fontSize: 12, color: "#ccc", fontWeight: 600 }}>{p.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color, fontFamily: "monospace" }}>${perPos}</span>
              <a href={p.btn.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color, border: `1px solid ${color}30`, background: "#0d0d0d", padding: "2px 8px", borderRadius: 3, textDecoration: "none" }}>
                {p.btn.label} ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}>
      <div style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 6, width: "min(640px, 95vw)", maxHeight: "85vh", overflowY: "auto", padding: "20px 22px" }}
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #1a1a1a" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: "#f5f5f5", marginBottom: 3 }}>
              Invest Like {investor.name}
            </div>
            <div style={{ fontSize: 11, color: "#484848" }}>
              Equally-weighted basket · {total} investable positions · ${perPos} each
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Amount input */}
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>Total to invest</div>
          <div style={{ display: "flex", alignItems: "center", background: "#111", border: "1px solid #2a2a2a", borderRadius: 4, padding: "6px 10px", gap: 6 }}>
            <span style={{ color: "#f5c842", fontFamily: "monospace", fontSize: 13 }}>$</span>
            <input
              type="number" value={amount} min={1}
              onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
              style={{ background: "none", border: "none", color: "#f5c842", fontFamily: "monospace", fontSize: 13, fontWeight: 700, width: 80, outline: "none" }}
            />
          </div>
          <div style={{ fontSize: 10, color: "#333" }}>÷ {total} positions = <span style={{ color: "#f5c842", fontFamily: "monospace" }}>${perPos}</span> each</div>
        </div>

        {total === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#333", fontSize: 12 }}>
            No directly investable positions for this investor. Holdings are primarily private/illiquid.
          </div>
        ) : (
          <>
            <Section label="Crypto — Buy on Coinbase" items={byCoin} color="#f59e0b" platform="Coinbase" url="https://coinbase.com" />
            <Section label="Public Stocks — Trade via Broker" items={byStock} color="#60a5fa" platform="Yahoo Finance" url="https://finance.yahoo.com" />
            <Section label="Pre-IPO Shares — via Forge" items={byForge} color="#a78bfa" platform="Forge" url="https://forgeplatform.com" />
            <Section label="Equity Crowdfunding — via Republic" items={byRep} color="#34d399" platform="Republic" url="https://republic.com" />
          </>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #181818", fontSize: 9, color: "#2e2e2e", lineHeight: 1.6 }}>
          This is not financial advice. Equal weighting is illustrative — not a recommended allocation strategy. Many positions are illiquid, speculative, or closed to retail investors. Do your own research.
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ investor }) {
  if (!investor) return null;
  const [showCart, setShowCart] = useState(false);
  const byCategory = {};
  investor.portfolio.forEach(item => {
    if (!byCategory[item.cat]) byCategory[item.cat] = [];
    byCategory[item.cat].push(item);
  });
  const catOrder = ["Founded", "Crypto", "Public", "Private", "Philanthropy"];
  const total = investor.portfolio.length;
  const investableCount = investor.portfolio.filter(p => p.btn && p.btn.t !== "exit" && p.btn.url).length;

  return (
    <div style={{ maxWidth: 740 }}>
      {showCart && <PortfolioCart investor={investor} onClose={() => setShowCart(false)} />}

      {/* Header */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: DOT[investor.tagColor] }} />
          <span style={{ fontSize: 9, color: DOT[investor.tagColor], fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>
            {investor.tag}
          </span>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5", margin: "0 0 4px 0" }}>
          {investor.name}
        </h2>
        <div style={{ fontSize: 11, color: "#484848" }}>{investor.title}</div>
      </div>

      {/* Stats — no net worth */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: investor.keyNumber.label, value: investor.keyNumber.value, mono: true },
          { label: "Tracked Positions", value: `${total} confirmed`, mono: true },
        ].map((s, i) => (
          <div key={i} style={{ padding: "10px 12px", background: "#0d0d0d", borderRadius: 3, border: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 8, color: "#383838", letterSpacing: "0.12em", marginBottom: 5, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0", fontFamily: s.mono ? "monospace" : "inherit" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Thesis */}
      <div style={{ marginBottom: 14, padding: "12px 14px", background: "#0a0a0a", borderLeft: "2px solid #222" }}>
        <div style={{ fontSize: 8, color: "#2e2e2e", letterSpacing: "0.14em", marginBottom: 6, textTransform: "uppercase" }}>Thesis</div>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>"{investor.thesis}"</p>
      </div>

      {/* PORTFOLIO CART BUTTON */}
      <div style={{ marginBottom: 14 }}>
        <button
          onClick={() => setShowCart(true)}
          style={{
            width: "100%", padding: "13px 16px", background: "#1a1000", border: "1px solid #f5c842",
            borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, color: "#f5c842", fontWeight: 700, marginBottom: 2 }}>
              Build Equally-Weighted Portfolio →
            </div>
            <div style={{ fontSize: 10, color: "#6b5c30" }}>
              {investableCount} investable positions · Crypto, stocks, pre-IPO, equity crowdfunding
            </div>
          </div>
          <div style={{ fontSize: 20, color: "#f5c842" }}>⊕</div>
        </button>
      </div>

      {/* Portfolio by category */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 8, color: "#2e2e2e", letterSpacing: "0.14em", marginBottom: 10, textTransform: "uppercase" }}>
          Full Portfolio — {total} confirmed positions
        </div>
        {catOrder.map(cat => byCategory[cat] ? (
          <CategoryGroup key={cat} cat={cat} items={byCategory[cat]} defaultOpen={cat === "Founded" || cat === "Crypto"} />
        ) : null)}
        {Object.keys(byCategory).filter(c => !catOrder.includes(c)).map(cat => (
          <CategoryGroup key={cat} cat={cat} items={byCategory[cat]} defaultOpen={false} />
        ))}
      </div>

      {/* Recent Moves */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 8, color: "#2e2e2e", letterSpacing: "0.14em", marginBottom: 10, textTransform: "uppercase" }}>Recent Moves</div>
        {investor.recent.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #111" }}>
            <div style={{ fontSize: 9, color: "#303030", fontFamily: "monospace", minWidth: 66, flexShrink: 0 }}>{r.date}</div>
            <div style={{ fontSize: 12, color: "#b0b0b0", flex: 1 }}>{r.deal}</div>
            <div style={{ fontSize: 9, color: "#484848", background: "#0d0d0d", padding: "2px 8px", borderRadius: 3, whiteSpace: "nowrap", flexShrink: 0 }}>{r.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function CovetApp() {
  const [activeTab, setActiveTab] = useState("visionaries");
  const [selectedId, setSelectedId] = useState("naval");
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 680 : false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap";
    document.head.appendChild(link);
    const onResize = () => setIsMobile(window.innerWidth < 680);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      try { document.head.removeChild(link); } catch(e) {}
    };
  }, []);

  const investors = ALL[activeTab];
  const selected = investors.find(i => i.id === selectedId) || investors[0];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedId(tab === "visionaries" ? "naval" : "lebron");
    setMobileShowDetail(false);
  };
  const handleSelect = (id) => { setSelectedId(id); setMobileShowDetail(true); };

  return (
    <div style={{ background: "#060606", minHeight: "100vh", color: "#f5f5f5", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #161616", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, fontWeight: 900, color: "#f5f5f5", letterSpacing: "-0.02em", lineHeight: 1 }}>COVET</div>
          <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.18em", marginTop: 3, textTransform: "uppercase" }}>Invest like the people you admire</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Buy Crypto", url: "https://coinbase.com" },
            { label: "Pre-IPO", url: "https://forgeplatform.com" },
            { label: "Startups", url: "https://republic.com" },
          ].map(b => (
            <a key={b.label} href={b.url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              color: "#f5c842", border: "1px solid #3d2b00",
              background: "#0e0900", padding: "5px 10px", borderRadius: 3,
              textDecoration: "none", display: "block",
            }}>{b.label} ↗</a>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #161616", display: "flex", flexShrink: 0 }}>
        {[
          { key: "visionaries", label: "Visionaries", count: 7 },
          { key: "icons", label: "Icons", count: 9 },
        ].map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)} style={{
            padding: "10px 20px", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
            color: activeTab === t.key ? "#f5c842" : "#303030",
            background: "none", border: "none",
            borderBottom: activeTab === t.key ? "2px solid #f5c842" : "2px solid transparent",
            cursor: "pointer",
          }}>
            {t.label} <span style={{ opacity: 0.4, fontWeight: 400 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Investor list */}
        {(!isMobile || !mobileShowDetail) && (
          <div style={{ width: isMobile ? "100%" : 210, borderRight: isMobile ? "none" : "1px solid #161616", overflowY: "auto", flexShrink: 0 }}>
            {investors.map(inv => (
              <button key={inv.id} onClick={() => handleSelect(inv.id)} style={{
                width: "100%", textAlign: "left", padding: "11px 14px",
                background: !isMobile && selectedId === inv.id ? "#0d0d0d" : "transparent",
                borderLeft: !isMobile && selectedId === inv.id ? "2px solid #f5c842" : !isMobile ? "2px solid transparent" : "none",
                borderRight: "none", borderTop: "none", borderBottom: "1px solid #111",
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: DOT[inv.tagColor], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: !isMobile && selectedId === inv.id ? "#f5f5f5" : "#999" }}>{inv.name}</span>
                </div>
                <div style={{ fontSize: 10, color: "#2e2e2e", marginLeft: 13 }}>{inv.netWorth}</div>
                <div style={{ fontSize: 9, color: "#222", marginLeft: 13, marginTop: 2 }}>{inv.portfolio.length} positions tracked</div>
              </button>
            ))}
          </div>
        )}

        {/* Detail */}
        {(!isMobile || mobileShowDetail) && (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "20px 24px", minWidth: 0 }}>
            {isMobile && mobileShowDetail && (
              <button onClick={() => setMobileShowDetail(false)} style={{ background: "none", border: "none", color: "#444", fontSize: 10, cursor: "pointer", padding: "0 0 12px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                ← Back
              </button>
            )}
            <DetailPanel investor={selected} />
          </div>
        )}
      </div>
    </div>
  );
}
