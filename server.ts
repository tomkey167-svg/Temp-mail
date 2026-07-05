import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-memory rate limiter / abuse tracker (per IP)
interface ClientRequestState {
  addressCreations: number;
  lastCreationTime: number;
  requestsCount: number;
  lastRequestResetTime: number;
}
const ipTracker: Record<string, ClientRequestState> = {};

function rateLimitAndAbuseCheck(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  if (!ipTracker[ip]) {
    ipTracker[ip] = { addressCreations: 0, lastCreationTime: 0, requestsCount: 0, lastRequestResetTime: now };
  }

  const tracker = ipTracker[ip];
  
  // Reset window if more than 1 minute has passed
  if (now - tracker.lastRequestResetTime > 60000) {
    tracker.requestsCount = 0;
    tracker.lastRequestResetTime = now;
  }
  
  tracker.requestsCount++;

  // General API limit: Max 120 requests per minute
  if (tracker.requestsCount > 120) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  next();
}

app.use(rateLimitAndAbuseCheck);

// API Routes

// Mail.tm Token cache to prevent extra auth roundtrips
const tokenCache: Record<string, { token: string; expiry: number }> = {};

// Get token with auto-registration of account if it does not exist
async function getMailtmToken(login: string, domain: string): Promise<string> {
  const address = `${login.toLowerCase()}@${domain.toLowerCase()}`;
  const password = `${login}_volt_secure_123!`; // deterministic password

  const now = Date.now();
  if (tokenCache[address] && tokenCache[address].expiry > now) {
    return tokenCache[address].token;
  }

  try {
    // Try to login to get a token
    const loginRes = await fetch("https://api.mail.tm/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
    });

    if (loginRes.ok) {
      const data: any = await loginRes.json();
      tokenCache[address] = { token: data.token, expiry: now + 3600000 }; // Cache for 1 hour
      return data.token;
    }

    if (loginRes.status === 401 || loginRes.status === 404) {
      // Create account since it does not exist
      const createRes = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();
        throw new Error(`Failed to create account: ${createRes.status} ${errorText}`);
      }

      // Login to get token after creation
      const retryLoginRes = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
      });

      if (retryLoginRes.ok) {
        const data: any = await retryLoginRes.json();
        tokenCache[address] = { token: data.token, expiry: now + 3600000 };
        return data.token;
      } else {
        throw new Error(`Failed to login after account creation: ${retryLoginRes.status}`);
      }
    } else {
      throw new Error(`Login endpoint returned status ${loginRes.status}`);
    }
  } catch (error: any) {
    console.error(`getMailtmToken error for ${address}:`, error.message);
    throw error;
  }
}

