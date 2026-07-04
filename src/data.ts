import { BlogArticle, FAQItem } from "./types";

export const FAQ_DATA: FAQItem[] = [
  {
    question: "What is a temporary / disposable / anonymous mail?",
    answer: "A temporary, disposable, or anonymous email address is a short-lived email account that is generated instantly and on-demand. It allows you to receive emails (such as confirmation links, activation codes, or newsletters) without giving away your real, personal, or professional email address, keeping you secure from unsolicited marketing and trackers."
  },
  {
    question: "Why do you need a temporary email address?",
    answer: "Using a burner email lets you download files, register on forums, or test web services without exposing your real identity. This completely blocks spam emails, promotional offers, and tracking attempts from reaching your personal or professional inbox."
  },
  {
    question: "How long are emails kept?",
    answer: "By default, your generated disposable address remains active for 3 minutes. Since we use strictly ephemeral memory storage with zero logs to save on server storage and protect your privacy, all messages are automatically deleted and permanently wiped when the 3-minute timer expires, or when you click 'Delete'. You can easily extend the timer inside the dashboard if you need more time."
  },
  {
    question: "Do emails stay private? Do you read messages?",
    answer: "No, we never read your messages, and we do not store them permanently. All incoming emails are processed in-memory and are irreversibly deleted from our systems when their timer expires or when you manually click the 'Delete' button. Your privacy is 100% guaranteed."
  },
  {
    question: "Where do I see if I've received an email?",
    answer: "All incoming emails are displayed in real-time in the inbox section directly on our homepage. The inbox auto-refreshes every 5–10 seconds, so you don't even need to refresh the page manually."
  },
  {
    question: "How do I change the email address?",
    answer: "You can click the 'Change Address' or 'Refresh' buttons above the address box. This allows you to generate a new randomized email address immediately, or choose a custom username and domain from the dropdown lists."
  },
  {
    question: "Can you recover deleted emails?",
    answer: "No. Once an email address or message is deleted, it is permanently and irreversibly purged from our routing servers. It cannot be recovered by you, us, or anyone else."
  },
  {
    question: "What is the difference of disposable mail from the usual email?",
    answer: "Usual email addresses are permanent, require personal details (name, phone number) to register, and are linked to your real identity. Disposable mail is completely anonymous, requires zero registration, lasts for a limited duration, and leaves no footprint."
  },
  {
    question: "How to send email?",
    answer: "Our service is strictly an inbound-only mail utility. We do not allow sending emails. This security measure prevents malicious actors from abusing our domains to send spam or phishing emails, maintaining high inbox deliverability rates for your incoming verifications."
  },
  {
    question: "Is temp mail safe?",
    answer: "Yes, temporary mail is highly secure for registering on non-sensitive sites (forums, downloads, trials). However, we strongly advise against using it for highly confidential personal portals, such as online banking, health accounts, or primary utilities, where you might need long-term access to retrieve password resets."
  },
  {
    question: "Do you have browser extension?",
    answer: "Yes! Check our browser extensions to generate randomized temporary email addresses with a single click directly from your browser toolbar. Safely shield your privacy on any sign-up page without leaving your current tab."
  }
];

