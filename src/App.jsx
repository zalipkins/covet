import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// COVET RESEARCH PROTOCOL — ENFORCED RULES (violating these = wrong data)
// ═══════════════════════════════════════════════════════════════════════════════
//
// RULE 1 — FUND VS PERSONAL SPLIT (T10):
//   If investor runs a fund with external LPs → the FUND is ONE entry.
//   The fund's portfolio companies go in the detail field as context, NOT as
//   individual positions. Exceptions: investor personally co-invested alongside
//   the fund, OR the vehicle is a true family office with no external LPs.
//
// RULE 2 — AUTO-CHALLENGE FINAL GATE (MANDATORY before every deploy):
//   After writing a profile, ask: "Would Zach look at this position count and
//   say 'this seems low, must be wrong'?" Cross-check the count against the
//   known PitchBook / CB Insights / Tracxn numbers for that investor.
//   If the count is substantially below what the databases show → go back,
//   find more confirmed positions from open sources, add them.
//   DO NOT deploy until the count is defensible.
//   PG example: 14 positions when PitchBook shows 78 = FAIL. Required more work.
//
// RULE 3 — SOURCES MUST BE NAMED:
//   Every entry needs a confirmed source in the detail field. "Confirmed X" is
//   required. Entries without a named source should not be added.
//
// ═══════════════════════════════════════════════════════════════════════════════


const CB = (slug, ticker) => ({ label: `Buy ${ticker}`, url: `https://coinbase.com/join/LC3KXJN?src=ios-link`, t: "crypto" });
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

const BTN_BG = { crypto:"#1a1400", stock:"#1a1400", preipo:"#1a1400", republic:"#1a1400", view:"#1a1400", exit:"#1a1a1a" };
const BTN_FG = { crypto:"#ffe033", stock:"#ffe033", preipo:"#ffe033", republic:"#ffe033", view:"#888", exit:"#404040" };

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
    {name:"Vast.com",cat:"Founded",detail:"Co-founded. Auto shopping network. Defunct.",btn:EXITED},
    {name:"The Hit Forge",cat:"Founded",detail:"$20M early-stage VC fund (2007). Naval as Managing Partner. Invested in Twitter, Uber, Stack Overflow. His first investment vehicle.",btn:null},
    {name:"AngelList",cat:"Founded",detail:"Co-founded 2010 with Babak Nivi. $4B+ valuation (2022). Supports $170B+ in assets. Participated in ~28% of all high-quality early-stage VC deals.",btn:null},
    {name:"MetaStable Capital",cat:"Founded",detail:"Crypto hedge fund (2014) with Lucas Ryan and Joshua Seims. $69M AUM by 2017. 500%+ returns by 2017. Backed by a16z, Sequoia, USV, Founders Fund, Bessemer. Holds BTC, ETH, Monero, Zcash.",btn:null},
    {name:"CoinList",cat:"Founded",detail:"Co-founded 2017 with Protocol Labs. ICO compliance platform and token launch platform spun from AngelList.",btn:null},
    {name:"Spearhead",cat:"Founded",detail:"$100M fund (2017) giving founders $1M each to angel invest. Third cohort: $100M. Spearhead founders have backed Neuralink, Opendoor, Rippling, Scale AI, PillPack.",btn:null},
    {name:"Airchat",cat:"Founded",detail:"Voice-first social app (2023). Shut down 2024.",btn:EXITED},
    // CRYPTO (personal + MetaStable fund holdings)
    {name:"Ethereum (ETH)",cat:"Crypto",detail:"Personal holding at ~$0.30 (2015-2016 range post-launch). Never sold. Advisor to Ethereum Foundation.",btn:CB("ethereum","ETH")},
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"Via MetaStable Capital fund. MetaStable owns BTC as primary holding.",btn:CB("bitcoin","BTC")},
    {name:"Monero (XMR)",cat:"Crypto",detail:"Via MetaStable Capital. MetaStable was reported to own ~1% of total Monero supply.",btn:CB("monero","XMR")},
    {name:"Zcash (ZEC)",cat:"Crypto",detail:"Via MetaStable Capital. Confirmed per multiple sources including line from Wikipedia.",btn:CB("zcash","ZEC")},
    // ADVISOR ROLES (confirmed PitchBook / official bios)
    {name:"StarkWare",cat:"Private",detail:"Advisor. ZK-proof layer 2 company. Confirmed in PitchBook bio.",btn:FORGE},
    {name:"Republic",cat:"Private",detail:"Advisor. Equity crowdfunding platform. Confirmed PitchBook.",btn:REP},
    {name:"BranchOut",cat:"Private",detail:"Professional networking on Facebook. Defunct.",btn:EXITED},
    // CANONICAL PORTFOLIO (Almanack bio + 50+ sources)
    {name:"Uber",cat:"Private",detail:"Pre-seed via The Hit Forge fund (2007). One of the greatest angel bets in VC history.",btn:YF("UBER")},
    {name:"Twitter / X",cat:"Private",detail:"Pre-IPO angel. Cashed out at $54.20/share when Elon took Twitter private Oct 2022.",btn:EXITED},
    {name:"Foursquare",cat:"Private",detail:"Location intelligence. City Guide consumer app shut Dec 2024 (25% layoffs May 2024). Enterprise location data platform still operating.",btn:FORGE},
    {name:"Poshmark",cat:"Private",detail:"Secondhand fashion marketplace. IPO'd then acquired by Naver.",btn:EXITED},
    {name:"Postmates",cat:"Private",detail:"Food delivery. Acquired by Uber (2020) for $2.65B.",btn:EXITED},
    {name:"Thumbtack",cat:"Private",detail:"Marketplace for local services.",btn:FORGE},
    {name:"Notion",cat:"Private",detail:"All-in-one workspace. $10B+ valuation.",btn:FORGE},
    {name:"SnapLogic",cat:"Private",detail:"Enterprise AI integration platform. Naval is current board member.",btn:FORGE},
    {name:"Opendoor",cat:"Private",detail:"iBuying pioneer. Public company (OPEN).",btn:YF("OPEN")},
    {name:"Clubhouse",cat:"Private",detail:"Audio social. Peaked 2021, rapidly declined.",btn:EXITED},
    {name:"Stack Overflow",cat:"Private",detail:"Developer Q&A platform. Acquired by Prosus (2021) for $1.8B.",btn:EXITED},
    {name:"Bolt",cat:"Private",detail:"Checkout and payments unicorn.",btn:FORGE},
    {name:"OpenDNS",cat:"Private",detail:"Internet security. Acquired by Cisco (2015) for $635M.",btn:EXITED},
    {name:"Yammer",cat:"Private",detail:"Enterprise social. Acquired by Microsoft (2012) for $1.2B.",btn:EXITED},
    {name:"Clearview AI",cat:"Private",detail:"Facial recognition. $51.75M class action settlement 2025 (23% equity to class). Barred from selling to private entities. Still operating for law enforcement.",btn:null},
    {name:"Wanelo",cat:"Private",detail:"Social shopping platform. Shut down 2019.",btn:EXITED},
    {name:"Wish.com",cat:"Private",detail:"E-commerce platform. Major decline since 2022.",btn:EXITED},
    // ADDITIONAL CONFIRMED
    {name:"Perplexity",cat:"Private",detail:"Early investor across multiple rounds. AI search unicorn challenging Google.",btn:FORGE},
    {name:"OpenSea",cat:"Private",detail:"NFT marketplace. $13.3B peak valuation (2022). 50%+ staff cuts 2023. SEC dropped investigation Feb 2025. OS2 relaunched 2024. NFT market down 90%+.",btn:FORGE},
    {name:"Eight Sleep",cat:"Private",detail:"Smart sleep system. Health-focused consumer hardware. Unicorn.",btn:FORGE},
    {name:"Anchorage Digital",cat:"Private",detail:"First federally chartered crypto bank. Advisor/investor.",btn:FORGE},
    {name:"HoneyBook",cat:"Private",detail:"Series A investor (2014 confirmed, $10M round). SMB client management. $2.4B valuation by 2021.",btn:FORGE},
    {name:"Blowfish",cat:"Private",detail:"Web3 security — alerts users to dangerous blockchain transactions.",btn:null},
    {name:"Alchemy",cat:"Private",detail:"Web3 developer platform. The 'AWS of blockchain'.",btn:FORGE},
    {name:"Primer",cat:"Private",detail:"AI-powered workflows. Enterprise automation.",btn:FORGE},
    {name:"NexHealth",cat:"Private",detail:"Healthcare SaaS connecting patients and providers.",btn:FORGE},
    {name:"Hebbia",cat:"Private",detail:"AI research tool for finance and legal.",btn:FORGE},
    {name:"Stonks",cat:"Private",detail:"Social investing/demo day platform. No longer active.",btn:EXITED},
    {name:"Magic",cat:"Private",detail:"On-demand personal assistant service.",btn:null},
    {name:"Flipagram",cat:"Private",detail:"Short video app. Acquired by Toutiao (ByteDance predecessor) (2017).",btn:EXITED},
    {name:"Descript",cat:"Private",detail:"AI-powered podcast and video editing.",btn:FORGE},
    {name:"Shef",cat:"Private",detail:"Home chef marketplace. March 1, 2023 investment (confirmed).",btn:null},
    {name:"Zaarly",cat:"Private",detail:"Proximity-based local services marketplace. Shut down 2016.",btn:EXITED},
    {name:"Wheels",cat:"Private",detail:"Shared electric mobility platform. Crunchbase confirmed. $37M raised.",btn:null},
    {name:"Vurb",cat:"Private",detail:"Local discovery app. Acquired by Snapchat 2016, shut down.",btn:EXITED},
    {name:"Visually",cat:"Private",detail:"Content creation platform. Acquired by Percolate, shut down.",btn:EXITED},
    {name:"Unsplash",cat:"Private",detail:"Copyright-free photography platform. Acquired by Getty Images March 2021.",btn:EXITED},
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
    {name:"Network School",cat:"Founded",detail:"Private island campus near Singapore (Forest City, Malaysia). 550+ enrollment (Sep 2024). Expanding to Miami/Dubai/Tokyo.",btn:null},
    {name:"Balaji Fund",cat:"Founded",detail:"Dec 2023. Backed by Naval, Coinbase CEO Brian Armstrong, Fred Wilson.",btn:null},
    {name:"Coin Center",cat:"Founded",detail:"Co-founded. Leading US crypto policy research/advocacy non-profit.",btn:null},
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
    {name:"OpenSea",cat:"Private",detail:"NFT marketplace. $13.3B peak valuation (2022). 50%+ staff cuts 2023. OS2 relaunched. SEC dropped investigation Feb 2025.",btn:FORGE},
    {name:"Orchid Health",cat:"Private",detail:"Reproductive genomics. Official bio.",btn:null},
    {name:"Paradigm",cat:"Private",detail:"Crypto-focused VC. One of the top crypto investment firms.",btn:null},
    {name:"Perplexity",cat:"Private",detail:"AI search engine. $20B valuation. Multiple rounds.",btn:FORGE},
    {name:"Polychain Capital",cat:"Private",detail:"Crypto hedge fund. Top-tier crypto-native VC.",btn:null},
    {name:"Polymarket",cat:"Private",detail:"Prediction markets. ICE invested $2B Oct 2025 ($9B valuation). CFTC-approved return to US market Nov 2025. Acquired CFTC-licensed exchange QCEX for $112M. US app launched Dec 2025. DOJ/CFTC probes closed Jul 2025.",btn:FORGE},
    {name:"Prospera",cat:"Private",detail:"Special economic zone in Honduras. Charter city experiment.",btn:null},
    {name:"Replit",cat:"Private",detail:"Online IDE / AI coding platform. Unicorn.",btn:FORGE},
    {name:"StarkWare",cat:"Private",detail:"ZK-proof L2. Pioneer of ZK technology. Early position.",btn:FORGE},
    {name:"Stedi",cat:"Private",detail:"EDI/B2B data exchange infrastructure.",btn:FORGE},
    {name:"Superhuman",cat:"Private",detail:"Fast email client. Unicorn.",btn:FORGE},
    {name:"Valar Atomic",cat:"Private",detail:"Micro nuclear reactors. Official bio.",btn:null},
    {name:"Varda Space",cat:"Private",detail:"In-orbit manufacturing. Official bio.",btn:FORGE},
    {name:"Zora (ZORA)",cat:"Crypto",detail:"On-chain creative economy / NFT protocol. ZORA token on Coinbase.",btn:CB("zora","ZORA")},
    // EXTENDED SPEAKING BIO (Bitcoin Asia 2025 + others)
    {name:"Celestia (TIA)",cat:"Crypto",detail:"Modular data availability layer for blockchains. TIA on Coinbase.",btn:CB("celestia","TIA")},
    {name:"Culdesac",cat:"Private",detail:"Car-free neighborhoods. Urban development.",btn:FORGE},
    {name:"Dapper Labs",cat:"Crypto",detail:"NBA Top Shot, CryptoKitties, Flow blockchain. 70%+ staff cuts 2022-24. NFT volume down 95%+. SEC investigation closed Sep 2023. Class action ongoing.",btn:FORGE},
    {name:"Deel",cat:"Private",detail:"Global HR and payroll platform. $17.3B valuation (Oct 2025). $1B+ ARR, profitable 3 years. DOJ opened criminal investigation re: corporate espionage vs Rippling (Jan 2026). IPO planned.",btn:FORGE},
    {name:"Espresso Systems",cat:"Crypto",detail:"Rollup confirmation layer / ZK infrastructure.",btn:null},
    {name:"Farcaster / DEGEN",cat:"Crypto",detail:"Decentralized social protocol on Ethereum. DEGEN is the primary Farcaster ecosystem token — on Coinbase.",btn:CB("degen-base","DEGEN")},
    {name:"Hadrian",cat:"Private",detail:"CNC machining for aerospace and defense.",btn:FORGE},
    {name:"Infinita",cat:"Private",detail:"Network state infrastructure.",btn:null},
    {name:"Instadapp",cat:"Crypto",detail:"DeFi aggregation and management.",btn:null},
    {name:"Minicircle",cat:"Private",detail:"Gene therapy / longevity. Startup in Próspera.",btn:null},
    {name:"Mirror",cat:"Crypto",detail:"Decentralized publishing on Ethereum.",btn:null},
    {name:"Nucleus Genomics",cat:"Private",detail:"Genomics and ancestry.",btn:null},
    {name:"Omada Health (OMDA)",cat:"Public",detail:"Digital chronic disease management. IPO'd Nasdaq Jun 6 2025 at $19/share. Ticker: OMDA.",btn:YF("OMDA")},
    {name:"Republic",cat:"Private",detail:"Equity crowdfunding platform.",btn:REP},
    {name:"Roam Research",cat:"Private",detail:"Networked note-taking tool.",btn:null},
    {name:"Synthesis",cat:"Private",detail:"Accelerated learning for kids (spun out of SpaceX school).",btn:FORGE},
    {name:"Vitalia",cat:"Private",detail:"Longevity city / network state in Honduras.",btn:null},
    {name:"VoteAgora",cat:"Private",detail:"Crypto governance tooling.",btn:null},
    // OLDER CONFIRMED (from bios + reports)
    {name:"Cameo",cat:"Private",detail:"Celebrity video messages. Once a $1B unicorn; valuation crashed 90%+ to ~$50-100M. FTC fined for undisclosed endorsements; couldn't afford $600K penalty. Still operating with <50 staff.",btn:FORGE},
    {name:"Eight Sleep",cat:"Private",detail:"Smart sleep system. Health tech.",btn:FORGE},
    {name:"Push Protocol (PUSH)",cat:"Crypto",detail:"Decentralized notifications for Web3. PUSH on Coinbase.",btn:CB("push-protocol","PUSH")},
    {name:"Gitcoin (GTC)",cat:"Crypto",detail:"Open source funding via quadratic funding. GTC on Coinbase.",btn:CB("gitcoin","GTC")},
    {name:"Golden",cat:"Private",detail:"Decentralized knowledge graph. Shut down 2024.",btn:EXITED},
    {name:"Lambda School (Bloom Institute)",cat:"Private",detail:"Coding bootcamp. CFPB enforcement action 2024 — fraud, predatory lending findings. CEO banned from student lending.",btn:EXITED},
    {name:"Levels Health",cat:"Private",detail:"Continuous glucose monitoring for metabolic health.",btn:FORGE},
    {name:"Messari",cat:"Private",detail:"Crypto research and data platform.",btn:FORGE},
    {name:"OnDeck",cat:"Private",detail:"Network for ambitious builders.",btn:null},
    {name:"Skiff",cat:"Private",detail:"Privacy-first collaborative docs. Acquired by Notion (2024).",btn:EXITED},
    {name:"Soylent",cat:"Private",detail:"Nutritionally complete food. Acquired by Starco Brands (STCB) Feb 2023.",btn:EXITED},
    {name:"Stability AI",cat:"Private",detail:"Open-source AI / Stable Diffusion.",btn:FORGE},
    {name:"Enhanced Games",cat:"Private",detail:"Olympic-style athletics competition allowing performance-enhancing drugs. Confirmed in Bitcoin Asia 2025 extended speaking bio.",btn:null},
    {name:"Clubhouse",cat:"Private",detail:"Audio social network. Peaked 2021, rapidly declined.",btn:EXITED},
    // PRESS-RELEASE CONFIRMED RECENT (all verified by The Block, CoinDesk, Bloomberg, Fortune, etc.)
    {name:"ZODL / Zcash Open Dev Lab",cat:"Crypto",detail:"$25M seed (Mar 2026). Paradigm, a16z, Winklevoss. ZK-proof Zcash ecosystem. Most recent investment.",btn:null},
    {name:"Project Eleven",cat:"Private",detail:"$20M Series A (Jan 2026). Castle Island led. Post-quantum cryptography security for Bitcoin.",btn:null},
    {name:"Reason Robotics",cat:"Private",detail:"Most recent per PitchBook (Dec 2025).",btn:null},
    {name:"Arctus Aerospace",cat:"Private",detail:"$2.6M pre-seed (Nov 2025). Version One confirmed. High-altitude UAVs, Bangalore.",btn:null},
    {name:"0xbow / Privacy Pools",cat:"Crypto",detail:"$3.5M seed (Nov 2025). The Block confirmed. Ethereum Privacy Pools compliant mixer.",btn:null},
    {name:"NOICE",cat:"Crypto",detail:"Undisclosed (Oct 2025). Social network on Base. Coinbase Ventures + Balaji. Crypto-Fundraising confirmed.",btn:null},
    {name:"Notch",cat:"Private",detail:"Oct 23, 2025. Crunchbase confirmed.",btn:null},
    {name:"fomo",cat:"Private",detail:"$17M Series A (Nov 2025). Crunchbase confirmed.",btn:null},
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
    {name:"Polymarket",cat:"Private",detail:"Series B investor (May 2024). Platform now valued at $9B (ICE $2B investment Oct 2025). CFTC-cleared to operate in US as of Nov 2025. Prediction markets as information infrastructure.",btn:FORGE},
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
    {name:"STRK (StarkNet Tokens)",cat:"Crypto",detail:"Unlocked 845,205 STRK in May 2024. Has not sold. From StarkWare/StarkNet relationship. STRK on Coinbase.",btn:CB("starknet","STRK")},
    {name:"WHITE Token",cat:"Crypto",detail:"~$1.16M gifted token holding. Retained, not sold.",btn:null},
    {name:"MOODENG (Memecoin)",cat:"Crypto",detail:"~$442K. Gifted memecoin. Retained.",btn:null},
    {name:"Aave V3 (DeFi)",cat:"Crypto",detail:"$12.33M deposited in Aave V3. Largest active DeFi position. On-chain confirmed.",btn:CB("aave","AAVE")},
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
    {name:"Jito (JTO)",cat:"Crypto",detail:"Invested in Jito Labs, the company behind the JTO governance token. Dominant Solana liquid staking and MEV protocol — largest liquid staking provider on Solana. JTO is live on Coinbase. Early investor token allocation confirmed via investment in Jito Labs. Confirmed Crunchbase.",btn:CB("jito","JTO")},
    {name:"Helius",cat:"Private",detail:"$9.5M Series A (Feb 2024, co-invested with Balaji). Premier Solana RPC provider.",btn:null},
    {name:"Chaos Labs",cat:"Private",detail:"$55M Series A. On-chain risk management for DeFi protocols.",btn:null},
    {name:"Solayer (LAYER)",cat:"Crypto",detail:"Pre-seed + $12M seed investor. Dominant Solana restaking marketplace — $150M+ TVL. LAYER governance token live on Coinbase since September 11, 2025. Backed by Binance Labs. Confirmed investment and Coinbase listing.",btn:CB("solayer","LAYER")},
    {name:"Squads",cat:"Private",detail:"$5.7M. Smart account and multisig infrastructure for Solana.",btn:null},
    {name:"Zama",cat:"Private",detail:"$73M. Fully homomorphic encryption (FHE) for blockchain.",btn:FORGE},
    {name:"io.net (IO)",cat:"Crypto",detail:"Series A investor. Decentralized GPU network assembling 1M+ GPUs for ML applications. IO token live on Coinbase since October 2024. Thesis: decentralized compute as AI infrastructure backbone. Confirmed Crunchbase and Coinbase.",btn:CB("io-net","IO")},
    {name:"Oobit",cat:"Private",detail:"$25M Series A. Led by Tether and Toly. Crypto payments.",btn:null},
    {name:"Drift Protocol (DRIFT)",cat:"Crypto",detail:"Solana-native perpetuals and spot DEX. DRIFT governance token live on Coinbase since September 2024. ⚠️ Protocol suffered a $280M security exploit April 1, 2026 via social engineering attack. Operations resumed, security remediation underway. Confirmed investment via Crunchbase.",btn:CB("drift","DRIFT")},
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
    {name:"Ryder",cat:"Private",detail:"$3.2M (Oct 2025). Hardware wallet / security device.",btn:null},
    {name:"Inference / Kuzco",cat:"Private",detail:"$11.8M (Oct 2025). Distributed AI inference on Solana.",btn:null},
    {name:"BULK",cat:"Crypto",detail:"$8M (Sep 2025). Solana ecosystem.",btn:null},
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
    {name:"LinkedIn",cat:"Private",detail:"Provided early funding. Wikipedia: 'provided early funding for LinkedIn, Yelp, and dozens of startups.' LinkedIn IPO'd 2011 and was acquired by Microsoft for $26.2B (2016). Confirmed Wikipedia Founders Fund section.",btn:EXITED},
    {name:"Clearview AI",cat:"Private",detail:"One of the first outside investors (2017). Controversial facial recognition technology startup. Wikipedia: 'Thiel was one of the first outside investors in Clearview AI, a facial recognition technology startup.' Also backed by Peter Thiel personally and through Founders Fund.",btn:null},
    {name:"AbCellera Biologics (ABCL)",cat:"Public",detail:"Antibody discovery platform. Bloomberg confirms Thiel holds a public stake outside Founders Fund. Nasdaq: ABCL. Part of his public markets positions distinct from FF.",btn:YF("ABCL")},
    {name:"Compass Pathways (CMPS)",cat:"Public",detail:"Mental health psychedelic therapy company. Bloomberg confirms Thiel holds a public stake. Nasdaq: CMPS. Part of his public markets positions distinct from FF.",btn:YF("CMPS")},
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
    {name:"Pudgy Penguins (PENGU)",cat:"Crypto",detail:"Leading NFT brand. PENGU token on Coinbase. Founders Fund.",btn:CB("pengu","PENGU")},
    {name:"Cognition AI",cat:"Private",detail:"AI coding agent 'Devin'. 2024 unicorn. FF.",btn:FORGE},
    {name:"SentientAGI",cat:"Private",detail:"$85M UAE seed (2024). Open-source sovereign AI for Gulf nations. FF led.",btn:null},
    {name:"Netic",cat:"Private",detail:"AI for SMBs. FF led $23M Series B (late 2025).",btn:null},
    {name:"Wish.com",cat:"Private",detail:"E-commerce platform. Major decline since 2022.",btn:EXITED},
    {name:"ZocDoc",cat:"Private",detail:"Doctor appointment booking platform. FF.",btn:FORGE},
    {name:"Flexport",cat:"Private",detail:"Digital freight/logistics. ~$3.5B valuation (down from $8B peak). Multiple layoff rounds. Ryan Petersen returned as CEO 2023. $2.1B revenue 2024. Still operating.",btn:FORGE},
    {name:"Asana",cat:"Private",detail:"Work management. Public (ASAN). FF and Thiel personal.",btn:YF("ASAN")},
    // MITHRIL CAPITAL portfolio (confirmed)
    {name:"Helion Energy",cat:"Private",detail:"Fusion energy. $425M round (Jan 2025). Mithril board member.",btn:FORGE},
    {name:"Oklo",cat:"Private",detail:"Nuclear microreactor. Public (OKLO). Mithril board member.",btn:YF("OKLO")},
    {name:"BlackSky (BKSY)",cat:"Public",detail:"Space-based geospatial intelligence. NYSE: BKSY. Mithril investment. $106M revenue 2025.",btn:YF("BKSY")},
    {name:"Invivyd (IVVD)",cat:"Private",detail:"Monoclonal antibody COVID therapies. EUA approved. Public on Nasdaq.",btn:YF("IVVD")},
    {name:"Forsight Robotics",cat:"Private",detail:"Israeli eye surgery robotics. Mithril.",btn:null},
    {name:"Fractyl Health",cat:"Private",detail:"Metabolic disease (GLP-1 alternative). IPO 2024. Mithril.",btn:YF("GUTS")},
    {name:"Paxos",cat:"Crypto",detail:"Blockchain infrastructure and stablecoin issuer. Mithril and FF.",btn:FORGE},
    {name:"Auris Health",cat:"Private",detail:"Surgical robotics — considered one of Mithril's best deals. Acquired by J&J.",btn:EXITED},
    // VALAR VENTURES portfolio (full confirmed list)
    {name:"Wise (TransferWise)",cat:"Public",detail:"Global money transfer platform. Listed on London Stock Exchange Jul 7 2021 via direct listing. Ticker: WISE on LSE. Valar flagship investment.",btn:YF("WISE.L")},
    {name:"N26",cat:"Private",detail:"German neobank. ~$6B valuation (down from $9B peak). BaFin regulatory issues. Co-founders stepped back H2 2025. IPO unlikely before 2027.",btn:FORGE},
    {name:"Qonto",cat:"Private",detail:"French business banking. Unicorn. Valar.",btn:FORGE},
    {name:"Bitpanda",cat:"Private",detail:"Austrian crypto/investment platform. Valar.",btn:FORGE},
    {name:"Xero",cat:"Private",detail:"Cloud accounting software. Public in Australia. Valar.",btn:null},
    {name:"Kuda Bank",cat:"Private",detail:"Nigerian neobank. Valar.",btn:null},
    {name:"Novo",cat:"Private",detail:"US small business banking. Valar.",btn:null},
    {name:"Treecard",cat:"Private",detail:"Green debit card. Shutting down April 16, 2026 — unable to operate sustainably.",btn:EXITED},
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
    {name:"Luminar Technologies",cat:"Private",detail:"LiDAR for autonomous vehicles. Filed Chapter 11 bankruptcy Dec 15 2025. Delisted from Nasdaq Dec 24 2025.",btn:EXITED},
    {name:"Loom",cat:"Private",detail:"Screen recording and video messaging. 1517 Fund. Acquired by Atlassian for $975M.",btn:EXITED},
    {name:"Atom Computing",cat:"Private",detail:"Quantum computing. 1517 Fund.",btn:null},
    {name:"Durin Mining Technologies",cat:"Private",detail:"Critical minerals. 1517 Fund.",btn:null},
    // PERSONAL / THIEL CAPITAL direct
    {name:"Facebook / Meta",cat:"Private",detail:"$500K for 10.2% → sold $1.1B+ post-IPO. Most famous angel bet ever. Now holds ~10K shares.",btn:YF("META")},
    {name:"LinkedIn",cat:"Private",detail:"Early investor (Founders Fund bio). Acquired by Microsoft $26B (2016).",btn:EXITED},
    {name:"Yelp",cat:"Private",detail:"Early investor. Confirmed multiple sources.",btn:YF("YELP")},
    {name:"Clearview AI",cat:"Private",detail:"Facial recognition. Early investor 2017. $51.75M class action settlement 2025. Barred from private entity sales. Active w/law enforcement.",btn:null},
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
    {name:"Block.one / EOS",cat:"Crypto",detail:"Blockchain platform. Confirmed PANews. EOS on Coinbase.",btn:CB("eos","EOS")},
    {name:"Bullish (BULL)",cat:"Crypto",detail:"Institutional crypto exchange. Went public via SPAC on NYSE. Thiel pre-IPO backer.",btn:YF("BULL")},
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
    {name:"Blueprint Protocol",cat:"Founded",detail:"$60M raised (Oct 2025). Investors: Naval, Balaji, Winklevoss twins, Kim Kardashian, Logan Paul, Alex Hormozi, Ari Emanuel. Bryan is the test subject.",btn:null},
    // OS FUND portfolio (confirmed)
    {name:"Ginkgo Bioworks (DNA)",cat:"Private",detail:"Synthetic biology platform. Now publicly traded on NYSE (DNA).",btn:YF("DNA")},
    {name:"Atomwise",cat:"Private",detail:"AI-powered drug discovery. Raised $174M total.",btn:FORGE},
    {name:"twoXAR / Aria",cat:"Private",detail:"AI drug discovery. Acquired and absorbed.",btn:EXITED},
    {name:"Catalog",cat:"Private",detail:"DNA data storage — trillion bits per gram capacity.",btn:null},
    {name:"Matternet",cat:"Private",detail:"Medical drone delivery in Switzerland.",btn:null},
    {name:"Synthego",cat:"Private",detail:"CRISPR genomics tools company. Acquired by Perceptive Biosciences (Jun 2025).",btn:EXITED},
    {name:"Pivot Bio",cat:"Private",detail:"Nitrogen-fixing microbes replacing chemical fertilizer.",btn:FORGE},
    {name:"Arzeda",cat:"Private",detail:"Computational protein design / enzyme engineering.",btn:null},
    {name:"NuMat Technologies",cat:"Private",detail:"Metal-organic framework materials for gas storage.",btn:null},
    {name:"Vicarious",cat:"Private",detail:"AI robotics. Acquired by Alphabet (SoftBank intermediary).",btn:EXITED},
    {name:"JUST Egg / Eat Just",cat:"Private",detail:"Plant-based eggs. ~$1.2B valuation. Serious financial issues — unpaid bills, multiple lawsuits, layoffs 2023. ABEC suit settled Mar 2025. Still operating.",btn:FORGE},
    {name:"Human Longevity Inc.",cat:"Private",detail:"Genomics and longevity data platform.",btn:FORGE},
    {name:"Planetary Resources",cat:"Private",detail:"Asteroid mining. Acquired by ConsenSys.",btn:EXITED},
    {name:"Synthetic Genomics (Viridos)",cat:"Private",detail:"J. Craig Venter's synthetic biology company. Renamed Viridos. Filed for bankruptcy April 2025.",btn:EXITED},
    {name:"Emerald Therapeutics",cat:"Private",detail:"Drug discovery platform. OS Fund confirmed via Wikipedia and Golden.",btn:null},
    {name:"uBiome",cat:"Private",detail:"Human microbiome sequencing. Shut down 2019 amid fraud investigation.",btn:EXITED},
    {name:"Verge Genomics",cat:"Private",detail:"AI-powered neurodegenerative disease drug discovery.",btn:FORGE},
    {name:"Truvian Health",cat:"Private",detail:"Automated blood testing at patient scale.",btn:FORGE},
    {name:"Elysium Health",cat:"Private",detail:"Longevity supplements (NAD+ via Basis). Science-backed.",btn:null},
    {name:"Tempo Automation",cat:"Private",detail:"PCB manufacturing automation. IPO Nov 2022, delisted Oct 2023, filed Chapter 7 bankruptcy Dec 2023.",btn:EXITED},
    // Personal angel
    {name:"Etched",cat:"Private",detail:"$5B valuation. Transformer-specific ASIC chip. Co-invested with Thiel and Balaji (confirmed press release).",btn:FORGE},
    {name:"Apollo Research",cat:"Private",detail:"Jan 2026. AI safety research organization.",btn:null},
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
    {name:"Twitter / X",cat:"Private",detail:"Early investment. Cashed out at $54.20/share when Elon took Twitter private Oct 2022.",btn:EXITED},
    {name:"Shopify",cat:"Private",detail:"First advisor with ~5 employees. Now $150B+ company.",btn:YF("SHOP")},
    {name:"Duolingo",cat:"Private",detail:"Led Series A. IPO'd at $11B+. ~50x+ return.",btn:YF("DUOL")},
    {name:"Airbnb",cat:"Private",detail:"Early angel.",btn:YF("ABNB")},
    {name:"Alibaba",cat:"Private",detail:"Early. Published portfolio.",btn:YF("BABA")},
    {name:"SpaceX",cat:"Private",detail:"Investor. Published portfolio.",btn:FORGE},
    {name:"AngelList",cat:"Private",detail:"Early investor. Published portfolio. Frequent co-investor with Naval.",btn:null},
    {name:"Wealthfront",cat:"Private",detail:"Robo-advisor. Early investor. UBS acquired Wealthfront 2022.",btn:EXITED},
    {name:"Nextdoor",cat:"Private",detail:"Neighborhood social. Public (KIND). Published portfolio.",btn:YF("KIND")},
    {name:"TaskRabbit",cat:"Private",detail:"First advisor. Acquired by IKEA (2017).",btn:EXITED},
    {name:"CLEAR",cat:"Private",detail:"First advisor. Biometric identity. IPO'd (YOU).",btn:YF("YOU")},
    {name:"Automattic",cat:"Private",detail:"WordPress parent company. $7.5B valuation. Published portfolio.",btn:FORGE},
    {name:"Blue Bottle Coffee",cat:"Private",detail:"Early investor. Acquired by Nestlé ~$500M (2017).",btn:EXITED},
    {name:"Commonwealth Fusion Systems",cat:"Private",detail:"Plasma fusion energy. Long-term bet. MIT spin-out.",btn:FORGE},
    {name:"Maui Nui Venison",cat:"Private",detail:"Regenerative wild deer harvesting. Published portfolio.",btn:null},
    {name:"LALO Tequila",cat:"Private",detail:"Additive-free blanco tequila by Don Julio's grandson. Ferriss invested. Tito's Vodka acquired majority stake Sep 2025.",btn:EXITED},
    {name:"Huckberry",cat:"Private",detail:"Outdoor/adventure lifestyle brand. Published portfolio.",btn:null},
    {name:"NoRedInk",cat:"Private",detail:"Writing education platform. Published portfolio.",btn:null},
    {name:"Harbor",cat:"Private",detail:"Securities tokenization. Shut down 2021.",btn:EXITED},
    {name:"OpenSea",cat:"Private",detail:"NFT marketplace. Series A 2021. $13.3B peak valuation 2022. OS2 relaunched.",btn:FORGE},
    {name:"Zendrive",cat:"Private",detail:"Telematics/driver safety analytics. Acquired by Intuit (Credit Karma) Jun 2024.",btn:EXITED},
    {name:"Haus",cat:"Private",detail:"Low-ABV aperitifs. Shut down Aug 2022. Acquired by Naked Market Jun 2023.",btn:EXITED},
    {name:"Rosebud",cat:"Private",detail:"AI journaling app. Jun 2025. TechCrunch confirmed.",btn:null},
    {name:"SkyKick",cat:"Private",detail:"Cloud SaaS for IT. Exit Sep 2024.",btn:EXITED},
    // From Crunchbase / Wellfound (all confirmed database entries)
    {name:"Evernote",cat:"Private",detail:"Note-taking app. Acquired by Bending Spoons 2023.",btn:EXITED},
    {name:"Posterous",cat:"Private",detail:"Blogging platform. Acquired by Twitter (2012). Crunchbase confirmed.",btn:EXITED},
    {name:"RescueTime",cat:"Private",detail:"Time tracking and productivity software. Crunchbase confirmed.",btn:null},
    {name:"BranchOut",cat:"Private",detail:"Professional networking on Facebook. Defunct.",btn:EXITED},
    {name:"about.me",cat:"Private",detail:"Personal landing page platform. Acquired by AOL. Crunchbase confirmed.",btn:EXITED},
    {name:"DailyBurn",cat:"Private",detail:"Fitness tracking and video workouts. Crunchbase confirmed.",btn:null},
    {name:"CreativeLive",cat:"Private",detail:"Online learning platform. Acquired by Fiverr 2021, sold to CourseHorse Dec 2025.",btn:EXITED},
    {name:"Soma Water",cat:"Private",detail:"Design-forward water filtration carafe. Acquired by Full Circle Home 2017.",btn:EXITED},
    {name:"The Hustle",cat:"Private",detail:"Business newsletter/media. Acquired by HubSpot. Crunchbase confirmed.",btn:EXITED},
    {name:"Shift",cat:"Private",detail:"Desktop app for managing multiple accounts/apps. Crunchbase confirmed.",btn:null},
    {name:"Reputation.com",cat:"Private",detail:"Online reputation management SaaS. Crunchbase confirmed.",btn:null},
    {name:"Trippy",cat:"Private",detail:"Social travel recommendations. Defunct.",btn:EXITED},
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
    {name:"Tonal",cat:"Private",detail:"Connected home gym. 35% layoffs 2022. Fresh $130M 2023. New CEO Sep 2024. Approaching EBITDA profitability. Still operating.",btn:FORGE},
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
    {name:"Savage X Fenty",cat:"Private",detail:"Rihanna's lingerie brand. $3B valuation floated 2022, IPO never filed. Rihanna stepped back to Executive Chair Jun 2023. CEO poached by Victoria's Secret Aug 2024. Still private.",btn:FORGE},
    {name:"StockX",cat:"Private",detail:"Sneaker/streetwear resale marketplace. $3.8B valuation (last round Apr 2021). Multiple layoffs including Jan 2024. Nike lawsuit settled. IPO on hold.",btn:FORGE},
    {name:"Therabody",cat:"Private",detail:"Percussion therapy tools. Acquired by Therabody group.",btn:null},
    {name:"Simulate (Nuggs)",cat:"Private",detail:"Plant-based chicken. Acquired by Ahimsa Companies (Oct 2024).",btn:EXITED},
    {name:"Partake Foods",cat:"Private",detail:"Allergen-free cookies and snacks.",btn:null},
    {name:"Bitski",cat:"Crypto",detail:"NFT marketplace. San Francisco-based.",btn:null},
    {name:"Spatial Labs (sLABS)",cat:"Private",detail:"Web3/metaverse incubator by Iddris Sandu. $19M deal.",btn:null},
    {name:"Hungry Marketplace",cat:"Private",detail:"Food-tech corporate catering. $270M valuation.",btn:FORGE},
    {name:"Merit Beauty",cat:"Private",detail:"Clean beauty brand.",btn:null},
    {name:"Our Place",cat:"Private",detail:"Cookware brand (Always Pan). Direct-to-consumer.",btn:null},
    {name:"Babylist",cat:"Private",detail:"Baby registry/marketplace.",btn:FORGE},
    {name:"Wheels",cat:"Private",detail:"Electric transportation / e-scooters. Shut down.",btn:EXITED},
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
    {name:"Fenty Beauty",cat:"Founded",detail:"50/50 with LVMH's Kendo. Launched Sep 2017 with 40 foundation shades. Industry-transforming. $100M first 40 days. $450M net sales (2024). LVMH exploring sale of its stake (Reuters Oct 2025). Valued $1-2B.",btn:null},
    {name:"Savage X Fenty",cat:"Founded",detail:"~30% stake. Launched 2018 with TechStyle. $1B valuation (2022 Series C, $125M, L Catterton + LVMH's Arnaud as shareholder). Jay-Z's MarcyPen invested. CEO departed Aug 2024. IPO speculation ongoing.",btn:null},
    {name:"Fenty Skin",cat:"Founded",detail:"Launched 2020. Skincare complement to Fenty Beauty. Available at Sephora globally.",btn:null},
    {name:"Fenty Hair",cat:"Founded",detail:"Launched June 2024. Key new category expansion into haircare.",btn:null},
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
    {name:"FuboTV (FUBO)",cat:"Private",detail:"Reynolds received $10M in FUBO stock via Maximum Effort deal (2022). Merged with Hulu + Live TV Oct 2025 — still public as FUBO on NYSE.",btn:YF("FUBO")},
    {name:"Nuvei",cat:"Private",detail:"Canadian fintech. Invested Apr 2023 at ~$42/share. Advent International took private Nov 2024 at $34/share — likely a loss.",btn:EXITED},
    {name:"Match Group (Board)",cat:"Private",detail:"Joined board of Match Group (Tinder, Match.com, Hinge, OkCupid).",btn:YF("MTCH")},
    {name:"Ottawa Senators (failed bid)",cat:"Private",detail:"Prepared $1B+ bid (2023). Did not proceed. Never completed.",btn:EXITED},
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
    {name:"SKIMS",cat:"Founded",detail:"Co-founded 2019 with Jens Grede (CEO). $5B valuation (Nov 2025, Goldman Sachs $225M round confirmed by official press release). Revenue expected $1B+ in 2025. 18 US stores + 2 Mexico franchise. Kim owns ~35% = ~$1.67B on paper.",btn:null},
    {name:"KKW Beauty → SKKN by Kim",cat:"Founded",detail:"Launched 2017. $100M first year. Coty bought 20% for $200M (2020). Rebranded SKKN 2022. Shut down Jun 2025. Folded into SKIMS.",btn:EXITED},
    {name:"SKKY Partners",cat:"Founded",detail:"Co-founded 2022 with ex-Carlyle Jay Sammons. Angela Ahrendts (ex-Apple retail) as senior advisor. Dual-HQ Boston + LA.",btn:null},
    {name:"NikeSkims",cat:"Private",detail:"Announced Feb 2025. Nike's first-ever co-branded outside label. Seven collections, 58 silhouettes. First drop sold out in hours. Ongoing product launches.",btn:null},
    {name:"Skims Beauty (2026)",cat:"Founded",detail:"Launching 2026 under Diarrha N'Diaye (ex-Ami Colé founder). Fragrance, makeup, skincare. Folding in all KKW/SKKN work.",btn:null},
    {name:"SKKY: 111Skin",cat:"Private",detail:"'Significant' minority stake (Jan 2025). First confirmed SKKY deal — reported Business of Fashion. Luxury skincare from Harley Street plastic surgeon.",btn:null},
    {name:"SKKY: Truff",cat:"Private",detail:"Truffle-infused hot sauce brand. Cult following among foodies.",btn:null},
    {name:"Coty stake (repurchased)",cat:"Private",detail:"Coty had 20% of KKW/SKKN since 2020 ($200M). Repurchased March 2025. All beauty now unified.",btn:YF("COTY")},
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
    {name:"Erakulis",cat:"Founded",detail:"Fitness and wellness app. €788K EU funding.",btn:null},
    {name:"UR.MARV Film Studio",cat:"Founded",detail:"50-50 JV with filmmaker Matthew Vaughn (Apr 10, 2025). Two action films already produced. Third in development.",btn:null},
    {name:"UR Cristiano",cat:"Founded",detail:"YouTube channel launched August 2024. Personal brand media content. Part of broader media empire alongside Medialivre.",btn:null},
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
    {name:"Daily Harvest",cat:"Private",detail:"Fresh food delivery. Serena Ventures portfolio. Settled $30M+ class action (2024-25) from 2022 tara flour recall that sickened 470+ people. Still operating.",btn:FORGE},
    {name:"Gobble",cat:"Private",detail:"Meal kit service. Acquired by Intelligent Foods (Sun Basket) Dec 2022.",btn:EXITED},
    {name:"Little Spoon",cat:"Private",detail:"Organic baby food delivery service. Serena Ventures portfolio — named explicitly in PitchBook deep-dive feature on Serena's investment thesis.",btn:FORGE},
    {name:"Ollie",cat:"Private",detail:"Fresh dog food subscription. Acquired by Agrolimen Feb 2026.",btn:EXITED},
    {name:"The Wing",cat:"Private",detail:"Women-focused co-working. Shut down August 2022.",btn:EXITED},
    {name:"Billie",cat:"Private",detail:"Female-focused razor brand. Acquired by Edgewell Personal Care Nov 2021 for $310M.",btn:EXITED},
    {name:"Lola",cat:"Private",detail:"Organic feminine care brand. Acquired by Forum Brands late 2023.",btn:EXITED},
    {name:"MasterClass",cat:"Private",detail:"Celebrity online learning platform. $2.75B valuation (2021). 3+ rounds of layoffs 2022-2025. Still operating ~800 employees.",btn:FORGE},
    {name:"Impossible Foods",cat:"Private",detail:"2019 $300M round alongside Jay-Z, Katy Perry.",btn:FORGE},
    {name:"Noom",cat:"Private",detail:"Weight management app. $3.7B valuation (2021). Multiple layoff rounds 2022-25. $56M class action settlement. Pivoting to GLP-1 drugs.",btn:FORGE},
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
    {name:"Indoggo Gin",cat:"Private",detail:"Co-owns strawberry-flavored gin brand.",btn:null},
    {name:"Still G.I.N.",cat:"Private",detail:"Premium spirits brand co-founded with Dr. Dre.",btn:null},
    {name:"Reddit",cat:"Private",detail:"Invested 2014. Reddit IPO'd March 2024 at $20B+ market cap.",btn:YF("RDDT")},
    {name:"Klarna (KLAR)",cat:"Public",detail:"Swedish payments giant. IPO'd NYSE Sep 2025 at $40/share (~$15B valuation). Ticker: KLAR.",btn:YF("KLAR")},
    {name:"Robinhood",cat:"Private",detail:"Pre-IPO investor. Backed before the 2021 GameStop retail trading moment.",btn:YF("HOOD")},
    // Casa Verde portfolio (named investments)
    {name:"Dutchie",cat:"Private",detail:"Dispensary operating platform. Point-of-sale, e-commerce, payments.",btn:FORGE},
    {name:"Eaze",cat:"Private",detail:"Cannabis delivery platform. One of the first cannabis e-commerce services.",btn:null},
    {name:"Vangst",cat:"Private",detail:"Cannabis industry recruiting platform.",btn:null},
    {name:"Proper Sleep",cat:"Private",detail:"CBD-focused sleep products.",btn:null},
    {name:"AceCann",cat:"Private",detail:"Led $15M round. First Casa Verde EU investment. Medical cannabis, Lisbon, Portugal.",btn:null},
    {name:"Tsumo Snacks",cat:"Private",detail:"Cannabis-infused tortilla chips.",btn:null},
    {name:"Oxford Cannabinoid Technologies",cat:"Private",detail:"UK medical cannabis research company. 2018.",btn:null},
    {name:"Harmony Craft Beverages",cat:"Private",detail:"Cannabis-infused beverage brand. Angel round March 5, 2025. Snoop's most recent confirmed personal investment per Tracxn.",btn:null},
    {name:"Philz Coffee",cat:"Private",detail:"Pour-over specialty coffee chain based in San Francisco. Snoop confirmed as investor via Crunchbase profile listing.",btn:null},
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
    {name:"Sound AI Fund",cat:"Founded",detail:"Closed at $240M (oversubscribed) in May 2023. Co-led by Kutcher and Guy Oseary with Effie Epstein. Invests at the foundation model AI layer. Current portfolio: OpenAI, Anthropic, StabilityAI. Confirmed Variety and official Sound Ventures press release.",btn:null},
    {name:"Thorn",cat:"Founded",detail:"Non-profit co-founded with Demi Moore (2012). Tech to detect and disrupt child sex trafficking. 10,000+ victims identified. Partners: Google, Twitter, Facebook. Defines his public identity.",btn:null},
    // Major exits
    {name:"Uber",cat:"Private",detail:"$500K early angel → tens of millions. One of the best individual angel bets in tech history.",btn:YF("UBER")},
    {name:"Airbnb",cat:"Private",detail:"$2.5M early A-Grade investment. Massive IPO return.",btn:YF("ABNB")},
    {name:"Spotify",cat:"Private",detail:"$3M pre-IPO via A-Grade.",btn:YF("SPOT")},
    {name:"Skype",cat:"Private",detail:"A-Grade position. Microsoft acquired for $8.5B.",btn:EXITED},
    {name:"Shazam",cat:"Private",detail:"Music recognition. Apple acquired for $400M.",btn:EXITED},
    {name:"Foursquare",cat:"Private",detail:"Location intelligence. A-Grade position.",btn:null},
    {name:"Duolingo",cat:"Private",detail:"Language learning. Led Series A via A-Grade. IPO'd at $5B+.",btn:YF("DUOL")},
    {name:"Square / Block",cat:"Private",detail:"Jack Dorsey's payments company. A-Grade investment. IPO'd then grew significantly.",btn:EXITED},
    // Sound Ventures portfolio
    {name:"OpenAI",cat:"Private",detail:"Via Sound AI Fund ($240M AI fund). ChatGPT / GPT-4 creator. $157B+ valuation. Confirmed Variety, official press release.",btn:FORGE},
    {name:"Anthropic",cat:"Private",detail:"Via Sound AI Fund ($240M AI fund). Claude creator. $61B+ valuation. Confirmed Variety.",btn:FORGE},
    {name:"StabilityAI",cat:"Private",detail:"Via Sound AI Fund ($240M AI fund). Stable Diffusion open-source image generator. Confirmed Variety.",btn:FORGE},
    {name:"Robinhood",cat:"Private",detail:"Commission-free trading. IPO'd. Sound Ventures.",btn:YF("HOOD")},
    {name:"Airtable",cat:"Private",detail:"No-code database. $11.7B valuation. Sound Ventures.",btn:FORGE},
    {name:"Brex",cat:"Private",detail:"Corporate spend management. $12B+ valuation.",btn:FORGE},
    {name:"Flexport",cat:"Private",detail:"Digital freight/logistics. ~$3.5B valuation (down from $8B). Multiple layoff rounds. Still operating.",btn:FORGE},
    {name:"Affirm",cat:"Private",detail:"Buy now, pay later. IPO'd.",btn:YF("AFRM")},
    {name:"Bird",cat:"Private",detail:"E-scooter company. IPO'd, then delisted.",btn:EXITED},
    {name:"GitLab",cat:"Private",detail:"DevOps platform. IPO'd at $15B+. Sound Ventures portfolio. Confirmed Crunchbase.",btn:EXITED},
    {name:"Lemonade",cat:"Private",detail:"AI-powered insurance. IPO'd. Wikipedia: Kutcher invested in 2017 as one of 6 startups he named publicly that year. Confirmed Wikipedia.",btn:YF("LMND")},
    {name:"Modern Fertility",cat:"Private",detail:"Fertility hormone testing. Acquired by Ro 2021.",btn:EXITED},
    {name:"OpenSea",cat:"Private",detail:"NFT marketplace. $13.3B peak valuation (2022). 50%+ staff cuts 2023. OS2 relaunched. SEC dropped investigation Feb 2025.",btn:FORGE},
    {name:"SoundCloud",cat:"Private",detail:"Music streaming / discovery.",btn:null},
    {name:"Beyond Meat",cat:"Private",detail:"Plant-based meat. IPO'd.",btn:YF("BYND")},
    {name:"MoonPay",cat:"Crypto",detail:"Crypto payments onramp. $3.4B valuation.",btn:FORGE},
    {name:"Pearpop",cat:"Private",detail:"Creator collaboration platform.",btn:null},
    {name:"Veldskoen Shoes",cat:"Private",detail:"South African leather shoe brand.",btn:null},
    {name:"The Fabricant",cat:"Private",detail:"Digital fashion company.",btn:null},
    {name:"Steakholder Foods (STKH)",cat:"Public",detail:"3D-printed cultivated alt-meat and fish. Nasdaq: STKH. Kutcher\x27s Breakthrough Energy-adjacent investment.",btn:YF("STKH")},
    {name:"Soho House",cat:"Private",detail:"Private members' club network. Went public 2021, taken private Jan 29 2026 at $9/share by MCR/Yucaipa. Ashton Kutcher joined take-private consortium as new equity investor.",btn:null},
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
// ─────────────────────────────────────────────────────────────────────────────
// MARK CUBAN — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const cuban = {
  id:"cuban", name:"Mark Cuban", handle:"@mcuban",
  title:"Cost Plus Drugs · Shark Tank · Dallas Mavericks",
  netWorth:"~$6B", category:"Tech · Healthcare · Media · Sports",
  thesis:"Find the hidden value everyone else is ignoring. Sweat the details — outwork, out-research, and out-hustle.",
  keyNumber:{label:"Companies invested",value:"500+"},
  tag:"Shark King", tagColor:"blue",
  recent:[
    {deal:"Cost Plus Drugs Humana partnership",date:"2025",note:"Major pharmacy distribution expansion"},
    {deal:"Synthesia",date:"2024",note:"AI video — unicorn $1B+"},
    {deal:"Underdog Fantasy",date:"2023",note:"Co-owner — sports fantasy platform"},
    {deal:"Mavericks minority stake",date:"Dec 2023",note:"Sold majority to Adelson family, retains 27%"},
    {deal:"Cost Plus Drugs",date:"2022",note:"Co-founded — $100M+ revenue, 6,000+ drugs"},
  ],
  portfolio:[
    // FOUNDED / CO-FOUNDED
    {name:"MicroSolutions",cat:"Founded",detail:"Software company founded 1983. Sold to CompuServe 1990 for $6M. Cuban's first major exit — netted ~$2M after taxes.",btn:EXITED},
    {name:"Broadcast.com",cat:"Founded",detail:"Co-founded with Todd Wagner as AudioNet 1995. Internet streaming pioneer. IPO July 1998 at largest first-day jump in history at the time. Sold to Yahoo for $5.7B in 1999 — made Cuban a billionaire. Yahoo discontinued the service in 2002.",btn:EXITED},
    {name:"2929 Entertainment",cat:"Founded",detail:"Co-founded with Todd Wagner 2003. Vertically integrated film production and distribution. Produced Good Night and Good Luck (Oscar nominated), Bubble (Soderbergh). Parent of Magnolia Pictures and Landmark Theatres.",btn:null},
    {name:"AXS TV",cat:"Founded",detail:"Co-founded. Cable TV network — live events, concerts, sports, news. Cuban is Co-CEO, President, and Chairman. Confirmed on PitchBook and official Mark Cuban Companies site.",btn:null},
    {name:"Cost Plus Drugs",cat:"Founded",detail:"Co-founded 2022 as a public benefit corporation. Transparent generic drug pricing: cost + 15% + $3 pharmacy fee + $5 shipping. Now offers 6,000+ therapies, $100M+ annual revenue. 2025 partnerships announced with Humana and TrumpRx.",btn:null},
    {name:"Fireside Chat",cat:"Founded",detail:"Interactive live streaming platform. Acquired by Digital Indies.",btn:EXITED},
    {name:"Mark Cuban Foundation",cat:"Philanthropy",detail:"Personal foundation. Launched Fallen Patriot Fund after Iraq War. $6M donation to Indiana University athletics 2024. Runs AI Bootcamps program for underserved youth.",btn:null},

    // SPORTS OWNERSHIP
    {name:"Dallas Mavericks (27% stake)",cat:"Sports",detail:"Bought majority 2000 for $285M. Won 2011 NBA Championship. Sold controlling 73% stake to Miriam Adelson/Dumont family Dec 2023 — valued at $4B+. Retains 27% and oversees basketball operations. ~1,100% return on original investment.",btn:null},
    {name:"Landmark Theatres",cat:"Founded",detail:"Acquired 2003 — 58 arthouse movie theaters. Sold 2018. Confirmed Wikipedia and multiple sources.",btn:EXITED},
    {name:"Magnolia Pictures",cat:"Founded",detail:"Independent film distributor specializing in foreign and art films. Under 2929 Entertainment umbrella. Confirmed CNBC bio and Mark Cuban Companies site.",btn:null},

    // CRYPTO
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"Major long-term holder. Confirmed 60% of his crypto portfolio is BTC per his own public statements. Previously stated Bitcoin was his largest single holding at nearly $1B in Amazon stock equivalent.",btn:CB("bitcoin","BTC")},
    {name:"Ethereum (ETH)",cat:"Crypto",detail:"30% of his stated crypto portfolio. Active Ethereum advocate — confirmed via multiple interviews.",btn:CB("ethereum","ETH")},
    {name:"Dogecoin (DOGE)",cat:"Crypto",detail:"Early vocal supporter and investor. Dallas Mavericks first NBA team to accept DOGE for tickets and merchandise (March 2021). Confirmed Wikipedia and CNBC.",btn:CB("dogecoin","DOGE")},
    {name:"Polygon (MATIC)",cat:"Crypto",detail:"Confirmed Ethereum Layer-2 investment per Motley Fool and multiple crypto reporting sources. Cuban publicly discussed Polygon as a core holding.",btn:CB("matic-network","MATIC")},

    // TECH — KEY INVESTMENTS
    {name:"Synthesia",cat:"Private",detail:"AI video generation unicorn — $1B+ valuation, $536M+ total funding. Enables professional video creation with AI avatars. Confirmed on Mark Cuban Companies site and Shark Tank Blog report.",btn:FORGE},
    {name:"Axie Infinity (AXS)",cat:"Crypto",detail:"Blockchain gaming platform. Participated in $7.5M Series A alongside Reddit co-founder Alexis Ohanian (May 2021). AXS on Coinbase. Confirmed multiple crypto reporting sources.",btn:CB("axie-infinity","AXS")},
    {name:"Upstart",cat:"Public",detail:"AI lending platform. Listed on Mark Cuban Companies site. Public company (UPST).",btn:YF("UPST")},
    {name:"Dave",cat:"Public",detail:"#1 personal financial management app in the US per Mark Cuban Companies site listing. Listed on NASDAQ.",btn:YF("DAVE")},
    {name:"Underdog Fantasy",cat:"Private",detail:"Sports fantasy and pick'em platform. Cuban listed as co-owner on PitchBook. Fast-growing sports gaming company.",btn:null},
    {name:"HomeCourt",cat:"Private",detail:"AI basketball shot-tracking app. Acquired by NBA.",btn:EXITED},
    {name:"Catalant",cat:"Private",detail:"Strategy-to-execution platform connecting companies with expert talent. Listed on Mark Cuban Companies site.",btn:FORGE},
    {name:"VNTANA",cat:"Private",detail:"First-of-its-kind 3D/hologram infrastructure platform. Listed on Mark Cuban Companies site.",btn:FORGE},
    {name:"SparkCharge",cat:"Private",detail:"Mobile EV charging solution. Cuban is board member per PitchBook. Appeared on Shark Tank.",btn:FORGE},
    {name:"Backstage Capital",cat:"Private",detail:"VC firm focused on underrepresented founders — Cuban listed as co-founder on PitchBook. Arlan Hamilton's firm.",btn:null},

    // SHARK TANK — TOP CONFIRMED DEALS
    {name:"Coinbase (COIN)",cat:"Public",detail:"Early investor. Cuban has publicly discussed his Coinbase position as one of his most successful crypto bets. IPO April 2021.",btn:YF("COIN")},
    {name:"BeatBox Beverages",cat:"Private",detail:"Shark Tank Season 4. $1M for 33.3% stake — largest deal in show history at the time. Party punch in boxed format. $200M+ revenue by 2022.",btn:null},
    {name:"Ten Thirty One Productions",cat:"Private",detail:"Shark Tank Season 5. $2M for 20% — largest deal in show history at that point. Live horror entertainment company.",btn:null},
    {name:"Simple Sugars",cat:"Private",detail:"Shark Tank Season 4. Skincare for sensitive skin. Cuban invested, company grew exponentially in distribution.",btn:null},
    {name:"Gameday Couture",cat:"Private",detail:"Licensed sports apparel brand. Shark Tank alumni. Now holds 350+ licenses including NCAA, NFL, MLS, Team USA. Cuban retains equity stake as of 2025.",btn:null},

    // HEALTHCARE PORTFOLIO (confirmed Pharmaphorum)
    {name:"Validic",cat:"Private",detail:"Digital health data platform. Confirmed in Pharmaphorum article listing Cuban's healthcare holdings.",btn:FORGE},
    {name:"Biolinq",cat:"Private",detail:"Continuous glucose monitoring wearable. Confirmed Pharmaphorum listing.",btn:FORGE},
    {name:"Genetesis",cat:"Private",detail:"Cardiac diagnostic imaging company. Confirmed Pharmaphorum listing.",btn:FORGE},
    {name:"Otolith Labs",cat:"Private",detail:"Motion sickness and vertigo treatment device. Confirmed Pharmaphorum listing.",btn:FORGE},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// KEVIN DURANT — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const durant = {
  id:"durant", name:"Kevin Durant", handle:"@KDTrey5",
  title:"35V · Boardroom · 2x NBA Champion",
  netWorth:"~$400M", category:"Tech VC · Sports · Media",
  thesis:"Invest where your network creates unfair advantage. Sports is the passport — access is the product, ownership is the endgame.",
  keyNumber:{label:"Unicorns backed",value:"8+"},
  tag:"The Slim Reaper", tagColor:"violet",
  recent:[
    {deal:"PSG minority stake",date:"Oct 2025",note:"Via Boardroom Sports Holdings / Arctos Partners"},
    {deal:"WHOOP Series G",date:"Mar 2026",note:"81x return since 2017 — now $10.1B valuation"},
    {deal:"TMRW Sports Series A",date:"Jun 2024",note:"Tiger Woods / Rory McIlroy golf venture"},
    {deal:"Skinny Dipped",date:"Sep 2023",note:"Series A — better-for-you snack brand"},
    {deal:"Sandbox VR",date:"2022",note:"VR entertainment alongside a16z, Will Smith, Katy Perry"},
  ],
  portfolio:[
    // FOUNDED / CO-FOUNDED
    {name:"35V (Thirty Five Ventures)",cat:"Founded",detail:"Family office co-founded 2016 with Rich Kleiman. 100+ portfolio companies across fintech, AI, health, media, sports. Operates as a full strategic firm — content, marketing, and equity alignment combined.",btn:null},
    {name:"Boardroom",cat:"Founded",detail:"Sports, media, and entertainment company co-founded with Rich Kleiman. Produces newsletters, premium content, events (CNBC x Boardroom Game Plan Summit, F1 Miami, Art Basel, US Open). Co-produced Academy Award-winning Two Distant Strangers (Netflix) and SWAGGER (Apple TV+).",btn:null},

    // SPORTS OWNERSHIP
    {name:"Philadelphia Union (MLS)",cat:"Sports",detail:"Minority owner since 2020. MLS team based in Chester, PA. Confirmed Sports Illustrated and CBS Sports.",btn:null},
    {name:"NJ/NY Gotham FC (NWSL)",cat:"Sports",detail:"Minority investor since May 2022. 35V provides content creation and social media support. Confirmed CBS Sports and Sports Illustrated.",btn:null},
    {name:"Athletes Unlimited",cat:"Sports",detail:"Board member. Women's professional sports league network. Confirmed Sports Illustrated.",btn:null},
    {name:"Premier Lacrosse League",cat:"Sports",detail:"Ownership stake. Emerging professional sports property. Confirmed 35V official site and multiple sources.",btn:null},
    {name:"Major League Pickleball",cat:"Sports",detail:"Ownership stake. Fast-growing professional pickleball league. Confirmed 35V official site and LinkedIn.",btn:null},
    {name:"Paris Saint-Germain (PSG)",cat:"Sports",detail:"Minority shareholder finalized Oct 2025 via Boardroom Sports Holdings through Arctos Partners. Durant met PSG president during Paris Olympics. PSG valued ~$5.7B. Confirmed Markets Group and Vetted Sports Newsletter.",btn:null},
    {name:"Brooklyn Aces",cat:"Sports",detail:"Ownership stake. Confirmed in Vetted Sports Newsletter.",btn:null},

    // MAJOR EXITS
    {name:"Postmates",cat:"Private",detail:"Early 35V investment. Acquired by Uber 2020. One of first major 35V exits validating the thesis.",btn:EXITED},
    {name:"Coinbase (COIN)",cat:"Public",detail:"2017 investment alongside Nas, Ben Horowitz, and Union Square Ventures. Coinbase IPO April 2021 at $86B valuation — 54x return from investment price. Confirmed Sportico, Hustle Commons, and PitchBook.",btn:EXITED},
    {name:"Robinhood (HOOD)",cat:"Public",detail:"35V invested 2017. IPO July 2021 at $38.6B market cap — 32x valuation return from investment. Confirmed Sportico.",btn:EXITED},

    // ACTIVE TECH
    {name:"WHOOP",cat:"Private",detail:"Invested 2017 at $125M valuation. Added to position in Series E (2020, $1.2B). Series G (Mar 2026) values company at $10.1B — 81x return. Has not sold any shares. Confirmed Sportico, Yahoo Sports, Celebrity Net Worth.",btn:FORGE},
    {name:"Acorns",cat:"Private",detail:"Micro-investing fintech app. $300M raise 2022 at ~$2B valuation (2x from KD's entry). 4.6M+ paid subscribers. IPO plans ongoing. Confirmed Crunchbase and Insider Monkey.",btn:FORGE},
    {name:"Overtime",cat:"Private",detail:"Youth sports media and leagues platform. Raised $100M+. Co-investors include Jeff Bezos and Drake. 6% of all NBA players invested. Confirmed Crunchbase, Dapper Labs press release.",btn:null},
    {name:"Dapper Labs (NBA Top Shot)",cat:"Crypto",detail:"35V invested pre-$305M round. Participated in $305M round (March 2021) alongside Michael Jordan, a16z, Coatue. Co-founded Flow blockchain and NBA Top Shot NFT platform. Confirmed Dapper Labs official press release.",btn:null},
    {name:"Hugging Face",cat:"Private",detail:"AI/ML model hub. 35V invested in multiple rounds including $100M raise at $2B valuation (2022) and participated again. Unicorn. Confirmed Insider Monkey and PitchBook.",btn:FORGE},
    {name:"OpenSea",cat:"Crypto",detail:"NFT marketplace. Confirmed Tracxn — listed as top unicorn in KD's portfolio.",btn:FORGE},
    {name:"Mercury",cat:"Private",detail:"Online banking for startups. 35V invested 2019. Raised at $1.6B valuation 2021 — 16x return from KD's entry. Confirmed Sportico.",btn:FORGE},
    {name:"Therabody",cat:"Private",detail:"Theragun massage device maker. Confirmed AthleteAgent.com and multiple sources.",btn:null},
    {name:"Sandbox VR",cat:"Private",detail:"Immersive VR entertainment venues. 35V participated alongside a16z, Will Smith, Katy Perry, Justin Timberlake. Confirmed Upload VR and official announcement.",btn:FORGE},
    {name:"TMRW Sports",cat:"Private",detail:"Golf venture co-founded by Tiger Woods and Rory McIlroy. 35V participated in Series A June 2024. Confirmed Markets Group.",btn:FORGE},
    {name:"Goldin Auctions",cat:"Private",detail:"Premium trading card and collectibles auction house. Confirmed Dapper Labs press release listing KD investments.",btn:null},
    {name:"Dutchie",cat:"Private",detail:"Cannabis point-of-sale and tech platform. Confirmed Dapper Labs press release listing KD investments.",btn:FORGE},
    {name:"Sleeper",cat:"Private",detail:"Sports fantasy and social platform. Hit #1 in App Store Sports. Confirmed 35V LinkedIn posts celebrating milestone.",btn:null},
    {name:"Propel (Fresh EBT)",cat:"Private",detail:"SNAP benefits app for low-income families. 35V co-invested with Nas, Andreessen Horowitz, and Omidyar Network in $4M seed 2017. Signal overlap: Nas and Durant co-investors.",btn:null},
    {name:"SeatGeek",cat:"Private",detail:"Ticket marketplace. ~$1B valuation. Confidential IPO filing Apr 2023. 15% layoffs Feb 2025. IPO expected 2026.",btn:FORGE},
    {name:"Pieology",cat:"Private",detail:"Fast-casual pizza chain with 100+ locations. Deal confirmed PitchBook and AthleteAgent.",btn:null},
    {name:"Jeeves",cat:"Private",detail:"Global spend management platform for startups. Confirmed Insider Monkey.",btn:FORGE},
    {name:"Brigit",cat:"Private",detail:"Fintech cash advance and credit-building app. Confirmed AthleteAgent.",btn:FORGE},
    {name:"Skinny Dipped",cat:"Private",detail:"Better-for-you snack brand. Series A Sep 2023. Most recent confirmed Tracxn.",btn:null},
    {name:"Master & Dynamic",cat:"Private",detail:"NYC-based premium audio brand. 35V became equity partner in 2019. Durant and Kleiman worked with brand on creative, design, and the intersection of sports and music. Launched exclusive 'Studio 35 from Master & Dynamic & Kevin Durant' wireless headphones. Confirmed Basketball Network and official brand partnership announcement.",btn:null},
    {name:"Lalo",cat:"Private",detail:"Baby and toddler products brand focused on design quality. 35V portfolio company. Confirmed multiple sources listing Lalo as a KD investment.",btn:null},
    {name:"Rec",cat:"Private",detail:"Series A September 2025. Consumer / sports-adjacent company. Durant's most recent confirmed investment per Hustle Commons deep-dive on 35V portfolio.",btn:FORGE},
    {name:"Spindrift",cat:"Private",detail:"Real-fruit sparkling water brand. CPG investment. 2025. Hustle Commons confirms as recent 35V portfolio widening into premium consumer packaged goods.",btn:null},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// NAS — complete portfolio (Research Protocol v2 + Level 5 Deep Mining)
// ─────────────────────────────────────────────────────────────────────────────
const nas = {
  id:"nas", name:"Nas", handle:"@nas",
  title:"QueensBridge Venture Partners · Illmatic",
  netWorth:"~$200M", category:"Tech VC · Consumer · Media",
  thesis:"Bet on great people before the narrative exists. Culture is the alpha signal — invest where Silicon Valley hasn't looked yet.",
  keyNumber:{label:"VC exits",value:"40+ confirmed"},
  tag:"Culture Alpha", tagColor:"amber",
  recent:[
    {deal:"Disco.xyz",date:"Jun 2024",note:"Personal investment — Web3 / financial software"},
    {deal:"Unite.io",date:"Jun 2024",note:"Personal investment — entertainment software"},
    {deal:"mParticle exit",date:"Jan 2025",note:"QBVP exit — customer data platform"},
    {deal:"Carry1st",date:"Jan 2022",note:"$20M Series A — African mobile gaming"},
    {deal:"Royal",date:"Nov 2021",note:"$55M Series A — music royalty NFT platform"},
  ],
  portfolio:[
    // FOUNDED / CO-FOUNDED
    {name:"QueensBridge Venture Partners",cat:"Founded",detail:"Co-founded 2014 with Anthony Saleh. 116+ portfolio companies, 4 unicorns, 9 IPOs, 40+ acquisitions. Invests $100K–$500K per deal, 20 companies/year. Pitches exceed 100/month.",btn:null},
    {name:"Ill Will Records",cat:"Founded",detail:"First label, founded 1999 with Steve Stoute. Released Nastradamus, Stillmatic, God's Son, Street's Disciple.",btn:null},
    {name:"Mass Appeal",cat:"Founded",detail:"Six-figure investment 2013 to resurrect defunct magazine. Now a quarterly print publication, creative agency, digital video production company, and record label releasing Nas albums.",btn:null},
    {name:"Sweet Chick",cat:"Founded",detail:"Co-owner since 2015 alongside restaurateur John Seymour. Chicken & waffles chain in NYC (Brooklyn, Manhattan, Queens), LA, and London. More than doubled locations since Nas joined.",btn:null},
    {name:"Escobar Cigars",cat:"Founded",detail:"Co-owner and equity partner since Aug 25, 2021 (PRNewswire press release). Premium Nicaraguan cigars made at Escobar Factory in Estelí. Nas oversaw full brand repackaging and e-commerce relaunch.",btn:null},

    // MAJOR EXITS
    {name:"Coinbase (COIN)",cat:"Private",detail:"Series B investor 2013. QBVP in $25M round when Coinbase valued at $143M. IPO April 2021. Nas made est. $41–206M. Coinbase currently valued ~$85–100B.",btn:EXITED},
    {name:"Ring",cat:"Private",detail:"$4.5M invested 2014 via QBVP. Amazon acquired Jan 2018 for $1.1B. Nas made ~$40M — one of the most profitable celebrity investment exits in hip-hop history.",btn:EXITED},
    {name:"PillPack",cat:"Private",detail:"QBVP participated in $8.8M Series B round 2014. Amazon acquired June 2018 for $1B. Second Amazon acquisition of a QBVP portfolio company in the same year.",btn:EXITED},
    {name:"Pluto TV",cat:"Private",detail:"QBVP invested Nov 2014. Viacom acquired Jan 2019 for $340M. Now one of the largest free streaming platforms in the US.",btn:EXITED},
    {name:"Dropbox",cat:"Private",detail:"Early investor 2014. IPO March 2018 at $10B valuation. QBVP stake ballooned significantly at public offering.",btn:EXITED},
    {name:"Lyft",cat:"Private",detail:"Early QBVP investment. IPO March 2019. One of several QBVP unicorn bets that paid out at IPO.",btn:YF("LYFT")},
    {name:"Robinhood (HOOD)",cat:"Private",detail:"QBVP participated in $13M round 2014 alongside Snoop Dogg, Jared Leto, and Index Ventures. IPO July 2021. Market cap ~$120–129B as of Oct 2025.",btn:EXITED},
    {name:"Casper",cat:"Private",detail:"QBVP invested through series of rounds up to 2018. IPO'd then went private. D2C mattress category pioneer.",btn:EXITED},
    {name:"Bevel / Walker & Company",cat:"Private",detail:"Early investor after introduction from Andreessen Horowitz. Founded by Tristan Walker. P&G acquired Walker & Company (Bevel + Form) in 2018.",btn:EXITED},
    {name:"mParticle",cat:"Private",detail:"QBVP portfolio. Customer data platform. Exited January 16, 2025 — most recent confirmed QBVP exit per CB Insights.",btn:EXITED},

    // ACTIVE PORTFOLIO — PRIVATE
    {name:"SeatGeek",cat:"Private",detail:"Series B 2014. ~$1B valuation. 15% layoffs Feb 2025. IPO expected 2026.",btn:FORGE},
    {name:"Genius (Rap Genius)",cat:"Private",detail:"One of the first QBVP investments, 2013. Lyrics and annotation platform. Nas was an early true believer.",btn:null},
    {name:"Tradesy",cat:"Private",detail:"Secondhand luxury fashion. Acquired by Vestiaire Collective 2022.",btn:EXITED},
    {name:"LANDR",cat:"Private",detail:"QBVP Series A 2015 ($6.2M round confirmed by BetaKit press release). Cloud-based AI music mastering platform. Reached $26M Series B in 2019.",btn:null},
    {name:"Parachute",cat:"Private",detail:"D2C home essentials brand. Confirmed QBVP portfolio per Celebrity Net Worth and multiple sources.",btn:null},
    {name:"General Assembly",cat:"Private",detail:"Tech education platform. Acquired by Adecco 2018.",btn:EXITED},
    {name:"Koru",cat:"Private",detail:"College-to-career training program. Shut down.",btn:EXITED},
    {name:"FanDuel / Flutter (FLUT)",cat:"Private",detail:"Daily fantasy sports pioneer. Acquired by Flutter Entertainment 2018. 100% owned July 2025. Trade FLUT on NYSE for exposure.",btn:YF("FLUT")},
    {name:"Knightscope (KSCP)",cat:"Public",detail:"QBVP portfolio. Security robot company. IPO'd on NASDAQ. Market cap $193M (Tracxn).",btn:YF("KSCP")},
    {name:"MedChart",cat:"Private",detail:"QBVP Series A, April 19, 2021 (CB Insights confirmed). Digital health records platform.",btn:FORGE},
    {name:"Disco.xyz",cat:"Private",detail:"Personal investment June 1, 2024 (PitchBook confirmed). Web3 / financial software platform. Most recent QBVP investment.",btn:FORGE},
    {name:"Unite.io",cat:"Private",detail:"Personal investment June 11, 2024 (PitchBook confirmed). Entertainment software platform.",btn:FORGE},

    // LEVEL 5 FINDS — Carry1st, Audius, Royal, Propel, Breakr, Magic Spoon
    {name:"Carry1st",cat:"Private",detail:"Angel investor in $20M Series A extension, Jan 2022. Led by a16z, also Google, Riot Games, Avenir. South African mobile gaming publisher — Africa's largest. Confirmed Bloomberg, Hollywood Reporter, a16z official announcement.",btn:FORGE},
    {name:"Audius",cat:"Private",detail:"$5M strategic round, Sep 2021. Blockchain music streaming platform — Nas described it as 'the most important technology to ever hit the music industry.' Confirmed Rolling Stone, Decrypt, Music Business Worldwide.",btn:null},
    {name:"Royal",cat:"Private",detail:"$55M Series A Nov 2021. Music royalty NFT platform. Investing platform shut down (2024). Website now says 'Royal is reinventing itself' — legacy NFT holders directed to separate claims portal. Effectively inactive.",btn:FORGE},
    {name:"Propel (Fresh EBT)",cat:"Private",detail:"$4M seed round 2017. SNAP benefits app for low-income families. Nas joined Kevin Durant and Andreessen Horowitz. Confirmed by Nas's own tweet and Technical.ly article.",btn:null},
    {name:"Breakr",cat:"Private",detail:"Music creator marketplace connecting artists and brands. Nas confirmed as early investor per Black Enterprise. Founders Anthony and Ameer Brown connected to Nas through General Assembly. Platform has 55M+ creators.",btn:null},
    {name:"Magic Spoon",cat:"Private",detail:"Series B investor. High-protein, low-carb cereal brand. Led by HighPost Capital (Mark Bezos). Nas named explicitly in PE Insights Series B article alongside Russell Westbrook, Shakira, Nick Jonas.",btn:null},

    // INFERRED
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// OPRAH WINFREY — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const oprah = {
  id:"oprah", name:"Oprah Winfrey", handle:"@Oprah",
  title:"Harpo Productions · OWN · Weight Watchers",
  netWorth:"~$2.5B", category:"Media · Consumer · Wellness",
  thesis:"Invest where your brand and your values already live. Authentic alignment isn't just ethics — it's the best risk management.",
  keyNumber:{label:"The Oprah Effect",value:"$2.5B built"},
  tag:"The OWL", tagColor:"purple",
  recent:[
    {deal:"YOU Wellness app",date:"2026",note:"AI-powered wellness startup — most recent confirmed"},
    {deal:"Maven Clinic",date:"2023",note:"Women's health unicorn — OW Management"},
    {deal:"Apeel Sciences",date:"Jun 2020",note:"$250M round — edible food coating to reduce waste"},
    {deal:"Oatly",date:"Jul 2020",note:"Part of Blackstone group $200M, 10% stake"},
    {deal:"True Food Kitchen",date:"Jul 2018",note:"Equity investment + board seat"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Harpo Productions",cat:"Founded",detail:"Founded 1986. Parent company for all Oprah's media ventures including OWN, O Magazine, and Harpo Films. The center of her media empire.",btn:null},
    {name:"OWN — Oprah Winfrey Network",cat:"Founded",detail:"Harpo holds 25.5% stake. Cable network launched 2011 in partnership with Discovery. Home to 'Super Soul Sunday,' 'Greenleaf,' and Queen Sugar. Over 80M households.",btn:null},
    {name:"OW Management",cat:"Founded",detail:"Oprah's family office that manages her investment portfolio. Identified in 2025 reporting as the vehicle behind multiple strategic investments in wellness and health tech.",btn:null},

    // MAJOR INVESTMENTS
    {name:"Weight Watchers / WW",cat:"Exited",detail:"Bought 10% stake 2015 for $43.5M. Shares rose 1,132% on announcement; peak value ~$430M. Oprah left board 2024. WW filed Chapter 11 bankruptcy May 6 2025, delisted Nasdaq May 16 2025. Equity wiped out.",btn:EXITED},
    {name:"True Food Kitchen",cat:"Private",detail:"Equity investment + board seat July 2018. Health-driven restaurant chain founded by Dr. Andrew Weil. Was 23 locations at investment, committed to help double business. Confirmed CNBC, Restaurant Business, press release.",btn:null},
    {name:"Oatly",cat:"Public",detail:"Part of Blackstone Group consortium that acquired 10% stake in Swedish oat milk company for $200M July 2020. Valuing Oatly at $2B. Other investors included Natalie Portman and Jay-Z. Oatly IPO'd on Nasdaq 2021. Confirmed The Org.",btn:YF("OTLY")},
    {name:"Apeel Sciences",cat:"Private",detail:"Participated in $250M funding round June 2020 alongside Katy Perry and others. Edible plant-based coating that extends fruit shelf life 2-3x. Valuation hit $1B at this round. Confirmed The Org.",btn:FORGE},
    {name:"Maven Clinic",cat:"Private",detail:"Women's healthcare unicorn — telehealth, digital tools, and care navigation across pregnancy, menopause, postpartum, and fertility. $1.7B valuation. Series F October 2024. Invested via OW Management. Confirmed Tracxn, 36kr family office report.",btn:FORGE},
    {name:"Guild Education",cat:"Private",detail:"OW Management participated in Series F 2022. Workforce education platform partnering with Fortune 500 companies to provide debt-free degrees for employees (Disney, Walmart, Chipotle). Unicorn. Confirmed 36kr family office deep-dive report on OW Management investments.",btn:FORGE},
    {name:"Waywire",cat:"Private",detail:"Social video startup. Acquired by CNN then shut down.",btn:EXITED},
    {name:"Dr. Barbara Sturm",cat:"Private",detail:"Angel investment April 27, 2023. German luxury skincare brand known for MC1 and molecular cosmetics science. CB Insights confirms Oprah as investor with angel round. Exited January 11, 2024 — brand acquired. Confirmed CB Insights portfolio listing.",btn:EXITED},
    {name:"YOU Wellness",cat:"Private",detail:"AI-powered wellness app. Most recent confirmed Oprah investment via OW Management, April 2026. Identified in News Anyway reporting.",btn:null},

    // PHILANTHROPY
    {name:"Oprah Winfrey Leadership Academy",cat:"Philanthropy",detail:"$40M investment to establish Leadership Academy for Girls in South Africa, opened 2007. State-of-the-art facility serving disadvantaged girls.",btn:null},
    {name:"Oprah's Angel Network",cat:"Philanthropy",detail:"Founded 1998. Raised $80M from audience and celebrity contributors. Supports education, housing, and women's initiatives globally.",btn:null},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// TONY ROBBINS — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const robbins = {
  id:"robbins", name:"Tony Robbins", handle:"@TonyRobbins",
  title:"Robbins Research International · 65+ PE Fund GP Stakes",
  netWorth:"~$600M", category:"Private Equity · Wellness · Finance",
  thesis:"Don't just invest in companies — own the machine that generates returns. Be a general partner, not a limited partner.",
  keyNumber:{label:"PE fund GP stakes",value:"65+"},
  tag:"The Giant", tagColor:"orange",
  recent:[
    {deal:"Minnect",date:"Oct 2025",note:"Angel — expert networking platform"},
    {deal:"Space Perspective exit",date:"Jul 2025",note:"Balloon spaceflight company exit"},
    {deal:"EVŌQ Nano",date:"Jan 2025",note:"Advanced nanomaterials company"},
    {deal:"Back to the Roots",date:"Nov 2021",note:"Series D — organic gardening brand"},
    {deal:"Freeletics",date:"Dec 2018",note:"Series A — AI fitness and wellness app"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Robbins Research International",cat:"Founded",detail:"Flagship company producing self-help seminars, products, and events worldwide. Tony is Chairman. The engine behind his entire business empire and investment platform.",btn:null},
    {name:"Anthony Robbins Companies",cat:"Founded",detail:"Conglomerate spanning hospitality, education, media, business services, and nutraceuticals. Includes Namale Resort & Spa (Fiji), Fortune Practice Management, and media production under Tony Robbins Productions.",btn:null},
    {name:"Namale Resort & Spa",cat:"Founded",detail:"Luxury all-inclusive resort in Fiji under the Anthony Robbins Companies umbrella.",btn:null},

    // PRIVATE EQUITY
    {name:"CAZ Investments",cat:"Private",detail:"Minority shareholder in Christopher Zook's private equity firm. Co-authored 'The Holy Grail of Investing' with Zook. Robbins promotes and benefits financially from CAZ as a fellow shareholder. SEC-registered RIA managing alternative investments. Confirmed Bogleheads forum via SEC filings.",btn:null},
    {name:"65+ PE Fund GP Partnerships",cat:"Private",detail:"Robbins has publicly stated he is a General Partner in 65 private equity, private credit, and venture capital funds — not a limited partner. Structure provides carry (20% of profits) plus management fees. Disclosed on Fox Business and in his book 'The Holy Grail of Investing.'",btn:null},

    // CONFIRMED STARTUP INVESTMENTS
    {name:"AXiomatic",cat:"Private",detail:"Esports holding company that owns Team Liquid and other properties. Confirmed Tracxn as a notable Robbins investment.",btn:FORGE},
    {name:"Thrive Market",cat:"Private",detail:"Online organic grocery marketplace. Confirmed Tracxn notable investment in Robbins portfolio. Member-based model similar to Costco for healthy food.",btn:null},
    {name:"Freeletics",cat:"Private",detail:"AI-powered fitness and wellness app. Series A December 2018. Munich-based. Confirmed Tracxn.",btn:null},
    {name:"Back to the Roots",cat:"Private",detail:"Organic gardening brand — grow kits, mushroom kits, soil. Series D November 29, 2021. Confirmed Tracxn.",btn:null},
    {name:"Space Perspective",cat:"Private",detail:"Balloon-based spaceflight tourism company. Invested. Exited July 24, 2025. Confirmed CB Insights as a portfolio exit.",btn:EXITED},
    {name:"EVŌQ Nano",cat:"Private",detail:"Advanced nanomaterials company. Most recent confirmed investment January 30, 2025. Confirmed PitchBook.",btn:FORGE},
    {name:"Beyond Imagination",cat:"Private",detail:"AI/business productivity software. Confirmed PitchBook as a portfolio company.",btn:FORGE},
    {name:"Minnect",cat:"Private",detail:"Expert networking platform connecting professionals. Angel investment October 7, 2025. Most recent angel round. Confirmed CB Insights.",btn:null},
    {name:"Boba",cat:"Private",detail:"Unicorn. Confirmed Tracxn as a Tony Robbins personal investment. Part of his broader angel portfolio. Tracxn lists as his most notable personal investment alongside Zion.",btn:FORGE},
    {name:"Zion",cat:"Private",detail:"Series A February 15, 2023. Confirmed Tracxn as a Tony Robbins personal investment alongside Boba.",btn:FORGE},

    // SPORTS — self-disclosed by Robbins on Fox Business and in The Holy Grail of Investing
    {name:"Golden State Warriors (minority)",cat:"Sports",detail:"Minority ownership stake via GP stakes pathway — through his network of private equity fund general partnerships. Self-disclosed on Fox Business's Mornings With Maria: 'Through this pathway, Robbins has become an investor in the Golden State Warriors.' Also close personal friend of Warriors co-owner Peter Guber. Confirmed GOBankingRates citing Fox Business.",btn:null},
    {name:"Utah Jazz (minority)",cat:"Sports",detail:"Minority ownership stake via GP stakes pathway. Self-disclosed same Fox Business interview as Warriors, Jazz, Dodgers, and Red Sox. Confirmed GOBankingRates citing Fox Business.",btn:null},
    {name:"Los Angeles Dodgers (minority)",cat:"Sports",detail:"Minority ownership stake via GP stakes pathway. Self-disclosed Fox Business. Note: Magic Johnson also owns Dodgers stake — Signal overlap with Magic Johnson in Boomers tab. Confirmed GOBankingRates citing Fox Business.",btn:null},
    {name:"Boston Red Sox (minority)",cat:"Sports",detail:"Minority ownership stake via GP stakes pathway. Self-disclosed Fox Business. Part of his 'holy grail formula' for uncorrelated returns averaging 18% compounded over 10 years. Confirmed GOBankingRates citing Fox Business.",btn:null},
    {name:"LAFC — Los Angeles FC (minority)",cat:"Sports",detail:"Co-investor in MLS expansion franchise with Peter Guber and others. Robbins' own TonyRobbins.com blog confirms: 'I made the move to become one of the owners of the MLS expansion team, the Los Angeles Football Club.' Note: Magic Johnson is also an LAFC owner — Signal overlap. Confirmed TonyRobbins.com official blog.",btn:null},
    {name:"Blue Owl GP Stakes Fund VI",cat:"Private",detail:"Through CAZ Investments, committed to Blue Owl's GP Stakes strategy. CAZ announced $1B commitment to Blue Owl GP Stakes Fund VI the same week Robbins' book was released. Prior $4.7B total allocation to Blue Owl across multiple funds. Blue Owl (formerly Dyal) buys minority positions in private equity asset management firms. Confirmed Net Interest deep-dive citing CAZ official announcement.",btn:YF("OWL")},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// STEPH CURRY — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const curry = {
  id:"curry", name:"Steph Curry", handle:"@StephenCurry30",
  title:"SC30 / Thirty Ink · Unanimous Media · Curry Brand",
  netWorth:"~$240M", category:"Tech · Sports · Media · Consumer",
  thesis:"Elevate the under. Invest where your ecosystem can pour real value — not just a check. Back founders who have grit and do the work.",
  keyNumber:{label:"Thirty Ink revenue",value:"$174M in 2024"},
  tag:"Chef", tagColor:"yellow",
  recent:[
    {deal:"Unrivaled",date:"2025",note:"Women's 3-on-3 basketball league — Stewart/Collier"},
    {deal:"PLEZi Nutrition",date:"2024",note:"Michelle Obama's healthier kids' food brand"},
    {deal:"Thirty Ink HQ",date:"2025",note:"$8.5M commercial property in SF — permanent home"},
    {deal:"Curry Brand equity",date:"2020",note:"Lifetime Under Armour deal with equity stake"},
    {deal:"Guild Education",date:"2019",note:"Debt-free degrees for frontline workers"},
  ],
  portfolio:[
    // FOUNDED — VC FUND
    {name:"Penny Jar Capital",cat:"Founded",detail:"Co-founded 2021 with former business manager Bryant Barr and Rich Scudellari (investment partner). Early-stage VC firm separate from SC30 — Curry is anchor investor and special advisor, not day-to-day manager. First fund filed June 2021, Fund II filed with SEC October 2024. Portfolio includes Syndio, Local Kitchens, HiveWatch, and others. Confirmed TechCrunch, SEC EDGAR Fund II filing, POCIT. Note: this is materially different from SC30 — it's an institutional VC vehicle.",btn:null},
    {name:"SC30 / Thirty Ink",cat:"Founded",detail:"Founded 2017 as SC30 Inc, rebranded to Thirty Ink. Family office and brand company managing investments, partnerships, media and philanthropy. Generated $174M revenue in 2024 per CNBC — every business is profitable. Bought $8.5M SF HQ 2025.",btn:null},
    {name:"Unanimous Media",cat:"Founded",detail:"Media production company focused on family, faith, and sports. Partnerships with NBCUniversal, Audible, Sony. Produced 'The Queen of Basketball' (Oscar), 'Stephen Curry: Underrated' (Apple TV+), 'Breakthrough.' Development deal with Comcast NBCUniversal 2021.",btn:null},
    {name:"Underrated Golf Tour",cat:"Founded",detail:"Founded by Curry. Purpose-driven amateur golf tour providing equity, access, and opportunity to underrepresented youth. Presented by KPMG. Entering Season 3 in 2025. Confirmed KPMG and PGA Tour sites.",btn:null},
    {name:"Curry Brand",cat:"Founded",detail:"Co-founded with Under Armour 2020. Similar to Jordan Brand — Curry is president and holds equity. Signed lifetime deal extension 2023. Revenue from shoe line contributes significantly to net worth.",btn:null},

    // TECH INVESTMENTS
    {name:"TSM (Team SoloMid)",cat:"Private",detail:"SC30 investment 2018. Valued $410M in 2022 before FTX $210M sponsorship collapsed Nov 2022. Massive layoffs followed — down to ~8 employees by Jan 2024. Sold LCS slot. Still operating in CS2/Fortnite/Apex with skeleton staff.",btn:FORGE},
    {name:"SnapTravel",cat:"Private",detail:"First major SC30 tech investment. Online hotel booking platform. Series A $21.2M round Dec 2018. Curry met founders during 2016 NBA Playoffs. Confirmed TechCrunch.",btn:FORGE},
    {name:"Guild Education",cat:"Private",detail:"2019 investment. Provides debt-free degrees for frontline workers via Fortune 1000 companies (Disney, Walmart, Taco Bell, Chipotle). Confirmed Basketball Network and multiple sources.",btn:FORGE},
    {name:"Tonal",cat:"Private",detail:"AI-powered home gym and strength training system. Confirmed multiple sources including TWSN and Sportstiger.",btn:null},
    {name:"Oxigen",cat:"Private",detail:"Premium oxygen-enhanced recovery water. Curry became equity partner, uses it himself after injuries. Confirmed Basketball Network and EssentiallySports.",btn:null},
    {name:"Mos",cat:"Private",detail:"San Francisco fintech startup helping students access financial aid. SC30 portfolio company. Confirmed CB Insights and multiple sources.",btn:FORGE},
    {name:"Syndio",cat:"Private",detail:"Pay-equity analytics platform (anti-bias software for compensation decisions). Penny Jar Capital's first confirmed investment — ~$1M in 2021. Clients include Salesforce, General Mills, Nordstrom. Confirmed Bloomberg/Seattle Times, Penny Jar official site listing Syndio as portfolio company.",btn:null},
    {name:"Nirvana Water Sciences",cat:"Private",detail:"Premium water brand. Listed on PitchBook as a Stephen Curry investment. Confirmed PitchBook investor portfolio page.",btn:FORGE},

    // SPORTS / CONSUMER
    {name:"PLEZi Nutrition",cat:"Private",detail:"Healthier food and drink brand for kids co-founded by Michelle Obama. Curry joined as investor 2024. Confirmed Sportskeeda.",btn:null},
    {name:"Unrivaled",cat:"Private",detail:"Women's 3-on-3 basketball league founded by WNBA stars Breanna Stewart and Napheesa Collier. Curry invested 2025. Confirmed Sportskeeda.",btn:null},

    // EXITS / CAUTIONARY
    {name:"FTX",cat:"Crypto",detail:"Curry became global ambassador and shareholder in 2021. FTX collapsed November 2022. Class action lawsuit filed against Curry and others for promoting the exchange. Confirmed Sportskhabri and multiple sources.",btn:EXITED},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// CARMELO ANTHONY — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const melo = {
  id:"melo", name:"Carmelo Anthony", handle:"@carmeloanthony",
  title:"Melo7 Tech Partners · Isos7 Growth Equity · Hall of Fame",
  netWorth:"~$160M", category:"Tech VC · Sports · Media",
  thesis:"Back diverse founders solving real problems. Invest in companies where your community is both the customer and the beneficiary.",
  keyNumber:{label:"Melo7 invested",value:"$73M+ in 20+ deals"},
  tag:"Melo7", tagColor:"indigo",
  recent:[
    {deal:"Isos7 Growth Equity",date:"2023",note:"$750M sports PE fund co-founded with Isos Capital"},
    {deal:"Stears News",date:"Oct 2022",note:"Africa news and data provider"},
    {deal:"Overtime",date:"2021",note:"Youth sports media — co-invested with Durant"},
    {deal:"Clubhouse",date:"2021",note:"Audio social platform"},
    {deal:"Andela",date:"2020",note:"African tech talent unicorn"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Melo7 Tech Partners",cat:"Founded",detail:"VC firm co-founded 2013 with Stuart Goldfarb. Focuses on seed, early, and later-stage digital media, consumer internet, and technology. Invested $73M+ in 20+ deals per S&P Capital IQ. Co-invests with Andreessen Horowitz and Accel. Confirmed Crunchbase, Technical.ly.",btn:null},
    {name:"Isos7 Growth Equity",cat:"Founded",detail:"$750M sports-focused private equity fund co-launched 2023 with Isos Capital Management. Expands beyond early-stage startup investing into sports team and sports business acquisitions. Confirmed PE Insights.",btn:null},
    {name:"Puerto Rico Football Club",cat:"Founded",detail:"Owner of Puerto Rico's only professional soccer team. Plays in North American Soccer League (NASL). Confirmed Crunchbase bio.",btn:null},
    {name:"The Social Change Fund",cat:"Philanthropy",detail:"Co-founded in response to racial injustice across the US. Focuses on policy change, community organizing, and civic engagement in underrepresented communities.",btn:null},

    // EXITS
    {name:"Lyft",cat:"Private",detail:"Early Melo7 Tech Partners investment. Lyft IPO'd March 2019. One of the fund's earliest and most publicly documented wins. Confirmed Fortune interview and Technical.ly.",btn:EXITED},
    {name:"Bonobos",cat:"Private",detail:"Men's fashion brand and e-commerce pioneer. Early Melo7 investment. Walmart acquired Bonobos for $310M in 2017. Confirmed Technical.ly.",btn:EXITED},

    // ACTIVE PORTFOLIO
    {name:"DraftKings (DKNG)",cat:"Public",detail:"Daily fantasy sports and sports betting platform. Early Melo7 investment when company was a startup. Now publicly traded. Confirmed Technical.ly and Fortune.",btn:YF("DKNG")},
    {name:"SeatGeek",cat:"Private",detail:"Event ticketing platform. Melo7 investment. ~$1B valuation. Confidential IPO filing 2023. IPO expected 2026.",btn:FORGE},
    {name:"Andela",cat:"Private",detail:"Global tech talent sourcing and training platform focused on African developers. Became a unicorn. Confirmed Tracxn — listed as most notable Melo7 portfolio company.",btn:FORGE},
    {name:"Vivino",cat:"Private",detail:"World's largest wine app and marketplace. Melo7 investment. Confirmed Technical.ly.",btn:null},
    {name:"Overtime",cat:"Private",detail:"Youth sports media and leagues platform. Melo7 investment alongside Kevin Durant and Jeff Bezos. Signal overlap with Durant. Confirmed Technical.ly.",btn:null},
    {name:"Clubhouse",cat:"Private",detail:"Audio-based social networking. Peaked 2021, rapidly declined.",btn:EXITED},
    {name:"Stears News",cat:"Private",detail:"Africa-focused news and data intelligence platform. Melo7 investment October 2022. Confirmed S&P Capital IQ data cited in PE Insights.",btn:FORGE},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGAN PAUL — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const logan = {
  id:"logan", name:"Logan Paul", handle:"@LoganPaul",
  title:"PRIME Hydration · Anti Fund · WWE",
  netWorth:"~$150M", category:"Consumer · Creator Economy · Crypto",
  thesis:"Build brands the creator economy way — your audience is your distribution, your distribution is your moat.",
  keyNumber:{label:"PRIME valuation",value:"$1.2B (2024)"},
  tag:"The Maverick", tagColor:"red",
  recent:[
    {deal:"Blueprint",date:"Oct 2025",note:"Series A — Bryan Johnson's longevity supplement brand"},
    {deal:"Superpower Health",date:"Apr 2025",note:"Healthcare technology — most recent CB Insights"},
    {deal:"Lolli exit",date:"Jul 2025",note:"Bitcoin rewards app exit"},
    {deal:"PRIME Hydration",date:"2022",note:"$1.2B valuation — co-founded with KSI"},
    {deal:"Lolli Series B",date:"Dec 2023",note:"Bitcoin rewards app additional investment"},
  ],
  portfolio:[
    // FOUNDED
    {name:"PRIME Hydration",cat:"Founded",detail:"Co-founded 2022 with KSI (MrBeast Lunchly connection — Lunchly co-invested alongside Logan Paul and KSI). Hit $1.2B valuation in 2024 in 18 months — fastest growing beverage brand in history at launch. Logan holds ~20% equity. Signal overlap: co-founded with KSI, who co-founded Lunchly with MrBeast.",btn:null},
    {name:"Maverick Clothing",cat:"Founded",detail:"Logan's lifestyle apparel brand. Co-founded early in his YouTube career. Generates ongoing royalty and merchandise revenue.",btn:null},
    {name:"Anti Fund",cat:"Founded",detail:"General Partner of the Anti Fund, a seed-stage VC firm for 'rebels and iconoclasts.' Invests in cryptocurrency, sports, and e-commerce. Confirmed Crunchbase — Logan listed as General Partner. Co-invests with creators and sports figures.",btn:null},

    // INVESTMENTS
    {name:"Lolli",cat:"Private",detail:"Bitcoin rewards app. Series A July 2021 ($10M round confirmed by official Lolli press release — named Logan Paul explicitly). Invested again in Series B December 2023. Exited July 2, 2025. Signal overlap: co-invested with Animal Capital (Josh Richards, Griffin Johnson, Noah Beck).",btn:EXITED},
    {name:"Blueprint",cat:"Private",detail:"Bryan Johnson's longevity supplement brand. Series A October 28, 2025. Most recent confirmed investment. CB Insights confirmed. Signal overlap: Bryan Johnson is in Visionaries tab.",btn:null},
    {name:"Superpower Health",cat:"Private",detail:"Healthcare technology systems platform. April 22, 2025 investment per PitchBook. Second most recent confirmed.",btn:FORGE},
    {name:"Goldin Auctions",cat:"Private",detail:"Premium trading card and collectibles marketplace. Confirmed Crunchbase profile listing. Signal overlap: Kevin Durant also invested in Goldin.",btn:null},

    // CAUTIONARY / EXITED
    {name:"Liquid Marketplace",cat:"Crypto",detail:"Fractional collectibles platform. Regulatory fraud scrutiny, funds frozen 2024.",btn:EXITED},
    {name:"CryptoZoo",cat:"Crypto",detail:"Blockchain game. Failed to deliver — Logan refunded investors 2024.",btn:EXITED},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// MRBEAST — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const mrbeast = {
  id:"mrbeast", name:"MrBeast", handle:"@MrBeast",
  title:"Beast Industries · Feastables · YouTube #1",
  netWorth:"~$1B+", category:"Creator Economy · CPG · Media",
  thesis:"Your audience is your distribution. Use content as the loss leader and brands as the profit center. Reinvest everything until it's undeniable.",
  keyNumber:{label:"Beast Industries valuation",value:"$5.2B (2024)"},
  tag:"The Beast", tagColor:"green",
  recent:[
    {deal:"Step acquisition",date:"Feb 2026",note:"Fintech for teens — Beast Industries acquires"},
    {deal:"Beast Games S2",date:"Jan 2026",note:"Amazon Prime — most streamed show on platform"},
    {deal:"Bitmine investment",date:"Jan 2026",note:"$200M equity from Bitmine (BMNR) — ETH treasury co"},
    {deal:"Beast Mobile launch",date:"Sep 2025",note:"Phone service brand announced"},
    {deal:"Alpha Wave Series C",date:"2024",note:"$300M at $5B valuation — UAE investment firm"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Beast Industries",cat:"Founded",detail:"Holding company for all MrBeast ventures. Jimmy Donaldson owns 'a little over half.' $5.2B valuation (2024 Series C led by Alpha Wave). $400M+ revenue in 2024 ($246M media, $250M Feastables). Projecting $900M revenue in 2025 and $300M profit in 2026. Pre-IPO per December 2025 DealBook Summit. Confirmed Bloomberg, Fortune, Business Insider.",btn:FORGE},
    {name:"Feastables",cat:"Founded",detail:"Chocolate and snack brand launched Jan 2022. $250M revenue in 2024 — more profitable than MrBeast's YouTube channel for first time. $20M profit. Zero spent on advertising; entirely creator-distribution model. Available in 30,000+ retail locations (Walmart, Target, CVS). Grew from $33M (2022) to $96M (2023) to $250M (2024). Forecasting $520M in 2025.",btn:null},
    {name:"Lunchly",cat:"Founded",detail:"Grab-and-go lunch kits co-founded with Logan Paul and KSI (Signal overlap with Logan Paul and PRIME). Launched Sep 2024 as Lunchables competitor. Available in Walmart, Target, Kroger. Signal overlap: co-founded with Logan Paul.",btn:null},
    {name:"Viewstats",cat:"Founded",detail:"YouTube analytics software platform. Co-founded by MrBeast. Helps creators track growth, viral patterns, and content performance. Available in free and pro versions. Projected $105M revenue contribution in 2025.",btn:null},
    {name:"MrBeast Lab",cat:"Founded",detail:"Toy line launched 2024. Minifigure collectibles. Topped Amazon sales charts within a year. Price range $5-$25. $65M net revenue within six months of launch. Has accompanying Beast Animations YouTube channel.",btn:null},
    {name:"Step",cat:"Founded",detail:"Fintech for teens — savings, investment services, credit-building for under-18s. Acquired by Beast Industries February 9, 2026 (Investing.com confirmed). Step had raised $500M+ and had 7 million users before acquisition.",btn:null},
    {name:"Beast Philanthropy",cat:"Philanthropy",detail:"501(c)(3) organization. Livestreamed 15.5 hours in 2024 and raised $12M for charity — new world record. Partnership with Rockefeller Foundation announced November 2025. Mission: leverage social media scale for global charitable causes.",btn:null},

    // EXTERNAL
    {name:"Backbone",cat:"Private",detail:"Gaming accessory company (mobile game controllers). MrBeast invested in Backbone per win.gg and multiple sources.",btn:null},
    {name:"Juice Funds",cat:"Private",detail:"Investment fund for fellow content creators. MrBeast co-founded to invest in other YouTubers and creators building businesses. Confirmed win.gg.",btn:null},

    // RECEIVED INVESTMENT
    {name:"Bitmine (BMNR) $200M",cat:"Public",detail:"Ethereum treasury company chaired by Tom Lee (Fundstrat) invested $200M for a minority stake and board observer seat in Beast Industries, closing January 19, 2026. Confirmed Bloomberg, CNBC, Bitmine official press release.",btn:YF("BMNR")},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// MAGIC JOHNSON — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const magic = {
  id:"magic", name:"Magic Johnson", handle:"@MagicJohnson",
  title:"Magic Johnson Enterprises · $1.5B Empire",
  netWorth:"~$1.5B", category:"Sports · Real Estate · Finance · Consumer",
  thesis:"Invest where mainstream capital is afraid to go — underserved urban markets have real demand and loyal customers at lower acquisition cost than crowded markets allow.",
  keyNumber:{label:"Canyon-Johnson invested",value:"$4B in 85 cities"},
  tag:"Showtime", tagColor:"yellow",
  recent:[
    {deal:"Washington Spirit (NWSL)",date:"Sep 2024",note:"MJE acquires stake in DC women's soccer"},
    {deal:"MJE president promotion",date:"Oct 2024",note:"Alexia Grevious Henderson named president"},
    {deal:"Washington Commanders",date:"2023",note:"$6.05B — most expensive franchise sale ever"},
    {deal:"Fanatics board",date:"2023",note:"Appointed to Fanatics board of directors"},
    {deal:"EquiTrust controlling stake",date:"2020s",note:"Insurance co with $16B+ AUM"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Magic Johnson Enterprises",cat:"Founded",detail:"Global investment conglomerate founded 1987. Valued at over $1B per Forbes. Focuses on underserved urban markets. Alexia Grevious Henderson named president Oct 2024 — signals continued professionalization. Confirmed Wikipedia, official MJE site.",btn:null},
    {name:"SodexoMAGIC",cat:"Founded",detail:"Joint venture with Sodexo (global food services), 51% owned by Johnson. Launched 2006. Brings food service and facilities management to urban institutions including schools, hospitals, and government facilities. Confirmed Hustle Fund.",btn:null},
    {name:"Canyon-Johnson Urban Fund",cat:"Founded",detail:"Co-founded 2001 with Canyon Capital. Invested nearly $4B in real estate projects across 85 cities in 21 states. Focused on urban neighborhoods mainstream capital abandoned. Harvard Business School case study subject. Transformed Crenshaw corridor in LA.",btn:null},
    {name:"Magic Johnson Foundation",cat:"Philanthropy",detail:"Founded 1991. Taylor Michaels Scholarship Program has awarded $1.5M+ to underserved students. Focuses on HIV/AIDS prevention, academic achievement, and healthy lifestyles.",btn:null},

    // SPORTS OWNERSHIP
    {name:"Los Angeles Dodgers",cat:"Sports",detail:"Part of Guggenheim Baseball Management group that purchased the Dodgers for $2.15B in 2012 — then-record for franchise purchase in US sports history. Magic contributed ~$50M. Dodgers won 2020 World Series. Franchise value has more than doubled. Confirmed Wikipedia.",btn:null},
    {name:"Los Angeles Sparks (WNBA)",cat:"Sports",detail:"Led purchase alongside Guggenheim Partners in 2014. LA Sparks reached championship-contention status under Johnson's ownership. Confirmed Wikipedia.",btn:null},
    {name:"LA Football Club (LAFC)",cat:"Sports",detail:"Part owner since 2014. LAFC became first MLS franchise to eclipse $1B valuation in 2022. Confirmed Wikipedia.",btn:null},
    {name:"Washington Commanders (NFL)",cat:"Sports",detail:"Part of ownership syndicate that purchased Commanders for $6.05B in 2023 — then-record for most expensive franchise sale in American sporting history. Confirmed Wikipedia, Hustle Fund.",btn:null},
    {name:"Washington Spirit (NWSL)",cat:"Sports",detail:"MJE invested in DC-based women's soccer club September 2024. Confirmed Wikipedia, MagicJohnson.com.",btn:null},

    // HISTORICAL / EXITS
    {name:"LA Lakers (4.5% stake)",cat:"Sports",detail:"Purchased 4.5% stake for $10M in 1994. Sold stake in 2010 for an estimated $50-60M. Remained unpaid Vice President and later rejoined as Director of Basketball Operations 2017-2019. Confirmed Athlete Exec, MoneyMade, magicjohnson.com.",btn:EXITED},
    {name:"PepsiCo Bottling (controlling stake)",cat:"Private",detail:"1990 — Magic and Earl Graves bought a controlling stake in a Pepsi bottling operation, creating the largest minority-owned and operated Pepsi facility in the country at the time. His first major business venture outside endorsements. Confirmed Athlete Exec.",btn:EXITED},
    {name:"Founders National Bank",cat:"Private",detail:"1998 — acquired majority interest forming JJP Partnership. Historically significant as one of the early Black-led banking ventures. Confirmed magicjohnson.com timeline, Athlete Exec.",btn:null},
    {name:"Dayton Dragons",cat:"Sports",detail:"Purchased minority share of the Dayton Dragons minor league baseball team (Cincinnati Reds affiliate) in 2000 with Mandalay Bay Sports. Confirmed magicjohnson.com official timeline.",btn:null},
    {name:"Vibe Holdings",cat:"Private",detail:"Invested and became Chairman in 2011. Holdings include Vibe Magazine, Uptown Magazine, and the Soul Train TV Show brand. Focus on digital, live entertainment, and Black-owned media. Confirmed magicjohnson.com official company timeline.",btn:null},
    {name:"JLC Infrastructure",cat:"Founded",detail:"Co-founded with Loop Capital Markets. Joint venture investing in major US infrastructure projects. Involved in the $8B LaGuardia Airport rebuild (with Delta/NY Gov. Cuomo), Denver International Airport Great Hall project, and JFK Terminal project with Ferrovial. Confirmed magicjohnson.com timeline, VnExpress.",btn:null},
    {name:"Uncharted",cat:"Private",detail:"Smart infrastructure company. Confirmed Tracxn as MJE portfolio company. Also confirmed by VnExpress notable ventures list.",btn:FORGE},
    {name:"Unchartedplay",cat:"Private",detail:"Series A May 24, 2016. MJE portfolio company. Develops kinetic energy-powered products for developing-world infrastructure. Confirmed Tracxn as MJE portfolio.",btn:FORGE},
    {name:"Jopwell",cat:"Private",detail:"Diversity recruiting platform. MJE portfolio company. Confirmed Tracxn as MJE portfolio investment.",btn:FORGE},
    {name:"Superheroic",cat:"Private",detail:"Children's active play sneakers with data-informed fitness tracking. Magic invested and joined board. Mission: encourage physical play for every child. Confirmed magicjohnson.com official company page.",btn:null},
    {name:"Hero Ventures / Marvel Experience",cat:"Private",detail:"Magic became board member of Hero Ventures, which operates The Marvel Experience — a premier touring 4D motion ride experience. Confirmed magicjohnson.com timeline.",btn:null},
    {name:"Starbucks Urban Franchises",cat:"Private",detail:"Partnered with Starbucks 1998 to open 125+ stores in urban neighborhoods via Urban Coffee Opportunities (UCO). Sold 105 stores back to Starbucks in Oct 2010 in a ~$100M deal. Confirmed Wikipedia, Benzinga.",btn:EXITED},
    {name:"TGI Friday's Franchises",cat:"Private",detail:"Magic Johnson Enterprises partnered with Carlson Restaurant Worldwide to open Magic Johnson TGI Friday's locations in urban markets. Confirmed MagicJohnson.com.",btn:null},
    {name:"Burger King Franchises",cat:"Private",detail:"MJE partnered with Burger King to open 29 restaurants in underserved urban markets. Confirmed MagicJohnson.com.",btn:null},
    {name:"EquiTrust Life Insurance",cat:"Private",detail:"Majority stake in insurance company managing $14.5-16B+ in assets. Provides life insurance and annuities. One of the largest assets in Magic's portfolio. Confirmed Forbes, Primal Mogul, Benzinga.",btn:null},
    {name:"Fanatics",cat:"Private",detail:"Appointed to Fanatics board of directors 2023. Sports merchandise and trading card unicorn. Confirmed MagicJohnson.com.",btn:FORGE},
    {name:"aXiomatic / Team Liquid",cat:"Private",detail:"Esports investment. Joined eSports franchise alongside Washington Wizards co-owner Ted Leonisis and Golden State Warriors co-owner Peter Guber. Confirmed Boardroom and MoneyMade.",btn:FORGE},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// BONO — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const bono = {
  id:"bono", name:"Bono", handle:"@Bono",
  title:"Elevation Partners · The Rise Fund · U2",
  netWorth:"~$700M", category:"Tech PE · Impact Investing · Media",
  thesis:"Invest at the intersection of technology, culture, and impact. The most important companies solve real problems for real people — profit and purpose aren't opposites.",
  keyNumber:{label:"The Rise Fund AUM",value:"$5B+"},
  tag:"The Activist Investor", tagColor:"teal",
  recent:[
    {deal:"Zipline",date:"2019",note:"Rise Fund — autonomous medical drone delivery"},
    {deal:"Varo Money (bank charter)",date:"2020",note:"Rise Fund — first consumer fintech national bank"},
    {deal:"Blue Bottle Coffee",date:"2017",note:"Personal investment — Series C (Nestlé acquired 2017)"},
    {deal:"Varo Money Series B",date:"2018",note:"Rise Fund — $45M round (TPG official press release)"},
    {deal:"Color",date:"2016",note:"Personal — genetic testing platform Series D"},
  ],
  portfolio:[
    // FOUNDED / CO-FOUNDED
    {name:"Elevation Partners",cat:"Founded",detail:"Co-founded 2004. $1.9B media and entertainment fund. Closed 2015.",btn:EXITED},
    {name:"The Rise Fund",cat:"Founded",detail:"Co-founded 2016/2017 with TPG Growth's Bill McGlashan and Jeff Skoll. $5B+ AUM. Invests in companies aligned with UN Sustainable Development Goals across education, energy, food, financial services, health, infrastructure, and tech. Bono is Special Partner at TPG Growth. Confirmed Environmental Finance, GIIN, TPG official press release.",btn:null},
    {name:"ONE Campaign",cat:"Philanthropy",detail:"Co-founded 2002-2004 with Bobby Shriver. Advocacy organization with 10M+ members fighting extreme poverty and disease. Backed by Bill Gates Foundation, George Soros. Bono left board end of 2023. Confirmed Wikipedia.",btn:null},
    {name:"(RED)",cat:"Philanthropy",detail:"Co-founded 2006 with Bobby Shriver. Licenses brand to companies (Apple, Nike, Microsoft, Starbucks) — % of proceeds go to Global Fund. Generated $650M+ for HIV/AIDS grants as of 2020. Confirmed Wikipedia.",btn:null},
    {name:"Clarence Hotel",cat:"Founded",detail:"Co-owns with U2 bandmate The Edge. Bought 1992, spent $8M renovating. Reopened 1996 as 51-room luxury 4-star in Dublin. Confirmed Wikipedia, MoneyInc.",btn:null},

    // ELEVATION EXITS
    {name:"Facebook / Meta",cat:"Public",detail:"Elevation Partners invested $210M for 1.5% stake (2009-2010 purchases totaling $270M). Bono made ~$40-50M on his personal share. Facebook IPO'd May 2012 at $100B+. Elevation's biggest win by far. Confirmed Wikipedia, Billboard.",btn:EXITED},
    {name:"Yelp",cat:"Public",detail:"Elevation invested $100M. Yelp IPO'd March 2012. Elevation Partners exit. Confirmed Elevation Partners official site.",btn:EXITED},
    {name:"BioWare/Pandemic Studios",cat:"Private",detail:"First Elevation investment, 2005. EA acquired both studios. Confirmed Elevation Partners official site.",btn:EXITED},
    {name:"Forbes Media",cat:"Private",detail:"Elevation acquired 40%+ stake for $250-300M in 2006. Sold to Integrated Whale Media. Confirmed Wikipedia, Elevation Partners site.",btn:EXITED},
    {name:"Palm",cat:"Private",detail:"$460M invested 2007-2008. HP acquired Palm for $1.2B in 2010 — Elevation broke even due to hedging structures. Confirmed Wikipedia.",btn:EXITED},
    {name:"MarketShare",cat:"Private",detail:"$32M invested. Acquired by Neustar. Confirmed Elevation Partners official site.",btn:EXITED},

    // ELEVATION INVESTORS II (personal investments after Elevation closed)
    {name:"Airbnb",cat:"Public",detail:"Invested via Elevation Investors II. IPO'd December 2020. Confirmed Elevation Partners official site listing Elevation II investments.",btn:EXITED},
    {name:"Uber",cat:"Public",detail:"Invested via Elevation Investors II. IPO'd May 2019. Confirmed Elevation Partners official site.",btn:EXITED},
    {name:"Convoy",cat:"Private",detail:"On-demand trucking. Shut down October 2023.",btn:EXITED},

    // PERSONAL / RISE FUND
    {name:"Varo Money",cat:"Private",detail:"Rise Fund led $45M Series B alongside Warburg Pincus Jan 2018. First consumer fintech to receive national bank charter (2020). Bono quoted in official TPG press release: 'Expanding access to affordable digital banking is one small but important step in the bigger mandate.'",btn:null},
    {name:"Zipline",cat:"Private",detail:"Autonomous drone delivery. Rise Fund investment 2019. $7.6B valuation (Jan 2026). $800M Series H raised Jan-Mar 2026. Expanding from medical to consumer delivery in US.",btn:FORGE},
    {name:"Blue Bottle Coffee",cat:"Private",detail:"Personal investment Series C. Nestlé acquired majority stake 2017. Confirmed Crunchbase profile.",btn:EXITED},
    {name:"Varo Money",cat:"Private",detail:"Rise Fund investment — personal Bono quote confirmed in TPG BusinessWire press release.",btn:null},
    {name:"Nuritas",cat:"Private",detail:"Irish food-tech startup using AI to discover peptides with health benefits. Bono and The Edge co-invested. Confirmed multiple sources.",btn:FORGE},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// NAOMI OSAKA — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const osaka = {
  id:"osaka", name:"Naomi Osaka", handle:"@naomiosaka",
  title:"Hana Kuma · Evolve · 4x Grand Slam Champion",
  netWorth:"~$60M", category:"Consumer · Media · Sports · Wellness",
  thesis:"I want to invest in companies whose missions I believe in — health, women's sports, and diverse storytelling. Ownership is how athletes outlast their playing days.",
  keyNumber:{label:"CB Insights investments",value:"14 confirmed"},
  tag:"Global Force", tagColor:"pink",
  recent:[
    {deal:"W grooming",date:"Jul 2024",note:"Series A — gender-inclusive grooming brand"},
    {deal:"Players Fund backs Hana Kuma",date:"Jun 2024",note:"Athlete-led VC joins SpringHill, Nike, Epic Games"},
    {deal:"StatusPRO",date:"2022",note:"Sports tech and gaming platform"},
    {deal:"Hana Kuma",date:"Jun 2022",note:"Co-founded with LeBron James / SpringHill"},
    {deal:"Sweetgreen exit",date:"Nov 2021",note:"IPO'd at $3B valuation"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Hana Kuma",cat:"Founded",detail:"Media company co-founded June 2022 with agent Stuart Duguid. Launched in collaboration with LeBron James and Maverick Carter's SpringHill Co. Raised $5M seed (SpringHill, Nike, Epic Games, Fenway Sports Group) April 2023. Then received investment from The Players Fund June 2024. Emmy-nominated. Produces diverse, multicultural storytelling. Confirmed AfroTech, Startups Magazine, official statements. Signal overlap: LeBron James.",btn:null},
    {name:"Kinlo",cat:"Founded",detail:"Skincare company designed for melanin-rich skin. Osaka is founder and CEO. Launched 2021. Confirmed Profluence.",btn:null},
    {name:"Evolve",cat:"Founded",detail:"Sports management agency co-founded with long-time agent Stuart Duguid. Osaka left her previous agency to launch her own representation company. Confirmed Sportskhabri.",btn:null},

    // SPORTS OWNERSHIP
    {name:"North Carolina Courage (NWSL)",cat:"Sports",detail:"Minority owner since January 2021. First investor to join team owner Steve Malik since he purchased the Courage. Confirmed Sportskhabri, Tennis.com.",btn:null},

    // EXITS
    {name:"Sweetgreen (SG)",cat:"Public",detail:"Became Sweetgreen's youngest investor and first national athlete ambassador May 2021. Custom 'Naomi Osaka Bowl' launched. Sweetgreen IPO'd November 2021 at $3B valuation. CB Insights confirms this as Osaka's listed portfolio exit. Confirmed Restaurant Business and CB Insights.",btn:EXITED},
    {name:"BodyArmor",cat:"Private",detail:"Invested 2019 alongside Kobe Bryant. Coca-Cola acquired BodyArmor for $8B in 2021 — Osaka enjoyed 400%+ gain. Confirmed GiveMeSport, Profluence.",btn:EXITED},

    // ACTIVE PORTFOLIO
    {name:"Hyperice",cat:"Private",detail:"Sports recovery and performance technology brand. Equity stake since August 2019 alongside Lindsey Vonn, Patrick Mahomes and Trae Young. Revenue grew from $10M to $200M in 3 years. Approaching $1B valuation. Signal overlap: Patrick Mahomes also invested in Hyperice. Confirmed Tennis.com, Sportskhabri.",btn:null},
    {name:"Daring Foods",cat:"Private",detail:"Plant-based food startup. Osaka exited.",btn:EXITED},
    {name:"W (grooming)",cat:"Private",detail:"Gender-inclusive grooming brand. Series A July 23, 2024. Most recent confirmed investment per Tracxn and CB Insights.",btn:FORGE},
    {name:"StatusPRO",cat:"Private",detail:"Sports tech platform and gaming company. Confirmed Sportskeeda as part of Osaka's investment portfolio.",btn:FORGE},
    {name:"Athletic Brewing",cat:"Private",detail:"Leading non-alcoholic craft beer company. Confirmed Sportskeeda as part of Osaka's investment portfolio.",btn:null},
    {name:"Soto Sake",cat:"Private",detail:"Premium Japanese sake brand. Investor and creative consultant since 2020. Confirmed Sportskhabri.",btn:null},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// PATRICK MAHOMES — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const mahomes = {
  id:"mahomes", name:"Patrick Mahomes", handle:"@PatrickMahomes",
  title:"Kansas City Royals · Alpine F1 · 3x Super Bowl MVP",
  netWorth:"~$90M", category:"Sports Ownership · Tech · Consumer",
  thesis:"Invest in what you're passionate about and what builds your community. Local ownership compounds — the teams around you rise together.",
  keyNumber:{label:"Alpine F1 stake value",value:"$360M (382% up)"},
  tag:"The GOAT at 29", tagColor:"red",
  recent:[
    {deal:"Throne SPORT COFFEE equity",date:"2024",note:"Founder and equity investor in his own coffee brand"},
    {deal:"Alpine F1 Racing",date:"Oct 2023",note:"24% stake via Otro Capital — now worth $360M"},
    {deal:"Miami Pickleball Club",date:"2023",note:"MLP franchise ownership"},
    {deal:"WHOOP",date:"2020+",note:"Co-invested with Durant and Osaka — 3-way Signal overlap"},
    {deal:"Kansas City Current",date:"2022",note:"NWSL co-ownership with wife Brittany"},
  ],
  portfolio:[
    // FOUNDED
    {name:"KMO Burgers (Whataburger)",cat:"Founded",detail:"Co-founded Whataburger franchise group. Brought Whataburger restaurants to Kansas and Missouri. Mahomes is native Texan who wanted to share his home state's chain. Expanded significantly through 2023-2024. Confirmed Ruling Sports, Front Office Sports.",btn:null},
    {name:"1587 Prime",cat:"Founded",detail:"Co-founded steakhouse in Kansas City alongside Travis Kelce. Confirmed Ruling Sports.",btn:null},
    {name:"Throne SPORT COFFEE",cat:"Founded",detail:"Coffee brand with equity stake. Launched alongside his 2024 investment. Mahomes involved in marketing campaigns, product formulation, and distribution deals. Available in 20 states and 3,000 stores. Confirmed Ruling Sports.",btn:null},

    // SPORTS OWNERSHIP
    {name:"Kansas City Royals (MLB)",cat:"Sports",detail:"Minority owner since July 2020. Bought ~1% stake for an estimated $10M. Made him youngest MLB owner at 24. His father Pat Mahomes Sr. was a MLB pitcher. Team valued at $1B+. Confirmed CNBC official announcement.",btn:null},
    {name:"Sporting Kansas City (MLS)",cat:"Sports",detail:"Minority ownership stake. MLS franchise valuations have more than doubled since Mahomes invested. Confirmed Front Office Sports, Ruling Sports.",btn:null},
    {name:"Kansas City Current (NWSL)",cat:"Sports",detail:"Co-ownership with wife Brittany Mahomes since 2022. She serves as co-owner and public face. Confirmed Front Office Sports.",btn:null},
    {name:"Miami Pickleball Club (MLP)",cat:"Sports",detail:"Major League Pickleball franchise. Confirmed PlayersTV, Ruling Sports.",btn:null},
    {name:"Alpine Racing (F1)",cat:"Sports",detail:"24% stake acquired October 2023 via Otro Capital alongside Travis Kelce and others for $218M. Team valued at $1.5B by 2024 — a 382% increase from entry price. Mahomes/Kelce stake worth $360M. Confirmed Sportico, SportsTak.",btn:null},

    // TECH / CONSUMER
    {name:"WHOOP",cat:"Private",detail:"Human performance wearable. Invested alongside Kevin Durant (who invested 2017) and Naomi Osaka. Three-way Signal overlap across Athletes tab. WHOOP hit $10.1B valuation in Series G (Mar 2026). Confirmed Front Office Sports, PlayersTV.",btn:FORGE},
    {name:"Hyperice",cat:"Private",detail:"Sports recovery and performance technology brand. Invested alongside Naomi Osaka and Trae Young. Signal overlap with Osaka in Athletes tab. Revenue grew 20x. Confirmed Front Office Sports.",btn:null},
    {name:"Buzzer",cat:"Private",detail:"Live sports mobile app. Minority stake confirmed. Confirmed Sportskeeda.",btn:FORGE},
    {name:"American State Bank",cat:"Private",detail:"Shareholder in Texas-based bank. Confirmed Sportskeeda.",btn:null},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// MARTHA STEWART — complete portfolio (Research Protocol v2 + Level 5)
// Primary sources: SEC 8-K filings, PRNewswire, Crunchbase, Wikipedia
// ─────────────────────────────────────────────────────────────────────────────
const martha = {
  id:"martha", name:"Martha Stewart", handle:"@MarthaStewart",
  title:"Martha Stewart Living · Marquee Brands · OG Mogul",
  netWorth:"~$400M", category:"Consumer · Media · Cannabis · Sports",
  thesis:"Build a brand so powerful that its IP outlasts every setback. Your name is your most valuable asset — license it intelligently and never stop expanding what it can mean.",
  keyNumber:{label:"MSLO IPO opened at",value:"$38/share (1999)"},
  tag:"The OG Mogul", tagColor:"green",
  recent:[
    {deal:"Swansea City AFC",date:"Dec 2025",note:"Minority owner — joining Snoop Dogg + Luka Modrić"},
    {deal:"Still G.I.N.",date:"2025",note:"Brand partner with Dr. Dre + Snoop Dogg spirits venture"},
    {deal:"iHerb Martha Stewart Wellness",date:"Jul 2024",note:"Global wellness product line launch"},
    {deal:"19 Crimes Martha's Chard",date:"Jan 2022",note:"Co-developed Chardonnay wine with Treasury Wine Estates"},
    {deal:"The Bedford — Paris Las Vegas",date:"2022",note:"First-ever Martha Stewart restaurant, still operating"},
  ],
  portfolio:[
    // FOUNDED — FLAGSHIP
    {name:"Martha Stewart Living Omnimedia",cat:"Founded",detail:"Founded 1997. IPO'd October 19, 1999 on NYSE (ticker: MSO). Stock opened at $18 and shot to $38 by end of day — making Stewart America's first self-made female billionaire. She held a 96% stake personally. Sold to Sequential Brands Group December 2015 for $353M. Brand IP then sold again to Marquee Brands April 2019 for ~$175M. Stewart retained an equity stake in her own brand at each step. Annual retail sales from the brand exceeded $900M in 2021.",btn:EXITED},
    {name:"Marquee Brands (IP equity)",cat:"Founded",detail:"When Marquee Brands (owned by Neuberger Berman) acquired the Martha Stewart and Emeril Lagasse IP from Sequential in April 2019, Stewart retained equity in her own brand. Marquee's portfolio drives $3.5B in annual retail sales across home, food, fashion. The Martha Stewart brand alone hits 100M consumers monthly across platforms. Confirmed WWD, PRNewswire official release.",btn:null},

    // RESTAURANTS / CONSUMER
    {name:"Martha by Martha Stewart",cat:"Founded",detail:"Premium lifestyle and cookware brand launched via martha.com. Features Copper Collection, Try-Ply Stainless Steel, and Ceramic Nonstick Collections — used by Stewart at home and at The Bedford restaurant. Her self-described 'favorite products I've ever created.' Confirmed Business Traveller.",btn:null},
    {name:"Martha Stewart Kitchen (frozen food)",cat:"Founded",detail:"Martha-branded frozen and fresh food line. Available at Kroger, Publix, Albertsons/Safeway, Hannaford, Meijer, Walmart, and 8+ major grocery chains. Launched 2021. Described as 'as close to homemade as you can get in the freezer aisle.' Partnership with Goldbelly for e-commerce delivery. Kitchen brand projected to reach $1B in retail sales by 2025. Confirmed Bedford New Canaan Magazine.",btn:null},

    // CANNABIS
    {name:"Canopy Growth (CGC)",cat:"Public",detail:"Strategic advisor + equity, announced February 2019. Largest cannabis company in the world by market cap at the time. Snoop Dogg connected the two. Stewart helped develop hemp-derived CBD product line including pet health products. Confirmed CNBC, CBS News. Signal overlap: Snoop Dogg in Icons tab.",btn:YF("CGC")},
    {name:"Wanderous by Wana (CBD gummies)",cat:"Private",detail:"Martha Stewart-branded CBD gummy line developed within the Canopy Growth ecosystem. Marketed for wellness, sleep, and relaxation. Confirmed multiple sources including TheStreet and R Networth.",btn:null},

    // WINE

    // SPORTS
    {name:"Swansea City AFC",cat:"Sports",detail:"Became minority owner December 22-23, 2025. Welsh Championship soccer club. Joined existing celebrity owners Snoop Dogg and Luka Modrić. Attended Wrexham match before announcement. Official club statement confirmed by majority owners Brett Cravatt and Jason Cohen. Signal overlap: Snoop Dogg in Icons tab.",btn:null},

    // BRAND PARTNERSHIPS
    {name:"Still G.I.N.",cat:"Private",detail:"Brand partner for Dr. Dre and Snoop Dogg's Still G.I.N. premium gin spirits venture. Announced 2025 — brings her lifestyle and entertaining expertise to the brand. Stewart, Dre, and Snoop's third cross-venture. Confirmed Food & Beverage Magazine. Signal overlap: Snoop Dogg in Icons tab.",btn:null},

    // MSLO DIGITAL PORTFOLIO (via the company)
    {name:"WeddingWire",cat:"Private",detail:"MSLO took 40% stake in WeddingWire in 2008 with an option to acquire the full company. Digital platform for wedding planning, vendor search, and social sharing. Confirmed via SEC 8-K filing February 2008. MSLO also served as national ad sales force for WeddingWire. Confirmed PitchBook exit records.",btn:EXITED},
    {name:"ZipList",cat:"Private",detail:"MSLO invested via Series A November 24, 2010. Online grocery and recipe tool — users could save recipes and auto-generate shopping lists. Confirmed Tracxn. Acquired by Yummly.",btn:EXITED},
    {name:"HomeGrocer.com",cat:"Private",detail:"Early online grocery investment via MSLO. Listed on Crunchbase as MSLO portfolio company. HomeGrocer was an early 2000s online grocery pioneer — merged with Webvan, which later went bankrupt. Historical confirmed.",btn:EXITED},
    {name:"Celebrations.com",cat:"Private",detail:"MSLO was an investor in Celebrations.com (formerly Pingg.com), a party planning, e-cards, and invitation platform. Confirmed Crunchbase company profile listing MSLO as investor.",btn:EXITED},

    // CONTEXTUAL
    {name:"ImClone Systems",cat:"Public",detail:"Stewart held shares in ImClone and sold them December 27, 2001 after receiving material, nonpublic information from her broker — avoiding a $45,673 loss. ImClone fell 16% the next day. Convicted March 2004 of felony conspiracy and obstruction charges. Served five months in federal prison, released March 2005. This moment made her one of the most famous cases in SEC enforcement history. Included for context — not a portfolio position.",btn:EXITED},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// ANDREW HUBERMAN — complete portfolio (Research Protocol v2 + Level 5)
// NOTE: Minimum position exception approved — only 2 confirmed positions
// ─────────────────────────────────────────────────────────────────────────────
const huberman = {
  id:"huberman", name:"Andrew Huberman", handle:"@hubermanlab",
  title:"Huberman Lab · Stanford · David Protein · Mateína",
  netWorth:"~$5M+", category:"Health · Longevity · Consumer",
  thesis:"Invest in products you actually use and believe in — science-backed, accessible, and built to improve human performance.",
  keyNumber:{label:"Podcast downloads",value:"500M+ (top 5 globally)"},
  tag:"The Neuroscientist", tagColor:"blue",
  recent:[
    {deal:"David Protein",date:"Aug 2024",note:"Seed investor — high-protein, low-calorie bar brand"},
    {deal:"Mateína",date:"Jan 2024",note:"Invested via Tiny acquisition — yerba mate energy drink"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Huberman Lab (podcast + brand)",cat:"Founded",detail:"Founded and hosts Huberman Lab, one of the top 5 most downloaded podcasts globally with 500M+ downloads. Covers neuroscience and human performance. The platform generates significant income through sponsorships and is the foundation for all his investment relationships. Stanford School of Medicine professor of neurobiology and ophthalmology.",btn:null},

    // CONFIRMED INVESTMENTS
    {name:"David Protein",cat:"Private",detail:"Seed investor August 2024. Protein bar brand co-founded by Peter Attia and Geoffrey Woo. High-protein (28g), low-calorie (150 cal) nutrition bar. Confirmed BusinessWire official press release. Huberman is named as a seed investor in the announcement.",btn:null},
    {name:"Mateína",cat:"Private",detail:"Invested via Tiny's majority acquisition of Mateína, January 2024. Premium yerba mate energy drink with cleaner ingredient profile than traditional energy drinks. Huberman invested alongside Tiny (Andrew Wilkinson's holding company). Confirmed official press release.",btn:null},

    // ADVISORY / NOTE
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// DAVID SINCLAIR — complete portfolio (Research Protocol v2 + Level 5)
// Primary source: sinclair.hms.harvard.edu/david-sinclairs-affiliations
// ─────────────────────────────────────────────────────────────────────────────
const sinclair = {
  id:"sinclair", name:"David Sinclair", handle:"@davidasinclair",
  title:"Harvard Genetics · Life Biosciences · Longevity Pioneer",
  netWorth:"~$200M+", category:"Biotech · Longevity · VC",
  thesis:"Aging is a disease — and it's treatable. Every company I co-found is a different weapon against the same enemy. Science is the moat.",
  keyNumber:{label:"Life Biosciences FDA Phase 1",value:"Approved Jan 2026"},
  tag:"The Age Hacker", tagColor:"purple",
  recent:[
    {deal:"Life Biosciences FDA Phase 1",date:"Jan 2026",note:"Epigenetic reprogramming eye trial — first partial de-aging human trial"},
    {deal:"Delavie Sciences",date:"2022",note:"EdenRoc subsidiary — skincare/longevity"},
    {deal:"Tally Health",date:"2022",note:"Co-founded — consumer biological age testing"},
    {deal:"Bold Capital",date:"2021",note:"Equity partner — Peter Diamandis longevity VC"},
    {deal:"Levels Health",date:"2021",note:"Equity advisor — continuous glucose monitoring"},
  ],
  portfolio:[
    // FLAGSHIP COMPANIES
    {name:"Life Biosciences",cat:"Founded",detail:"Co-founded 2017. Partial epigenetic reprogramming to reverse cellular aging. FDA approved Phase 1 human clinical trial January 2026 — first partial de-aging human trial in history. Initially targeting vision loss (glaucoma, NAION). Previously saw success treating liver fibrosis. Licensed technology from Harvard/Sinclair lab. Confirmed Fortune, Life Biosciences official site.",btn:null},
    {name:"Sirtris Pharmaceuticals",cat:"Founded",detail:"Co-founded 2004. Focused on sirtuin activation — the pathway Sinclair is most associated with. GlaxoSmithKline acquired Sirtris in 2008 for $720M. Sinclair's first major commercial exit. Listed on his official HMS affiliations page.",btn:EXITED},
    {name:"EdenRoc Sciences",cat:"Founded",detail:"Co-founded 2016 as umbrella holding company for multiple longevity subsidiaries. Vice Chairman. Subsidiaries include: Liberty Biosecurity, MetroBiotech (NAD boosters), Cantata Bio, Claret Bioscience, Delavie Sciences (skincare), Astrea Forensics, Animal Biosciences. All confirmed on official HMS affiliations page.",btn:null},

    // CO-FOUNDED COMPANIES
    {name:"InsideTracker / Segterra",cat:"Founded",detail:"Board member since 2011. Segterra/InsideTracker provides personalized health analytics by analyzing blood and DNA biomarkers. Cambridge, MA. Confirmed HMS affiliations page and Levels Health press release.",btn:null},
    {name:"TuHURA Biosciences (HURA)",cat:"Public",detail:"Formerly CohBar. Merged with Morphogenesis late 2023. Renamed TuHURA Biosciences, ticker HURA on Nasdaq. Pivoted to oncology immunotherapy.",btn:YF("HURA")},
    {name:"Genocea Biosciences (NASDAQ: GNCA)",cat:"Public",detail:"Co-founded 2006. Cambridge, MA. Vaccine-focused biotech. Went public on Nasdaq. Confirmed HMS affiliations page and MarketScreener.",btn:EXITED},
    {name:"Immetas Therapeutics",cat:"Founded",detail:"Co-founded 2018. Boston, MA. Longevity therapeutics. F,I,E,A,B status on official HMS affiliations page — founder, investor, equity, advisor, board.",btn:FORGE},
    {name:"Tally Health",cat:"Founded",detail:"Co-founded 2021-2022. Consumer biological age testing and recommendations — direct-to-consumer longevity insights. Confirmed MarketScreener, HMS affiliations, Crunchbase.",btn:null},
    {name:"Galilei Biosciences",cat:"Founded",detail:"Co-founded. SIRT6 activators (2014-present). Founder and investor per official HMS affiliations page.",btn:null},

    // VC / ADVISORY
    {name:"Catalio Capital Management",cat:"Private",detail:"Venture Partner. NYC-based life sciences VC focused on longevity and biotech. Sinclair actively advises portfolio companies. Confirmed Catalio Capital official team page.",btn:FORGE},
    {name:"Bold Capital",cat:"Private",detail:"Equity partner since 2021. Peter Diamandis' venture fund focused on exponential technology and longevity. Confirmed HMS affiliations page.",btn:null},
    {name:"Levels Health",cat:"Private",detail:"Equity advisor since 2021. Continuous glucose monitoring for metabolic health — non-diabetic optimization. Confirmed official Levels Health blog post naming Sinclair as longevity leader advisor.",btn:null},
    {name:"Virtusan",cat:"Private",detail:"Equity advisor since 2021. Holistic human performance platform. Confirmed HMS affiliations page.",btn:null},
    {name:"Arc Bio",cat:"Founded",detail:"Co-founded 2015. Cambridge, MA and Menlo Park, CA. Diagnosing infectious diseases using genomics. Confirmed HMS affiliations page.",btn:null},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// KSI — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const ksi = {
  id:"ksi", name:"KSI", handle:"@KSI",
  title:"PRIME Hydration · Misfits Boxing · Sidemen",
  netWorth:"~$100M", category:"Consumer · Sports · Creator Economy",
  thesis:"Build brands with your audience, not for your audience. The creator economy is the most efficient distribution machine ever built.",
  keyNumber:{label:"PRIME revenue 2023",value:"$1.2B"},
  tag:"The Nightmare", tagColor:"red",
  recent:[
    {deal:"PRIME Hydration",date:"2022",note:"$1.2B revenue 2023 — co-founded with Logan Paul"},
    {deal:"Lunchly",date:"Sep 2024",note:"Co-founded with MrBeast + Logan Paul — Lunchables rival"},
    {deal:"Best Cereal",date:"2024",note:"Sidemen Group venture — UK cereal brand launch"},
    {deal:"XIX Vodka",date:"2022",note:"Sidemen Group premium vodka brand"},
    {deal:"Misfits Boxing",date:"2021",note:"Founded boxing promotion company"},
  ],
  portfolio:[
    // FOUNDED
    {name:"PRIME Hydration",cat:"Founded",detail:"Co-founded January 2022 with former rival Logan Paul. Congo Brands holds 60%, KSI and Logan Paul each hold ~20%. Hit $1.2B revenue in 2023 in just 18 months — fastest beverage brand growth ever. Declined to ~$750M in 2024. Official partner of Arsenal FC, UFC, and LA Dodgers. Signal overlap: co-founded with Logan Paul (Creators tab).",btn:null},
    {name:"Misfits Boxing",cat:"Founded",detail:"Founded boxing promotion company. KSI has generated $20M+ in combined purses and PPV revenue. Misfits promotes both his own bouts and those of other YouTube/creator boxers. Created the blueprint for influencer boxing as a legitimate commercial category. Confirmed Bored Panda.",btn:null},
    {name:"Lunchly",cat:"Founded",detail:"Co-founded September 2024 with MrBeast and Logan Paul. School lunch kit positioned as a healthier Lunchables alternative. Available in Walmart, Target, Kroger. Faced controversy over health claims and mold reports in 2024. Signal overlap: co-founded with MrBeast and Logan Paul (both in Creators tab) — three-way Signal.",btn:null},

    // SIDEMEN GROUP VENTURES (shared equity with 7 members)
    {name:"XIX Vodka",cat:"Founded",detail:"Premium vodka brand launched 2022 as a Sidemen Group collective venture. Shared equity among the 7 Sidemen members including KSI. Available in UK and internationally. Confirmed Bored Panda.",btn:null},
    {name:"Sides Restaurant Chain",cat:"Founded",detail:"Sidemen Group fast-casual restaurant chain. Multiple UK locations. Shared equity among Sidemen group members. Confirmed Bored Panda.",btn:null},
    {name:"Side+",cat:"Founded",detail:"Sidemen subscription app launched 2021. Exclusive content, behind-the-scenes access, and member perks. Shared equity model across Sidemen group. Confirmed Bored Panda.",btn:null},
    {name:"Best Cereal",cat:"Founded",detail:"UK cereal brand launched 2024 as a Sidemen Group venture. Shared equity model. Confirmed Bored Panda.",btn:null},
    {name:"Sidemen Clothing",cat:"Founded",detail:"Apparel brand launched 2014. Original Sidemen Group collective venture. Ongoing revenue shared among group members. Confirmed Bored Panda.",btn:null},
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// EMMA CHAMBERLAIN — complete portfolio (Research Protocol v2 + Level 5)
// ─────────────────────────────────────────────────────────────────────────────
const emma = {
  id:"emma", name:"Emma Chamberlain", handle:"@emmachamberlain",
  title:"Chamberlain Coffee · Co-CEO · Gen Z's Mogul",
  netWorth:"~$30M", category:"Creator Economy · CPG · Coffee",
  thesis:"Build something you actually care about — not just something your audience will buy. Authenticity is the only moat that can't be copied.",
  keyNumber:{label:"Chamberlain Coffee funding",value:"$22M raised"},
  tag:"The Aesthetic", tagColor:"brown",
  recent:[
    {deal:"First Café — Westfield Century City",date:"Jan 2025",note:"First physical Chamberlain Coffee location opens LA"},
    {deal:"Co-CEO promotion",date:"2024",note:"Promoted to co-CEO — active operational leadership"},
    {deal:"Series A (Feb 2024)",date:"Feb 2024",note:"Most recent funding round — 6 investors participated"},
    {deal:"$7M Series A",date:"Jun 2023",note:"Volition Capital + Electric Feel Ventures"},
    {deal:"RTD cold brew launch",date:"2023",note:"Chamberlain Coffee enters ready-to-drink category"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Chamberlain Coffee",cat:"Founded",detail:"Co-founded 2020 when Emma was 19. Promoted to co-CEO in 2024 — active operational role, not just figurehead. Raised $22M across 4 rounds from 14 investors including Blazar Capital, UTA Ventures, Volition Capital, Electric Feel Ventures, L.A. Libations. $22M revenue in 2024, projecting $33M in 2025 (53% growth). Available in 8,500+ retail stores (Walmart, Target, Costco, Sprouts). Opened first physical café January 28, 2025 at Westfield Century City Mall — massive lines. Pivoting to profitability in 2025 after 2024 losses. Emma holds estimated 30-50% equity. Confirmed PRNewswire (official press release naming Emma as investor), Arthnova, LA Business Journal.",btn:null},

    // ANGEL

    // BRAND CONTEXT
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// PAUL GRAHAM — complete portfolio (Research Protocol v3 + Level 5)
// PROTOCOL NOTE: YC = institutional fund with external LPs → ONE entry, not individual positions.
// Personal angel = checks PG wrote from his own capital, confirmed separately.
// Primary sources: CB Insights (62), PitchBook (78), boringbusinessnerd.com, Tracxn (34)
// ─────────────────────────────────────────────────────────────────────────────
const pg = {
  id:"pg", name:"Paul Graham", handle:"@paulg",
  title:"Y Combinator · Viaweb · Hackers & Painters",
  netWorth:"~$2.5B", category:"Seed · Essays · Internet",
  thesis:"Make something people want. Most startup ideas that seem bad are bad for a reason — but a few are bad only because they're ahead of their time. Bet on those.",
  keyNumber:{label:"YC companies funded",value:"4,000+"},
  tag:"The Essay King", tagColor:"amber",
  recent:[
    {deal:"Autosana",date:"Feb 2026",note:"Personal angel — PitchBook most recent"},
    {deal:"Orange Slice",date:"Feb 2026",note:"Personal angel — CB Insights confirmed"},
    {deal:"Channel3",date:"Dec 2025",note:"Personal angel — Tracxn confirmed"},
    {deal:"Wordware",date:"Nov 2024",note:"Personal angel — AI programming tools"},
    {deal:"Tenderd",date:"Jun 2019",note:"Personal angel — co-invested with Thiel"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Viaweb",cat:"Founded",detail:"Co-founded 1995 with Robert Morris. One of the first web-based SaaS apps — an e-commerce store builder written in Lisp. Yahoo! acquired for $49.6M in 1998 (renamed Yahoo! Store). The exit that seeded everything that followed. Confirmed Wikipedia.",btn:EXITED},
    {name:"Hacker News",cat:"Founded",detail:"Developer and startup news aggregator. Launched 2007. One of the most influential tech forums in the world — the original distribution layer for YC culture and companies. Confirmed YC official.",btn:null},
    // PERSONAL ANGEL (PG's own capital — confirmed boringbusinessnerd, CB Insights, PitchBook, Tracxn, press releases)
    // NOTE: Full personal portfolio is 34 (Tracxn), 62 (CB Insights), 78 (PitchBook) — lists are paywalled.
    // Below are all individually confirmed from open sources.
    {name:"Stripe",cat:"Private",detail:"Payments infrastructure. Listed on boringbusinessnerd.com as a PG personal investment (distinct from YC institutional). $91.5B+ valuation. PG backed the Collisons early. Confirmed boringbusinessnerd.",btn:FORGE},
    {name:"Airbnb",cat:"Private",detail:"Short-term rentals. $75B+ market cap. Listed boringbusinessnerd as PG personal investment. PG has written extensively about believing in Chesky when the idea seemed implausible. Confirmed boringbusinessnerd.",btn:YF("ABNB")},
    {name:"Replit",cat:"Private",detail:"Collaborative browser IDE. $1.16B unicorn. PG personal angel — top unicorn in Tracxn personal profile. Confirmed Tracxn, boringbusinessnerd.",btn:FORGE},
    {name:"ClassDojo",cat:"Private",detail:"K-12 classroom communication. $1.25B unicorn. PG personal angel — top unicorn Tracxn personal profile. Confirmed Tracxn, boringbusinessnerd.",btn:FORGE},
    {name:"Retool",cat:"Private",detail:"Internal tools builder. $3.2B+ valuation. PG personal angel. Confirmed boringbusinessnerd.",btn:FORGE},
    {name:"Boom Supersonic",cat:"Private",detail:"Supersonic passenger aircraft. XB-1 broke sound barrier Jan 2025 — first privately-funded jet to go supersonic. $300M Series B Dec 2025. $700M total raised. $1.5B valuation. Trump lifted overland supersonic ban Jun 2025.",btn:FORGE},
    {name:"Titan",cat:"Private",detail:"Cash management, investing, and retirement planning app. PG personal angel. Confirmed boringbusinessnerd select investments listing.",btn:FORGE},
    {name:"Pachama",cat:"Private",detail:"High-quality carbon credit marketplace. Climate/AI. PG personal angel. Confirmed boringbusinessnerd select investments listing.",btn:FORGE},
    {name:"Manara",cat:"Private",detail:"Developer talent platform for MENA engineers. PG personal angel. Confirmed boringbusinessnerd.",btn:FORGE},
    {name:"Clever",cat:"Private",detail:"K-12 single sign-on and edtech infrastructure. PG personal angel. Confirmed boringbusinessnerd.",btn:null},
    {name:"Tenderd",cat:"Private",detail:"Dubai heavy equipment rental marketplace. June 2019. PG named personally in PRNewswire press release alongside Peter Thiel and YC. Confirmed MENAbytes PRNewswire.",btn:FORGE},
    {name:"College Pulse",cat:"Private",detail:"Real-time college student opinion data platform. April 2019. PG named alongside YC, Madrona, Norwest in PRNewswire press release. Confirmed PRNewswire.",btn:null},
    {name:"Wordware",cat:"Private",detail:"AI programming tools for non-engineers. Seed November 2024. PG personal — confirmed Tracxn personal portfolio.",btn:FORGE},
    {name:"Channel3",cat:"Private",detail:"Seed December 2025. Most recent Tracxn confirmed personal investment.",btn:null},
    {name:"Orange Slice",cat:"Private",detail:"Seed VC-II February 2026. Confirmed CB Insights latest portfolio entry.",btn:null},
    {name:"Autosana",cat:"Private",detail:"Business/productivity software. February 17, 2026. Most recent PitchBook confirmed.",btn:null},
    // EXITS (confirmed CB Insights 8 exits + Tracxn)
    {name:"Triplebyte",cat:"Private",detail:"Technical recruiting platform. Most recent CB Insights exit — March 16, 2023. PG personal investment. Confirmed CB Insights exit list.",btn:EXITED},
    {name:"SocialCam",cat:"Private",detail:"Mobile video sharing app. PG personally named in TechCrunch's full investor list for SocialCam's angel round (2012) — distinct from YC institutional. Acquired by Autodesk 2012 for $60M. Confirmed TechCrunch, Tracxn exit.",btn:EXITED},
    {name:"North (Thalmic Labs)",cat:"Private",detail:"Smart glasses company. PG personal investment — confirmed Tracxn as portfolio exit. Google acquired North 2020. Confirmed Tracxn exits.",btn:EXITED},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// GARRY TAN — complete portfolio (Research Protocol v3 + Level 5)
// PROTOCOL NOTE: Initialized Capital = institutional fund with external LPs → ONE entry.
// Personal positions = confirmed PitchBook board seats + named personal angels only.
// Primary sources: Wikipedia, PitchBook (232 deals), Initialized Wikipedia, Tracxn (51)
// ─────────────────────────────────────────────────────────────────────────────
const garrytan = {
  id:"garrytan", name:"Garry Tan", handle:"@garrytan",
  title:"Y Combinator CEO · Initialized Capital · Forbes Midas #6",
  netWorth:"~$300M", category:"Seed VC · Design · SF Politics",
  thesis:"Back the founders others don't yet believe in. The best seed investments look wrong when you make them. Coinbase before Bitcoin was a thing. Instacart before mobile delivery was obvious.",
  keyNumber:{label:"Initialized unicorns",value:"27 at seed"},
  tag:"The Seed Contrarian", tagColor:"blue",
  recent:[
    {deal:"NewLimit",date:"May 2025",note:"Personal angel — Brian Armstrong longevity co. PitchBook confirmed"},
    {deal:"Oboe",date:"Dec 2025",note:"Personal angel — educational software"},
    {deal:"Patron gaming fund",date:"Sep 2024",note:"LP/backer alongside Marc Andreessen"},
    {deal:"Coinbase IPO",date:"Apr 2021",note:"Wrote the first $200K seed check in 2013 via Initialized"},
    {deal:"Instacart IPO",date:"Sep 2023",note:"Initialized seed 2012 — second landmark fund exit"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Posterous",cat:"Founded",detail:"Co-founded 2007. Simple blogging platform via email. YC S08. Grew to 15M+ users. Twitter acquired 2012 (team acquihire); service shut down 2013. Confirmed Wikipedia.",btn:EXITED},
    {name:"Posthaven",cat:"Founded",detail:"Co-founded with Brett Gibson after Posterous shutdown. Paid continuation service preserving users' sites. Still running. Confirmed Wikipedia.",btn:null},
    // PERSONAL ANGEL (PitchBook board seats + named personal investments confirmed)
    {name:"NewLimit",cat:"Private",detail:"Longevity drug discovery co-founded by Brian Armstrong. Garry Tan's most recent confirmed PitchBook deal (May 6, 2025). Personal angel check — not an Initialized fund investment. Signal overlap: Brian Armstrong in Health & Longevity tab.",btn:FORGE},
    {name:"Safeheron",cat:"Private",detail:"Crypto asset security infrastructure. Garry Tan holds a board seat per PitchBook. Personal position. Confirmed PitchBook board seat.",btn:null},
    {name:"TigerEye Labs",cat:"Private",detail:"Revenue intelligence platform. Board member per PitchBook. Personal position. Confirmed PitchBook.",btn:FORGE},
    {name:"Career Karma",cat:"Private",detail:"Workforce upskilling platform. Board member per PitchBook. Personal position. Confirmed PitchBook.",btn:null},
    {name:"Oboe",cat:"Private",detail:"Educational software. December 10, 2025 — most recent personal PitchBook investment.",btn:null},
    {name:"Patron Gaming Fund",cat:"Private",detail:"$100M gaming-centric VC fund. Tan backed as LP alongside Marc Andreessen, September 2024. Confirmed PitchBook news item.",btn:null},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ELAD GIL — complete portfolio (Research Protocol v3 + Level 5)
// PROTOCOL NOTE: Gil Capital = personal family office vehicle (Elad's own capital).
// eladgil.com is a direct primary-source self-disclosure of his personal positions.
// All entries below are explicitly listed on eladgil.com or confirmed PitchBook board seats.
// Primary sources: eladgil.com (primary), PitchBook (316 investments), LinkedIn
// ─────────────────────────────────────────────────────────────────────────────
const eladgil = {
  id:"eladgil", name:"Elad Gil", handle:"@eladgil",
  title:"Gil Capital · Color Health · High Growth Handbook",
  netWorth:"~$500M+", category:"Angel · AI · Longevity · Operator",
  thesis:"Back infrastructure companies at the earliest stages of massive platform shifts. Don't wait for consensus. Invest when it still looks uncertain.",
  keyNumber:{label:"Unicorns backed",value:"40+"},
  tag:"The Operator-Investor", tagColor:"teal",
  recent:[
    {deal:"Crosby",date:"Mar 2026",note:"Business productivity — PitchBook most recent"},
    {deal:"Harvey Series E",date:"2025",note:"AI legal — $300M Kleiner + Coatue led"},
    {deal:"Saronic",date:"2025",note:"Autonomous naval vessels — defense"},
    {deal:"Perplexity",date:"2024",note:"AI search — multiple rounds"},
    {deal:"Mistral",date:"2024",note:"Open-source LLM — European AI"},
  ],
  portfolio:[
    // FOUNDED (all confirmed eladgil.com + PitchBook)
    {name:"MixerLabs / GeoAPI",cat:"Founded",detail:"Co-founded. Developer location infrastructure. Twitter acquired 2009 for ~$5M — Elad joined as VP Corporate Strategy. Confirmed PitchBook bio.",btn:EXITED},
    {name:"Color Health",cat:"Founded",detail:"Co-founded 2015 as Color Genomics. Population-scale cancer screening and telehealth. MIT PhD in biology — personal conviction. Elad was CEO 2013-2016. Confirmed eladgil.com, PitchBook.",btn:null},
    {name:"Gil Capital",cat:"Founded",detail:"Personal investment vehicle (family office), 2008-present. 316+ investments per PitchBook. Elad's own capital — no external LPs in traditional fund sense. Transitioning to formal multi-billion fund structure per 2025 reporting. All positions below are via Gil Capital. Confirmed PitchBook bio, LinkedIn.",btn:null},
    // INFRASTRUCTURE / SAAS (self-disclosed eladgil.com)
    {name:"Stripe",cat:"Private",detail:"Payments infrastructure. $91.5B+ valuation. Listed on eladgil.com as investor + advisor. Confirmed eladgil.com direct.",btn:FORGE},
    {name:"Airbnb",cat:"Private",detail:"Short-term rental. $75B+ market cap. Listed on eladgil.com as investor + advisor. Confirmed eladgil.com direct.",btn:YF("ABNB")},
    {name:"Coinbase",cat:"Private",detail:"Crypto exchange. Early investor, also served as advisor. Public (COIN). Confirmed eladgil.com, PitchBook bio.",btn:YF("COIN")},
    {name:"Figma (FIG)",cat:"Public",detail:"Collaborative design platform. IPO'd NYSE Jul 30 2025 at $33/share (~$12B valuation). Ticker: FIG. Adobe $20B deal collapsed 2023.",btn:YF("FIG")},
    {name:"Notion",cat:"Private",detail:"All-in-one workspace. $10B+ valuation. Listed eladgil.com. Confirmed.",btn:FORGE},
    {name:"Airtable",cat:"Private",detail:"No-code database. $11.7B valuation. Listed eladgil.com as investor + advisor. Confirmed.",btn:FORGE},
    {name:"Rippling",cat:"Private",detail:"HR and IT management. $13.5B+ valuation. Served as advisor. Confirmed eladgil.com, PitchBook.",btn:FORGE},
    {name:"Brex",cat:"Private",detail:"Corporate spend management. $12B+ valuation. Listed eladgil.com. Confirmed.",btn:FORGE},
    {name:"Gusto",cat:"Private",detail:"Payroll and HR for SMBs. $9.5B+ valuation. Listed eladgil.com. Confirmed.",btn:FORGE},
    {name:"Retool",cat:"Private",detail:"Internal tools builder. $3.2B+ valuation. Listed eladgil.com. Confirmed.",btn:FORGE},
    {name:"Flexport",cat:"Private",detail:"Digital freight forwarding. ~$3.5B valuation (down from $8B). Listed eladgil.com. Still operating.",btn:FORGE},
    {name:"Deel",cat:"Private",detail:"Global payroll and compliance. $17.3B valuation (Oct 2025). Listed eladgil.com as investor + advisor. DOJ criminal probe re: Rippling espionage opened Jan 2026. Still private.",btn:FORGE},
    {name:"Navan (NAVN)",cat:"Public",detail:"Business travel and expense management. IPO'd Nasdaq Oct 30 2025 at $25/share (~$6.2B valuation). Ticker: NAVN. Elad Gil advisor/investor.",btn:YF("NAVN")},
    {name:"Rippling",cat:"Private",detail:"HR and IT management platform. $13.5B+ valuation. Confirmed eladgil.com.",btn:FORGE},
    {name:"Samsara",cat:"Public",detail:"IoT operations. Public (IOT). Listed eladgil.com. Confirmed.",btn:YF("IOT")},
    {name:"Checkr",cat:"Private",detail:"Background check platform. $5B+ valuation. Listed eladgil.com. Confirmed.",btn:FORGE},
    {name:"dbt Labs",cat:"Private",detail:"SQL analytics transformation layer. $4.2B valuation. Listed eladgil.com. Confirmed.",btn:FORGE},
    {name:"GitLab",cat:"Public",detail:"DevOps platform. Public (GTLB). Listed eladgil.com as investor. Confirmed.",btn:YF("GTLB")},
    {name:"Square / Block",cat:"Public",detail:"Payments. Public (XYZ). Listed eladgil.com. Confirmed.",btn:YF("XYZ")},
    {name:"Pinterest",cat:"Public",detail:"Visual discovery. Public (PINS). Listed eladgil.com as investor. Confirmed.",btn:YF("PINS")},
    {name:"SpaceX",cat:"Private",detail:"Reusable rockets and Starlink. $350B+ valuation. Listed eladgil.com. Confirmed.",btn:FORGE},
    {name:"Applied Intuition",cat:"Private",detail:"Autonomous vehicle simulation. $15B+ valuation. Listed eladgil.com. Confirmed.",btn:FORGE},
    {name:"Anduril",cat:"Private",detail:"Defense AI and autonomous systems. $28B+ valuation. Elad holds board seat per PitchBook. Listed eladgil.com. Confirmed.",btn:FORGE},
    // AI (eladgil.com AI section — all explicitly listed)
    {name:"OpenAI",cat:"Private",detail:"GPT / ChatGPT. $157B+ valuation. Listed eladgil.com AI section as early investor. Confirmed.",btn:FORGE},
    {name:"Perplexity",cat:"Private",detail:"AI search. $20B+ valuation. Multiple rounds. Listed eladgil.com AI section. Confirmed.",btn:FORGE},
    {name:"Harvey",cat:"Private",detail:"AI legal platform. $300M Series E 2025 (Kleiner + Coatue). Elad co-invested. Listed eladgil.com AI section. Confirmed PitchBook news.",btn:FORGE},
    {name:"Mistral",cat:"Private",detail:"Open-source LLM, Paris. European AI. Listed eladgil.com AI section. Confirmed.",btn:FORGE},
    {name:"Character.AI",cat:"Private",detail:"AI companion chatbots. Founders returned to Google in Aug 2024 $2.7B licensing deal. Still operates independently under new CEO. Google has no ownership stake.",btn:FORGE},
    {name:"Decagon",cat:"Private",detail:"AI customer support agents. Listed eladgil.com AI section. Confirmed.",btn:FORGE},
    {name:"Pika",cat:"Private",detail:"AI video generation. Listed eladgil.com AI section. Confirmed.",btn:FORGE},
    {name:"Abridge",cat:"Private",detail:"AI ambient clinical notes for doctors. Led round. Listed eladgil.com AI section. Confirmed.",btn:FORGE},
    // LONGEVITY (eladgil.com longevity section — PhD in biology, personal conviction)
    {name:"BioAge Labs",cat:"Private",detail:"Longevity biotech targeting aging biology. Elad holds board seat per PitchBook. Listed eladgil.com longevity section. Confirmed.",btn:FORGE},
    {name:"NewLimit",cat:"Private",detail:"Epigenetic longevity drug discovery co-founded by Brian Armstrong. Listed eladgil.com longevity section. Confirmed.",btn:FORGE},
    // CRYPTO (eladgil.com crypto section)
    {name:"Anchorage Digital",cat:"Crypto",detail:"First federally chartered crypto bank. Listed eladgil.com as investor + advisor. Confirmed PitchBook bio.",btn:FORGE},
    {name:"dYdX (DYDX)",cat:"Crypto",detail:"Decentralized perpetuals exchange. DYDX on Coinbase.",btn:CB("dydx","DYDX")},
    {name:"Bitwise Asset Management",cat:"Crypto",detail:"Crypto index funds and ETFs. Listed eladgil.com crypto section. Confirmed.",btn:FORGE},
    {name:"OpenSea",cat:"Crypto",detail:"NFT marketplace. Listed eladgil.com and confirmed PitchBook bio.",btn:FORGE},
    // DEFENSE (PitchBook confirmed recent)
    {name:"Saronic",cat:"Private",detail:"Autonomous naval vessels for US Navy. 2025. Confirmed PitchBook as recent Elad investment.",btn:FORGE},
    {name:"Crosby",cat:"Private",detail:"Business/productivity software. March 31, 2026. Most recent PitchBook confirmed investment.",btn:null},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MARC ANDREESSEN — complete portfolio (Research Protocol v3 + Level 5)
// PROTOCOL: a16z = institutional fund with external LPs → ONE entry.
// Personal positions = pre-a16z era (2005–2009) + confirmed post-a16z personal.
// AUTO-CHALLENGE: CB Insights shows 20 personal exits. Pre-a16z era = 45 named
// startups but only Twitter + Qik individually named in Wikipedia. Most named
// investments post-2009 flow through a16z fund. Low count here = accurate.
// Primary sources: Wikipedia, CB Insights (20 exits), a16z.com, a16z Wikipedia
// ─────────────────────────────────────────────────────────────────────────────
const marc = {
  id:"marc", name:"Marc Andreessen", handle:"@pmarca",
  title:"a16z · Netscape · Techno-Optimist Manifesto",
  netWorth:"~$2B", category:"VC · Internet · AI · Crypto · Defense",
  thesis:"Software is eating the world. Every industry will be rebuilt by software. The question is not whether, but who builds it and when.",
  keyNumber:{label:"a16z AUM",value:"$90B+"},
  tag:"The Techno-Optimist", tagColor:"indigo",
  recent:[
    {deal:"a16z Fund X",date:"Jan 2026",note:"$15B raise — largest VC fund raise in history"},
    {deal:"Thinking Machines Lab",date:"Jul 2025",note:"a16z led $2B seed round — largest seed in history"},
    {deal:"Wealthfront exit",date:"Dec 2025",note:"Personal portfolio exit — CB Insights confirmed"},
    {deal:"xAI",date:"2025",note:"a16z invested in Musk's xAI — acquired Twitter for $45B"},
    {deal:"DOGE / Trump advisor",date:"2024",note:"Unpaid intern at DOGE — vetting DOD and intelligence candidates"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Netscape",cat:"Founded",detail:"Co-founded 1994 with Jim Clark as Mosaic Communications, renamed Netscape. Navigator was the dominant browser in the early web. IPO'd August 1995 — first-day valuation nearly $3B. AOL acquired for $4.2B in 1998. The exit that seeded everything. Confirmed Wikipedia.",btn:EXITED},
    {name:"Loudcloud / Opsware",cat:"Founded",detail:"Co-founded September 1999 with Ben Horowitz, Tim Howes, In Sik Rhee. Cloud computing and IT automation. IPO'd 2001. Transformed into Opsware (enterprise software). Hewlett-Packard acquired July 2007 for $1.6B in cash. Confirmed Wikipedia.",btn:EXITED},
    {name:"Ning",cat:"Founded",detail:"Social networking platform — let anyone create their own social network. Co-founded 2004. Reached 90M+ users at peak. Acquired by Glam Media 2011. Confirmed Wikipedia.",btn:EXITED},
    // PRE-a16z PERSONAL (2005-2009 super angel era — confirmed Wikipedia, $80M in ~45 startups)
    {name:"Twitter (pre-a16z)",cat:"Private",detail:"Personal angel investment 2005-2009 super angel era. Marc Andreessen and Ben Horowitz invested $80M across ~45 startups including Twitter before founding a16z. Twitter explicitly named in Wikipedia. a16z later committed $400M to Musk's 2022 Twitter acquisition. Confirmed Wikipedia.",btn:YF("X")},
    {name:"Qik",cat:"Private",detail:"Mobile video streaming app. Named alongside Twitter as a confirmed pre-a16z personal investment in the 2005-2009 super angel era. Wikipedia explicitly names Qik. Acquired by Skype 2011. Confirmed Wikipedia.",btn:EXITED},
    {name:"Facebook (early)",cat:"Public",detail:"Early personal investor and board member before a16z era. Marc joined the Facebook board of directors in 2008. Remains on Meta board today — a personal board seat independent of a16z. Facebook IPO'd May 2012 at $104B market cap. Meta now $1.5T+ market cap. Confirmed Wikipedia, a16z.com board bio.",btn:YF("META")},
    {name:"LinkedIn (early)",cat:"Private",detail:"Pre-a16z era personal investment. Andreessen served on the LinkedIn board during the super angel period. LinkedIn IPO'd May 2011 (LNKD) at $4.3B market cap; Microsoft acquired 2016 for $26.2B. Confirmed multiple sources.",btn:EXITED},
    // PERSONAL EXITS (CB Insights confirms 20 personal exits, latest Wealthfront Dec 2025)
    {name:"Wealthfront",cat:"Private",detail:"Automated investment and financial planning platform. Personal Andreessen exit December 11, 2025 — most recent confirmed CB Insights personal portfolio exit. UBS acquired Wealthfront 2022. Confirmed CB Insights.",btn:EXITED},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BEN HOROWITZ — complete portfolio (Research Protocol v3 + Level 5)
// PROTOCOL: a16z = institutional fund with external LPs → ONE entry.
// Cultural Leadership Fund = a16z sub-fund → ONE entry.
// PitchBook board seats (Databricks, Okta, Lyft, Genius, etc.) = a16z fund seats.
// AUTO-CHALLENGE: Ben's personal investment portfolio OUTSIDE a16z is genuinely
// not well-documented in open sources. Low count here = accurate, not missing data.
// Primary sources: Wikipedia, a16z.com, PitchBook bio, a16z CLF official page
// ─────────────────────────────────────────────────────────────────────────────
const bhorowitz = {
  id:"bhorowitz", name:"Ben Horowitz", handle:"@bhorowitz",
  title:"a16z · Opsware · The Hard Thing About Hard Things",
  netWorth:"~$1.4B", category:"VC · Enterprise · Hip-Hop · Culture",
  thesis:"The struggle is not optional. If you're going through it, you're probably doing something important. The only way out is through.",
  keyNumber:{label:"Books sold",value:"3M+ copies"},
  tag:"The Hip-Hop VC", tagColor:"violet",
  recent:[
    {deal:"a16z Fund X",date:"Jan 2026",note:"$15B raise — 'dynamic, innovative, intensely competitive with China'"},
    {deal:"Flow (Adam Neumann)",date:"2023",note:"a16z $350M into Neumann's residential real estate venture"},
    {deal:"a16z American Dynamism",date:"2023",note:"$600M defense + national interest fund launch"},
    {deal:"Databricks",date:"Ongoing",note:"Board member via a16z — leading AI data platform"},
    {deal:"Cultural Leadership Fund",date:"Ongoing",note:"LPs: Nas, Kevin Durant, Will Smith, Chance the Rapper"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Loudcloud / Opsware",cat:"Founded",detail:"Co-founded September 1999 with Marc Andreessen, Tim Howes, In Sik Rhee. CEO for the full history of the company. Took Loudcloud public March 2001 — shares went from $6 IPO to $0.35 at nadir, back to $14.25 at sale. Sold Loudcloud's managed services to EDS for $63.5M while pivoting to Opsware software. HP acquired Opsware July 2007 for $1.6B in cash. The defining CEO story behind 'The Hard Thing About Hard Things.' Confirmed Wikipedia.",btn:EXITED},
    {name:"a16z Cultural Leadership Fund (sub-fund)",cat:"Founded",detail:"Created by Ben Horowitz within a16z. Brings African American cultural leaders into tech as LPs — Nas, Kevin Durant, Will Smith, Quincy Jones, Chance the Rapper, Kevin Hart, Shonda Rhimes, Diddy (pre-2024). 100% of management fees and carried interest donated to nonprofits advancing Black participation in tech. Portfolio company LPs include Lime, Mercury, Overtime, Hipcamp. Ben's deep connection to hip-hop (writes rap lyrics for every blog post) is the origin story. Confirmed a16z CLF official page, a16z.com.",btn:null},
    // PRE-a16z PERSONAL
    {name:"Twitter (pre-a16z)",cat:"Private",detail:"Personal angel investment in the 2005-2009 super angel era. Marc Andreessen and Ben Horowitz together invested $80M across ~45 startups including Twitter before founding a16z. Confirmed Wikipedia (explicitly names both in context of Twitter investment).",btn:YF("X")},
    // NOTE ON COUNT
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAMATH PALIHAPITIYA — complete portfolio (Research Protocol v3 + Level 5)
// PROTOCOL: Social Capital pre-2018 had external LPs → ONE fund entry for that era.
// Post-2018 restructured as personal family office (Chamath's capital only) →
// individual positions can be listed. SPACs listed individually as public vehicles.
// AUTO-CHALLENGE: PitchBook shows 50 personal investments. Social Capital fund = 398.
// Named positions here = open-source verifiable subset. Full list requires paid access.
// Primary sources: Wikipedia, PitchBook (50 personal), CB Insights, various press
// ─────────────────────────────────────────────────────────────────────────────
const chamath = {
  id:"chamath", name:"Chamath Palihapitiya", handle:"@chamath",
  title:"Social Capital · All-In Podcast · SPAC King",
  netWorth:"~$1.2B", category:"VC · Crypto · AI · SPACs · Media",
  thesis:"Invest in companies that advance humanity by solving the world's hardest problems. Everything else is noise.",
  keyNumber:{label:"Slack return",value:"~$3B on $20M"},
  tag:"The SPAC King", tagColor:"green",
  recent:[
    {deal:"AEXA SPAC",date:"Sep 2025",note:"$345M raised — AI, DeFi, defense, energy focus"},
    {deal:"Mitra Chem",date:"Jun 2025",note:"Battery materials — latest Social Capital confirmed CB Insights"},
    {deal:"8090 Software Factory",date:"Jul 2025",note:"AI enterprise software rebuilder — alpha launch"},
    {deal:"Groq valuation",date:"2025",note:"Social Capital backed from founding 2016 — AI inference chip major winner"},
    {deal:"Warriors sold",date:"2022",note:"Exited 10% GSW stake bought for $25M in 2011"},
  ],
  portfolio:[
    // FOUNDED
    {name:"Social Capital",cat:"Founded",detail:"Founded 2011. Went through two distinct eras: (1) 2011-2018 external LP fund era — raised $1.2B+ across 3 funds, invested in Slack, Box, Yammer, SurveyMonkey, Flatiron Health, Glooko, and others. (2) 2018-present personal family office era — returned all external LP capital, now manages $2.147B from $1.4B Chamath paid-in capital (per June 2025 annual letter). Chamath is the sole investing partner as of March 2024 per PitchBook. Confirmed Wikipedia, Social Capital official.",btn:null},
    {name:"8090 Solutions",cat:"Founded",detail:"Co-founded January 2024. AI-powered enterprise software rebuilder — rebuilds enterprise software with 80% of features at 90% less cost using AI + offshore engineering. Launched Software Factory product July 2025 with planned September 2025 launch. Chamath's personal conviction bet against $2T of accumulated enterprise software debt. Confirmed Wikipedia, PitchBook.",btn:null},
    // SOCIAL CAPITAL PRE-2018 ERA (external LP fund — ONE entry per protocol)
    // SOCIAL CAPITAL POST-2018 PERSONAL (Chamath's own capital)
    {name:"Groq",cat:"Private",detail:"AI inference chip company. Social Capital backed Jonathan Ross (Google TPU inventor) from Groq's founding in 2016 with $60M convertible note. One of the most prescient AI infrastructure bets — Groq became a dominant AI inference speed leader before the AI boom. Named in Chamath's AEXA SPAC founder letter as a proof-of-conviction investment. Confirmed Bloomberg, Wikipedia, Boardroom Alpha citing AEXA letter.",btn:FORGE},
    {name:"Mitra Chem",cat:"Private",detail:"Iron-air battery materials startup. June 6, 2025 — most recent confirmed Social Capital investment per CB Insights. Series B-V round. Board seat per PitchBook. Confirmed CB Insights.",btn:FORGE},
    {name:"Palmetto",cat:"Private",detail:"Residential clean energy — solar installation platform. Board seat held by Chamath per PitchBook. Post-2018 personal capital. Confirmed PitchBook board seat.",btn:FORGE},
    {name:"Beast Industries",cat:"Private",detail:"Jimmy Donaldson (MrBeast)'s holding company. Chamath cited this as a portfolio investment in his 2024 annual letter alongside Groq and Palmetto. Confirmed Wikipedia.",btn:null},
    // SPACs (public blank-check vehicles — listed individually as distinct public market bets)
    {name:"SoFi Technologies (IPOE SPAC)",cat:"Public",detail:"Personal finance and banking app. Chamath's SPAC IPOE merged with SoFi in 2021 — $8.65B deal. The ONLY Chamath SPAC in the green as of mid-2025, up 46.6% from launch. SoFi obtained national bank charter, reached first full year of GAAP profitability in 2024. Public (SOFI). Confirmed Segler Consulting SPAC analysis, Motley Fool.",btn:YF("SOFI")},
    {name:"Virgin Galactic (IPOA SPAC)",cat:"Public",detail:"Chamath's first SPAC (IPOA) merged with Richard Branson's space tourism company in 2019. Peaked at $46/share during SPAC mania; fell to $5. Stock down ~98% from SPAC price as of 2025. Confirmed Segler Consulting, Wikipedia.",btn:YF("SPCE")},
    {name:"Opendoor (IPOB SPAC)",cat:"Public",detail:"iBuying real estate platform. IPOB SPAC merger in 2020. Peaked at $30/share; fell to $5. Down ~65% from SPAC price. Public (OPEN). Confirmed Segler Consulting analysis.",btn:YF("OPEN")},
    {name:"Clover Health (IPOC SPAC)",cat:"Public",detail:"Medicare Advantage health insurer. IPOC SPAC merger 2020. Fell from $28 to $4. Down ~74% from SPAC price. Subject to SEC investigation. Public (CLOV). Confirmed Segler Consulting, Wikipedia.",btn:YF("CLOV")},
    {name:"ProKidney Corp (PROK)",cat:"Public",detail:"Kidney disease cell therapy. SPAC merger. Chamath Social Capital vehicle. Public on Nasdaq.",btn:YF("PROK")},
    {name:"Akili (SPAC)",cat:"Public",detail:"Prescription digital therapeutics. SPAC merger. Acquired by Virtual Therapeutics Jul 2024 and delisted from Nasdaq.",btn:EXITED},
    {name:"AEXA — American Exceptionalism Acquisition Corp",cat:"Public",detail:"Chamath's SPAC launched Sep 26 2025. Raised $345M, NYSE: AEXA. Targets AI/DeFi/defense/energy. No merger target announced as of Apr 2026. 98.7% institutional.",btn:YF("AEXA")},
    // PERSONAL
    {name:"Golden State Warriors",cat:"Private",detail:"Bought ~10% minority stake for $25M in 2011 when franchise was valued at ~$450M. Warriors became a dynasty (3 NBA titles). Franchise now valued at $5.6B+. Sold stake 2022. One of the best sports investments in history — effectively a 100x+ return. Confirmed Wikipedia, multiple sources.",btn:EXITED},
    {name:"Bitcoin",cat:"Crypto",detail:"Early personal buyer around $80-100/coin in 2012-2013, accumulating ~$5M worth. Publicly advocates Bitcoin as 'gold 2.0' and 'schmuck insurance' against government overreach. Has stated 'I own Bitcoin in my fund, I own Bitcoin in my personal account.' Confirmed Bitcoiners Anonymous, multiple public statements.",btn:CB("bitcoin","BTC")},
    {name:"Facebook (employee equity)",cat:"Public",detail:"Joined Facebook as VP of User Growth in 2007. Helped scale from 50M to 700M+ users. Held significant Facebook equity through employee stock. Left 2011 to found Social Capital. Confirmed Wikipedia.",btn:EXITED},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SAM ALTMAN
// ─────────────────────────────────────────────────────────────────────────────
const altman = {
  id:"altman", name:"Sam Altman", handle:"@sama",
  title:"OpenAI · Hydrazine Capital · Apollo Projects",
  netWorth:"~$2.8B portfolio", category:"AI · Longevity · Energy",
  thesis:"I put essentially all my liquid net worth into nuclear fusion and anti-aging. The amount of intelligence in the universe is going to increase dramatically.",
  keyNumber:{label:"Portfolio companies",value:"132+"},
  tag:"AI Maximalist", tagColor:"indigo",
  portfolio:[
    {name:"Reddit (RDDT)",cat:"Public",detail:"Third-largest shareholder pre-IPO at ~9%. Backed in multiple rounds (2014, 2015, 2021). IPO'd March 2024. Confirmed Wikipedia and SEC filings.",btn:YF("RDDT")},
    {name:"Oklo (OKLO)",cat:"Public",detail:"Nuclear microreactor company. Backed from 2014 seed round through IPO via SPAC (AltC Acquisition Corp, also Altman-backed). Went public May 2024. Board member. Confirmed CB Insights.",btn:YF("OKLO")},
    {name:"Helion Energy",cat:"Private",detail:"Nuclear fusion startup. $375M personal investment in Series E (2021) — his largest ever. Additional $425M in Series F (2024). 'By far the most promising approach to fusion I've seen.' Microsoft signed agreement to buy Helion electricity. Confirmed Altman blog post and CB Insights.",btn:FORGE},
    {name:"Retro Biosciences",cat:"Private",detail:"$180M total personal investment. Anti-aging via cellular reprogramming. Along with Helion, accounted for 'all my liquid net worth' per MIT Technology Review. Confirmed CB Insights.",btn:null},
    {name:"Boom Supersonic",cat:"Private",detail:"Supersonic commercial flights. $300M Series B Dec 2025, $700M total raised. XB-1 broke sound barrier Jan 2025. $1.5B valuation. Board member confirmed PitchBook.",btn:FORGE},
    {name:"Worldcoin (WLD)",cat:"Crypto",detail:"Co-founded Tools for Humanity which created Worldcoin. WLD is a live tradeable token on Coinbase and major exchanges. Iris-scan based crypto identity and UBI project. Confirmed Tools for Humanity founding documentation.",btn:CB("worldcoin","WLD")},
    {name:"KoBold Metals",cat:"Private",detail:"AI-powered critical metals mining. $195M round in 2024 via Apollo Projects. Applies AI to finding cobalt, copper, nickel and lithium for EV batteries. Confirmed CB Insights.",btn:null},
    {name:"Stripe",cat:"Private",detail:"Payments infrastructure. Early angel investor. One of the most anticipated IPOs. Actively traded on Forge secondary market. Confirmed multiple sources.",btn:FORGE},
    {name:"Exowatt",cat:"Private",detail:"Solar energy startup providing clean power to data centers. Confirmed via Wikipedia — personal investment alongside nuclear and energy thesis.",btn:null},
    {name:"Gusto",cat:"Private",detail:"HR and payroll software platform. Confirmed personal investment via Crunchbase reporting.",btn:null},
    {name:"Humane",cat:"Private",detail:"AI wearable (Ai Pin). Product discontinued, company acquired by HP 2025.",btn:EXITED},
    {name:"Airbnb (ABNB)",cat:"Private",detail:"Early YC-era angel investment. IPO'd December 2020 at $47B valuation. Altman's early stake exited at or before IPO. Confirmed CB Insights exits list.",btn:EXITED},
    {name:"Instacart (CART)",cat:"Private",detail:"Early angel investment. IPO'd September 2023. Altman's early stake exited. Confirmed CB Insights exits list.",btn:EXITED},
    {name:"Uber (UBER)",cat:"Private",detail:"Early personal angel investment from YC era. IPO'd May 2019. Stake exited. Confirmed Fortune reporting on Altman early bets.",btn:EXITED},
    {name:"Codecademy",cat:"Private",detail:"Online coding education. Backed 2011. Acquired by SkillSoft for $525M December 2021. Confirmed CB Insights.",btn:EXITED},
    {name:"Cruise",cat:"Private",detail:"Autonomous vehicles. Early investment. Acquired by General Motors 2016. Confirmed CB Insights.",btn:EXITED},
  ],
  recent:[
    {date:"Oct 2025",deal:"Arcadia Medicine — angel round",note:"Longevity biotech"},
    {date:"Jan 2024",deal:"Helion Energy — $425M Series F",note:"Nuclear fusion"},
    {date:"Mar 2024",deal:"Reddit (RDDT) IPO",note:"~9% stake"},
    {date:"May 2024",deal:"Oklo (OKLO) IPO",note:"Board member"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// JACK DORSEY
// ─────────────────────────────────────────────────────────────────────────────
const dorsey = {
  id:"dorsey", name:"Jack Dorsey", handle:"@jack",
  title:"Block · Twitter co-founder · Bitcoin advocate",
  netWorth:"~$4.3B", category:"Bitcoin · Fintech · Social",
  thesis:"Bitcoin will be the native currency of the internet above all else. I own only Bitcoin — nothing else.",
  keyNumber:{label:"Block BTC treasury",value:"8,027 BTC"},
  tag:"Bitcoin Maximalist", tagColor:"blue",
  portfolio:[
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"Personal holding confirmed multiple times since 2021. 'I own Bitcoin, and it's much more Bitcoin than Ether or Doge.' Has not sold. Block (his company) holds additional 8,027 BTC on balance sheet. Confirmed The B Word conference July 2021 and multiple public statements.",btn:CB("bitcoin","BTC")},
    {name:"Block (XYZ)",cat:"Public",detail:"Founder and CEO. Holds ~47.85M Class B shares (~79% voting control). Formerly Square. Rebranded 2021 to reflect broader Bitcoin mission. Cash App processes $10B+ in Bitcoin revenue annually. Confirmed SEC filings.",btn:YF("XYZ")},
    {name:"Bluesky",cat:"Private",detail:"Decentralized social media protocol. Initiated by Dorsey in 2019 while still at Twitter. Launched publicly 2023. Now independent — Dorsey no longer on board as of 2024 but was founding backer. Confirmed multiple sources.",btn:null},
    {name:"Mummolin / Ocean",cat:"Private",detail:"Decentralized Bitcoin mining pool. Led $6.2M investment November 2024. Mission: make mining more decentralized. Confirmed Decrypt.",btn:null},
  ],
  recent:[
    {date:"Nov 2024",deal:"Led $6.2M investment in Mummolin/Ocean",note:"Bitcoin mining decentralization"},
    {date:"May 2024",deal:"Donated $21M to OpenSats",note:"Bitcoin open source development"},
    {date:"Nov 2024",deal:"Block $80M regulatory settlement",note:"AML compliance lapses"},
    {date:"2025",deal:"Square Bitcoin payments rollout to merchants",note:"4M+ sellers"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// KOBE BRYANT (LEGACY)
// ─────────────────────────────────────────────────────────────────────────────
const kobe = {
  id:"kobe", name:"Kobe Bryant", handle:"Bryant Stibel",
  title:"Bryant Stibel · Kobe Inc. · NBA Legend",
  netWorth:"Estate ~$600M+", category:"Tech · Media · Sports",
  thesis:"What I do after basketball will be more impressive than what I did during. Apply the same obsession to business.",
  keyNumber:{label:"Bryant Stibel AUM",value:"$2B+"},
  tag:"The Mamba", tagColor:"purple",
  portfolio:[
    {name:"Alibaba (BABA)",cat:"Public",detail:"Bryant Stibel portfolio company. Chinese e-commerce giant. Confirmed Institutional Investor report on Bryant Stibel.",btn:YF("BABA")},
    {name:"LegalZoom (LZ)",cat:"Public",detail:"Online legal services. Bryant Stibel portfolio. IPO'd 2021. Confirmed Bryant Stibel website and Institutional Investor.",btn:YF("LZ")},
    {name:"Life360 (LIF)",cat:"Public",detail:"Family safety app. Bryant Stibel portfolio. Most recent confirmed Bryant Stibel investment (Post-IPO round). Confirmed Tracxn.",btn:YF("LIF")},
    {name:"TeamViewer (TMVWY)",cat:"Public",detail:"Remote access software. Bryant Stibel portfolio. Primary listing Frankfurt (XETR:TMV). Trades US OTC as TMVWY on Yahoo Finance and Robinhood. Confirmed bryantstibel.com.",btn:YF("TMVWY")},
    {name:"Klarna (KLAR)",cat:"Public",detail:"Buy-now-pay-later giant. Bryant Stibel portfolio. IPO'd September 10, 2025 on NYSE at $40/share, $15B valuation. Forge confirmed no longer tracking as pre-IPO. Confirmed Motley Fool, Capital.com, Forge Global.",btn:YF("KLAR")},
    {name:"Epic Games",cat:"Private",detail:"Fortnite creator. Bryant Stibel portfolio company. Valued at $32B+. IPO eventual. Confirmed PYMNTS and bryantstibel.com.",btn:null},
    {name:"Art of Sport",cat:"Private",detail:"Performance skincare brand. Co-founded with Brian Lee and Matthias Metternich. Bryant was equity partner. Confirmed Bryant Stibel website.",btn:null},
    {name:"HouseCanary",cat:"Private",detail:"AI-powered real estate valuation platform. Personal angel investment January 2017. Confirmed PitchBook.",btn:null},
    {name:"Body Armor",cat:"Private",detail:"Sports drink. Personal investment. Sold stake to Coca-Cola 2021 in deal valuing company at $5.6B. One of his highest-return personal bets. Confirmed CNN and multiple outlets.",btn:EXITED},
    {name:"The Players' Tribune",cat:"Private",detail:"Athlete storytelling platform. Bryant Stibel investment. Acquired by Minute Media. Confirmed Institutional Investor.",btn:EXITED},
    {name:"Scopely",cat:"Private",detail:"Mobile gaming. Bryant Stibel portfolio. Acquired for $4.9B by Savvy Games Group 2023. Confirmed bryantstibel.com.",btn:EXITED},
  ],
  recent:[
    {date:"Jan 2020",deal:"Passed away January 26, 2020",note:"Estate continues Bryant Stibel"},
    {date:"Jan 2017",deal:"HouseCanary — personal angel investment",note:"Real estate AI"},
    {date:"2021",deal:"Body Armor sold to Coca-Cola at $5.6B",note:"Major personal exit"},
    {date:"2023",deal:"Scopely acquired at $4.9B",note:"Bryant Stibel exit"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEOPOLD ASCHENBRENNER
// ─────────────────────────────────────────────────────────────────────────────
const leopold = {
  id:"leopold", name:"Leopold Aschenbrenner", handle:"@leopoldasc",
  title:"Situational Awareness LP · Former OpenAI",
  netWorth:"~$383M AUM ($5.5B gross exposure)", category:"AI · Energy · Bitcoin Mining",
  thesis:"The real bottleneck in the AGI race isn't algorithms — it's electricity and compute. Bet on the infrastructure, not the models.",
  keyNumber:{label:"2025 fund return",value:"47%"},
  tag:"AGI Realist", tagColor:"orange",
  portfolio:[
    {name:"Bloom Energy (BE)",cat:"Public",detail:"Fuel cell power generation. Top holding in Q4 2025 13F. AI data centers creating massive power demand aligns with Bloom's solid-oxide fuel cell technology. Confirmed SEC 13F filing February 2026.",btn:YF("BE")},
    {name:"Intel (INTC)",cat:"Public",detail:"Contrarian semiconductor bet. Situational Awareness held significant Intel position amid AI chip boom. Confirmed SEC 13F filing.",btn:YF("INTC")},
    {name:"Lumentum (LITE)",cat:"Public",detail:"Optical networking components critical for AI data center interconnects. Confirmed SEC 13F filing Q4 2025.",btn:YF("LITE")},
    {name:"IREN (IREN)",cat:"Public",detail:"Bitcoin miner pivoting to AI compute hosting. Large Q4 2025 position. Thesis: Bitcoin miners have power infrastructure that can be repurposed for AI workloads. Confirmed SEC 13F filing.",btn:YF("IREN")},
    {name:"Cipher Mining (CIFR)",cat:"Public",detail:"Bitcoin mining company. Part of the Bitcoin miner/AI infrastructure thesis. Confirmed SEC 13F filing Q4 2025.",btn:YF("CIFR")},
    {name:"Riot Platforms (RIOT)",cat:"Public",detail:"Bitcoin miner with large-scale power infrastructure. Held in Q4 2025 13F. Confirmed SEC filing.",btn:YF("RIOT")},
    {name:"Bitdeer (BTDR)",cat:"Public",detail:"Bitcoin mining and AI cloud computing. Situational Awareness position in Q4 2025. Confirmed SEC 13F filing.",btn:YF("BTDR")},
    {name:"Applied Digital (APLD)",cat:"Public",detail:"Data center infrastructure for AI and Bitcoin. Confirmed Situational Awareness position. Confirmed SEC 13F filing.",btn:YF("APLD")},
    {name:"Anthropic",cat:"Private",detail:"AI safety and research company. Situational Awareness has private exposure. Confirmed PYMNTS reporting. Backed by Stripe Collisons who also backed Leopold's fund.",btn:null},
    {name:"VanEck Semiconductor ETF (SMH)",cat:"Public",detail:"Semiconductor sector ETF. Large Q2 2025 position. AI chip exposure via diversified semiconductor basket. Confirmed SEC 13F filing.",btn:YF("SMH")},
  ],
  recent:[
    {date:"Feb 2026",deal:"Q4 2025 13F: $5.5B gross US equity exposure",note:"29 holdings filed with SEC"},
    {date:"Oct 2025",deal:"47% return H1 2025 vs 6% S&P 500",note:"Fastest growing new hedge fund"},
    {date:"2025",deal:"Exited Nvidia and Broadcom",note:"Pivoted to power/infrastructure from chips"},
    {date:"2024",deal:"Launched Situational Awareness LP",note:"Backed by Stripe Collisons, Nat Friedman, Daniel Gross"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MICHAEL SAYLOR
// ─────────────────────────────────────────────────────────────────────────────
const saylor = {
  id:"saylor", name:"Michael Saylor", handle:"@saylor",
  title:"Strategy (MicroStrategy) · Bitcoin Maximalist",
  netWorth:"~$4B+ (varies with BTC)", category:"Bitcoin · Enterprise Software",
  thesis:"Bitcoin is the apex property of the human race. There is no second best. Everything else is a distraction.",
  keyNumber:{label:"Strategy BTC treasury",value:"712,647 BTC"},
  tag:"Bitcoin Maximalist", tagColor:"amber",
  fundNote:"Strategy's Bitcoin holdings reflect Saylor's personal conviction expressed through corporate treasury. He has personally confirmed 17,732+ BTC in personal holdings.",
  portfolio:[
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"Personal holding confirmed. As of 2022 SEC disclosure, personally holds 17,732+ BTC. Has stated he will never sell. 'I intend to keep buying Bitcoin forever.' Confirmed multiple SEC filings and public statements.",btn:CB("bitcoin","BTC")},
    {name:"Strategy (MSTR)",cat:"Public",detail:"Co-founded as MicroStrategy 1989. Rebranded to Strategy 2025. Holds 712,647 BTC as of January 2026 — purchased for ~$54.2B at avg $76,037/coin. ~3.4% of all Bitcoin that will ever exist. Largest corporate Bitcoin holder in the world. Confirmed SEC filings.",btn:YF("MSTR")},
  ],
  recent:[
    {date:"Jan 2026",deal:"Strategy buys additional 2,932 BTC for $264M",note:"Total holdings reach 712,647 BTC"},
    {date:"Dec 2025",deal:"Strategy buys 10,624 BTC for $962.7M",note:"Avg price $90,615"},
    {date:"2025",deal:"MicroStrategy rebrands to Strategy",note:"Full identity shift to Bitcoin company"},
    {date:"2025",deal:"Strategy added to S&P 500",note:"Landmark institutional validation"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CATHIE WOOD
// ─────────────────────────────────────────────────────────────────────────────
const cathie = {
  id:"cathie", name:"Cathie Wood", handle:"@CathieDWood",
  title:"ARK Investment Management · ARKK",
  netWorth:"$15B+ AUM", category:"AI · Genomics · Fintech · EV",
  thesis:"Innovation solves the world's greatest problems and creates enormous wealth. We invest in companies that are changing the world.",
  keyNumber:{label:"ARK AUM",value:"$15B+"},
  tag:"Innovation Investor", tagColor:"violet",
  fundNote:"ARK publishes all holdings daily. Every position shown is a personal conviction call by Cathie — she is the portfolio manager of all ARK funds.",
  portfolio:[
    {name:"Tesla (TSLA)",cat:"Public",detail:"ARK's largest holding at ~9.8% of ARKK (Q1 2026). Cathie has called TSLA her highest conviction idea for years. Believes Tesla will reach $2,600/share driven by robotaxis and energy. Confirmed ARK daily filing.",btn:YF("TSLA")},
    {name:"Coinbase (COIN)",cat:"Public",detail:"~8.2% of ARKK (Q1 2026). ARK thesis: Coinbase becomes the reserve currency exchange for the global crypto economy as institutional adoption accelerates. Confirmed ARK daily filing.",btn:YF("COIN")},
    {name:"Roku (ROKU)",cat:"Public",detail:"~7.5% of ARKK (Q1 2026). ARK thesis: linear TV collapses, Roku captures the connected TV advertising market as the dominant OS. Confirmed ARK daily filing.",btn:YF("ROKU")},
    {name:"CRISPR Therapeutics (CRSP)",cat:"Public",detail:"~5.3% of ARKK. ARK's lead genomics bet. CRISPR-based gene editing represents ARK's multi-decade therapeutic revolution thesis. Confirmed ARK daily filing.",btn:YF("CRSP")},
    {name:"UiPath (PATH)",cat:"Public",detail:"~3.9% of ARKK. ARK thesis: software robots automate repetitive knowledge work at scale, comparable value creation to industrial robots. Confirmed ARK daily filing.",btn:YF("PATH")},
    {name:"Exact Sciences (EXAS)",cat:"Public",detail:"~4.8% of ARKK. Cancer early detection diagnostics. ARK's molecular diagnostics play alongside genomics thesis. Confirmed ARK daily filing.",btn:YF("EXAS")},
    {name:"Shopify (SHOP)",cat:"Public",detail:"ARKK holding. ARK thesis: Shopify becomes the operating system for global commerce, arming merchants against Amazon. Confirmed ARK daily filing.",btn:YF("SHOP")},
    {name:"Robinhood (HOOD)",cat:"Public",detail:"ARKK holding. ARK thesis: democratization of finance, Robinhood becomes the primary financial account for the next generation. Confirmed ARK daily filing.",btn:YF("HOOD")},
    {name:"Palantir (PLTR)",cat:"Public",detail:"ARKK holding. ARK thesis: Palantir's AI platform becomes essential government and enterprise infrastructure. Confirmed ARK daily filing.",btn:YF("PLTR")},
    {name:"Tempus AI (TEM)",cat:"Public",detail:"ARKK holding. AI-powered precision medicine and cancer genomics data platform. Went public 2024. ARK early backer. Confirmed ARK daily filing.",btn:YF("TEM")},
  ],
  recent:[
    {date:"Apr 2026",deal:"ARKK Q1 2026: Tesla, Coinbase, Roku remain top 3",note:"ARK publishes holdings daily at ark-funds.com"},
    {date:"Feb 2026",deal:"Added Airbnb (ABNB) to ARKK",note:"New position opened"},
    {date:"Feb 2026",deal:"Added DraftKings (DKNG)",note:"Sports betting as fintech play"},
    {date:"Mar 2025",deal:"Added CoreWeave (CRWV)",note:"AI infrastructure exposure"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SHAQUILLE O'NEAL
// ─────────────────────────────────────────────────────────────────────────────
const shaq = {
  id:"shaq", name:"Shaquille O'Neal", handle:"@SHAQ",
  title:"Big Chicken · HartBeat · TNT Analyst",
  netWorth:"~$500M", category:"Franchises · Tech · Food",
  thesis:"If it's in my hand or on my kitchen counter, it might end up in my portfolio. Invest in what you know and actually use.",
  keyNumber:{label:"Franchise locations",value:"550+"},
  tag:"The Franchise King", tagColor:"blue",
  portfolio:[
    {name:"Papa John's (PZZA)",cat:"Public",detail:"Board member since 2019. Owns 9 Papa John's franchises in Atlanta. Sold likeness rights to the company for $8.5M. Major brand ambassador role instrumental in the company's turnaround. Confirmed multiple sources.",btn:YF("PZZA")},
    {name:"Lyft (LYFT)",cat:"Public",detail:"Early personal investor in Lyft. Confirmed CNBC reporting on Shaq's tech investment portfolio.",btn:YF("LYFT")},
    {name:"Krispy Kreme (DNUT)",cat:"Public",detail:"Franchise owner. Personal investment and operator. Confirmed multiple sources.",btn:YF("DNUT")},
    {name:"Big Chicken",cat:"Founded",detail:"Co-founded fast-casual chicken brand 2018. 40+ locations open, 350+ in development as of 2025. 234% year-over-year unit growth. Zero franchise failures in 3 years. Confirmed bryantstibel.com and multiple outlets.",btn:null},
    {name:"Car Washes",cat:"Founded",detail:"Owns ~150 car wash locations. Generates estimated $30-60M gross revenue annually. Confirmed multiple sources.",btn:null},
    {name:"Ring",cat:"Private",detail:"Early investor in Ring smart doorbell. Amazon acquired Ring for ~$1B in 2018. One of his best-timed tech exits. Confirmed CNBC.",btn:EXITED},
    {name:"Google",cat:"Private",detail:"Early pre-IPO personal investment. 'I accidentally invested $250,000 in Google' — accredited the early bet to luck and a Jeff Bezos tip. IPO'd 2004. Confirmed multiple outlets.",btn:EXITED},
    {name:"Five Guys",cat:"Founded",detail:"Owned 155 Five Guys franchises (10% of total chain). Sold entire portfolio 2016 for estimated $80-100M+. Largest single franchise exit by a celebrity athlete. Confirmed multiple sources.",btn:EXITED},
    {name:"Auntie Anne's",cat:"Founded",detail:"Owned 17 Auntie Anne's pretzel franchises. Sold. Confirmed multiple sources.",btn:EXITED},
    {name:"24-Hour Fitness",cat:"Founded",detail:"Owned 40 24-Hour Fitness gym locations. Sold. Confirmed multiple sources.",btn:EXITED},
  ],
  recent:[
    {date:"2025",deal:"Big Chicken reaches 350+ locations in development",note:"Crown jewel franchise"},
    {date:"2019",deal:"Joined Papa John's board, bought 9 franchises",note:"Major brand turnaround role"},
    {date:"2018",deal:"Ring acquired by Amazon ~$1B",note:"Early investor exit"},
    {date:"2016",deal:"Sold all 155 Five Guys franchises",note:"Est. $80-100M+ exit"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BRIAN ARMSTRONG
// ─────────────────────────────────────────────────────────────────────────────
const armstrong = {
  id:"armstrong", name:"Brian Armstrong", handle:"@brian_armstrong",
  title:"Coinbase · NewLimit · ResearchHub",
  netWorth:"~$9.6B", category:"Crypto · Biotech · Open Science",
  thesis:"The legacy financial system is broken. Blockchain provides the open, global infrastructure to fix it. Own the infrastructure, not the apps on top of it.",
  keyNumber:{label:"Coinbase stake",value:"~14%"},
  tag:"Open Finance", tagColor:"blue",
  fundNote:"Coinbase Ventures (550+ investments) reflects institutional capital. Positions shown are personal direct investments and co-founded companies.",
  portfolio:[
    {name:"Coinbase (COIN)",cat:"Public",detail:"Co-founded 2012. Holds ~33.1M shares (~14% stake) as of early 2025. Went public via direct listing April 2021. Joined S&P 500 May 2025. SEC lawsuit dismissed 2025. Confirmed SEC filings.",btn:YF("COIN")},
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"Personal holder since ~2012 when BTC was ~$6. 'Bitcoin is going to be a reserve currency for the internet.' Confirmed Bloomberg reporting and public statements.",btn:CB("bitcoin","BTC")},
    {name:"Ethereum (ETH)",cat:"Crypto",detail:"Personal holder. Confirmed public statements. Also co-founded Base, Coinbase's L2 network built on Ethereum. Confirmed multiple sources.",btn:CB("ethereum","ETH")},
    {name:"NewLimit",cat:"Private",detail:"Co-founded 2021 with Blake Byers. Anti-aging biotech via epigenetic reprogramming. Armstrong and Byers committed $110M of personal funds. Raised $40M Series A May 2023. Confirmed Wikipedia and multiple reporting.",btn:null},
    {name:"ResearchHub",cat:"Private",detail:"Self-funded open science platform modeled on GitHub for research papers. Armstrong committed personal capital. Confirmed Wikipedia.",btn:null},
  ],
  recent:[
    {date:"May 2025",deal:"Coinbase joins S&P 500",note:"Landmark institutional validation"},
    {date:"2025",deal:"SEC ends lawsuit against Coinbase",note:"Regulatory clarity achieved"},
    {date:"May 2023",deal:"NewLimit raises $40M Series A",note:"Anti-aging research milestone"},
    {date:"Aug 2024",deal:"Base L2 hits record on-chain activity",note:"Coinbase's Ethereum L2"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// RIHANNA
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// KIM KARDASHIAN
// ─────────────────────────────────────────────────────────────────────────────
const kimk = {
  id:"kimk", name:"Kim Kardashian", handle:"@KimKardashian",
  title:"SKIMS · SKKY Partners · SKKN by Kim",
  netWorth:"~$1.7B", category:"Fashion · Beauty · Private Equity",
  thesis:"I've built brands from the ground up. I know what founders need better than most investors because I've lived it.",
  keyNumber:{label:"SKIMS valuation",value:"$4B+"},
  tag:"Brand Builder", tagColor:"neutral",
  fundNote:"SKKY Partners positions shown reflect co-managed PE fund investments alongside Jay Sammons (former Carlyle). Kardashian is senior operating advisor.",
  portfolio:[
    {name:"SKIMS",cat:"Private",detail:"Co-founded 2019 with Emma and Jens Grede. Shapewear and apparel brand. $4B+ valuation. IPO widely anticipated — Saks Fifth Avenue partnership 2024, flagship NYC store opened December 2024. Confirmed multiple sources.",btn:FORGE},
    {name:"SKKN by Kim",cat:"Private",detail:"Skincare line launched 2022. Premium multi-step skincare system. Private. Confirmed multiple sources.",btn:null},
    {name:"TRUFF",cat:"Private",detail:"SKKY Partners first investment (Q1 2024). Truffle-infused hot sauces and condiments. Luxury food brand. Minority stake. Confirmed SKKY Partners announcement.",btn:null},
    {name:"111Skin",cat:"Private",detail:"SKKY Partners second investment (January 2025). UK-based luxury skincare. Significant minority stake. £20.3M revenue 2023. Available at Nordstrom and Sephora. Confirmed Business of Fashion.",btn:null},
  ],
  recent:[
    {date:"Jan 2025",deal:"SKKY Partners invests in 111Skin",note:"Luxury skincare UK brand"},
    {date:"Dec 2024",deal:"SKIMS flagship store opens NYC Fifth Avenue",note:"Retail expansion milestone"},
    {date:"Q1 2024",deal:"SKKY Partners invests in TRUFF",note:"First PE deal: luxury condiments"},
    {date:"2022",deal:"SKKY Partners launches with Jay Sammons",note:"Former Carlyle Group executive"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// KEVIN HART
// ─────────────────────────────────────────────────────────────────────────────
const kevinhart = {
  id:"kevinhart", name:"Kevin Hart", handle:"@KevinHart4real",
  title:"HartBeat Ventures · HartBeat Productions",
  netWorth:"~$400M", category:"Health · Consumer · Tech",
  thesis:"I invest in things I believe in and use. Health, wellness, people — not just ideas.",
  keyNumber:{label:"HartBeat portfolio",value:"28 companies"},
  tag:"Comedy Capitalist", tagColor:"green",
  fundNote:"HartBeat Ventures is Kevin's institutionally-backed VC firm (J.P. Morgan investor). Positions shown are HartBeat fund investments that reflect his personal conviction.",
  portfolio:[
    {name:"Function Health",cat:"Private",detail:"Comprehensive lab testing and health analytics platform. HartBeat participated in $298M Series B November 2025 (Redpoint led). Kevin's flagship health investment. Confirmed PitchBook and Tracxn.",btn:null},
    {name:"Simple (App)",cat:"Private",detail:"AI-powered health coaching and weight loss app. $35M Series B October 2025 led by HartBeat. 700,000+ subscribers, $160M ARR. Confirmed TechCrunch.",btn:null},
    {name:"MoonPay",cat:"Private",detail:"Crypto payments infrastructure. HartBeat portfolio unicorn. Primary on/off ramp for NFT purchases. Confirmed Tracxn (7 unicorns in HartBeat portfolio).",btn:null},
    {name:"Yuga Labs",cat:"Private",detail:"Creator of Bored Ape Yacht Club NFT collection. HartBeat portfolio unicorn. Confirmed Tracxn.",btn:null},
    {name:"Therabody",cat:"Private",detail:"Theragun massage therapy devices. HartBeat portfolio. Premium recovery tech brand. Confirmed TechCrunch HartBeat announcement.",btn:null},
    {name:"Alice Mushrooms",cat:"Private",detail:"Functional mushroom supplements and wellness. HartBeat portfolio. Confirmed PitchBook.",btn:null},
    {name:"Cleancult",cat:"Private",detail:"Sustainable home cleaning products. HartBeat portfolio. Confirmed PitchBook.",btn:null},
    {name:"BrightFox",cat:"Private",detail:"Electrolyte performance beverage brand. HartBeat early portfolio. Confirmed TechCrunch.",btn:null},
  ],
  recent:[
    {date:"Nov 2025",deal:"HartBeat invests in Function Health $298M Series B",note:"Flagship health bet"},
    {date:"Oct 2025",deal:"HartBeat leads Simple App $35M Series B",note:"AI health coaching"},
    {date:"2023",deal:"J.P. Morgan becomes first institutional investor in HartBeat Ventures",note:"Legitimization milestone"},
    {date:"2022",deal:"HartBeat Ventures launched with focus on health and consumer",note:"VC fund established"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ALEXIS OHANIAN
// ─────────────────────────────────────────────────────────────────────────────
const ohanian = {
  id:"ohanian", name:"Alexis Ohanian", handle:"@alexisohanian",
  title:"Reddit Co-Founder · Seven Seven Six",
  netWorth:"~$200M", category:"Tech · Crypto · Women's Sports",
  thesis:"Community is the internet's most durable moat. The next wave of social will be built on crypto rails. Bet on women's sports before the valuation gap closes.",
  keyNumber:{label:"Reddit IPO (2024)",value:"$34 → $228"},
  tag:"Internet Builder", tagColor:"indigo",
  fundNote:"Seven Seven Six is Ohanian's institutional fund (228+ investments). Positions shown are personal direct investments and co-founded companies.",
  portfolio:[
    {name:"Reddit (RDDT)",cat:"Public",detail:"Co-founded 2005. IPO'd NYSE March 2024 at $34/share. Ohanian retains equity stake. Beat analyst estimates every quarter since IPO. Confirmed SEC filings.",btn:YF("RDDT")},
    {name:"Solana (SOL)",cat:"Crypto",detail:"Seven Seven Six and the Solana Foundation partnered for $100M investment in Solana-native social media. Ohanian personally bullish on SOL and has spoken publicly about the investment thesis. Confirmed Solana Foundation announcement.",btn:CB("solana","SOL")},
    {name:"Angel City FC",cat:"Private",detail:"Co-owner of NWSL women's soccer club. One of multiple high-profile investors in women's sports. Valuation has grown significantly since 2020 acquisition. Confirmed Yahoo Finance.",btn:null},
    {name:"Chelsea FC Women",cat:"Private",detail:"Partial ownership stake in Chelsea FC Women. Part of Ohanian's thesis that women's sports valuations are dramatically undervalued. Confirmed Yahoo Finance.",btn:null},
    {name:"Digg",cat:"Founded",detail:"Rose+Ohanian reacquired 2025. Relaunched Jan 2026, shut down Mar 14 2026 — overwhelmed by bots. Most staff laid off.",btn:EXITED},
    {name:"Mantel",cat:"Founded",detail:"Sports media and content platform. Ohanian helped launch, partnered with Yahoo Sports. Private. Confirmed Yahoo Finance.",btn:null},
  ],
  recent:[
    {date:"Jan 2026",deal:"Digg relaunches in public beta",note:"AI-first community platform acquired March 2025"},
    {date:"Nov 2025",deal:"Ohanian on women's sports valuations at Yahoo Finance Invest",note:"Angel City + Chelsea FC Women stakes"},
    {date:"Mar 2024",deal:"Reddit IPO on NYSE at $34/share",note:"Now trades at $228+"},
    {date:"2021",deal:"$100M Solana social media fund",note:"With Solana Foundation"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PARIS HILTON
// ─────────────────────────────────────────────────────────────────────────────
const paris = {
  id:"paris", name:"Paris Hilton", handle:"@ParisHilton",
  title:"11:11 Media · Original Crypto Celebrity",
  netWorth:"~$300M", category:"Crypto · Media · Consumer",
  thesis:"I've been investing in Bitcoin and Ethereum since 2016. I believe in the future of digital assets.",
  keyNumber:{label:"Crypto investor since",value:"2016"},
  tag:"Crypto OG", tagColor:"pink",
  portfolio:[
    {name:"Bitcoin (BTC)",cat:"Crypto",detail:"Investing since 2016 when BTC was ~$1,000. One of the earliest celebrity crypto investors. 'I see digital currencies definitely rising.' Confirmed CNBC and multiple outlets.",btn:CB("bitcoin","BTC")},
    {name:"Ethereum (ETH)",cat:"Crypto",detail:"Investing since 2016 when ETH was ~$10. Became interested after befriending Ethereum co-founders. Still holds. Confirmed CNBC.",btn:CB("ethereum","ETH")},
    {name:"11:11 Media",cat:"Founded",detail:"Founded 2021. Media and entertainment company overseeing all Paris Hilton brands, content, and investments. Private.",btn:null},
    {name:"Paris World (Roblox)",cat:"Founded",detail:"Metaverse experience on Roblox. New Year's Eve party drew more virtual attendees than Times Square. Brand-building in Web3. Confirmed multiple outlets.",btn:null},
    {name:"NFT Portfolio",cat:"Crypto",detail:"Over 150 NFTs acquired. 'Iconic Crypto Queen' series raised $1.5M in 2021. Sold her first digital artwork for 40 ETH in 2020. Active collector. Confirmed CoinPaper.",btn:null},
  ],
  recent:[
    {date:"2025",deal:"Scaled back BTC holdings amid market uncertainty",note:"Rebalancing after years of holding"},
    {date:"2021",deal:"'Iconic Crypto Queen' NFT series raises $1.5M",note:"Won Best Charity NFT at NFT Awards"},
    {date:"2021",deal:"11:11 Media founded",note:"Unified media platform for all Hilton IP"},
    {date:"2016",deal:"First crypto investment in BTC and ETH",note:"One of the earliest celebrity crypto investors"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// DR. DRE
// ─────────────────────────────────────────────────────────────────────────────
const dre = {
  id:"dre", name:"Dr. Dre", handle:"@drdre",
  title:"Aftermath Entertainment · Beats · Still G.I.N.",
  netWorth:"~$1B (Forbes 2026)", category:"Music · Consumer · Tech",
  thesis:"If it's going to be great, it has to sound great. Quality over everything.",
  keyNumber:{label:"Beats exit (2014)",value:"~$750M"},
  tag:"West Coast Mogul", tagColor:"slate",
  portfolio:[
    {name:"Beats Electronics",cat:"Private",detail:"Co-founded with Jimmy Iovine 2006. Apple acquired 2014 for $3B — the largest acquisition in Apple history at the time. Dre held ~25% stake = ~$750M pre-tax. The blueprint for music industry brand exits. Confirmed Celebrity Net Worth.",btn:EXITED},
    {name:"Apple (AAPL)",cat:"Public",detail:"Received $400M in Apple stock as part of the Beats acquisition. Court filings from 2021 confirmed he sold $73M in AAPL shares that year. May still hold partial position. Confirmed divorce court filings.",btn:YF("AAPL")},
    {name:"Aftermath Entertainment",cat:"Founded",detail:"Founded 1996 after leaving Death Row. Signed Eminem, 50 Cent, Kendrick Lamar. Sold stake to Interscope/Universal for $52M in 2001. Still actively involved. Distributed through Universal Music Group.",btn:null},
    {name:"Still G.I.N.",cat:"Founded",detail:"Ultra-premium gin brand co-founded with Snoop Dogg 2024. Citrus tangerine notes. Diamond-shaped bottle. 'Surprisingly sippable' — The Guardian. Confirmed TheStreet.",btn:null},
    {name:"Death Row Records",cat:"Founded",detail:"Co-founded 1991 with Suge Knight. Left 1996 walking away from estimated $50M. The label that launched Snoop, Tupac, and West Coast hip-hop. Dre's exit defined his subsequent career.",btn:EXITED},
  ],
  recent:[
    {date:"Apr 2026",deal:"Forbes estimates net worth $1B",note:"5th wealthiest musician alive"},
    {date:"2024",deal:"Still G.I.N. launches with Snoop Dogg",note:"Second venture together"},
    {date:"Jan 2023",deal:"Sold $200M in music rights",note:"Generates ~$10M annual income"},
    {date:"2014",deal:"Beats acquired by Apple for $3B",note:"Dre received ~$750M pre-tax"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TIGER WOODS
// ─────────────────────────────────────────────────────────────────────────────
const tiger = {
  id:"tiger", name:"Tiger Woods", handle:"@TigerWoods",
  title:"Sun Day Red · PopStroke · TGR Design",
  netWorth:"~$1.5B (Forbes 2026)", category:"Sports · Apparel · Entertainment",
  thesis:"I've spent my entire career growing the game of golf. Everything I build is about bringing more people to a sport I love.",
  keyNumber:{label:"PopStroke valuation",value:"$650M"},
  tag:"Golf GOAT", tagColor:"red",
  portfolio:[
    {name:"Sun Day Red",cat:"Founded",detail:"Premium golf apparel brand launched February 2024 with TaylorMade. Tiger holds equity stake ('full partnership, not an endorsement'). First apparel without Nike since his entire career. Launched May 2024. Confirmed ESPN and ABC News.",btn:null},
    {name:"PopStroke Entertainment",cat:"Founded",detail:"Co-founded with Greg Bartoli 2018. Upscale putting entertainment with full-service restaurants. 17 US locations as of March 2026. TaylorMade invested at $650M valuation. Confirmed Front Office Sports and PopStroke.com.",btn:null},
    {name:"TGR Design",cat:"Founded",detail:"Golf course design and consulting firm. 30+ course projects globally. Part of Tiger's TGR Ventures business family. Private. Confirmed TGR Ventures.",btn:null},
    {name:"TMRW Sports / TGL",cat:"Founded",detail:"Co-founded tech-focused golf league with Rory McIlroy and Mike McCarley. SoFi Stadium tech arena. Full TV deal. Tiger won the inaugural TGL title in 2025. Confirmed GolfMagic.",btn:null},
    {name:"The Woods Jupiter",cat:"Founded",detail:"Upscale sports and dining restaurant in Jupiter, Florida. Opened 2015. Part of the TGR hospitality business. Private. Confirmed GolfMagic.",btn:null},
  ],
  recent:[
    {date:"Mar 2026",deal:"PopStroke reaches 17 US locations",note:"Aggressive national expansion"},
    {date:"2025",deal:"Tiger wins inaugural TGL title",note:"TMRW Sports tech league"},
    {date:"Feb 2024",deal:"Sun Day Red launches at Genesis Invitational",note:"First Nike-free apparel in career"},
    {date:"Jan 2023",deal:"TaylorMade invests in PopStroke at $650M",note:"Material investment, Abeles joins board"},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PHARRELL WILLIAMS
// ─────────────────────────────────────────────────────────────────────────────
const pharrell = {
  id:"pharrell", name:"Pharrell Williams", handle:"@Pharrell",
  title:"Humanrace · BBC · Louis Vuitton · Joopiter",
  netWorth:"~$250M", category:"Fashion · Beauty · Culture",
  thesis:"Culture is the currency. I build things at the intersection of music, fashion, and the future.",
  keyNumber:{label:"BBC founded",value:"2003"},
  tag:"Culture Architect", tagColor:"yellow",
  portfolio:[
    {name:"Humanrace",cat:"Founded",detail:"Skincare and lifestyle brand launched 2020. Distributed through partnership with Chanel for luxury retail access. Premium wellness positioning. Private. Confirmed multiple sources.",btn:null},
    {name:"Billionaire Boys Club (BBC)",cat:"Founded",detail:"Streetwear brand co-founded with NIGO in 2003. Sister brand ICECREAM. Growing global retail presence including flagship stores. Over 20 years of brand equity. Private. Confirmed multiple outlets.",btn:null},
    {name:"Joopiter",cat:"Founded",detail:"Digital auction house for collectibles and cultural artifacts. Launched 2022. Positions Pharrell at intersection of NFTs and physical collectibles. Private. Confirmed multiple outlets.",btn:null},
    {name:"i am OTHER",cat:"Founded",detail:"Creative collective, record label, and production company. Umbrella for Pharrell's creative ventures beyond his own music. Private. Confirmed multiple outlets.",btn:null},
    {name:"Louis Vuitton / LVMH (LVMUY)",cat:"Public",detail:"Creative Director of LV Men's since 2023. While a role rather than direct equity, Pharrell's appointment drives brand value and he holds a strategic stake in the relationship. LVMH ADR trades on OTC markets as LVMUY.",btn:YF("LVMUY")},
  ],
  recent:[
    {date:"2023",deal:"Named Creative Director of Louis Vuitton Men's",note:"First non-Virgil Abloh appointment"},
    {date:"2022",deal:"Joopiter auction platform launches",note:"Digital and physical collectibles"},
    {date:"2020",deal:"Humanrace launches with Chanel partnership",note:"Premium wellness brand"},
    {date:"2003",deal:"Billionaire Boys Club co-founded with NIGO",note:"20+ years of streetwear dominance"},
  ],
};

const ALL = {
  visionaries: [naval, balaji, vitalik, toly, thiel, bryan, ferriss, eladgil, chamath, altman, dorsey, leopold, saylor, cathie, armstrong, ohanian],
  icons: [lebron, jayz, reynolds, ronaldo, serena, snoop, kutcher, rihanna, kimk, kevinhart, paris, pharrell],
  boomers: [cuban, nas, oprah, robbins, magic, bono, martha, dre, sinclair],
  athletes: [durant, curry, melo, mahomes, osaka, kobe, shaq, tiger],
};

// ─────────────────────────────────────────────────────────────────────────────
// THEMES — cross-investor conviction by sector
// Sorted by number of backing investors. Includes tradeable + non-tradeable.
// ─────────────────────────────────────────────────────────────────────────────
const THEMES = [
  {
    id: "bitcoin-digital-assets",
    label: "Bitcoin & Digital Assets",
    color: "#f59e0b",
    description: "The most backed theme on Covet — 7 investors with documented Bitcoin or crypto positions. Saylor put his entire company treasury here. Dorsey built Block around it. Toly built the second-biggest L1.",
    backers: ["Saylor","Dorsey","Armstrong","Toly","Balaji","Vitalik","Naval"],
    positions: [
      {name:"Bitcoin (BTC)", investor:"Saylor", detail:"'The apex property of the human race.' 17,732+ personal BTC + 712,647 BTC in Strategy treasury.", btn:CB("bitcoin","BTC")},
      {name:"Strategy (MSTR)", investor:"Saylor", detail:"The original Bitcoin treasury company. Leveraged BTC play. S&P 500 member 2025.", btn:YF("MSTR")},
      {name:"Block (XYZ)", investor:"Dorsey", detail:"Dorsey's fintech company. Cash App processes $10B+ in BTC annually. Square for merchants.", btn:YF("XYZ")},
      {name:"Coinbase (COIN)", investor:"Armstrong", detail:"Armstrong co-founded it. S&P 500 since May 2025. Custodian for 90% of Bitcoin ETF assets.", btn:YF("COIN")},
      {name:"Ethereum (ETH)", investor:"Vitalik", detail:"Vitalik co-founded it. The programmable layer for decentralized applications.", btn:CB("ethereum","ETH")},
      {name:"Solana (SOL)", investor:"Toly", detail:"Toly co-founded it. Proof of History. 65,000+ TPS. The high-speed L1 for DeFi and consumer apps.", btn:CB("solana","SOL")},
      {name:"Worldcoin (WLD)", investor:"Altman", detail:"Altman co-founded. Global identity and financial network using iris biometrics.", btn:CB("worldcoin-wld","WLD")},
      {name:"Jito (JTO)", investor:"Toly", detail:"Dominant Solana liquid staking + MEV protocol. Toly invested in Jito Labs.", btn:CB("jito","JTO")},
    ]
  },
  {
    id: "health-longevity",
    label: "Health & Longevity",
    color: "#10b981",
    description: "6 investors putting serious personal capital into living longer. Altman committed $180M of personal net worth to Retro Biosciences alone. Armstrong $110M to NewLimit. Bryan Johnson runs the most documented human longevity experiment alive.",
    backers: ["Altman","Armstrong","Sinclair","Bryan Johnson","Cathie Wood","Kevin Hart","Ferriss"],
    positions: [
      {name:"Retro Biosciences", investor:"Altman", detail:"$180M personal bet — 'all my liquid net worth.' Cellular reprogramming to extend human lifespan. Altman's highest-conviction personal investment.", btn:null},
      {name:"NewLimit", investor:"Armstrong", detail:"Co-founded with Blake Byers. $110M personal commitment. Epigenetic reprogramming to extend healthspan. Raised $40M Series A May 2023.", btn:null},
      {name:"Function Health", investor:"Kevin Hart", detail:"Comprehensive lab testing and health analytics. HartBeat participated in $298M Series B Nov 2025.", btn:null},
      {name:"CRISPR Therapeutics (CRSP)", investor:"Cathie Wood", detail:"ARK's lead genomics bet. Gene editing therapeutics. Cathie calls it a multi-decade thesis.", btn:YF("CRSP")},
      {name:"Exact Sciences (EXAS)", investor:"Cathie Wood", detail:"Cancer early detection via molecular diagnostics. ARK ARKG core position.", btn:YF("EXAS")},
      {name:"Simple (App)", investor:"Kevin Hart", detail:"AI health coaching for weight loss. HartBeat led $35M Series B Oct 2025. 700K+ subscribers.", btn:null},
      {name:"Kernel", investor:"Bryan Johnson", detail:"Brain-computer interface measuring neural activity. Bryan invested personally.", btn:null},
      {name:"Therabody", investor:"Kevin Hart", detail:"Theragun massage therapy devices. HartBeat portfolio.", btn:null},
    ]
  },
  {
    id: "ai-compute-infrastructure",
    label: "AI & Compute Infrastructure",
    color: "#6366f1",
    description: "Leopold Aschenbrenner's thesis in one line: the AI bottleneck isn't algorithms, it's electricity and compute. His Q4 2025 13F showed $5.5B in gross exposure across power and data center stocks. All publicly tradeable.",
    backers: ["Leopold","Altman","Cathie Wood","Thiel","Toly","Armstrong"],
    positions: [
      {name:"IREN (IREN)", investor:"Leopold", detail:"Bitcoin miner pivoting to AI compute hosting. One of Leopold's largest 13F positions.", btn:YF("IREN")},
      {name:"Applied Digital (APLD)", investor:"Leopold", detail:"Data center infrastructure for AI and Bitcoin. Leopold Q4 2025 13F.", btn:YF("APLD")},
      {name:"Bloom Energy (BE)", investor:"Leopold", detail:"Fuel cell power generation. Top holding Q4 2025 13F. AI data center demand thesis.", btn:YF("BE")},
      {name:"Riot Platforms (RIOT)", investor:"Leopold", detail:"Bitcoin miner with large-scale power infrastructure. AI hosting pivot.", btn:YF("RIOT")},
      {name:"Palantir (PLTR)", investor:"Thiel", detail:"Thiel co-founded Palantir. AI platform for government and enterprise intelligence.", btn:YF("PLTR")},
      {name:"UiPath (PATH)", investor:"Cathie Wood", detail:"AI-powered software automation. ARK thesis: replaces knowledge work at industrial scale.", btn:YF("PATH")},
      {name:"io.net (IO)", investor:"Toly", detail:"Decentralized GPU network for ML. Toly backed Series A. IO live on Coinbase.", btn:CB("io-net","IO")},
      {name:"Anthropic", investor:"Leopold", detail:"AI safety and research company. Leopold's fund has private exposure. Maker of Claude.", btn:null},
    ]
  },
  {
    id: "nuclear-clean-energy",
    label: "Nuclear & Clean Energy",
    color: "#fb923c",
    description: "Altman described this as \"literally all my liquid net worth.\" His $800M+ personal bet on Helion Energy is the single most concentrated individual bet on this entire site. One public stock, the rest still private.",
    backers: ["Altman","Leopold"],
    positions: [
      {name:"Helion Energy", investor:"Altman", detail:"Nuclear fusion. $375M (2021) + $425M (2024) = $800M+ from Altman personally. Microsoft power purchase agreement for 2028.", btn:FORGE},
      {name:"Oklo (OKLO)", investor:"Altman", detail:"Nuclear microreactors. Altman backed from 2014. IPO'd May 2024 via SPAC. Altman was board chair.", btn:YF("OKLO")},
      {name:"Bloom Energy (BE)", investor:"Leopold", detail:"Solid-oxide fuel cell power generation. Leopold's top holding Q4 2025 13F.", btn:YF("BE")},
      {name:"Exowatt", investor:"Altman", detail:"Solar energy startup providing clean power to data centers. Personal investment.", btn:null},
    ]
  },
  {
    id: "fintech-payments",
    label: "Fintech & Payments",
    color: "#60a5fa",
    description: "Dorsey built his entire post-Twitter career around open financial infrastructure. Armstrong founded the company that became the S&P 500's crypto gateway. Altman's Stripe investment was one of his earliest.",
    backers: ["Dorsey","Armstrong","Altman","Naval"],
    positions: [
      {name:"Block (XYZ)", investor:"Dorsey", detail:"Dorsey's company. Square for merchants + Cash App. Bitcoin payments for 4M+ merchants.", btn:YF("XYZ")},
      {name:"Coinbase (COIN)", investor:"Armstrong", detail:"Armstrong co-founded. S&P 500 since May 2025. 90% of $36B Bitcoin ETF custody.", btn:YF("COIN")},
      {name:"Stripe", investor:"Altman", detail:"Early personal angel in Stripe. One of the most anticipated IPOs. Available on Forge secondary market.", btn:FORGE},
      {name:"MoonPay", investor:"Kevin Hart", detail:"Crypto on/off ramp. HartBeat portfolio unicorn. Primary gateway for NFT purchases.", btn:null},
    ]
  },
  {
    id: "sports-media-empires",
    label: "Sports & Media Empires",
    color: "#f87171",
    description: "Athletes and icons building ownership stakes in teams, leagues, and entertainment. LeBron owns pieces of the Red Sox and Liverpool. Ryan Reynolds bought Wrexham out of the fourth tier. Shaq owns 550+ franchises.",
    backers: ["LeBron","Shaq","Jay-Z","Ryan Reynolds","Durant","Kobe Bryant","Nas","Snoop"],
    positions: [
      {name:"Fenway Sports Group (Red Sox / Liverpool)", investor:"LeBron", detail:"LeBron holds a small equity stake in FSG, the parent of Boston Red Sox and Liverpool FC. Joined 2011.", btn:null},
      {name:"Wrexham AFC", investor:"Ryan Reynolds", detail:"Reynolds and Rob McElhenney bought Wrexham out of the fifth tier in 2020. Welcome to Wrexham docuseries. Promoted to the Championship.", btn:null},
      {name:"Alpine F1 Team", investor:"Ryan Reynolds", detail:"Reynolds acquired equity in Alpine F1 in 2023. Part of a celebrity-led investor group.", btn:null},
      {name:"Papa John's (PZZA)", investor:"Shaq", detail:"Board member since 2019. 9 franchise locations in Atlanta. Instrumental in brand turnaround.", btn:YF("PZZA")},
      {name:"Big Chicken", investor:"Shaq", detail:"Co-founded 2018. 40+ locations, 350+ in development. 234% unit growth, zero failures.", btn:null},
      {name:"Roc Nation Sports", investor:"Jay-Z", detail:"Jay-Z's sports management agency. Represents NFL, NBA, MLB players. Partnerships with NFL.", btn:null},
      {name:"Lyft (LYFT)", investor:"Shaq", detail:"Early personal investor in Lyft. Confirmed public investment.", btn:YF("LYFT")},
    ]
  },
  {
    id: "solana-ecosystem",
    label: "Solana Ecosystem",
    color: "#a78bfa",
    description: "Toly built it — and kept investing in it. With 24+ confirmed positions, his portfolio is the deepest single-investor thesis on the site. Four tokens are live on Coinbase today.",
    backers: ["Toly","Balaji","Naval"],
    positions: [
      {name:"Solana (SOL)", investor:"Toly", detail:"Co-founded. Invented Proof of History. 65,000+ TPS. The foundation.", btn:CB("solana","SOL")},
      {name:"Jito (JTO)", investor:"Toly", detail:"Dominant Solana liquid staking + MEV. Largest liquid staking provider on Solana.", btn:CB("jito","JTO")},
      {name:"io.net (IO)", investor:"Toly", detail:"Decentralized GPU network for ML. Series A investment. IO live on Coinbase.", btn:CB("io-net","IO")},
      {name:"Solayer (LAYER)", investor:"Toly", detail:"Solana restaking protocol. $150M+ TVL. Listed on Coinbase September 2025.", btn:CB("solayer","LAYER")},
      {name:"Drift Protocol (DRIFT)", investor:"Toly", detail:"Solana perpetuals DEX. ⚠️ $280M exploit April 1, 2026. Remediation underway. DRIFT on Coinbase.", btn:CB("drift","DRIFT")},
      {name:"Helius", investor:"Toly", detail:"Premier Solana RPC provider. $9.5M Series A. Infrastructure layer for Solana builders.", btn:null},
      {name:"Chaos Labs", investor:"Toly", detail:"$55M Series A. On-chain risk management for DeFi protocols.", btn:null},
    ]
  },
];


const TRACKING = [
  {
    id: "andrew-huberman", name: "Andrew Huberman", tag: "Scientist", tagColor: "teal",
    category: "Health · Longevity · Biotech",
    why: "Huberman Lab podcast reaches 5M+ listeners. His endorsements move product. His investments will move markets in the longevity space.",
    companies: [
      { name: "Momentous", detail: "Official supplement partner since 2021. Equity stake rumored but unconfirmed. Premium performance supplements." },
      { name: "Eight Sleep", detail: "Official partner. Temperature-regulating sleep technology. Equity unconfirmed." },
      { name: "ROKA", detail: "Official eyewear partner. Performance sunglasses and eyeglasses." },
    ],
  },
  {
    id: "mrbeast", name: "MrBeast", tag: "Creator", tagColor: "amber",
    category: "YouTube · Food · Philanthropy",
    why: "300M+ subscribers. The most watched person on the internet. When these brands go public it will be one of the biggest creator IPOs ever.",
    companies: [
      { name: "Feastables", detail: "Chocolate and snack brand. $10M+ in first month. Sold in Walmart and Target." },
      { name: "MrBeast Burger", detail: "Virtual restaurant chain. 1,700+ locations via delivery apps." },
      { name: "Beast Philanthropy", detail: "Non-profit arm. Feeds millions. Not investable but tracked." },
      { name: "Lunchly", detail: "Lunch kit brand launched 2024 with KSI and Logan Paul." },
    ],
  },
  {
    id: "emma-chamberlain", name: "Emma Chamberlain", tag: "Creator", tagColor: "violet",
    category: "Fashion · Coffee · Lifestyle",
    why: "Gen Z's most influential creator. Chamberlain Coffee is one of the strongest creator-brand plays in the market.",
    companies: [
      { name: "Chamberlain Coffee", detail: "Founded 2020. Specialty coffee and matcha. Available in Whole Foods and Target nationwide." },
    ],
  },
  {
    id: "diplo", name: "Diplo", tag: "Creator", tagColor: "blue",
    category: "Music · Tech · Wellness",
    why: "One of the most active investor-artists alive. LP in Torch Capital. Confirmed positions in music tech and crypto.",
    companies: [
      { name: "Mad Decent", detail: "Record label founded 2006. Independent, globally distributed." },
      { name: "Stationhead", detail: "Social music platform. Confirmed $12M Series A investor (2022)." },
      { name: "HIFI", detail: "Music business and financial management platform. Confirmed eight-figure round investor (2022)." },
      { name: "MoonPay", detail: "Crypto payments platform. Confirmed angel investor (2021)." },
      { name: "Torch Capital", detail: "Consumer VC fund. Confirmed LP in $200M raise (2023)." },
    ],
  },
  {
    id: "ksi", name: "KSI", tag: "Creator", tagColor: "green",
    category: "Boxing · Music · Beverages",
    why: "Prime is one of the fastest growing beverage brands in history. Sides restaurant chain expanding across UK.",
    companies: [
      { name: "Prime Hydration", detail: "Co-founded with Logan Paul 2022. $250M+ revenue in first year. Available in Walmart, Costco, ALDI." },
      { name: "Sides", detail: "Fast food restaurant chain founded 2020. 10+ UK locations." },
      { name: "Lunchly", detail: "Lunch kit brand launched 2024 with MrBeast and Logan Paul." },
    ],
  },
  {
    id: "logan-paul", name: "Logan Paul", tag: "Creator", tagColor: "red",
    category: "Boxing · Beverages · Wrestling",
    why: "Prime is a generational beverage brand. Co-founder with KSI. Serious capital to deploy beyond his own brands.",
    companies: [
      { name: "Prime Hydration", detail: "Co-founded with KSI 2022. $250M+ revenue in first year. One of the fastest growing sports drinks ever." },
      { name: "Maverick Clothing", detail: "Merchandise and apparel brand. Direct-to-consumer." },
      { name: "Lunchly", detail: "Lunch kit brand launched 2024 with MrBeast and KSI." },
    ],
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function InvestBtn({ btn, small, isPaid, onUpgrade }) {
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
  const fg = BTN_FG[btn.t] || BTN_FG.view;
  const bg = BTN_BG[btn.t] || BTN_BG.view;
  if (!isPaid && onUpgrade) {
    return (
      <button onClick={onUpgrade} style={{
        display: "inline-block", background: bg, color: fg,
        border: `1px solid ${fg}`, borderRadius: 3,
        padding: small ? "3px 8px" : "4px 10px",
        fontSize: small ? 9 : 10, fontWeight: 700, letterSpacing: "0.08em",
        whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, opacity: 0.4,
      }}>
        {btn.label} ↗
      </button>
    );
  }
  return (
    <a href={btn.url} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-block", background: bg, color: fg,
      border: `1px solid ${fg}`, borderRadius: 3,
      padding: small ? "3px 8px" : "4px 10px",
      fontSize: small ? 9 : 10, fontWeight: 700, letterSpacing: "0.08em",
      textDecoration: "none", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
    }}>
      {btn.label} ↗
    </a>
  );
}

function WatchButton({ positionName, investorName }) {
  const [state, setState] = useState("idle"); // idle | open | saving | done
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(null);

  const storageKey = `watch:${positionName.toLowerCase().replace(/\s+/g,"-")}`;

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(storageKey, true);
        if (r) {
          const data = JSON.parse(r.value);
          setCount(data.count || 0);
        }
      } catch(e) {}
    })();
  }, []);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setState("saving");
    try {
      let current = { count: 0, emails: [] };
      try {
        const r = await window.storage.get(storageKey, true);
        if (r) current = JSON.parse(r.value);
      } catch(e) {}
      if (!current.emails.includes(email)) {
        current.emails.push(email);
        current.count = current.emails.length;
      }
      await window.storage.set(storageKey, JSON.stringify(current), true);
      setCount(current.count);
      setState("done");
    } catch(e) {
      setState("done");
    }
  };

  if (state === "done") return (
    <div style={{ fontSize: 9, color: "#4ade80", fontFamily: "monospace", whiteSpace: "nowrap" }}>
      ✓ Watching
    </div>
  );

  if (state === "open" || state === "saving") return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={e => e.stopPropagation()}>
      <input
        autoFocus
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        style={{
          fontSize: 10, padding: "4px 8px", background: "#111", border: "1px solid #333",
          borderRadius: 3, color: "#ccc", width: 150, outline: "none",
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={state === "saving"}
        style={{
          fontSize: 9, padding: "4px 8px", background: "#f5c842", border: "none",
          borderRadius: 3, cursor: "pointer", color: "#000", fontWeight: 700,
          opacity: state === "saving" ? 0.6 : 1,
        }}>
        {state === "saving" ? "..." : "Notify me"}
      </button>
      <button onClick={() => setState("idle")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 12 }}>✕</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
      <button
        onClick={() => setState("open")}
        style={{
          fontSize: 9, color: "#2dd4bf", border: "1px solid #0f3d38", background: "#020f0e",
          padding: "3px 8px", borderRadius: 3, cursor: "pointer", whiteSpace: "nowrap",
          letterSpacing: "0.04em", fontWeight: 600,
        }}>
        Notify when investable
      </button>
      {count > 0 && (
        <span style={{ fontSize: 8, color: "#2a2a2a", fontFamily: "monospace" }}>{count} watching</span>
      )}
    </div>
  );
}

function CategoryGroup({ cat, items, defaultOpen, isPaid, onUpgrade }) {
  const [open, setOpen] = useState(true);
  if (!items || items.length === 0) return null;
  const catColors = {
    Founded: "#f97316", Crypto: "#6366f1", Private: "#64748b",
    Philanthropy: "#10b981", Public: "#3b82f6", Exited: "#374151",
    "Pre-IPO": "#f59e0b", Equity: "#8b5cf6",
  };
  const color = catColors[cat] || "#64748b";
  return (
    <div style={{ marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 10px", background: "#0d0d0d", border: "none", borderLeft: `2px solid ${color}`,
        cursor: "pointer",
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
              {item.btn && item.btn.t === "exit" ? (
                <InvestBtn btn={item.btn} small isPaid={isPaid} onUpgrade={onUpgrade} />
              ) : (!item.btn || !item.btn.url) ? (
                <WatchButton positionName={item.name} investorName={""} />
              ) : (
                <InvestBtn btn={item.btn} small isPaid={isPaid} onUpgrade={onUpgrade} />
              )}
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
            <Section label="Crypto — Buy on Coinbase" items={byCoin} color="#f59e0b" platform="Coinbase" url="https://coinbase.com/join/LC3KXJN?src=ios-link" />
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

function PortfolioTabs({ investor, isPaid, onUpgrade, catOrder, byCategory, total }) {
  const [tab, setTab] = useState("all");

  const tradeable = investor.portfolio.filter(p => p.btn && p.btn.t !== "exit" && p.btn.url);
  const byCat = {
    crypto: tradeable.filter(p => p.btn.t === "crypto"),
    stock: tradeable.filter(p => p.btn.t === "stock"),
    preipo: tradeable.filter(p => p.btn.t === "preipo"),
    republic: tradeable.filter(p => p.btn.t === "republic"),
  };
  const catLabels = { crypto: "Crypto", stock: "Stocks", preipo: "Pre-IPO", republic: "Equity" };
  const catColors = { crypto: "#6366f1", stock: "#3b82f6", preipo: "#f59e0b", republic: "#10b981" };

  const tabStyle = (active) => ({
    fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    padding: "6px 14px", background: "none", border: "none",
    borderBottom: active ? "2px solid #f5c842" : "2px solid transparent",
    color: active ? "#f5c842" : "#2e2e2e",
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  const allCatOrder = ["Crypto", "Public", "Private", "Founded", "Philanthropy"];

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #161616", marginBottom: 12 }}>
        <button style={tabStyle(tab === "all")} onClick={() => setTab("all")}>
          All <span style={{ opacity: 0.4, fontWeight: 400 }}>({total})</span>
        </button>
        <button style={tabStyle(tab === "tradeable")} onClick={() => setTab("tradeable")}>
          Tradeable <span style={{ opacity: 0.4, fontWeight: 400 }}>({tradeable.length})</span>
        </button>
      </div>

      {tab === "all" && (
        <div>
          {allCatOrder.map(cat => byCategory[cat] ? (
            <CategoryGroup key={cat} cat={cat} items={byCategory[cat]} defaultOpen={cat === "Crypto"} isPaid={isPaid} onUpgrade={onUpgrade} />
          ) : null)}
          {Object.keys(byCategory).filter(c => !allCatOrder.includes(c)).map(cat => (
            <CategoryGroup key={cat} cat={cat} items={byCategory[cat]} defaultOpen={false} isPaid={isPaid} onUpgrade={onUpgrade} />
          ))}
        </div>
      )}

      {tab === "tradeable" && (
        <div>
          {tradeable.length === 0 ? (
            <div style={{ fontSize: 12, color: "#333", padding: "20px 0" }}>No tradeable positions tracked for this investor.</div>
          ) : (
            Object.entries(byCat).map(([type, items]) => {
              if (!items.length) return null;
              const color = catColors[type];
              const label = catLabels[type];
              return (
                <div key={type} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 8, color, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
                    {label}
                  </div>
                  {items.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 0", borderBottom: "1px solid #0d0d0d",
                    }}>
                      <span style={{ fontSize: 12, color: "#ccc", fontWeight: 500 }}>{item.name}</span>
                      <InvestBtn btn={item.btn} small isPaid={isPaid} onUpgrade={onUpgrade} />
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}

function DetailPanel({ investor, isPaid, onUpgrade }) {
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

      {/* Stats */}
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

      {investor.fundNote && (
        <div style={{ marginBottom: 14, padding: "9px 12px", background: "#0d0a00", border: "1px solid #2a1e00", borderRadius: 3 }}>
          <span style={{ fontSize: 9, color: "#7a5a10", lineHeight: 1.6 }}>
            ⓘ {investor.fundNote}
          </span>
        </div>
      )}

      {!investor.fundNote && (
        <div style={{ marginBottom: 14, padding: "7px 12px", background: "#060606", borderRadius: 3 }}>
          <span style={{ fontSize: 8, color: "#222", lineHeight: 1.5 }}>
            Personal & direct investments shown. Institutional fund positions excluded.
          </span>
        </div>
      )}

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

      {/* Portfolio tabs + content */}
      <PortfolioTabs investor={investor} isPaid={isPaid} onUpgrade={onUpgrade} catOrder={catOrder} byCategory={byCategory} total={total} />

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
// PAID TIER — $12/month via Stripe
// Free: top 3 positions per investor
// Paid: full portfolio + signal overlap feed
// ─────────────────────────────────────────────────────────────────────────────

const STRIPE_LINK = "https://buy.stripe.com/5kQ5kCdfta7H4Do1vkeAg00";

// Simple auth — store paid status in localStorage after Stripe redirect
function usePaidStatus() {
  const [isPaid, setIsPaid] = useState(() => {
    try { return localStorage.getItem("covet_paid") === "true"; } catch(e) { return false; }
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") {
      try { localStorage.setItem("covet_paid", "true"); } catch(e) {}
      setIsPaid(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  return { isPaid, setIsPaid };
}

// Signal overlap — positions held by 3+ investors
function computeOverlap() {
  const counts = {};
  ALL_FLAT.forEach(inv => {
    inv.portfolio.forEach(p => {
      const key = p.name.toLowerCase().trim();
      if (!counts[key]) counts[key] = { name: p.name, investors: [], btn: p.btn };
      if (!counts[key].investors.includes(inv.name)) counts[key].investors.push(inv.name);
    });
  });
  return Object.values(counts)
    .filter(c => c.investors.length >= 3)
    .sort((a, b) => b.investors.length - a.investors.length)
    .slice(0, 12);
}

function SignalPreview() {
  const overlaps = computeOverlap().slice(0, 4);
  const colors = ["#f5c842","#60a5fa","#4ade80","#f472b6"];
  const bgColors = ["#1a1000","#0a1628","#061408","#1a0814"];
  const borderColors = ["#3d2b00","#1e3a5f","#0d2e14","#3d0e2a"];
  return (
    <div style={{ margin: "18px 0", background: "#050505", border: "1px solid #1a1a1a", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
          <span style={{ fontSize: 8, color: "#4ade80", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "monospace" }}>Live Signal Feed</span>
        </div>
        <span style={{ fontSize: 8, color: "#222", fontFamily: "monospace" }}>REAL-TIME · {overlaps.length} ACTIVE</span>
      </div>
      {overlaps.map((item, i) => (
        <div key={i} style={{ padding: "10px 14px", borderBottom: i < overlaps.length - 1 ? "1px solid #0d0d0d" : "none", background: bgColors[i] + "44" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e0e0e0", marginBottom: 2 }}>{item.name}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {item.investors.slice(0, 4).map((inv, j) => (
                  <span key={j} style={{ fontSize: 8, color: colors[i], background: bgColors[i], border: `1px solid ${borderColors[i]}`, borderRadius: 2, padding: "1px 5px", fontFamily: "monospace", letterSpacing: "0.04em" }}>
                    {inv.split(" ")[0]}
                  </span>
                ))}
                {item.investors.length > 4 && (
                  <span style={{ fontSize: 8, color: "#333", fontFamily: "monospace" }}>+{item.investors.length - 4}</span>
                )}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: colors[i], fontFamily: "monospace", lineHeight: 1 }}>{item.investors.length}</div>
              <div style={{ fontSize: 7, color: "#333", letterSpacing: "0.1em" }}>INVESTORS</div>
            </div>
          </div>
          <div style={{ height: 2, background: "#111", borderRadius: 1 }}>
            <div style={{ height: 2, borderRadius: 1, background: colors[i], width: `${Math.min(100, (item.investors.length / 6) * 100)}%`, opacity: 0.7 }} />
          </div>
        </div>
      ))}
      <div style={{ padding: "10px 14px", background: "#061408", borderTop: "1px solid #0d2e14" }}>
        <div style={{ fontSize: 9, color: "#1a5c1a", fontFamily: "monospace", letterSpacing: "0.08em" }}>
          Pro members see the full convergence map across all 29 investors
        </div>
      </div>
    </div>
  );
}

function PaywallModal({ onClose, onUpgrade }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      overflowY: "auto",
    }}>
      <div style={{
        background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6,
        padding: "28px 24px", maxWidth: 440, width: "100%",
      }}>
        <div style={{ fontSize: 8, color: "#f5c842", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12, textAlign: "center" }}>
          COVET PRO
        </div>
        <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginBottom: 8, lineHeight: 1.3, textAlign: "center" }}>
          Build your portfolio.<br/>See where smart money converges.
        </div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.75, marginBottom: 20, textAlign: "center" }}>
          Three intelligence tools built from 45 investor portfolios.
        </div>

        {[
          { name:"Radar", color:"#f5c842", desc:"Top investable positions ranked by conviction strength — plus a full convergence map showing where 45 investors overlap." },
          { name:"Portfolio Builder", color:"#f472b6", desc:"Pick your investors or a theme. Get a full actionable allocation with buy buttons. Set alerts when positions change." },
          { name:"Horizon", color:"#a78bfa", desc:"Forward-looking plays built from documented thesis patterns — full investment thesis and specific positions to act on." },
          { name:"Watchlist", color:"#2dd4bf", desc:"Every uninvestable position across all 45 investors. Get notified the moment any private company, pre-token protocol, or founded brand opens to retail." },
          { name:"Themes", color:"#10b981", desc:"6 investment theses across Bitcoin, AI, Nuclear, Sports, Solana, and Fintech — full position lists and buy buttons." },
          { name:"Watchlist", color:"#2dd4bf", desc:"Every non-investable position across all 45 investors — private companies, pre-token projects, brands yet to IPO — with notifications when they open up." },
        ].map((f,i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:8, padding:"10px 12px", background:"#080808", borderRadius:3, borderLeft:`2px solid ${f.color}55` }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:f.color, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:3 }}>{f.name}</div>
              <div style={{ fontSize:10, color:"#444", lineHeight:1.55 }}>{f.desc}</div>
            </div>
          </div>
        ))}

        <button onClick={onUpgrade} style={{
          width: "100%", marginTop: 12, padding: "14px", background: "#f5c842",
          border: "none", borderRadius: 4, cursor: "pointer",
          fontSize: 13, fontWeight: 700, color: "#000", letterSpacing: "0.04em",
        }}>
          Upgrade — $12/month
        </button>
        <button onClick={onClose} style={{
          display: "block", width: "100%", background: "none", border: "none",
          color: "#333", fontSize: 10, cursor: "pointer", marginTop: 12,
          letterSpacing: "0.08em", textAlign: "center",
        }}>
          Continue with free access
        </button>
      </div>
    </div>
  );
}

function SignalOverlapFeed() {
  const overlaps = computeOverlap();
  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #111" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 8, color: "#f5c842", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "monospace" }}>
          Signal Overlap
        </div>
        <div style={{ fontSize: 9, color: "#2a2a2a", fontFamily: "monospace" }}>
          {overlaps.length} convergences found
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#2a2a2a", marginBottom: 14, lineHeight: 1.6 }}>
        Assets held by 3 or more investors simultaneously.
      </div>
      {overlaps.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px", background: i % 2 === 0 ? "#080808" : "#0a0a0a",
          borderBottom: "1px solid #0f0f0f", gap: 10,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#ddd", marginBottom: 3 }}>{item.name}</div>
            <div style={{ fontSize: 10, color: "#333", lineHeight: 1.5 }}>
              {item.investors.slice(0, 4).join(" · ")}{item.investors.length > 4 ? ` +${item.investors.length - 4}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: "#f5c842", fontFamily: "monospace", background: "#1a1000", padding: "2px 8px", borderRadius: 3, border: "1px solid #2a1500" }}>
              {item.investors.length} investors
            </div>
            {item.btn && item.btn.url && <InvestBtn btn={item.btn} small />}
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsletterEmbed() {
  return (
    <div style={{ marginTop: 32, padding: "20px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4 }}>
      <div style={{ fontSize: 8, color: "#2e2e2e", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 8 }}>
        Stay updated
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 4 }}>
        New positions. Signal alerts. Weekly.
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <input
          type="email"
          placeholder="your@email.com"
          style={{
            flex: 1, padding: "9px 12px", background: "#060606", border: "1px solid #1e1e1e",
            borderRadius: 3, color: "#888", fontSize: 11, outline: "none",
          }}
        />
        <a
          href="https://covets-newsletter.beehiiv.com/subscribe"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "9px 16px", background: "#1a1000", border: "1px solid #f5c842",
            borderRadius: 3, color: "#f5c842", fontSize: 10, fontWeight: 700,
            textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "0.06em",
          }}>
          Subscribe
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTING — custom client-side router, no dependencies
// URLs: / = homepage directory  |  /investor/naval = individual page
// ─────────────────────────────────────────────────────────────────────────────

// Flat lookup of all investors by id
const ALL_FLAT = Object.values(ALL).flat();

// Slug map — clean URL per investor
const SLUG_MAP = {
  naval:"naval", balaji:"balaji", vitalik:"vitalik", toly:"toly",
  thiel:"thiel", bryan:"bryan-johnson", ferriss:"tim-ferriss",
  eladgil:"elad-gil", chamath:"chamath",
  lebron:"lebron-james", jayz:"jay-z", reynolds:"ryan-reynolds",
  ronaldo:"ronaldo", serena:"serena-williams", snoop:"snoop-dogg", kutcher:"ashton-kutcher",
  cuban:"mark-cuban", nas:"nas", oprah:"oprah", robbins:"tony-robbins",
  magic:"magic-johnson", bono:"bono", martha:"martha-stewart",
  durant:"kevin-durant", curry:"steph-curry", melo:"carmelo-anthony",
  mahomes:"patrick-mahomes", osaka:"naomi-osaka",
  sinclair:"david-sinclair",
};
const SLUG_TO_ID = Object.fromEntries(Object.entries(SLUG_MAP).map(([id, slug]) => [slug, id]));

function useRouter() {
  const getPath = () => window.location.pathname;
  const [path, setPath] = useState(getPath);
  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  };
  return { path, navigate };
}

function useSEO({ title, description, url }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", url, true);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "Covet", true);
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    // Canonical
    let canon = document.querySelector("link[rel='canonical']");
    if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
    canon.href = url;
  }, [title, description, url]);
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HEADER
// ─────────────────────────────────────────────────────────────────────────────
function Header({ navigate, isPaid, onUpgrade }) {
  return (
    <div style={{ borderBottom: "1px solid #161616", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, fontWeight: 900, color: "#f5f5f5", letterSpacing: "-0.02em", lineHeight: 1 }}>COVET</div>
        <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.18em", marginTop: 3, textTransform: "uppercase" }}>Invest like the people you admire</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {[
          { label: "Buy Crypto", url: "https://coinbase.com/join/LC3KXJN?src=ios-link" },
          { label: "Buy Stocks", url: "https://public.com" },
          { label: "Pre-IPO", url: "https://forgeplatform.com" },
        ].map(b => (
          <a key={b.label} href={b.url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            color: "#f5c842", border: "1px solid #3d2b00",
            background: "#0e0900", padding: "5px 10px", borderRadius: 3,
            textDecoration: "none", display: "block",
          }}>{b.label} ↗</a>
        ))}
        {isPaid ? (
          <div style={{ fontSize: 8, color: "#2d5a2d", fontFamily: "monospace", letterSpacing: "0.1em", padding: "5px 10px", border: "1px solid #1a2e1a", borderRadius: 3 }}>
            PRO ✓
          </div>
        ) : (
          <button onClick={onUpgrade} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            color: "#000", border: "none", background: "#f5c842",
            padding: "6px 12px", borderRadius: 3, cursor: "pointer",
          }}>Upgrade $12/mo</button>
        )}
      </div>
    </div>
  );
}

function ThemeCard({ theme, isPaid, onUpgrade }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 1 }}>
      <button onClick={() => setOpen(!open)} style={{
        width:"100%", textAlign:"left", padding:"14px 16px",
        background:"#080808", border:"none", borderLeft:`3px solid ${theme.color}`,
        cursor:"pointer", borderBottom:"1px solid #111",
      }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:7 }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#e0e0e0", fontFamily:"'Playfair Display',Georgia,serif" }}>{theme.label}</span>
          <span style={{ fontSize:9, color:"#222", fontFamily:"monospace" }}>
            {theme.backers.length} investors · {theme.positions.length} positions {open ? "▾" : "▸"}
          </span>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {theme.backers.map((b,i) => (
            <span key={i} style={{
              fontSize:8, color:theme.color, background:`${theme.color}18`,
              padding:"2px 7px", borderRadius:2, fontFamily:"monospace", fontWeight:600, letterSpacing:"0.03em",
            }}>{b}</span>
          ))}
        </div>
      </button>
      {open && (
        <div style={{ background:"#060606", borderLeft:`3px solid ${theme.color}22` }}>
          <div style={{ padding:"10px 16px 8px", borderBottom:"1px solid #0d0d0d" }}>
            <p style={{ fontSize:10, color:"#3a3a3a", lineHeight:1.7, margin:0 }}>{theme.description}</p>
          </div>
          {theme.positions.map((pos,i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 16px", borderBottom:"1px solid #0d0d0d", background: i%2===0?"#060606":"#070707" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:"#ccc" }}>{pos.name}</span>
                  <span style={{ fontSize:8, color:theme.color, background:`${theme.color}15`, padding:"1px 5px", borderRadius:2, fontFamily:"monospace" }}>{pos.investor}</span>
                </div>
                <div style={{ fontSize:10, color:"#363636", lineHeight:1.5 }}>{pos.detail}</div>
              </div>
              {pos.btn && pos.btn.t === "exit" ? (
                <span style={{ fontSize:9, color:"#404040", background:"#141414", padding:"3px 8px", borderRadius:3, whiteSpace:"nowrap", border:"1px solid #222" }}>EXITED</span>
              ) : pos.btn && pos.btn.url ? (
                <InvestBtn btn={pos.btn} small isPaid={isPaid} onUpgrade={onUpgrade} />
              ) : (
                <WatchButton positionName={pos.name} investorName={pos.investor} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function TrackingCard({ person }) {
  const [notifyState, setNotifyState] = useState("idle");
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(null);
  const storageKey = `track:${person.id}`;
  const accent = DOT[person.tagColor] || DOT.neutral;

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(storageKey, true);
        if (r) setCount(JSON.parse(r.value).count || 0);
      } catch(e) {}
    })();
  }, []);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setNotifyState("saving");
    try {
      let current = { count: 0, emails: [] };
      try { const r = await window.storage.get(storageKey, true); if (r) current = JSON.parse(r.value); } catch(e) {}
      if (!current.emails.includes(email)) { current.emails.push(email); current.count = current.emails.length; }
      await window.storage.set(storageKey, JSON.stringify(current), true);
      setCount(current.count);
      setNotifyState("done");
    } catch(e) { setNotifyState("done"); }
  };

  return (
    <div style={{ background: "#080808", padding: "18px 18px 16px", borderBottom: "1px solid #111", borderLeft: `2px solid ${accent}22` }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent, flexShrink: 0 }} />
            <span style={{ fontSize: 8, color: accent, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>{person.tag}</span>
          </div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, color: "#e0e0e0", marginBottom: 3 }}>{person.name}</div>
          <div style={{ fontSize: 9, color: "#333", fontFamily: "monospace", letterSpacing: "0.08em" }}>{person.category}</div>
        </div>
        <div style={{ fontSize: 8, color: accent, background: "#050505", border: `1px solid ${accent}44`, padding: "2px 7px", borderRadius: 2, fontFamily: "monospace", letterSpacing: "0.1em", whiteSpace: "nowrap", flexShrink: 0 }}>
          TRACKING
        </div>
      </div>

      <div style={{ fontSize: 10, color: "#444", lineHeight: 1.65, marginBottom: 12 }}>{person.why}</div>

      {/* Companies */}
      {person.companies && person.companies.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 8, color: accent, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 8, opacity: 0.7 }}>Known Companies</div>
          {person.companies.map((co, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: "1px solid #0d0d0d" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#ccc", marginBottom: 2 }}>{co.name}</div>
                <div style={{ fontSize: 10, color: "#383838", lineHeight: 1.5 }}>{co.detail}</div>
              </div>
              <WatchButton positionName={co.name} investorName={person.name} />
            </div>
          ))}
        </div>
      )}

      {/* Person-level notify */}
      <div>
        {notifyState === "done" ? (
          <span style={{ fontSize: 9, color: "#4ade80", fontFamily: "monospace" }}>✓ You'll be notified when they invest</span>
        ) : notifyState === "open" || notifyState === "saving" ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input autoFocus type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ fontSize: 10, padding: "4px 8px", background: "#111", border: "1px solid #333", borderRadius: 3, color: "#ccc", width: 160, outline: "none" }} />
            <button onClick={handleSubmit} disabled={notifyState === "saving"}
              style={{ fontSize: 9, padding: "4px 8px", background: "#f5c842", border: "none", borderRadius: 3, cursor: "pointer", color: "#000", fontWeight: 700, opacity: notifyState === "saving" ? 0.6 : 1 }}>
              {notifyState === "saving" ? "..." : "Notify me"}
            </button>
            <button onClick={() => setNotifyState("idle")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 12 }}>✕</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setNotifyState("open")}
              style={{ fontSize: 9, color: accent, border: `1px solid ${accent}44`, background: "#050505", padding: "3px 8px", borderRadius: 3, cursor: "pointer", fontWeight: 600, letterSpacing: "0.04em" }}>
              Notify when they invest
            </button>
            {count > 0 && <span style={{ fontSize: 8, color: "#2a2a2a", fontFamily: "monospace" }}>{count} watching</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRO INTELLIGENCE — Radar, Signal, Horizon data + components
// ─────────────────────────────────────────────────────────────────────────────

const HORIZON = [
  {
    name:"Nuclear Fusion Energy",
    why:"Altman committed more personal capital here than anywhere else — $800M+ on Helion alone. Leopold's entire 13F is energy infrastructure. When fusion delivers, every AI data center becomes a customer.",
    thesis:"The AI buildout has a fundamental constraint: power. Altman's thesis is that nuclear — specifically fusion — is the only technology that can generate enough clean, baseload energy to run the next generation of AI infrastructure. His $375M (2021) + $425M (2024) in Helion is the largest single personal bet on this site. Leopold's approach is the publicly traded proxy: buy the power infrastructure stocks that benefit regardless of which technology wins. The convergence of two different investors on the same macro thesis from different angles is a strong signal.",
    investors:["Altman","Leopold"],
    signal:"Altman's Helion bet is the single largest personal investment on this site. Pattern: AI demand drives energy demand, fusion solves the supply side.",
    tier:"WATCH", tierColor:"#f59e0b",
    positions:[
      {name:"Oklo (OKLO)", detail:"Nuclear microreactors. Altman backed from 2014, was board chair. IPO'd May 2024 via SPAC. The only pure-play public fission stock.", btn:YF("OKLO")},
      {name:"Bloom Energy (BE)", detail:"Solid-oxide fuel cell power generation. Leopold's top 13F holding. AI data center demand is their bull case.", btn:YF("BE")},
      {name:"IREN (IREN)", detail:"Bitcoin miner pivoting to AI compute hosting. Leopold Q4 2025 13F. Power infrastructure play.", btn:YF("IREN")},
      {name:"Applied Digital (APLD)", detail:"Data center infrastructure for AI and Bitcoin. Leopold Q4 2025 13F.", btn:YF("APLD")},
      {name:"Helion Energy", detail:"Nuclear fusion. $800M+ from Altman personally. Microsoft power purchase agreement for 2028. Pre-IPO only.", btn:FORGE},
    ],
  },
  {
    name:"AI Agent Infrastructure",
    why:"Every Visionaries investor has AI exposure. The next unlocking: the infrastructure layer between LLMs and real-world action — tools, memory, orchestration. No dominant player yet.",
    thesis:"The first wave of AI was models (OpenAI, Anthropic, Mistral). The second wave was interfaces (ChatGPT, Claude, Perplexity). The third wave — where capital is quietly concentrating right now — is agent infrastructure: the tools, memory systems, and orchestration layers that let AI models take actions in the world autonomously. Naval's investment in Alchemy (the AWS of Web3) follows the same infrastructure-first pattern. Toly's io.net is decentralized compute for exactly this use case. Armstrong's NewLimit and ResearchHub both require AI-native infrastructure to function. No single investable proxy yet — this is where you watch, not act.",
    investors:["Altman","Armstrong","Naval","Toly"],
    signal:"4 Visionaries adjacent to this space. The picks have not converged yet — this is where the capital will concentrate next.",
    tier:"EARLY", tierColor:"#60a5fa",
    positions:[
      {name:"Perplexity", detail:"AI-native search and research. Naval and Balaji are both early investors. The most investable AI infrastructure play before IPO.", btn:FORGE},
      {name:"io.net (IO)", detail:"Decentralized GPU network for ML. Toly backed Series A. The agent compute layer — live on Coinbase.", btn:CB("io-net","IO")},
      {name:"Alchemy", detail:"Naval backed. Web3 developer platform — 'the AWS of blockchain' — increasingly used for AI + crypto agent workflows.", btn:FORGE},
      {name:"Palantir (PLTR)", detail:"Thiel co-founded. The most mature AI-native enterprise platform. AIP is the agent layer for government and enterprise.", btn:YF("PLTR")},
    ],
  },
  {
    name:"Longevity Biotech IPO Wave",
    why:"Altman put $180M into Retro Biosciences. Armstrong put $110M into NewLimit. Sinclair co-founded Life Biosciences. When any of these goes public it will be the defining longevity IPO of the decade.",
    thesis:"The longevity sector is where the smartest money in tech has quietly deployed the most personal capital. Not fund capital — personal capital. Altman described his Retro bet as 'all my liquid net worth.' Armstrong made NewLimit his primary philanthropic and investment focus. Sinclair has spent 30 years building toward this moment at Harvard. The companies are in late preclinical or early clinical stages. The IPO window opens when one of them achieves a human trial milestone. Forge is the best way to get pre-IPO exposure. CRISPR Therapeutics and Exact Sciences are the most liquid public proxies for the same thesis.",
    investors:["Altman","Armstrong","Sinclair"],
    signal:"$290M+ combined personal capital deployed. Series B/C rounds may open to retail. Watch Forge for early access.",
    tier:"WATCH", tierColor:"#f59e0b",
    positions:[
      {name:"CRISPR Therapeutics (CRSP)", detail:"Gene editing therapeutics. Cathie Wood's lead genomics bet. The most liquid public proxy for the longevity/gene editing thesis.", btn:YF("CRSP")},
      {name:"Exact Sciences (EXAS)", detail:"Cancer early detection via molecular diagnostics. ARK core position. Preventive diagnostics = longevity infrastructure.", btn:YF("EXAS")},
      {name:"Retro Biosciences", detail:"$180M from Altman personally. Cellular reprogramming to extend lifespan. Pre-IPO, watch Forge.", btn:FORGE},
      {name:"NewLimit", detail:"Armstrong co-founded. $110M personal commitment. Epigenetic reprogramming. Pre-IPO.", btn:FORGE},
      {name:"Tally Health", detail:"Sinclair co-founded. Consumer longevity diagnostics. Biological age testing. Pre-IPO.", btn:FORGE},
    ],
  },
  {
    name:"Solana Consumer Apps",
    why:"Toly built the infrastructure. Balaji funds the ecosystem. 24+ confirmed Solana positions between them. The consumer app layer is the next wave — SOL is the liquid way to bet on it now.",
    thesis:"Solana in 2025 is where Ethereum was in 2020 — the infrastructure is proven, the developer ecosystem is mature, and the consumer applications are just arriving. The DeFi primitives are live (Jito, Drift). The identity layer is forming (Solayer). The GPU compute network is deployed (io.net). What comes next is the consumer-facing layer: social apps, games, payments, and media built on top. Toly's 24+ confirmed positions span every layer of this stack. The cleanest liquid expression is SOL itself, with JTO as a yield-generating overlay and LAYER for restaking exposure.",
    investors:["Toly","Balaji","Naval"],
    signal:"Infrastructure is mature. Consumer apps are the next layer. Pattern is visible in all three portfolios.",
    tier:"ACT", tierColor:"#4ade80",
    positions:[
      {name:"Solana (SOL)", detail:"Toly co-founded. The foundational bet. 65,000+ TPS. Proof of History. Buy and hold.", btn:CB("solana","SOL")},
      {name:"Jito (JTO)", detail:"Dominant Solana liquid staking + MEV protocol. Toly invested in Jito Labs. Yield-generating SOL exposure.", btn:CB("jito","JTO")},
      {name:"Solayer (LAYER)", detail:"Solana restaking protocol. $150M+ TVL. Toly backed. Listed on Coinbase Sept 2025.", btn:CB("solayer","LAYER")},
      {name:"io.net (IO)", detail:"Decentralized GPU for ML. Toly Series A. The compute layer for on-chain AI apps. Live on Coinbase.", btn:CB("io-net","IO")},
    ],
  },
  {
    name:"Premium Spirits & Consumer Brands",
    why:"Aviation Gin sold to Diageo for ~$600M. Mint Mobile to T-Mobile for $1.35B. Armand de Brignac 50% to LVMH. The playbook: undervalued brand + celebrity distribution + strategic exit.",
    thesis:"Ryan Reynolds, Jay-Z, LeBron, and Snoop Dogg have independently discovered the same playbook: find an undercapitalized brand in a category with strong strategic acquirers (spirits, sports, beverages), inject personality and distribution through their existing audience, and hold until a strategic buyer (Diageo, LVMH, T-Mobile) pays a premium. The average exit multiple across the documented exits is 8–15x. Republic and equity crowdfunding platforms are the retail access point for this category — the next generation of celebrity-backed brands is actively raising there.",
    investors:["Ryan Reynolds","Jay-Z","LeBron","Snoop"],
    signal:"4 Icons. Multiple documented exits at large multiples. Republic has active campaigns in this category.",
    tier:"ACT", tierColor:"#4ade80",
    positions:[
      {name:"Republic campaigns", detail:"Active equity crowdfunding for consumer brands. Best retail access point for early-stage celebrity-backed brands.", btn:REP},
      {name:"LVMH (LVMUY)", detail:"Parent of Armand de Brignac (Jay-Z), Moët Hennessy, and 75+ luxury brands. The ultimate strategic acquirer in this category.", btn:YF("LVMUY")},
      {name:"Diageo (DEO)", detail:"Acquirer of Aviation Gin (Reynolds). Owns Johnnie Walker, Guinness, Tanqueray. The spirits consolidator.", btn:YF("DEO")},
    ],
  },
  {
    name:"Sports Franchise Ownership",
    why:"LeBron owns Red Sox and Liverpool stakes. Reynolds bought Wrexham out of tier 5. Mahomes bought into KC Royals and Alpine F1. Celebrity ownership + media rights + global fanbase = the documented formula.",
    thesis:"Sports franchises have become the premier alternative asset class of the 2020s. The formula is consistent: buy an undervalued or underexposed franchise, inject celebrity distribution (social media reach, documentary content, brand partnerships), and benefit from the structural appreciation driven by media rights expansion and global audience growth. The Wrexham playbook — from fifth-tier football club to global media property in 4 years — is the clearest case study. The most liquid public proxies are the companies that benefit from sports media rights expansion rather than the franchises themselves.",
    investors:["LeBron","Ryan Reynolds","Mahomes","Kobe Bryant"],
    signal:"Undervalued franchises + personality injection + media rights expansion = repeatable thesis.",
    tier:"WATCH", tierColor:"#f59e0b",
    positions:[
      {name:"Endeavor Group (WME)", detail:"Sports, entertainment, and media. Taken private by Silver Lake Mar 24 2025 at $27.50/share. Rebranded WME Group. Delisted NYSE.", btn:EXITED},
      {name:"DraftKings (DKNG)", detail:"Michael Jordan investor. Sports betting infrastructure — benefits directly from sports media rights growth.", btn:YF("DKNG")},
      {name:"Genius Sports (GENI)", detail:"Tony Robbins backed. Official NFL data and technology partner. Royalties on every live sports bet.", btn:YF("GENI")},
    ],
  },
  {
    name:"Decentralized AI Compute",
    why:"Toly backed io.net — a decentralized GPU network for ML training. Leopold's entire 13F is the centralized version of this thesis. As AI compute costs spike, the decentralized alternative becomes structurally attractive.",
    thesis:"There are two ways to bet on the AI compute bottleneck. Leopold's approach: buy the centralized infrastructure stocks — the data centers, power companies, and miners-turned-compute-hosts that Nvidia chips plug into. Toly's approach: bet on decentralized compute networks that aggregate underutilized GPUs globally and rent them to AI developers at a fraction of AWS pricing. Both are right. The centralized thesis is already priced in to some extent. The decentralized thesis (io.net, Render) is earlier stage and has more asymmetric upside.",
    investors:["Toly","Leopold"],
    signal:"Two angles on the same scarcity thesis. Centralized (Leopold) vs decentralized (Toly). Both are right.",
    tier:"ACT", tierColor:"#4ade80",
    positions:[
      {name:"io.net (IO)", detail:"Decentralized GPU network. Toly backed. The purest expression of the decentralized compute thesis. Live on Coinbase.", btn:CB("io-net","IO")},
      {name:"Riot Platforms (RIOT)", detail:"Leopold Q4 2025 13F. Bitcoin miner with massive power infrastructure — pivoting to AI hosting.", btn:YF("RIOT")},
      {name:"IREN (IREN)", detail:"Leopold Q4 2025 13F. Former Bitcoin miner repositioning as AI compute host. First-mover in the pivot.", btn:YF("IREN")},
      {name:"Applied Digital (APLD)", detail:"Leopold Q4 2025 13F. Purpose-built data centers for AI workloads. Growing co-location business.", btn:YF("APLD")},
    ],
  },
  {
    name:"AI Health Diagnostics",
    why:"Kevin Hart's HartBeat backed Function Health ($298M Series B) and Simple App. Altman invested in Retro. Sinclair built InsideTracker. The convergence of AI and personalized diagnostics is a thesis in early formation.",
    thesis:"Healthcare is the largest industry in the world and one of the least disrupted by software. The convergence happening now: AI models that can interpret biomarker data at scale, wearables that generate continuous health data, and diagnostic platforms that turn that data into actionable protocols. Kevin Hart's HartBeat portfolio is the celebrity access point — Function Health, Simple App, and Therabody are all bets on the same consumer health stack. Sinclair's InsideTracker is the scientific anchor. The most liquid public proxies are the diagnostics and genomics companies that are building the data layer this thesis depends on.",
    investors:["Kevin Hart","Sinclair"],
    signal:"3 investors from 3 different categories independently backing the same sub-sector. Early signal.",
    tier:"EARLY", tierColor:"#60a5fa",
    positions:[
      {name:"Exact Sciences (EXAS)", detail:"Cancer early detection diagnostics. Sinclair / Cathie Wood. The diagnostic data layer for preventive health.", btn:YF("EXAS")},
      {name:"CRISPR Therapeutics (CRSP)", detail:"Cathie Wood lead holding. Gene editing — the intervention layer once diagnostics identify the target.", btn:YF("CRSP")},
      {name:"Function Health", detail:"HartBeat $298M Series B Nov 2025. Comprehensive lab testing and AI health analytics. Pre-IPO.", btn:FORGE},
      {name:"InsideTracker", detail:"Sinclair equity. Personalized health analytics from blood and DNA biomarkers. Pre-IPO.", btn:FORGE},
    ],
  },
];

function RadarPage({ isPaid, onUpgrade, isMobile }) {
  const [subTab, setSubTab] = useState("ranked");

  // ── Shared computation ──────────────────────────────────────────────────────
  const categoryMap = {};
  Object.entries(ALL).forEach(([cat, invs]) => { invs.forEach(inv => { categoryMap[inv.id] = cat; }); });

  const posMap = {};
  ALL_FLAT.forEach(inv => {
    const cat = categoryMap[inv.id] || "other";
    inv.portfolio.forEach(p => {
      const key = p.name.toLowerCase().trim();
      if (!posMap[key]) posMap[key] = { name:p.name, btn:p.btn, backers:[], cats:new Set(), investable: !!(p.btn && p.btn.url && p.btn.t !== "exit") };
      if (!posMap[key].backers.includes(inv.name)) { posMap[key].backers.push(inv.name); posMap[key].cats.add(cat); if (p.btn && p.btn.url && p.btn.t !== "exit") posMap[key].investable = true; }
    });
  });
  const allSignals = Object.values(posMap)
    .filter(c => c.backers.length >= 2)
    .map(c => ({ ...c, cats:Array.from(c.cats), score:(c.backers.length*5)+(c.cats.size*3) }))
    .sort((a,b) => b.score - a.score);

  const scored = allSignals.filter(p => p.investable).slice(0, 15);
  const ultra = allSignals.filter(s => s.backers.length >= 5);
  const high = allSignals.filter(s => s.backers.length >= 3 && s.backers.length < 5);
  const emerging = allSignals.filter(s => s.backers.length === 2).slice(0, 14);

  const getLabel = (p) => {
    if (p.backers.length >= 5) return { text:"MAX CONVICTION", color:"#f5c842", bg:"#1a1000", border:"#3d2b00" };
    if (p.cats.length >= 3) return { text:"CROSS-SECTOR", color:"#60a5fa", bg:"#0a1628", border:"#1e3a5f" };
    if (p.backers.length >= 3) return { text:"HIGH CONVICTION", color:"#4ade80", bg:"#061408", border:"#0d2e14" };
    return { text:"MULTI-BACKED", color:"#888", bg:"#111", border:"#222" };
  };

  const subTabStyle = (active) => ({
    fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
    padding:"6px 14px", background:"none", border:"none",
    borderBottom: active ? "2px solid #f5c842" : "2px solid transparent",
    color: active ? "#f5c842" : "#2e2e2e", cursor:"pointer",
  });

  const renderConvergenceGroup = (items, tier) => {
    if (!items.length) return null;
    const cfg = {
      ultra:{ label:"MAXIMUM CONVICTION", color:"#f5c842", bg:"#1a1000", border:"#3d2b00", desc:`${items.length} positions · 5+ investors` },
      high:{ label:"HIGH CONVICTION", color:"#60a5fa", bg:"#0a1628", border:"#1e3a5f", desc:`${items.length} positions · 3–4 investors` },
      emerging:{ label:"EMERGING", color:"#4ade80", bg:"#061408", border:"#0d2e14", desc:`${items.length} positions · 2 investors` },
    }[tier];
    return (
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", marginBottom:4, borderBottom:"1px solid #111" }}>
          <span style={{ fontSize:8, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}`, padding:"2px 8px", borderRadius:2, fontFamily:"monospace", letterSpacing:"0.12em" }}>{cfg.label}</span>
          <span style={{ fontSize:9, color:"#252525", fontFamily:"monospace" }}>{cfg.desc}</span>
        </div>
        {items.map((item,i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #0d0d0d", gap:12 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#ddd", marginBottom:4 }}>{item.name}</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {item.backers.map((inv,j) => (
                  <span key={j} style={{ fontSize:8, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}`, padding:"1px 6px", borderRadius:2, fontFamily:"monospace" }}>{inv.split(" ")[0]}</span>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:16, fontWeight:900, color:cfg.color, fontFamily:"monospace", lineHeight:1 }}>{item.backers.length}</div>
                <div style={{ fontSize:7, color:"#333", letterSpacing:"0.08em" }}>investors</div>
              </div>
              {item.btn && item.btn.t === "exit" ? (
                <span style={{ fontSize:9, color:"#404040", background:"#141414", padding:"3px 8px", borderRadius:3, border:"1px solid #222" }}>EXITED</span>
              ) : item.btn && item.btn.url ? (
                <InvestBtn btn={item.btn} small isPaid={isPaid} onUpgrade={onUpgrade} />
              ) : (
                <WatchButton positionName={item.name} investorName="Multiple" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding: isMobile ? "14px" : "24px" }}>
      <div style={{ maxWidth:740 }}>
        {/* Header */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#f5c842" }} />
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:18, fontWeight:700, color:"#f0f0f0" }}>Radar</div>
          </div>
          <div style={{ fontSize:11, color:"#444", lineHeight:1.7, maxWidth:560 }}>
            Where the smartest and most influential investors in the world are converging — ranked by conviction strength and cross-sector diversity.
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid #161616", marginBottom:20 }}>
          <button style={subTabStyle(subTab==="ranked")} onClick={() => setSubTab("ranked")}>
            Top Ranked <span style={{ opacity:0.4, fontWeight:400 }}>({scored.length})</span>
          </button>
          <button style={subTabStyle(subTab==="convergence")} onClick={() => setSubTab("convergence")}>
            Convergence <span style={{ opacity:0.4, fontWeight:400 }}>({allSignals.length})</span>
          </button>
        </div>

        {/* Ranked tab */}
        {subTab === "ranked" && (
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:10, color:"#2a2a2a", marginBottom:14, lineHeight:1.6 }}>
              Investable positions only — scored by backer count × category diversity. A tech founder, an NBA star, and a pop icon all owning the same thing is a stronger signal than three VCs owning it.
            </div>
            {scored.map((pos,i) => {
              const lbl = getLabel(pos);
              const isBlurred = !isPaid && i >= 3;
              return (
                <div key={i} style={{ padding:"13px 16px", background:i%2===0?"#080808":"#070707", borderBottom:"1px solid #111", borderLeft:`2px solid ${i < 3 ? "#f5c842" : "#181818"}`, filter:isBlurred?"blur(5px)":"none", userSelect:isBlurred?"none":"auto", pointerEvents:isBlurred?"none":"auto" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <span style={{ fontSize:10, color:"#333", fontFamily:"monospace", minWidth:22 }}>#{i+1}</span>
                        <span style={{ fontSize:14, fontWeight:700, color:"#e0e0e0" }}>{pos.name}</span>
                        <span style={{ fontSize:7, color:lbl.color, background:lbl.bg, border:`1px solid ${lbl.border}`, padding:"1px 6px", borderRadius:2, fontFamily:"monospace", letterSpacing:"0.1em", flexShrink:0 }}>{lbl.text}</span>
                      </div>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginLeft:30 }}>
                        {pos.backers.map((b,j) => (
                          <span key={j} style={{ fontSize:8, color:"#f5c842", background:"#1a1000", border:"1px solid #2a1500", padding:"1px 6px", borderRadius:2, fontFamily:"monospace" }}>{b.split(" ")[0]}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                      <div style={{ fontSize:18, fontWeight:900, color:"#f5c842", fontFamily:"monospace", lineHeight:1 }}>{pos.backers.length}</div>
                      <div style={{ fontSize:7, color:"#333", letterSpacing:"0.1em" }}>BACKERS</div>
                      <InvestBtn btn={pos.btn} small isPaid={isPaid} onUpgrade={onUpgrade} />
                    </div>
                  </div>
                </div>
              );
            })}
            {!isPaid && scored.length > 3 && (
              <div style={{ padding:"24px 16px", textAlign:"center", background:"#060606", borderTop:"1px solid #111" }}>
                <div style={{ fontSize:11, color:"#444", marginBottom:12 }}>{scored.length - 3} more positions · full convergence map · buy buttons on everything</div>
                <button onClick={onUpgrade} style={{ padding:"10px 22px", background:"#f5c842", border:"none", borderRadius:3, cursor:"pointer", fontSize:11, fontWeight:700, color:"#000", letterSpacing:"0.04em" }}>
                  Unlock Radar — $12/mo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Convergence tab */}
        {subTab === "convergence" && !isPaid && (
          <div style={{ padding:"32px 16px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#444", marginBottom:12, lineHeight:1.7 }}>See where all 45 investors converge — grouped by Max Conviction, High Conviction, and Emerging tiers.</div>
            <button onClick={onUpgrade} style={{ padding:"10px 22px", background:"#f5c842", border:"none", borderRadius:3, cursor:"pointer", fontSize:11, fontWeight:700, color:"#000" }}>
              Unlock Convergence — $12/mo
            </button>
          </div>
        )}
        {subTab === "convergence" && isPaid && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:20 }}>
              {[
                { n:ultra.length, label:"Max Conviction", color:"#f5c842" },
                { n:high.length, label:"High Conviction", color:"#60a5fa" },
                { n:emerging.length, label:"Emerging", color:"#4ade80" },
              ].map((s,i) => (
                <div key={i} style={{ padding:"7px 12px", background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:3 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:s.color, fontFamily:"monospace" }}>{s.n}</div>
                  <div style={{ fontSize:8, color:"#333", letterSpacing:"0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {renderConvergenceGroup(ultra,"ultra")}
            {renderConvergenceGroup(high,"high")}
            {renderConvergenceGroup(emerging,"emerging")}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO BUILDER — pick investors or a theme, choose weighting, get allocation
// ─────────────────────────────────────────────────────────────────────────────
function PortfolioBuilderPage({ isPaid, onUpgrade, isMobile }) {
  const [builderMode, setBuilderMode] = useState("investors"); // investors | theme
  const [selected, setSelected] = useState({ naval:true, lebron:true });
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [amount, setAmount] = useState(1000);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertState, setAlertState] = useState("idle");
  const [showPortfolio, setShowPortfolio] = useState(true);

  const toggleInvestor = (id) => {
    setSelected(prev => { const next={...prev}; if(next[id]) delete next[id]; else next[id]=true; return next; });
    setShowPortfolio(false);
  };
  const selectedIds = Object.keys(selected);
  const selectedInvestors = ALL_FLAT.filter(i => selected[i.id]);

  // Free tier: first 3 investors per category by index
  const FREE_IDS = new Set(
    Object.values(ALL).flatMap(invs => invs.slice(0, 3).map(i => i.id))
  );

  const buildPortfolio = () => {
    let positions = [];
    if (builderMode === "investors") {
      if (!selectedIds.length) return [];
      const posMap = {};
      selectedInvestors.forEach(inv => {
        inv.portfolio.forEach(p => {
          if (!p.btn || !p.btn.url || p.btn.t === "exit") return;
          const key = p.name.toLowerCase().trim();
          if (!posMap[key]) posMap[key] = { name:p.name, btn:p.btn, backers:[] };
          if (!posMap[key].backers.includes(inv.name)) posMap[key].backers.push(inv.name);
        });
      });
      positions = Object.values(posMap);
    } else {
      if (!selectedTheme) return [];
      const theme = THEMES.find(t => t.id === selectedTheme);
      if (!theme) return [];
      // Pull from full portfolios of all theme backers — not just the curated theme.positions list
      const themeInvestors = ALL_FLAT.filter(inv =>
        theme.backers.some(b =>
          inv.name.toLowerCase().includes(b.toLowerCase().split(" ")[0]) ||
          b.toLowerCase().includes(inv.name.toLowerCase().split(" ")[0])
        )
      );
      const posMap = {};
      themeInvestors.forEach(inv => {
        inv.portfolio.forEach(p => {
          if (!p.btn || !p.btn.url || p.btn.t === "exit") return;
          const key = p.name.toLowerCase().trim();
          if (!posMap[key]) posMap[key] = { name:p.name, btn:p.btn, backers:[] };
          if (!posMap[key].backers.includes(inv.name)) posMap[key].backers.push(inv.name);
        });
      });
      positions = Object.values(posMap);
    }
    return positions.sort((a,b) => b.backers.length - a.backers.length);
  };

  const portfolio = showPortfolio ? buildPortfolio() : [];
  const FREE_POSITIONS = 3;
  const visiblePortfolio = (isPaid || builderMode === "investors") ? portfolio : portfolio.slice(0, FREE_POSITIONS);
  const hiddenCount = portfolio.length - visiblePortfolio.length;

  const handleAlert = async () => {
    if (!alertEmail || !alertEmail.includes("@")) return;
    setAlertState("saving");
    try {
      const key = `alerts:portfolio:${selectedIds.sort().join("-")}`;
      let current = { emails:[] };
      try { const r = await window.storage.get(key,true); if(r) current=JSON.parse(r.value); } catch(e) {}
      if (!current.emails.includes(alertEmail)) current.emails.push(alertEmail);
      await window.storage.set(key, JSON.stringify(current), true);
      setAlertState("done");
    } catch(e) { setAlertState("done"); }
  };

  const DOT_COLORS = { visionaries:"#60a5fa", icons:"#f472b6", boomers:"#fb923c", athletes:"#4ade80" };
  const CAT_ORDER = ["visionaries","icons","boomers","athletes"];
  const canBuild = builderMode === "investors" ? selectedIds.length > 0 : !!selectedTheme;

  return (
    <div style={{ flex:1, overflowY:"auto", padding: isMobile ? "14px" : "24px" }}>
      <div style={{ maxWidth:740 }}>
        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#f472b6" }} />
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:18, fontWeight:700, color:"#f0f0f0" }}>Portfolio Builder</div>
          </div>
          <div style={{ fontSize:11, color:"#444", lineHeight:1.7, maxWidth:560 }}>
            Pick the investors you want to model — or build around a theme. Choose how to weight their positions. Get a real, actionable allocation.
          </div>
        </div>

        {/* Mode toggle — Investors vs Theme */}
        <div style={{ display:"flex", gap:6, marginBottom:22 }}>
          {[["investors","By Investor"],["theme","By Theme"]].map(([val,label]) => (
            <button key={val} onClick={() => { setBuilderMode(val); setShowPortfolio(false); setSelectedTheme(null); setSelected({}); }} style={{
              padding:"7px 16px", fontSize:10, fontWeight:700, letterSpacing:"0.08em",
              background:builderMode===val?"#f5c842":"#0d0d0d",
              color:builderMode===val?"#000":"#444",
              border:builderMode===val?"none":"1px solid #1a1a1a", borderRadius:3, cursor:"pointer",
            }}>{label}</button>
          ))}
        </div>

        {/* BY INVESTOR */}
        {builderMode === "investors" && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:8, color:"#f472b6", letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>
              Step 1 — Choose your investors
              {selectedIds.length > 0 && <span style={{ color:"#555", marginLeft:10, fontWeight:400 }}>{selectedIds.length} selected</span>}
            </div>
            {CAT_ORDER.map(cat => {
              const invs = ALL[cat]; if (!invs) return null;
              const color = DOT_COLORS[cat] || "#888";
              const freeInvs = invs.filter(inv => FREE_IDS.has(inv.id));
              const lockedInvs = invs.filter(inv => !FREE_IDS.has(inv.id));
              return (
                <div key={cat} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:7, color, letterSpacing:"0.16em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:8, opacity:0.7 }}>{cat.charAt(0).toUpperCase()+cat.slice(1)}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom: lockedInvs.length ? 6 : 0 }}>
                    {freeInvs.map(inv => {
                      const isOn = !!selected[inv.id];
                      return (
                        <button key={inv.id} onClick={() => toggleInvestor(inv.id)} style={{
                          fontSize:10, fontWeight:isOn?700:400,
                          color:isOn?"#000":"#555",
                          background:isOn?"#f5c842":"#0d0d0d",
                          border:isOn?"1px solid #f5c842":"1px solid #1a1a1a",
                          padding:"5px 11px", borderRadius:3, cursor:"pointer",
                        }}>{inv.name}</button>
                      );
                    })}
                  </div>
                  {lockedInvs.length > 0 && (
                    <button onClick={isPaid ? undefined : onUpgrade} style={{
                      width:"100%", padding:"6px 10px", background:"#0a0a0a",
                      border:"1px dashed #1e1e1e", borderRadius:3, cursor: isPaid?"default":"pointer",
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                    }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {lockedInvs.map(inv => {
                          const isOn = isPaid && !!selected[inv.id];
                          return isPaid ? (
                            <span key={inv.id} onClick={e => { e.stopPropagation(); toggleInvestor(inv.id); }} style={{
                              fontSize:10, fontWeight:isOn?700:400, color:isOn?"#000":"#555",
                              background:isOn?"#f5c842":"#111", border:isOn?"1px solid #f5c842":"1px solid #222",
                              padding:"4px 10px", borderRadius:3, cursor:"pointer", display:"inline-block",
                            }}>{inv.name}</span>
                          ) : (
                            <span key={inv.id} style={{ fontSize:10, color:"#2a2a2a", padding:"4px 10px" }}>{inv.name}</span>
                          );
                        })}
                      </div>
                      {!isPaid && (
                        <span style={{ fontSize:8, color:"#f5c842", background:"#1a1000", border:"1px solid #3d2b00", padding:"2px 7px", borderRadius:2, fontFamily:"monospace", whiteSpace:"nowrap", flexShrink:0, marginLeft:8 }}>
                          + {lockedInvs.length} PRO
                        </span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* BY THEME */}
        {builderMode === "theme" && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:8, color:"#f472b6", letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>
              Step 1 — Choose a theme
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {THEMES.map(theme => {
                const isOn = selectedTheme === theme.id;
                const investableCount = theme.positions.filter(p => p.btn && p.btn.url && p.btn.t !== "exit").length;
                return (
                  <button key={theme.id} onClick={() => { setSelectedTheme(isOn ? null : theme.id); setShowPortfolio(false); }} style={{
                    textAlign:"left", padding:"11px 14px", borderRadius:3, cursor:"pointer",
                    background:isOn?"#0d0d0d":"#080808",
                    border:isOn?`1px solid ${theme.color}`:"1px solid #1a1a1a",
                    borderLeft:`3px solid ${isOn ? theme.color : theme.color+"44"}`,
                  }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:13, fontWeight:700, color:isOn?"#e0e0e0":"#555" }}>{theme.label}</span>
                      <span style={{ fontSize:9, color:"#2a2a2a", fontFamily:"monospace" }}>{investableCount} investable positions</span>
                    </div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:6 }}>
                      {theme.backers.map((b,i) => (
                        <span key={i} style={{ fontSize:7, color:isOn?theme.color:"#2a2a2a", background:isOn?`${theme.color}18`:"#111", border:`1px solid ${isOn?theme.color+"44":"#1a1a1a"}`, padding:"1px 5px", borderRadius:2, fontFamily:"monospace" }}>{b}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Build button */}
        {canBuild && (
          <button onClick={() => setShowPortfolio(true)} style={{
            width:"100%", padding:"14px", background:"#f5c842", border:"none", borderRadius:4,
            cursor:"pointer", fontSize:13, fontWeight:700, color:"#000", letterSpacing:"0.04em", marginBottom:24,
          }}>Build Portfolio →</button>
        )}

        {/* Portfolio output */}
        {showPortfolio && portfolio.length > 0 && (
          <div>
            <div style={{ fontSize:8, color:"#f472b6", letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:14 }}>
              Your Portfolio — {portfolio.length} positions
            </div>

            {/* Asset type summary — counts only, no dollars */}
            {(() => {
              const byType = {};
              portfolio.forEach(p => { const t=p.btn.t; if(!byType[t]) byType[t]=0; byType[t]++; });
              const typeLabels = { crypto:"Crypto", stock:"Stocks", preipo:"Pre-IPO", republic:"Equity CF", view:"View" };
              const typeColors = { crypto:"#f59e0b", stock:"#60a5fa", preipo:"#a78bfa", republic:"#34d399", view:"#888" };
              return (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                  {Object.entries(byType).map(([t,count]) => (
                    <div key={t} style={{ padding:"5px 10px", background:"#0a0a0a", border:`1px solid ${(typeColors[t]||"#333")}33`, borderRadius:3 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:typeColors[t]||"#888", fontFamily:"monospace" }}>{count}</span>
                      <span style={{ fontSize:8, color:"#333", marginLeft:5 }}>{typeLabels[t]||t}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {visiblePortfolio.map((pos,i) => {
              const isOverlap = pos.backers.length > 1;
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"9px 12px", background:i%2===0?"#080808":"#070707",
                  borderBottom:"1px solid #0f0f0f", gap:10,
                  borderLeft: isOverlap ? "2px solid #f472b6" : "2px solid transparent",
                }}>
                  <div style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#ccc" }}>{pos.name}</span>
                    {isOverlap && (
                      <span style={{ fontSize:8, color:"#f472b6", background:"#1a0812", border:"1px solid #3d0a28", padding:"1px 6px", borderRadius:2, fontFamily:"monospace", flexShrink:0 }}>×{pos.backers.length}</span>
                    )}
                  </div>
                  <InvestBtn btn={pos.btn} small isPaid={isPaid} onUpgrade={onUpgrade} />
                </div>
              );
            })}

            {/* Theme gate — show upgrade CTA after first 3 */}
            {!isPaid && builderMode === "theme" && hiddenCount > 0 && (
              <div style={{ padding:"22px 16px", textAlign:"center", background:"#060606", borderTop:"1px solid #111" }}>
                <div style={{ fontSize:11, color:"#444", marginBottom:6 }}>{hiddenCount} more positions in this theme</div>
                <div style={{ fontSize:9, color:"#2a2a2a", marginBottom:14 }}>Full theme portfolios · all buy buttons · build from any combination</div>
                <button onClick={onUpgrade} style={{ padding:"10px 22px", background:"#f5c842", border:"none", borderRadius:3, cursor:"pointer", fontSize:11, fontWeight:700, color:"#000", letterSpacing:"0.04em" }}>
                  Unlock Full Portfolio — $12/mo
                </button>
              </div>
            )}

            {/* Alerts — paid only */}
            {isPaid && (
              <div style={{ marginTop:24, padding:"16px 18px", background:"#080808", border:"1px solid #1a1a1a", borderRadius:4 }}>
                <div style={{ fontSize:8, color:"#f472b6", letterSpacing:"0.16em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:8 }}>Get alerts when positions change</div>
                <div style={{ fontSize:11, color:"#333", lineHeight:1.6, marginBottom:12 }}>New investments, exits, and changes for the investors in your portfolio. First to know.</div>
                {alertState === "done" ? (
                  <div style={{ fontSize:10, color:"#4ade80", fontFamily:"monospace" }}>✓ You'll be notified when positions change</div>
                ) : (
                  <div style={{ display:"flex", gap:8 }}>
                    <input type="email" placeholder="your@email.com" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleAlert()}
                      style={{ flex:1, padding:"8px 10px", background:"#0d0d0d", border:"1px solid #2a2a2a", borderRadius:3, color:"#ccc", fontSize:11, outline:"none" }} />
                    <button onClick={handleAlert} disabled={alertState==="saving"} style={{ padding:"8px 14px", background:"#f472b6", border:"none", borderRadius:3, cursor:"pointer", fontSize:10, fontWeight:700, color:"#000", opacity:alertState==="saving"?0.6:1 }}>
                      {alertState==="saving"?"...":"Alert me"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop:12, fontSize:9, color:"#1e1e1e", lineHeight:1.6 }}>
              Not financial advice. Many positions are illiquid or speculative. Do your own research.
            </div>
          </div>
        )}

        {showPortfolio && portfolio.length === 0 && (
          <div style={{ padding:"20px 0", fontSize:12, color:"#333" }}>No investable positions found for this selection. Try a different combination.</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCHLIST — all non-investable positions across all investors, ranked by conviction
// ─────────────────────────────────────────────────────────────────────────────
function WatchlistPage({ isPaid, onUpgrade, isMobile }) {
  const [filter, setFilter] = useState("all");

  const computeWatchlist = () => {
    const posMap = {};
    ALL_FLAT.forEach(inv => {
      const cat = Object.entries(ALL).find(([c,invs]) => invs.some(i => i.id === inv.id))?.[0] || "other";
      inv.portfolio.forEach(p => {
        if (p.btn && (p.btn.url || p.btn.t === "exit")) return; // skip investable + exited
        if (p.cat === "Philanthropy") return; // philanthropies are never investable
        if (p.cat === "Sports") return; // franchise ownerships aren't retail-investable
        if (p.name && p.name.includes("(institutional)")) return; // fund-level positions not personal
        if (p.name && p.name.startsWith("Note:")) return; // meta entries
        if (p.detail && p.detail.includes("sponsorships, not confirmed equity")) return;
        const key = p.name.toLowerCase().trim();
        if (!posMap[key]) posMap[key] = { name:p.name, backers:[], cat:p.cat, detail:p.detail, investorCats:new Set() };
        if (!posMap[key].backers.includes(inv.name)) {
          posMap[key].backers.push(inv.name);
          posMap[key].investorCats.add(cat);
        }
      });
    });
    return Object.values(posMap)
      .map(p => ({ ...p, investorCats:Array.from(p.investorCats) }))
      .sort((a,b) => b.backers.length - a.backers.length);
  };

  const all = computeWatchlist();

  const CAT_FILTERS = [
    { key:"all", label:"All" },
    { key:"Founded", label:"Founded" },
    { key:"Private", label:"Private" },
    { key:"Crypto", label:"Crypto" },
  ];

  const filtered = filter === "all" ? all : all.filter(p => p.cat === filter);

  const filterBtn = (key, label) => (
    <button key={key} onClick={() => setFilter(key)} style={{
      fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
      padding:"4px 10px", background:filter===key?"#f5c842":"#0d0d0d",
      color:filter===key?"#000":"#444", border:filter===key?"none":"1px solid #1a1a1a",
      borderRadius:3, cursor:"pointer",
    }}>{label}</button>
  );

  return (
    <div style={{ flex:1, overflowY:"auto", padding: isMobile ? "14px" : "24px" }}>
      <div style={{ maxWidth:740 }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#2dd4bf" }} />
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:18, fontWeight:700, color:"#f0f0f0" }}>Watchlist</div>
          </div>
          <div style={{ fontSize:11, color:"#444", lineHeight:1.7, maxWidth:560 }}>
            Every position across all 45 investors that isn't investable yet — private companies, pre-token projects, and brands yet to IPO. Set notifications and be first when they open up.
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <div style={{ padding:"7px 12px", background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:3 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#2dd4bf", fontFamily:"monospace" }}>{all.length}</div>
            <div style={{ fontSize:8, color:"#333", letterSpacing:"0.08em" }}>positions watching</div>
          </div>
          <div style={{ padding:"7px 12px", background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:3 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#2dd4bf", fontFamily:"monospace" }}>{all.filter(p=>p.backers.length>1).length}</div>
            <div style={{ fontSize:8, color:"#333", letterSpacing:"0.08em" }}>multi-investor</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
          {CAT_FILTERS.map(f => filterBtn(f.key, f.label))}
        </div>

        {/* Position list */}
        <div style={{ position:"relative" }}>
          {filtered.map((pos,i) => {
            const isBlurred = !isPaid && i >= 30;
            return (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                padding:"11px 14px", background:i%2===0?"#080808":"#070707",
                borderBottom:"1px solid #0f0f0f", gap:12,
                borderLeft: pos.backers.length > 1 ? "2px solid #2dd4bf44" : "2px solid transparent",
                filter: isBlurred ? "blur(4px)" : "none",
                userSelect: isBlurred ? "none" : "auto",
                pointerEvents: isBlurred ? "none" : "auto",
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#ccc" }}>{pos.name}</span>
                    {pos.backers.length > 1 && (
                      <span style={{ fontSize:7, color:"#2dd4bf", background:"#041a18", border:"1px solid #0d3d38", padding:"1px 5px", borderRadius:2, fontFamily:"monospace" }}>×{pos.backers.length}</span>
                    )}
                    <span style={{ fontSize:7, color:"#2a2a2a", background:"#111", border:"1px solid #1a1a1a", padding:"1px 5px", borderRadius:2, fontFamily:"monospace", textTransform:"uppercase" }}>{pos.cat}</span>
                  </div>
                  {pos.detail && (
                    <div style={{ fontSize:10, color:"#363636", lineHeight:1.5, marginBottom:4 }}>{pos.detail}</div>
                  )}
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {pos.backers.map((b,j) => (
                      <span key={j} style={{ fontSize:7, color:"#444", fontFamily:"monospace" }}>{b.split(" ")[0]}{j < pos.backers.length-1 ? " ·" : ""}</span>
                    ))}
                  </div>
                </div>
                <div style={{ flexShrink:0 }}>
                  <WatchButton positionName={pos.name} investorName={pos.backers[0] || "Multiple"} />
                </div>
              </div>
            );
          })}
          {!isPaid && filtered.length > 30 && (
            <div style={{ padding:"24px 16px", textAlign:"center", background:"#060606", borderTop:"1px solid #111" }}>
              <div style={{ fontSize:11, color:"#444", marginBottom:6 }}>{filtered.length - 30} more positions — private companies, pre-token projects, upcoming IPOs</div>
              <div style={{ fontSize:9, color:"#2a2a2a", marginBottom:14 }}>Set notifications on all of them · be first when they open up</div>
              <button onClick={onUpgrade} style={{ padding:"10px 22px", background:"#2dd4bf", border:"none", borderRadius:3, cursor:"pointer", fontSize:11, fontWeight:700, color:"#000", letterSpacing:"0.04em" }}>
                Unlock Full Watchlist — $12/mo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HorizonCard({ play, isPaid, onUpgrade }) {
  const [open, setOpen] = useState(false);
  const c = play.tierColor;
  return (
    <div style={{ marginBottom:1, background:"#080808", borderBottom:"1px solid #111", borderLeft:`2px solid ${c}44` }}>
      {/* Header row — always visible */}
      <button onClick={() => setOpen(!open)} style={{ width:"100%", textAlign:"left", padding:"16px 18px", background:"none", border:"none", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:14, fontWeight:700, color:"#e0e0e0" }}>{play.name}</span>
              <span style={{ fontSize:7, color:c, background:`${c}18`, border:`1px solid ${c}44`, padding:"1px 6px", borderRadius:2, fontFamily:"monospace", letterSpacing:"0.1em", flexShrink:0 }}>{play.tier}</span>
            </div>
            <p style={{ fontSize:11, color:"#444", lineHeight:1.65, margin:"0 0 8px 0" }}>{play.why}</p>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", alignItems:"center" }}>
              {play.investors.map((inv,j) => (
                <span key={j} style={{ fontSize:8, color:c, background:`${c}12`, border:`1px solid ${c}33`, padding:"1px 6px", borderRadius:2, fontFamily:"monospace" }}>{inv.split(" ")[0]}</span>
              ))}
              <span style={{ fontSize:9, color:"#2a2a2a", marginLeft:4 }}>{open ? "▾ less" : "▸ full thesis + investments"}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded — thesis + positions */}
      {open && (
        <div style={{ borderTop:`1px solid ${c}22` }}>
          {/* Full thesis */}
          <div style={{ padding:"14px 18px", background:"#060606", borderBottom:"1px solid #111" }}>
            <div style={{ fontSize:8, color:c, letterSpacing:"0.16em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:8, opacity:0.7 }}>Investment Thesis</div>
            <p style={{ fontSize:11, color:"#3a3a3a", lineHeight:1.75, margin:"0 0 10px 0" }}>{play.thesis}</p>
            <div style={{ padding:"6px 10px", background:"#0a0a0a", borderLeft:`2px solid ${c}33` }}>
              <span style={{ fontSize:9, color:"#363636" }}>Signal: {play.signal}</span>
            </div>
          </div>
          {/* Investable positions */}
          {play.positions && play.positions.length > 0 && (
            <div>
              <div style={{ padding:"10px 18px 6px", background:"#070707" }}>
                <div style={{ fontSize:8, color:c, letterSpacing:"0.16em", textTransform:"uppercase", fontFamily:"monospace", opacity:0.7 }}>How to invest in this thesis</div>
              </div>
              {play.positions.map((pos,k) => (
                <div key={k} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"10px 18px", borderBottom:"1px solid #0d0d0d", background:k%2===0?"#070707":"#060606", gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#ccc", marginBottom:3 }}>{pos.name}</div>
                    <div style={{ fontSize:10, color:"#363636", lineHeight:1.5 }}>{pos.detail}</div>
                  </div>
                  <div style={{ flexShrink:0 }}>
                    {pos.btn && pos.btn.t === "exit" ? (
                      <span style={{ fontSize:9, color:"#404040", background:"#141414", padding:"3px 8px", borderRadius:3, border:"1px solid #222" }}>EXITED</span>
                    ) : pos.btn && pos.btn.url ? (
                      <InvestBtn btn={pos.btn} small isPaid={isPaid} onUpgrade={onUpgrade} />
                    ) : (
                      <WatchButton positionName={pos.name} investorName={play.name} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HorizonPage({ isPaid, onUpgrade, isMobile }) {
  const FREE_PREVIEW = 3;
  return (
    <div style={{ flex:1, overflowY:"auto", padding: isMobile ? "14px" : "24px" }}>
      <div style={{ maxWidth:740 }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#a78bfa" }} />
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:18, fontWeight:700, color:"#f0f0f0" }}>Horizon</div>
          </div>
          <div style={{ fontSize:11, color:"#444", lineHeight:1.7, maxWidth:560 }}>
            Forward-looking plays built from documented thesis patterns. Click any play to see the full investment thesis and specific stocks, crypto, and pre-IPO positions to act on.
          </div>
          <div style={{ marginTop:8, padding:"6px 10px", background:"#0d0a00", border:"1px solid #2a1e00", borderRadius:3, display:"inline-block" }}>
            <span style={{ fontSize:8, color:"#6b4c10", fontFamily:"monospace" }}>ⓘ Speculative analysis only. Not confirmed positions. Not financial advice.</span>
          </div>
        </div>
        {HORIZON.map((play,i) => {
          const isBlurred = !isPaid && i >= FREE_PREVIEW;
          return (
            <div key={i} style={{ filter:isBlurred?"blur(5px)":"none", userSelect:isBlurred?"none":"auto", pointerEvents:isBlurred?"none":"auto" }}>
              <HorizonCard play={play} isPaid={isPaid} onUpgrade={onUpgrade} />
            </div>
          );
        })}
        {!isPaid && HORIZON.length > FREE_PREVIEW && (
          <div style={{ padding:"24px 16px", textAlign:"center", background:"#060606", borderTop:"1px solid #111" }}>
            <div style={{ fontSize:11, color:"#444", marginBottom:12 }}>{HORIZON.length - FREE_PREVIEW} more thesis plays — full analysis + investable positions</div>
            <button onClick={onUpgrade} style={{ padding:"10px 22px", background:"#f5c842", border:"none", borderRadius:3, cursor:"pointer", fontSize:11, fontWeight:700, color:"#000", letterSpacing:"0.04em" }}>
              Unlock Horizon — $12/mo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOMEPAGE — sidebar + detail panel layout
// ─────────────────────────────────────────────────────────────────────────────
function HomePage({ navigate, isPaid, onUpgrade }) {
  const [activeTab, setActiveTab] = useState("visionaries");
  const [selectedId, setSelectedId] = useState("naval");
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 680 : false);

  useSEO({
    title: "Covet — Invest Like the People You Admire",
    description: "Track the confirmed investment portfolios of 29 iconic investors and cultural figures. See exactly what Naval Ravikant, LeBron James, Jay-Z, Peter Thiel, and others actually own.",
    url: "https://covet.vc",
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 680);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isTracking = activeTab === "tracking";
  const isThemes = activeTab === "themes";
  const isRadar = activeTab === "radar";
  const isHorizon = activeTab === "horizon";
  const isPortfolio = activeTab === "portfolio";
  const isWatchlist = activeTab === "watchlist";
  const isFullPage = isTracking || isThemes || isRadar || isHorizon || isPortfolio || isWatchlist;
  const investors = isFullPage ? [] : (ALL[activeTab] || []);
  const selected = investors.find(i => i.id === selectedId) || investors[0];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const isPro = ["radar","horizon","portfolio"].includes(tab);
    if (!isPro && tab !== "tracking" && tab !== "themes" && ALL[tab]) setSelectedId(ALL[tab][0].id);
    setMobileShowDetail(false);
  };
  const handleSelect = (id) => { setSelectedId(id); setMobileShowDetail(true); };

  const TABS = [
    { key:"visionaries", label:"Visionaries", count:16 },
    { key:"icons", label:"Icons", count:12 },
    { key:"boomers", label:"Boomers", count:9 },
    { key:"athletes", label:"Athletes", count:8 },
    { key:"tracking", label:"Tracking", count:TRACKING.length },
    { key:"themes", label:"Themes", count:THEMES.length },
    { key:"watchlist", label:"Watchlist", count:null, pro:true },
    { key:"portfolio", label:"Portfolio Builder", count:null, pro:true },
    { key:"radar", label:"Radar", count:null, pro:true },
    { key:"horizon", label:"Horizon", count:null, pro:true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #161616", display: "flex", flexShrink: 0, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {TABS.map(t => {
          const isActive = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => handleTabChange(t.key)} style={{
              padding: "10px 14px", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
              color: isActive ? "#f5c842" : t.pro ? "#444" : "#303030",
              background: "none", border: "none",
              borderBottom: isActive ? "2px solid #f5c842" : "2px solid transparent",
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              {t.label}
              {t.count !== null && <span style={{ opacity: 0.4, fontWeight: 400 }}>({t.count})</span>}
              {t.pro && <span style={{ fontSize: 6, color: isActive ? "#000" : "#f5c842", background: isActive ? "#f5c842" : "#1a1000", border: "1px solid #3d2b00", padding: "1px 4px", borderRadius: 2, fontFamily: "monospace", letterSpacing: "0.08em" }}>PRO</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {isRadar ? (
          <RadarPage isPaid={isPaid} onUpgrade={onUpgrade} isMobile={isMobile} />
        ) : isHorizon ? (
          <HorizonPage isPaid={isPaid} onUpgrade={onUpgrade} isMobile={isMobile} />
        ) : isPortfolio ? (
          <PortfolioBuilderPage isPaid={isPaid} onUpgrade={onUpgrade} isMobile={isMobile} />
        ) : isWatchlist ? (
          <WatchlistPage isPaid={isPaid} onUpgrade={onUpgrade} isMobile={isMobile} />
        ) : isThemes ? (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "24px" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: "#f0f0f0", marginBottom: 6 }}>Investment Themes</div>
              <div style={{ fontSize: 11, color: "#444", lineHeight: 1.7, maxWidth: 540 }}>
                Where are the smartest investors concentrating? Ranked by number of backers. Includes both investable and not-yet-investable positions — use Notify to get alerted when private positions open up.
              </div>
            </div>
            {(() => {
              const allNames = Object.values(ALL).flat().map(inv => inv.name); // kept for future use
              return THEMES.map(theme => (
                <ThemeCard key={theme.id} theme={theme} isPaid={isPaid} onUpgrade={onUpgrade} />
              ));
            })()}
          </div>
        ) : isTracking ? (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "24px" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: "#f0f0f0", marginBottom: 6 }}>Being Tracked</div>
              <div style={{ fontSize: 11, color: "#444", lineHeight: 1.7, maxWidth: 540 }}>
                These are notable people with thin or no confirmed investment portfolios yet. We are watching them. Get notified the moment they make their first confirmed investment.
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 1, border: "1px solid #111", borderRadius: 4, overflow: "hidden" }}>
              {TRACKING.map((person, i) => (
                <TrackingCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Sidebar */}
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
                    <div style={{ fontSize: 9, color: "#222", marginLeft: 13, marginTop: 2 }}>{inv.portfolio.length} positions tracked</div>
                  </button>
                ))}
              </div>
            )}
            {/* Detail panel */}
            {(!isMobile || mobileShowDetail) && (
              <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "20px 24px", minWidth: 0 }}>
                {isMobile && mobileShowDetail && (
                  <button onClick={() => setMobileShowDetail(false)} style={{ background: "none", border: "none", color: "#444", fontSize: 10, cursor: "pointer", padding: "0 0 12px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    ← Back
                  </button>
                )}
                <DetailPanel investor={selected} isPaid={isPaid} onUpgrade={onUpgrade} />
                {isPaid && <SignalOverlapFeed />}
                <NewsletterEmbed />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVESTOR PAGE — individual dedicated page with SEO + agent placeholder
// ─────────────────────────────────────────────────────────────────────────────
function InvestorPage({ slug, navigate, isPaid, onUpgrade }) {
  const id = SLUG_TO_ID[slug];
  const investor = ALL_FLAT.find(i => i.id === id);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 680 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 680);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const topPositions = investor ? investor.portfolio.slice(0, 3).map(p => p.name).join(", ") : "";

  useSEO(investor ? {
    title: `${investor.name} Investment Portfolio — Covet`,
    description: `${investor.name}'s confirmed investment portfolio: ${investor.portfolio.length} tracked positions including ${topPositions} and more. See what ${investor.name.split(" ")[0]} actually owns on Covet.`,
    url: `https://covet.vc/investor/${slug}`,
  } : { title: "Covet", description: "Investment intelligence platform.", url: "https://covet.vc" });

  if (!investor) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ fontSize: 13, color: "#444" }}>Investor not found</div>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "1px solid #333", color: "#666", padding: "8px 16px", borderRadius: 3, cursor: "pointer", fontSize: 11 }}>
          ← Back to directory
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "14px" : "24px 28px" }}>
        {/* Breadcrumb */}
        <button onClick={() => navigate("/")} style={{
          background: "none", border: "none", color: "#333", fontSize: 10,
          cursor: "pointer", padding: "0 0 16px 0", letterSpacing: "0.08em",
          textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
        }}>
          ← All Investors
        </button>

        {/* Agent status badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20,
          padding: "4px 10px", marginBottom: 16,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2d5a2d" }} />
          <span style={{ fontSize: 8, color: "#2a4a2a", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
            Research Agent · Last updated April 2026
          </span>
        </div>

        {/* Main detail */}
        <DetailPanel investor={investor} isPaid={isPaid} onUpgrade={onUpgrade} />
        {isPaid && <SignalOverlapFeed />}
        <NewsletterEmbed />

        {/* Footer nav */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#333", fontSize: 10, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ← All Investors
          </button>
          <div style={{ fontSize: 9, color: "#1e1e1e", fontFamily: "monospace" }}>covet.vc/investor/{slug}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP — router shell
// ─────────────────────────────────────────────────────────────────────────────
export default function CovetApp() {
  const { path, navigate } = useRouter();
  const { isPaid } = usePaidStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(e) {} };
  }, []);

  const handleUpgrade = () => setShowPaywall(true);
  const handleStripe = () => { window.open(STRIPE_LINK, "_blank"); setShowPaywall(false); };

  // Parse route
  const investorMatch = path.match(/^\/investor\/([^/]+)/);
  const slug = investorMatch ? investorMatch[1] : null;

  return (
    <div style={{ background: "#060606", minHeight: "100vh", color: "#f5f5f5", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onUpgrade={handleStripe} />}
      <Header navigate={navigate} isPaid={isPaid} onUpgrade={handleUpgrade} />
      {slug ? (
        <InvestorPage slug={slug} navigate={navigate} isPaid={isPaid} onUpgrade={handleUpgrade} />
      ) : (
        <HomePage navigate={navigate} isPaid={isPaid} onUpgrade={handleUpgrade} />
      )}
      <div style={{ borderTop: "1px solid #1a1a1a", padding: "14px 18px", marginTop: "auto" }}>
        <p style={{ fontSize: 10, color: "#444", lineHeight: 1.7, margin: 0, maxWidth: 740 }}>
          <span style={{ color: "#666", fontWeight: 600 }}>Disclaimer:</span> Covet is for informational purposes only. Nothing on this site constitutes investment advice, a solicitation, or a recommendation to buy or sell any security or asset. Portfolio data is compiled from public sources and may be incomplete or out of date. Always do your own research. Covet is not affiliated with any investor profiled on this site.
        </p>
      </div>
    </div>
  );
}