// Helper to fetch with token caching & automatic 401 self-healing retry
async function fetchWithMailtmToken(login: string, domain: string, url: string, options: RequestInit = {}): Promise<Response> {
  const address = `${login.toLowerCase()}@${domain.toLowerCase()}`;
  let token = await getMailtmToken(login, domain);

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Clear cache and retry once
    delete tokenCache[address];
    token = await getMailtmToken(login, domain);
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`
      }
    });
  }

  return response;
}

// 1. Fetch available domains
app.get("/api/domains", async (req, res) => {
  try {
    const response = await fetch("https://api.mail.tm/domains");
    if (!response.ok) {
      throw new Error(`Failed to fetch domains: ${response.status}`);
    }
    const data: any = await response.json();
    const domains = (data["hydra:member"] || [])
      .filter((d: any) => d.isActive)
      .map((d: any) => d.domain)
      .sort((a: string, b: string) => a.length - b.length); // Sort shortest domains first
    
    // Fallback domains if mail.tm domain list is empty or down
    if (domains.length === 0) {
      res.json(["mail.tm", "emlpro.com", "emltmp.com", "secmail.pro", "web-library.net"]);
    } else {
      res.json(domains);
    }
  } catch (error: any) {
    console.error("Error fetching domains:", error.message);
    res.json(["mail.tm", "emlpro.com", "emltmp.com", "secmail.pro", "web-library.net"]);
  }
});

// 2. Fetch messages in inbox
app.get("/api/messages", async (req, res) => {
  const { login, domain } = req.query;
  if (!login || !domain) {
    return res.status(400).json({ error: "Parameters 'login' and 'domain' are required" });
  }

  try {
    const response = await fetchWithMailtmToken(
      login as string,
      domain as string,
      "https://api.mail.tm/messages"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const data: any = await response.json();
    const rawMessages = data["hydra:member"] || [];

    const mappedMessages = rawMessages.map((msg: any) => ({
      id: msg.id,
      from: msg.from ? (msg.from.name ? `${msg.from.name} <${msg.from.address}>` : msg.from.address) : "Unknown",
      subject: msg.subject || "(No Subject)",
      date: msg.createdAt || new Date().toISOString()
    }));

    res.json(mappedMessages);
  } catch (error: any) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. Read specific message details
app.get("/api/message", async (req, res) => {
  const { login, domain, id } = req.query;
  if (!login || !domain || !id) {
    return res.status(400).json({ error: "Parameters 'login', 'domain', and 'id' are required" });
  }

  try {
    const response = await fetchWithMailtmToken(
      login as string,
      domain as string,
      `https://api.mail.tm/messages/${id}`
    );

    if (!response.ok) {
      throw new Error(`Failed to read message: ${response.status}`);
    }

    const details: any = await response.json();

    const htmlBody = Array.isArray(details.html) ? details.html.join("") : (details.html || "");
    const textBody = Array.isArray(details.text) ? details.text.join("") : (details.text || "");
    const body = htmlBody || textBody || "";

    const mappedDetails = {
      id: details.id,
      from: details.from ? (details.from.name ? `${details.from.name} <${details.from.address}>` : details.from.address) : "Unknown",
      subject: details.subject || "(No Subject)",
      date: details.createdAt || new Date().toISOString(),
      attachments: (details.attachments || []).map((att: any) => ({
        id: att.id,
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
        downloadUrl: att.downloadUrl || ""
      })),
      body: body,
      textBody: textBody,
      htmlBody: htmlBody
    };

    res.json(mappedDetails);
  } catch (error: any) {
    console.error("Error reading message:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. Download EML format for a message
app.get("/api/eml", async (req, res) => {
  const { login, domain, id } = req.query;
  if (!login || !domain || !id) {
    return res.status(400).json({ error: "Parameters 'login', 'domain', and 'id' are required" });
  }

  try {
    const response = await fetchWithMailtmToken(
      login as string,
      domain as string,
      `https://api.mail.tm/messages/${id}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch message for EML: ${response.status}`);
    }

    const details: any = await response.json();

    const htmlBody = Array.isArray(details.html) ? details.html.join("") : (details.html || "");
    const textBody = Array.isArray(details.text) ? details.text.join("") : (details.text || "");
    const body = htmlBody || textBody || "";

    const fromAddress = details.from ? (details.from.name ? `${details.from.name} <${details.from.address}>` : details.from.address) : "Unknown";

    const emlContent = [
      `From: ${fromAddress}`,
      `To: ${login}@${domain}`,
      `Subject: ${details.subject || "(No Subject)"}`,
      `Date: ${new Date(details.createdAt || Date.now()).toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `X-Mailer: VoltInbox Mailer Service`,
      ``,
      htmlBody || body || ""
    ].join("\r\n");

    res.setHeader("Content-Disposition", `attachment; filename="message-${id}.eml"`);
    res.setHeader("Content-Type", "message/rfc822");
    res.send(emlContent);
  } catch (error: any) {
    console.error("Error compiling EML:", error.message);
    res.status(500).json({ error: "Failed to compile and download EML." });
  }
});

// 4.5. Proxy route for downloading attachments with proper Authorization Bearer headers
app.get("/api/download-attachment", async (req, res) => {
  const { login, domain, downloadUrl } = req.query;
  if (!login || !domain || !downloadUrl) {
    return res.status(400).json({ error: "Parameters 'login', 'domain', and 'downloadUrl' are required" });
  }

  try {
    const rawUrl = downloadUrl as string;
    const fullUrl = rawUrl.startsWith("http") ? rawUrl : `https://api.mail.tm${rawUrl}`;
    
    const response = await fetchWithMailtmToken(
      login as string,
      domain as string,
      fullUrl
    );

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || `attachment; filename="attachment"`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", contentDisposition);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error: any) {
    console.error("Error downloading attachment:", error.message);
    res.status(500).json({ error: "Failed to download attachment." });
  }
});

// 5. Submit Contact Form
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All contact fields are required." });
  }

  console.log(`[Contact Form Submission] Name: ${name}, Email: ${email}, Subject: ${subject}`);
  console.log(`Message: ${message}`);

  // In a real application we would mail this, but since it's a disposable/private email service,
  // we successfully save/simulate receipt.
  res.json({ success: true, message: "Thank you! Your message has been received successfully." });
});