export const BLOG_DATA: BlogArticle[] = [
  {
    id: "1",
    slug: "temp-mail-cursor-developer-privacy-guide",
    title: "Temp mail for Cursor: a developer's privacy guide",
    summary: "Cursor sees your code and ties it to your email. Learn what data the AI editor collects, how to protect your privacy, and how to sign up with a temporary email.",
    category: "Platform Guides",
    publishDate: "Jun 29, 2026",
    readTime: "5 min read",
    author: "Anton Troynin",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    content: `Cursor has become one of the most popular AI-powered code editors. However, to unlock its full power, you are required to sign up for an account. By signing up, you link your programming identity, active workspace telemetry, and email address together.

### What Data Does Cursor Collect?
When you use an AI code editor, several types of telemetry are sent back to the developer servers:
1. **Code Snippets & Prompt History**: Depending on your settings, code chunks might be stored for AI training.
2. **Account Metadata**: Your real email, payment details, and geographical access points are linked.
3. **Usage Frequency**: When and how long you code.

### How to Use a Temporary Email for Cursor
If you want to test Cursor's pro capabilities or evaluate its features for a client project without exposing your team's primary emails or facing endless sales emails, follow these steps:
1. Generate an active disposable email on our service.
2. Copy the address and use it in the Cursor sign-up portal.
3. Keep our page open to receive the verification OTP code instantly.
4. Input the code, finish setting up Cursor, and code with absolute privacy.

By isolating your testing profiles, you ensure your main developers' inboxes remain free from marketing lists and unwanted tracking databases.`
  },
  {
    id: "2",
    slug: "do-you-need-temp-mail-fortnite",
    title: "Do you need temp mail for Fortnite?",
    summary: "Fortnite accounts are prime targets for hackers. Learn how to protect your Epic Games account, avoid V-Bucks scams, and use temporary email for safer gaming.",
    category: "Platform Guides",
    publishDate: "Jun 16, 2026",
    readTime: "4 min read",
    author: "Anton Troynin",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
    content: `Fortnite remains a powerhouse of online gaming, but with popularity comes risk. Epic Games accounts, often holding premium skins and digital assets, are constant targets for phishing schemes, database credential stuffing, and hacking attempts.

### The Risks of Using Your Real Email on Gaming Forums
Most gamers sign up for unofficial Fortnite forums, skin trackers, trade portals, or V-Bucks calculators using their primary email addresses. This is dangerous because:
- Unofficial gaming sites have weak security databases and get breached frequently.
- Scammers crawl these databases to send highly convincing phishing emails pretending to be Epic Games support.
- Your email is sold to advertisers targeting the gamer demographic.

### Why Burner Mail is Perfect for Fortnite Extensions
When you register on third-party gaming platforms, use a temporary email address. Your Epic Games account remains associated with your secure primary email, while the auxiliary tools and stats trackers are kept safely isolated. If a tracking forum gets hacked, your core Epic Games account stays completely safe.`
  },
  {
    id: "3",
    slug: "temp-mail-tinder-privacy-tips",
    title: "Temp mail for Tinder: privacy tips",
    summary: "Tinder knows more about you than your matches do. Learn how to protect your email, manage data exposure, and navigate online dating with more privacy.",
    category: "Platform Guides",
    publishDate: "Jun 9, 2026",
    readTime: "4 min read",
    author: "Anton Troynin",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    content: `Online dating has transformed how we connect, but Tinder collects an immense amount of personal, behavioral, and location metadata. Registering on dating apps with your real primary email connects your professional and family identity to your dating profile.

### The Importance of Identity Isolation in Dating
By linking your real email to Tinder or dating support forums:
1. **Cross-Site Tracking**: Advertisers use your email to link your dating preferences with your LinkedIn or shopping history.
2. **Unwanted Discovery**: Coworkers or contacts may find your dating profile via contact list syncs.
3. **Phishing Targets**: Dating notifications are commonly spoofed by scammers to drop malware onto your device.

### Securing Your Dating Profile
Using a temporary disposable email is a clean way to keep your dating activity completely independent. You can complete your verification code through our service, activate your account, and rest assured that no advertising agency can link your late-night swipes with your professional workspace.`
  },
  {
    id: "4",
    slug: "protect-email-roblox",
    title: "How to protect your email on Roblox",
    summary: "Roblox is a top target for scammers targeting kids. Learn how to protect your family accounts, avoid Robux scams, and use temporary email safely.",
    category: "Platform Guides",
    publishDate: "Jun 2, 2026",
    readTime: "4 min read",
    author: "Mikhail Mitiaev",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80",
    content: `Roblox provides an expansive virtual playground, but its young player base makes it a magnet for phishing attacks, item scammers, and fake "free Robux" campaigns.

### The Anatomy of a Roblox Scam
Scammers build convincing web pages offering free in-game currency. To redeem the fake reward, children are prompted to input their Roblox username and email. Once collected, these emails are used to send sophisticated password-reset links that compromise their accounts.

### Best Practices for Parent-Child Privacy
1. Keep the primary Roblox account registered under a parent's secure email.
2. For all unofficial forums, gaming groups, skin creators, or fan clubs, mandate the use of temporary email.
3. Teach kids never to input their primary login credentials on third-party sites.`
  },
  {
    id: "5",
    slug: "temp-mail-spotify-accounts",
    title: "Temp mail for Spotify accounts",
    summary: "Spotify tracks your listening habits in detail and shares data with advertisers. Learn how to listen anonymously and manage multiple temporary accounts.",
    category: "Platform Guides",
    publishDate: "May 26, 2026",
    readTime: "3 min read",
    author: "Mikhail Mitiaev",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    content: `Your music tastes reveal a surprising amount of detail about your mood, age, and behavioral patterns. Spotify tracks every stream and shares this telemetry with external advertising partners to build customized consumer profiles.

### Why Create Disposable Spotify Profiles?
- **Avoid Listening Bias**: If you want to play ambient background tracks, kid's lullabies, or study noise without ruining your personalized algorithms (like Discover Weekly), use a burner profile.
- **Test Family Plans**: Evaluate premium plans or test streaming quality on a new speaker system without linking your primary profile.
- **No Marketing Spam**: Stop Spotify and its advertisers from spamming your main email with concert tickets and subscription upsells.`
  },
  {
    id: "6",
    slug: "is-temp-mail-good-linkedin",
    title: "Is temp mail good for LinkedIn?",
    summary: "LinkedIn links your email to your professional identity. Learn how to protect your job-hunting privacy and avoid corporate headhunter databases.",
    category: "Platform Guides",
    publishDate: "May 19, 2026",
    readTime: "4 min read",
    author: "Mikhail Mitiaev",
    image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=600&q=80",
    content: `LinkedIn is the gold standard for professional networking, but it is also a gold mine for data scrapers, unsolicited sales agents, and automated recruiting bots.

### The Job Hunter's Dilemma
When looking for roles, your email address is shared across job boards, resume aggregates, and recruiting databases. This inevitably leads to a barrage of spam, fake recruiting campaigns, and marketing lists.

### How to Use Disposable Mail for Networking
By using a temporary email address to communicate with preliminary recruiters or registering on unfamiliar job portals:
- You filter out low-quality automated recruiters.
- Your personal email is kept safe until you sign an NDA or establish a trusted direct relationship with a company.
- You avoid being added to permanent cold-outreach databases.`
  },
  {
    id: "7",
    slug: "use-temp-mail-chatgpt",
    title: "How to use temp mail for ChatGPT",
    summary: "ChatGPT is revolutionizing work, but OpenAI collects your conversation history and links it to your email. Learn how to sign up with full anonymity.",
    category: "Platform Guides",
    publishDate: "Apr 21, 2026",
    readTime: "4 min read",
    author: "Anton Troynin",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
    content: `Artificial intelligence utilities like ChatGPT are incredibly powerful, but signing up exposes your prompt logs, IP address, and email to OpenAI.

### The Privacy Risks of AI Chats
Anything you type into a prompt might be reviewed by human annotators or used to train future iterations of the neural network. If your account is registered to your primary email address, your search queries and sensitive intellectual ideas are directly linked to your real identity.

### Regaining Anonymity with Disposable Mail
Generate a disposable email on our service to create a clean, untraceable ChatGPT testing account. By doing so, you can run research queries, draft creative briefs, and test experimental features with the peace of mind that your real-world identity is not tied to the chatbot logs.`
  },
  {
    id: "8",
    slug: "temp-mail-tiktok-safety",
    title: "Is temp mail safe for TikTok?",
    summary: "TikTok's data collection policies are highly aggressive. Learn how to stay secure, create secondary burner profiles, and watch TikTok anonymously.",
    category: "Platform Guides",
    publishDate: "Apr 14, 2026",
    readTime: "3 min read",
    author: "Anton Troynin",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    content: `TikTok collects some of the most invasive behavioral patterns, device signatures, and viewing telemetry of any social application.

### The Danger of Account Linkage
If your TikTok account is registered with your primary email:
- TikTok cross-references your contacts, matching you to people in your offline life.
- Advertisers can link your short-form video interests to your professional career.
- Your email is subjected to massive, automated push notification spam.

### Keeping TikTok Isolated
Using a burner email from our service to register your secondary or viewer accounts breaks the connection. You can watch creators, leave comments, and participate in trends while keeping your primary digital identity entirely private.`
  },
  {
    id: "9",
    slug: "anonymous-online-vpn-temp-mail-7vpn",
    title: "How to Stay Anonymous Online: Using VPN and Temporary Email with 7vpn",
    summary: "A comprehensive guide on combining high-frequency VPN tunnels with temporary emails to establish an impenetrable digital shield.",
    category: "Tutorials",
    publishDate: "Feb 18, 2026",
    readTime: "6 min read",
    author: "Anton Troynin",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
    content: `True online anonymity is never achieved through a single tool. In this tutorial, we outline how to pair virtual private networks (specifically trusted providers like 7vpn) with disposable email addresses from our service to secure your web activity from all vectors of corporate and state surveillance.

### Step 1: Secure Your IP with 7vpn
A VPN encrypts your active data stream, masking your real IP address and physical location. This prevents your ISP and websites from logging your geographical location.

### Step 2: Clear Your Footprint
Even if you use a VPN, signing up on websites with your real email leaks your identity. By generating a disposable temporary mailbox on our service, you eliminate the final piece of the tracking puzzle.

### Step 3: Combined Browsing Workflow
1. Activate your VPN tunnel on your device.
2. Launch a secure or incognito browser.
3. Open our page to generate your transient, short-lived email.
4. Complete your sign-ups and link confirmations safely, knowing you have left zero traces behind.`
  }
];