// 6. Anti-Abuse Tracking endpoint
app.post("/api/abuse-check", (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  if (!ipTracker[ip]) {
    ipTracker[ip] = { addressCreations: 0, lastCreationTime: 0, requestsCount: 0, lastRequestResetTime: now };
  }

  const tracker = ipTracker[ip];

  // If a user creates more than 5 mailboxes in a 3-minute window, show them a Captcha
  if (now - tracker.lastCreationTime < 180000) {
    if (tracker.addressCreations >= 5) {
      return res.json({ requiresCaptcha: true });
    }
  } else {
    // Reset creations window
    tracker.addressCreations = 0;
  }

  tracker.addressCreations++;
  tracker.lastCreationTime = now;

  res.json({ requiresCaptcha: false });
});

// 6.5. Google Search Console Verification HTML
app.get("/googled87c6cde125caf0b.html", (req, res) => {
  res.type("text/html");
  res.send("google-site-verification: googled87c6cde125caf0b.html");
});

// 7. robots.txt endpoint for crawlers
app.get("/robots.txt", (req, res) => {
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const appUrl = process.env.APP_URL || `${protocol}://${req.get("host")}`;
  res.type("text/plain");
  res.send(`User-agent: *\nAllow: /\nSitemap: ${appUrl}/sitemap-index.xml`);
});

// 8. sitemap-index.xml (The Master Index)
app.get("/sitemap-index.xml", (req, res) => {
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const appUrl = process.env.APP_URL || `${protocol}://${req.get("host")}`;
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${appUrl}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${appUrl}/sitemap-domains.xml</loc>
  </sitemap>
</sitemapindex>`;
  res.type("application/xml");
  res.send(sitemapIndex);
});

// 9. sitemap-pages.xml (Static Pages)
app.get("/sitemap-pages.xml", (req, res) => {
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const appUrl = process.env.APP_URL || `${protocol}://${req.get("host")}`;
  const sitemapPages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appUrl}/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#home</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#blog</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#faq</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#about</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#contact</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#privacy</loc>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#terms</loc>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#api-documentation</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#blog/what-is-temporary-email-when-to-use-one</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#blog/avoid-spam-without-changing-your-real-email</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#blog/temporary-email-vs-email-aliases-difference</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#blog/is-it-safe-to-use-disposable-email-for-signups</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${appUrl}/#blog/top-5-situations-where-disposable-email-saves-time</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>
</urlset>`;
  res.type("application/xml");
  res.send(sitemapPages);
});

// Helper function to fetch active domains for sitemap
async function getSitemapDomains(): Promise<string[]> {
  try {
    const response = await fetch("https://api.mail.tm/domains");
    if (response.ok) {
      const data: any = await response.json();
      const domains = (data["hydra:member"] || [])
        .filter((d: any) => d.isActive)
        .map((d: any) => d.domain)
        .sort((a: string, b: string) => a.length - b.length);
      if (domains.length > 0) {
        return domains;
      }
    }
  } catch (error: any) {
    console.error("Error fetching domains for sitemap-domains.xml:", error.message);
  }
  return ["mail.tm", "emlpro.com", "emltmp.com", "secmail.pro", "web-library.net"];
}

// 10. sitemap-domains.xml (Active Email Domains)
app.get("/sitemap-domains.xml", async (req, res) => {
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const appUrl = process.env.APP_URL || `${protocol}://${req.get("host")}`;
  const domains = await getSitemapDomains();
  
  const urls = domains.map((domain) => {
    return `  <url>
    <loc>${appUrl}/domain/${domain}</loc>
    <priority>0.8</priority>
    <changefreq>daily</changefreq>
  </url>`;
  }).join("\n");

  const sitemapDomains = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  res.type("application/xml");
  res.send(sitemapDomains);
});

// Legacy fallback redirect for /sitemap.xml
app.get("/sitemap.xml", (req, res) => {
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const appUrl = process.env.APP_URL || `${protocol}://${req.get("host")}`;
  res.redirect(301, `${appUrl}/sitemap-index.xml`);
});

// Vite Server or Static Handler setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for client-side routing fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VoltInbox Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
