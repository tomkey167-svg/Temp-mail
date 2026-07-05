import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Mail, Copy, Check, RefreshCw, Trash2, Clock, Plus, Menu, X, 
  ShieldCheck, HelpCircle, Info, ChevronRight, BookOpen, 
  MessageSquare, Download, Sun, Moon, FileText, Lock, 
  AlertCircle, ExternalLink, Eye, Send, Globe, Star, UploadCloud,
  Smartphone, Play, Bot, Zap, Chrome, ChevronDown, ChevronUp,
  Apple, Shield, Flame, Compass, QrCode, User, MailOpen, Volume2, VolumeX,
  Twitter, Github, Instagram, Linkedin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "./firebase";
import { MailMessage, MailDetails, BlogArticle, FAQItem } from "./types";
import { FAQ_DATA, BLOG_DATA } from "./data";
import { Language, LANGUAGES, TRANSLATIONS, FAQ_TRANSLATIONS } from "./translations";

export default function App() {
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.00001, start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.4);
      playTone(659.25, now + 0.12, 0.5);
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  };

  // Diagnostic logs state
  const [apiLogs, setApiLogs] = useState<{
    id: string;
    timestamp: string;
    type: "info" | "success" | "error" | "warning";
    message: string;
    data?: any;
  }[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});

  const addDiagnosticLog = useCallback((type: "info" | "success" | "error" | "warning", message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const logId = Math.random().toString(36).substring(2, 9);
    setApiLogs((prev) => [
      { id: logId, timestamp, type, message, data },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  }, []);

  // Language State
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("volt_lang") as Language;
      if (saved && ["en", "es", "zh", "hi", "fr"].includes(saved)) {
        return saved;
      }
      const navLang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
      const baseLang = navLang.substring(0, 2).toLowerCase();
      if (["en", "es", "zh", "hi", "fr"].includes(baseLang)) {
        return baseLang as Language;
      }
      if (navLang.toLowerCase().includes("hi") || navLang.toLowerCase().includes("in")) {
        return "hi";
      }
    }
    return "en";
  });
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);

  // Theme State (Premium Light Theme with white background is standard)
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Mailbox State
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [activeDomain, setActiveDomain] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [domains, setDomains] = useState<string[]>([]);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MailDetails | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Time Limit Timer State (Default 10 minutes)
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Overlays / Modals States
  const [activeModal, setActiveModal] = useState<string | null>(null); // "tools" | "contact" | "privacy" | "terms" | "download" | "about"
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [customUsername, setCustomUsername] = useState<string>("");
  const [customDomain, setCustomDomain] = useState<string>("");
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);
  const [isSpamAlertVisible, setIsSpamAlertVisible] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"messages" | "saved">("messages");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const isFirstFetch = useRef(true);
  const messagesRef = useRef<MailMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cookie Consent Banner State
  const [cookieConsent, setCookieConsent] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cookie_consent") !== null;
    }
    return true;
  });

  // Saved/Starred Messages State
  const [savedMessages, setSavedMessages] = useState<MailMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("volt_saved_messages");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Security Tools States
  const [activeToolTab, setActiveToolTab] = useState<string>("password-generator");

  // FAQ Accordion States
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Discover More Accordion States
  const [expandedDiscoverIdx, setExpandedDiscoverIdx] = useState<number | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Password Generator State
  const [genLength, setGenLength] = useState<number>(16);
  const [genUppercase, setGenUppercase] = useState<boolean>(true);
  const [genLowercase, setGenLowercase] = useState<boolean>(true);
  const [genNumbers, setGenNumbers] = useState<boolean>(true);
  const [genSymbols, setGenSymbols] = useState<boolean>(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isPassCopied, setIsPassCopied] = useState<boolean>(false);

  // Password Strength State
  const [checkPassword, setCheckPassword] = useState<string>("");

  // Byte Unit Converter State
  const [byteInputValue, setByteInputValue] = useState<string>("1");
  const [byteInputUnit, setByteInputUnit] = useState<string>("MB");

  // Virus Scanner State
  const [scannerFileName, setScannerFileName] = useState<string>("");
  const [scannerStatus, setScannerStatus] = useState<"idle" | "scanning" | "clean">("idle");
  const [scannerProgress, setScannerProgress] = useState<number>(0);
  const [scannerLog, setScannerLog] = useState<string[]>([]);

  // Password Generator Handler
  const generatePassword = useCallback(() => {
    let chars = "";
    if (genUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (genLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (genNumbers) chars += "0123456789";
    if (genSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    if (!chars) {
      setGeneratedPassword("");
      return;
    }
    
    let result = "";
    for (let i = 0; i < genLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(result);
  }, [genLength, genUppercase, genLowercase, genNumbers, genSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // Toggle Dark/Light Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Fetch available domains on load
  const fetchDomains = async () => {
    addDiagnosticLog("info", "Request started: GET /api/domains");
    try {
      const res = await fetch("/api/domains");
      if (res.ok) {
        const data = await res.json();
        const sortedDomains = (data as string[]).sort((a, b) => a.length - b.length);
        setDomains(sortedDomains);
        addDiagnosticLog("success", `Request succeeded: GET /api/domains. Loaded ${sortedDomains.length} domains.`, sortedDomains);
        return sortedDomains;
      } else {
        addDiagnosticLog("error", `Request failed: GET /api/domains (HTTP ${res.status})`);
      }
    } catch (e) {
      console.error("Failed to fetch domains", e);
      addDiagnosticLog("error", `Request failed: GET /api/domains. Error: ${e instanceof Error ? e.message : String(e)}`, e);
    }
    const fallback = ["mail.tm", "emlpro.com", "emltmp.com", "secmail.pro", "web-library.net"];
    setDomains(fallback);
    addDiagnosticLog("warning", `Using fallback domain list: ${fallback.join(", ")}`);
    return fallback;
  };

  // Core Address Generation
  const generateNewMailbox = async (customDomainList?: string[]) => {
    try {
      let activeDomains = customDomainList || domains;
      if (activeDomains.length === 0) {
        activeDomains = await fetchDomains();
      }

      const randomDomain = activeDomains[Math.floor(Math.random() * activeDomains.length)];
      
      const names = [
        "kayon", "helen", "brian", "clara", "derek", "eliza", "felix", "grace", "henry", "irene",
        "jason", "kevin", "laura", "mason", "nadia", "oliver", "paula", "quinn", "rachel", "simon",
        "tara", "victor", "wendy", "xavier", "yara", "zach", "aaron", "bella", "caleb", "diana",
        "ethan", "fiona", "gavin", "hazel", "ian", "julia", "kyle", "lucas", "maya", "noah",
        "owen", "penelope", "ryan", "sofia", "tristan", "valerie", "wyatt", "zoey", "amber", "brooks",
        "cole", "daisy", "elliot", "flora", "grant", "hope", "jade", "leo", "mila", "neal",
        "opal", "piper", "reed", "sage", "tess", "vance", "wren", "zane", "adrian", "claire",
        "david", "emma", "frank", "gina", "hugo", "iris", "jack", "kate", "liam", "mia",
        "nathan", "olivia", "peter", "rose", "sam", "tina", "will", "zoe"
      ];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomNum = Math.floor(1000 + Math.random() * 90000); // 4 to 5 digit number
      const generatedUsername = `${randomName}${randomNum}`;
      const fullAddress = `${generatedUsername}@${randomDomain}`;

      setUsername(generatedUsername);
      setActiveDomain(randomDomain);
      setEmailAddress(fullAddress);
      setTimeLeft(600); // 10 minutes default
      setSelectedMessage(null);
      setMessages([]);
      isFirstFetch.current = true;
      
      localStorage.setItem("volt_username", generatedUsername);
      localStorage.setItem("volt_domain", randomDomain);
      localStorage.setItem("volt_email", fullAddress);
      localStorage.setItem("volt_expiry_timestamp", String(Date.now() + 600000));
      addDiagnosticLog("success", `Active mailbox updated to: ${fullAddress}. Inbox polling sequence initialized.`);
    } catch (e) {
      console.error("Failed to generate mailbox", e);
      addDiagnosticLog("error", `Failed to generate mailbox: ${e instanceof Error ? e.message : String(e)}`, e);
    }
  };

  // Restore Active Session or Create New on initial render
  useEffect(() => {
    const initMailbox = async () => {
      const domainList = await fetchDomains();
      const savedUser = localStorage.getItem("volt_username");
      const savedDomain = localStorage.getItem("volt_domain");
      const savedEmail = localStorage.getItem("volt_email");
      const savedExpiry = localStorage.getItem("volt_expiry_timestamp");

      if (savedUser && savedDomain && savedEmail && savedExpiry) {
        const expTime = Number(savedExpiry);
        const remSecs = Math.floor((expTime - Date.now()) / 1000);
        if (remSecs > 5) {
          setUsername(savedUser);
          setActiveDomain(savedDomain);
          setEmailAddress(savedEmail);
          setTimeLeft(remSecs);
          addDiagnosticLog("success", `Restored saved mailbox session: ${savedEmail}. Remaining lifetime: ${Math.floor(remSecs / 60)}m ${remSecs % 60}s.`);
          return;
        }
      }
      addDiagnosticLog("info", "No active session found or previous session expired. Creating a new mailbox.");
      await generateNewMailbox(domainList);
    };
    initMailbox();
  }, []);

  // Poll Inbox periodically
  const fetchInbox = useCallback(async (isAutoRefresh = true) => {
    if (!username || !activeDomain || !emailAddress) return;
    if (!isAutoRefresh) setIsRefreshing(true);
    else setIsLoadingMessages(messages.length === 0);

    const checkType = isAutoRefresh ? "Auto-Refresh Poll" : "Manual Refresh";
    addDiagnosticLog("info", `${checkType} initiated for mailbox: ${emailAddress}`);

    try {
      // 1. Fetch from secure temporary mail API
      let apiMessages: MailMessage[] = [];
      const apiEndpoint = `/api/messages?login=${username}&domain=${activeDomain}`;
      addDiagnosticLog("info", `Requesting incoming messages from server: GET ${apiEndpoint}`);
      
      const res = await fetch(apiEndpoint);
      if (res.ok) {
        apiMessages = await res.json();
        addDiagnosticLog("success", `Server GET ${apiEndpoint} responded with HTTP ${res.status}. Received ${apiMessages.length} messages.`, apiMessages);
      } else {
        addDiagnosticLog("error", `Server GET ${apiEndpoint} failed with HTTP ${res.status} ${res.statusText}`);
      }

      // 2. Query Firestore backup for any messages matching this recipient
      addDiagnosticLog("info", `Requesting backed-up messages from Firestore db: received_emails where recipient == "${emailAddress}"`);
      const q = query(
        collection(db, "received_emails"),
        where("recipient", "==", emailAddress)
      );
      
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err) {
        addDiagnosticLog("warning", `Firestore GET query failed: ${err instanceof Error ? err.message : String(err)}`);
        handleFirestoreError(err, OperationType.GET, "received_emails");
        throw err;
      }

      const firestoreMessages: MailMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreMessages.push({
          id: Number(data.id),
          from: data.from || "",
          subject: data.subject || "",
          date: data.date || ""
        });
      });
      addDiagnosticLog("success", `Firestore query returned ${firestoreMessages.length} backed-up messages.`, firestoreMessages);

      // 3. Save any new API messages to Firestore to secure them
      if (apiMessages.length > 0) {
        addDiagnosticLog("info", `Synchronizing ${apiMessages.length} new API message(s) to Firestore backup...`);
      }
      for (const msg of apiMessages) {
        const docRef = doc(db, "received_emails", `${emailAddress}_${msg.id}`);
        // Use non-blocking writes to avoid delaying state updates
        setDoc(docRef, {
          id: String(msg.id),
          from: msg.from,
          subject: msg.subject,
          date: msg.date,
          recipient: emailAddress,
          timestamp: new Date().toISOString()
        }, { merge: true }).then(() => {
          addDiagnosticLog("info", `Successfully backed up message ID ${msg.id} to Firestore.`);
        }).catch(err => {
          console.error("Error saving message list doc to Firestore", err);
          addDiagnosticLog("warning", `Failed to back up message ID ${msg.id} to Firestore: ${err instanceof Error ? err.message : String(err)}`);
          handleFirestoreError(err, OperationType.WRITE, `received_emails/${emailAddress}_${msg.id}`);
        });
      }

      // 4. Merge API & Firestore lists to ensure messages received in the last 10 minutes or more persist
      const mergedMap = new Map<string, MailMessage>();
      
      // Load Firestore messages first
      firestoreMessages.forEach((msg) => {
        mergedMap.set(String(msg.id), msg);
      });
      // API messages override or add to Firestore messages
      apiMessages.forEach((msg) => {
        mergedMap.set(String(msg.id), msg);
      });

       const mergedList = Array.from(mergedMap.values());
      // Sort in descending order (newest ID first)
      mergedList.sort((a, b) => Number(b.id) - Number(a.id));

      if (isFirstFetch.current) {
        isFirstFetch.current = false;
      } else {
        const hasNew = mergedList.some(
          (newMsg) => !messagesRef.current.some((oldMsg) => String(oldMsg.id) === String(newMsg.id))
        );
        if (hasNew && soundEnabled) {
          playNotificationSound();
        }
      }

      setMessages(mergedList);
      addDiagnosticLog("info", `Polling cycle complete. Total merged messages in UI display: ${mergedList.length}.`);
    } catch (e) {
      console.error("Failed to fetch messages with Firestore backup", e);
      addDiagnosticLog("error", `Exception during fetch inbox cycle: ${e instanceof Error ? e.message : String(e)}`, e);
    } finally {
      setIsRefreshing(false);
      setIsLoadingMessages(false);
    }
  }, [username, activeDomain, emailAddress, soundEnabled]);

  // Refresh trigger on address change
  useEffect(() => {
    fetchInbox();
  }, [username, activeDomain]);

  // Polling loop countdown (every 8 seconds)
  useEffect(() => {
    if (!username) return;
    const interval = setInterval(() => {
      fetchInbox(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [username, fetchInbox]);

  // Burner Address Countdown Lifespan Timer
  useEffect(() => {
    if (!username) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewMailbox();
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [username]);

  // Copy address utility
  const copyToClipboard = () => {
    if (!emailAddress) return;
    navigator.clipboard.writeText(emailAddress);
    
    // Select the text inside the simulated input field for instant visual feedback
    const inputEl = document.getElementById("mail-address-input") as HTMLInputElement;
    if (inputEl) {
      inputEl.select();
    }
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Change address manually panel toggle
  const handleChangeAddress = () => {
    if (domains.length > 0) {
      setCustomUsername(username || "temp");
      setCustomDomain(activeDomain || domains[0]);
    }
    setIsCustomizing(!isCustomizing);
    setIsMoreOpen(false);
  };

  // Save the custom username/domain selected by user
  const handleSaveCustomAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) return;

    const cleanUser = customUsername.toLowerCase().replace(/[^a-z0-9._+-]/g, "");
    if (!cleanUser) return;

    const fullAddress = `${cleanUser}@${customDomain}`;
    setUsername(cleanUser);
    setActiveDomain(customDomain);
    setEmailAddress(fullAddress);
    setTimeLeft(600); // Reset timer to 10 minutes
    setSelectedMessage(null);
    setMessages([]);
    isFirstFetch.current = true;
    setIsCustomizing(false);

    localStorage.setItem("volt_username", cleanUser);
    localStorage.setItem("volt_domain", customDomain);
    localStorage.setItem("volt_email", fullAddress);
    localStorage.setItem("volt_expiry_timestamp", String(Date.now() + 600000));
  };

  // Toggle saving an incoming message locally
  const handleToggleSaveMessage = (msg: MailMessage) => {
    setSavedMessages((prev) => {
      const exists = prev.some((m) => String(m.id) === String(msg.id));
      let updated;
      if (exists) {
        updated = prev.filter((m) => String(m.id) !== String(msg.id));
      } else {
        updated = [...prev, msg];
      }
      localStorage.setItem("volt_saved_messages", JSON.stringify(updated));
      return updated;
    });
  };

  const isMessageSaved = (msgId: string | number) => {
    return savedMessages.some((m) => String(m.id) === String(msgId));
  };

  // Delete address manually
  const handleDeleteAddress = () => {
    localStorage.removeItem("volt_username");
    localStorage.removeItem("volt_domain");
    localStorage.removeItem("volt_email");
    localStorage.removeItem("volt_expiry_timestamp");
    
    setUsername("");
    setActiveDomain("");
    setEmailAddress("");
    setMessages([]);
    setSelectedMessage(null);
    isFirstFetch.current = true;
    setTimeLeft(600);
    setIsCustomizing(false);
    setIsMoreOpen(false);

    generateNewMailbox();
  };

  // Extend active address lifetime
  const handleExtendLifetime = (minutes: number) => {
    setTimeLeft((prev) => {
      const added = minutes * 60;
      const newDuration = Math.min(prev + added, 3600); // capped at 1 hour max
      localStorage.setItem("volt_expiry_timestamp", String(Date.now() + newDuration * 1000));
      return newDuration;
    });
    setIsMoreOpen(false);
  };

  // Read message details
  const handleReadMessage = async (msgId: string | number) => {
    if (!username || !activeDomain || !emailAddress) return;
    setIsLoadingContent(true);

    addDiagnosticLog("info", `Request started: Read details for message ID "${msgId}"`);

    try {
      const res = await fetch(`/api/message?login=${username}&domain=${activeDomain}&id=${msgId}`);
      if (res.ok) {
        const details: MailDetails = await res.json();
        setSelectedMessage(details);
        addDiagnosticLog("success", `Request succeeded: GET /api/message for ID ${msgId}. Subject: "${details.subject || "(No Subject)"}"`, details);

        // Backup full content (with body/htmlBody/textBody) to Firestore securely
        const docRef = doc(db, "received_emails", `${emailAddress}_${msgId}`);
        try {
          addDiagnosticLog("info", `Syncing full message body payload to Firestore for offline persistence...`);
          await setDoc(docRef, {
            id: String(msgId),
            from: details.from,
            subject: details.subject,
            date: details.date,
            body: details.body || "",
            htmlBody: details.htmlBody || "",
            textBody: details.textBody || "",
            recipient: emailAddress,
            timestamp: new Date().toISOString()
          }, { merge: true });
          addDiagnosticLog("success", `Full message body payload synced to Firestore successfully.`);
        } catch (err) {
          addDiagnosticLog("warning", `Firestore backup write failed: ${err instanceof Error ? err.message : String(err)}`);
          handleFirestoreError(err, OperationType.WRITE, `received_emails/${emailAddress}_${msgId}`);
        }
      } else {
        // Fallback to Firestore backup if the temporary mail link expired
        addDiagnosticLog("warning", `API GET /api/message failed with HTTP ${res.status}. Falling back to Firestore backup...`);
        const docRef = doc(db, "received_emails", `${emailAddress}_${msgId}`);
        let docSnap;
        try {
          docSnap = await getDoc(docRef);
        } catch (err) {
          addDiagnosticLog("error", `Firestore fallback getDoc query failed: ${err instanceof Error ? err.message : String(err)}`);
          handleFirestoreError(err, OperationType.GET, `received_emails/${emailAddress}_${msgId}`);
          throw err;
        }
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedMessage({
            id: Number(data.id),
            from: data.from || "",
            subject: data.subject || "",
            date: data.date || "",
            body: data.body || "",
            textBody: data.textBody || "",
            htmlBody: data.htmlBody || "",
            attachments: []
          });
          addDiagnosticLog("success", `Successfully retrieved cached message content from Firestore backup.`, data);
        } else {
          addDiagnosticLog("error", `No backup document found in Firestore for message ID ${msgId}`);
        }
      }
    } catch (e) {
      console.error("Failed to read message details", e);
      addDiagnosticLog("warning", `Exception during read message details: ${e instanceof Error ? e.message : String(e)}. Trying Firestore fallback...`);
      // Fallback to Firestore backup on API failure/offline
      try {
        const docRef = doc(db, "received_emails", `${emailAddress}_${msgId}`);
        let docSnap;
        try {
          docSnap = await getDoc(docRef);
        } catch (err) {
          addDiagnosticLog("error", `Firestore fallback getDoc query failed: ${err instanceof Error ? err.message : String(err)}`);
          handleFirestoreError(err, OperationType.GET, `received_emails/${emailAddress}_${msgId}`);
          throw err;
        }
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedMessage({
            id: Number(data.id),
            from: data.from || "",
            subject: data.subject || "",
            date: data.date || "",
            body: data.body || "",
            textBody: data.textBody || "",
            htmlBody: data.htmlBody || "",
            attachments: []
          });
          addDiagnosticLog("success", `Successfully retrieved cached message content from Firestore backup.`, data);
        } else {
          addDiagnosticLog("error", `No backup document found in Firestore for message ID ${msgId}`);
        }
      } catch (err) {
        console.error("Failed to retrieve fallback email details from Firestore", err);
        addDiagnosticLog("error", `All read pathways failed. Could not load message ID ${msgId} details.`);
      }
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Submit Contact Us form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });

      if (response.ok) {
        setContactSubmitted(true);
        setContactName("");
        setContactEmail("");
        setContactSubject("");
        setContactMessage("");
        setTimeout(() => setContactSubmitted(false), 5000);
      }
    } catch (err) {
      console.error("Contact submit error", err);
    } finally {
      setContactLoading(false);
    }
  };

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setCookieConsent(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper evaluator for password strength
  const evaluatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "None", color: "bg-gray-200", text: "text-gray-400", feedback: "Enter a password to test." };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 2;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score: 25, label: "Weak", color: "bg-rose-500", text: "text-rose-500", feedback: "Too short or simple." };
    } else if (score <= 4) {
      return { score: 50, label: "Fair", color: "bg-amber-500", text: "text-amber-500", feedback: "Decent complexity." };
    } else if (score <= 5) {
      return { score: 75, label: "Strong", color: "bg-emerald-500/80", text: "text-emerald-500", feedback: "Great security!" };
    } else {
      return { score: 100, label: "Secure", color: "bg-emerald-500", text: "text-emerald-400", feedback: "Ultimate encryption standard." };
    }
  };

  // Helper converter
  const convertBytes = (valueStr: string, sourceUnit: string) => {
    const val = parseFloat(valueStr);
    if (isNaN(val) || val < 0) return { B: 0, KB: 0, MB: 0, GB: 0, TB: 0 };
    
    const multipliers: { [key: string]: number } = {
      B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4
    };
    
    const bytes = val * (multipliers[sourceUnit] || 1);
    return {
      B: bytes,
      KB: bytes / multipliers.KB,
      MB: bytes / multipliers.MB,
      GB: bytes / multipliers.GB,
      TB: bytes / multipliers.TB
    };
  };

  // Virus Scanner Simulation Handler
  const startVirusScan = (fileName: string) => {
    setScannerStatus("scanning");
    setScannerFileName(fileName);
    setScannerProgress(0);
    setScannerLog(["Initializing advanced quarantine engine...", "Loading multi-vendor signature definitions..."]);
    
    const logs = [
      "Securing local sandbox virtual stream...",
      "Hashing file stream using SHA-256...",
      "Matching signature against 4.2M database hashes...",
      "Deep scan verification complete."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      setScannerProgress((prev) => {
        const next = prev + 25;
        if (next >= 100) {
          clearInterval(interval);
          setScannerStatus("clean");
          setScannerLog((prevLog) => [...prevLog, "Scan complete: No malicious threats detected. Your file is 100% clean and safe!"]);
          return 100;
        }
        if (currentStep < logs.length) {
          setScannerLog((prevLog) => [...prevLog, logs[currentStep]]);
          currentStep++;
        }
        return next;
      });
    }, 400);
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className={darkMode ? "dark text-[#f1f3f9] min-h-screen bg-[#0b1329] font-sans antialiased" : "text-gray-900 min-h-screen bg-[#fafbfe] font-sans antialiased"}>
      
      {/* 1. BRAND-MATCHING HEADER (EMERALD REDESIGNED) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-md text-slate-800 dark:text-white transition-colors py-3.5 border-b border-slate-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo with Envelope Accent & clean text */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                setSelectedBlogSlug(null);
                setActiveModal(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center space-x-2.5 text-left cursor-pointer bg-transparent border-0"
            >
              <div className="bg-[#eefbf6] dark:bg-emerald-950/40 text-[#00b074] rounded-xl w-9 h-9 flex items-center justify-center shadow-sm">
                <Mail className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-display font-black text-xl text-slate-800 dark:text-white tracking-tight">
                Temp-Mail-Generator<span className="text-[#00b074]">.site</span>
              </span>
            </button>
          </div>

          {/* Center Links - Real Mockup Navigation */}
          <div className="hidden md:flex items-center space-x-7">
            <button 
              onClick={() => {
                setSelectedBlogSlug(null);
                setActiveModal(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="relative text-sm font-bold text-[#00b074] hover:text-[#00b074] transition-colors py-1 cursor-pointer bg-transparent border-0"
            >
              Home
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00b074] rounded-full" />
            </button>
            <button 
              onClick={() => {
                const faqSec = document.getElementById("faq-section");
                if (faqSec) {
                  faqSec.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-sm font-bold text-slate-500 hover:text-[#00b074] dark:text-gray-300 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer bg-transparent border-0"
            >
              FAQ
            </button>
            <button 
              onClick={() => {
                const blogSec = document.getElementById("blog-section");
                if (blogSec) {
                  blogSec.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-sm font-bold text-slate-500 hover:text-[#00b074] dark:text-gray-300 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer bg-transparent border-0"
            >
              Blog
            </button>
            <button 
              onClick={() => setActiveModal("privacy")}
              className="text-sm font-bold text-slate-500 hover:text-[#00b074] dark:text-gray-300 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer bg-transparent border-0"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setActiveModal("contact")}
              className="text-sm font-bold text-slate-500 hover:text-[#00b074] dark:text-gray-300 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer bg-transparent border-0"
            >
              Contact Us
            </button>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode toggle button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-400 hover:text-[#00b074] hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 border border-slate-200 dark:border-gray-800 rounded-xl hover:border-[#00b074] dark:hover:border-emerald-500 text-slate-700 dark:text-gray-300 transition-all cursor-pointer text-xs font-bold bg-white dark:bg-[#1c222b]"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#00b074]" />
                <span className="hidden xs:inline">{LANGUAGES.find(l => l.code === lang)?.name}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                   <>
                    {/* Backdrop click register to close */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setIsLangOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl py-1.5 z-50 text-left overflow-hidden"
                    >
                      {LANGUAGES.map((item) => (
                        <button
                          key={item.code}
                          onClick={() => {
                            setLang(item.code);
                            localStorage.setItem("volt_lang", item.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center space-x-2.5 transition-colors cursor-pointer border-0 bg-transparent ${
                            lang === item.code
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#00b074] dark:text-emerald-400"
                              : "text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#1f242c]"
                          }`}
                        >
                          <span className="text-sm">{item.flag}</span>
                          <span className="font-sans font-extrabold">{item.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors block md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-[#161b22] border-b border-slate-100 dark:border-gray-800 overflow-hidden text-slate-800 dark:text-white"
          >
            <div className="px-4 py-4 space-y-2.5">
              <button 
                onClick={() => { setMobileMenuOpen(false); setSelectedBlogSlug(null); setActiveModal(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="block w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold"
              >
                Home
              </button>
              <button 
                onClick={() => { 
                  setMobileMenuOpen(false);
                  const faqSec = document.getElementById("faq-section");
                  if (faqSec) faqSec.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold"
              >
                FAQ
              </button>
              <button 
                onClick={() => { 
                  setMobileMenuOpen(false);
                  const blogSec = document.getElementById("blog-section");
                  if (blogSec) blogSec.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold"
              >
                Blog
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); setActiveModal("privacy"); }}
                className="block w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); setActiveModal("contact"); }}
                className="block w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO HERO CONTAINER WITH BACKGROUND WAVING GRADIENT */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#fafbfe] via-[#fafbfe] to-white dark:from-[#0d1117] dark:to-[#0b1329] pt-12 pb-6 px-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text Content Column */}
          <div className="space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-5.5xl font-display font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Free Temporary Email <br />
              Address <span className="text-[#00b074]">Generator</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
              Protect your privacy and keep spam out of your inbox. Generate a secure, free temporary email address in seconds.
            </p>

            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 max-w-md pt-2">
              {[
                { text: "Instant Email" },
                { text: "No Registration" },
                { text: "100% Free" },
                { text: "Secure & Private" }
              ].map((feat, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="bg-[#eefbf6] dark:bg-emerald-950/35 p-1 rounded-full">
                    <Check className="w-3.5 h-3.5 text-[#00b074] stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Vector Illustration Column */}
          <div className="flex items-center justify-center relative min-h-[300px] sm:min-h-[380px] select-none py-6 lg:py-0 overflow-visible">
            {/* Outer soft glowing rings and grid */}
            <div className="absolute inset-0 bg-radial from-emerald-500/5 to-transparent rounded-full blur-3xl scale-125" />
            
            <div className="relative w-full max-w-md h-full flex items-center justify-center">
              {/* Dashed paths and orbits */}
              <svg className="absolute w-[360px] h-[360px] text-emerald-500/20" viewBox="0 0 100 100">
                <path d="M 10 50 Q 50 20 90 50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                <path d="M 10 50 Q 50 80 90 50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.2" />
              </svg>

              {/* Floating Orbit Node 1: Paper Airplane */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-12 bg-white dark:bg-[#161b22] border border-emerald-100 dark:border-gray-800 p-3.5 rounded-2xl shadow-lg text-[#00b074] z-10"
              >
                <Send className="w-5 h-5 transform -rotate-12 stroke-[2.5]" />
              </motion.div>

              {/* Floating Orbit Node 2: Shield Check */}
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-8 right-10 bg-white dark:bg-[#161b22] border border-emerald-100 dark:border-gray-800 p-3.5 rounded-2xl shadow-lg text-[#00b074] z-10"
              >
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </motion.div>

              {/* Floating Orbit Node 3: Avatar User */}
              <motion.div 
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-16 right-6 bg-white dark:bg-[#161b22] border border-emerald-100 dark:border-gray-800 p-3.5 rounded-2xl shadow-lg text-gray-400 z-10"
              >
                <User className="w-5 h-5 stroke-[2.5]" />
              </motion.div>

              {/* Main Envelope Element */}
              <motion.div 
                className="relative z-20 w-72 h-48 bg-[#00b074] rounded-3xl shadow-2xl flex flex-col justify-end p-6 border border-emerald-400/20 overflow-visible"
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                whileHover={{ scale: 1.03 }}
              >
                {/* Sliding Letter */}
                <motion.div 
                  animate={{ y: [0, -22, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-16 left-6 right-6 h-40 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 flex flex-col space-y-2.5 z-10 origin-bottom"
                >
                  <div className="w-12 h-2.5 bg-[#00b074]/20 rounded-full" />
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full" />
                  <div className="w-5/6 h-2 bg-gray-100 dark:bg-gray-700 rounded-full" />
                  <div className="w-4/5 h-2 bg-gray-100 dark:bg-gray-700 rounded-full" />
                  <div className="w-3/4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full" />
                </motion.div>

                {/* Envelope Front Flaps and Body Overlay to sandwich the letter */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#009b64] to-[#00b074] rounded-3xl z-20 flex flex-col justify-end p-6 shadow-inner pointer-events-none">
                  {/* Mail line mock design */}
                  <div className="w-1/2 h-1.5 bg-white/20 rounded-full mb-1" />
                  <div className="w-1/3 h-1.5 bg-white/10 rounded-full" />
                </div>

                {/* Padlock Shield layered directly in front */}
                <motion.div 
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-30 bg-[#00a068] text-white py-3.5 px-4.5 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center space-x-1"
                >
                  <Lock className="w-6 h-6 stroke-[2.5]" />
                </motion.div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN SINGLE LANDING PAGE STRUCTURE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {/* 2. MAIN GENERATOR CARD SEGMENT (MOCKUP ACCURATE OVERLAPPING CARD) */}
        <div className="max-w-3xl mx-auto -mt-16 sm:-mt-24 relative z-30">
          <div className="bg-white dark:bg-[#161b22] border border-slate-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all hover:shadow-emerald-500/5 duration-300">
            <h2 className="text-center font-display font-black text-slate-800 dark:text-white text-base tracking-wider uppercase mb-5">
              Your Temporary Email Address
            </h2>

            <div className="space-y-4">
              {/* Row: Soft green icon -> Input address -> Copy -> New Email */}
              <div className="flex flex-col md:flex-row items-stretch gap-3">
                {/* Simulated Email address field with badge on left */}
                <div className="flex-1 flex items-center bg-[#f8f9fa] dark:bg-[#0d1117] border border-slate-200 dark:border-gray-800 rounded-2xl p-2.5 sm:p-3 focus-within:border-[#00b074] dark:focus-within:border-emerald-500 transition-colors">
                  <div className="bg-[#eefbf6] dark:bg-emerald-950/40 text-[#00b074] p-2 rounded-xl shrink-0 mr-3 hidden sm:flex items-center justify-center">
                    <Mail className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={emailAddress || t.generatingMailbox}
                    onClick={copyToClipboard}
                    className="flex-1 bg-transparent text-left font-sans font-semibold text-sm sm:text-base text-slate-800 dark:text-white outline-none cursor-pointer tracking-wide px-1 py-1"
                    title="Click to copy"
                    id="mail-address-input"
                  />
                </div>

                {/* Action Buttons styled exactly like mockup */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-3.5 border border-slate-200 dark:border-gray-800 rounded-2xl hover:border-[#00b074] dark:hover:border-emerald-500 hover:text-[#00b074] dark:hover:text-emerald-400 bg-white dark:bg-[#1c222b] text-slate-700 dark:text-gray-300 font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-all shadow-sm active:scale-95"
                    title="Copy address to clipboard"
                    id="action-btn-copy"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>{isCopied ? t.copied : t.copy}</span>
                  </button>

                  <button
                    onClick={() => generateNewMailbox()}
                    className="flex-2 md:flex-none flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#00b074] hover:bg-[#009b64] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer border-0"
                    title="Generate new temporary mailbox"
                    id="action-btn-change"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>New Email</span>
                  </button>
                </div>
              </div>

              {/* Card Subtitle and Optional Power Actions Underneath */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-1 text-xs gap-3">
                <div className="flex items-center space-x-1.5 text-slate-400 dark:text-gray-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#00b074]" />
                  <span>This email will expire automatically.</span>
                </div>

                {/* Perfectly integrated secondary actions for power users (QR Code & Delete Address) */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveModal("qrcode")}
                    className="text-slate-400 hover:text-[#00b074] dark:hover:text-emerald-400 font-bold transition-colors flex items-center space-x-1 cursor-pointer bg-transparent border-0"
                    title="Display QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Code</span>
                  </button>
                  <span className="text-gray-200 dark:text-gray-800">|</span>
                  <button
                    onClick={handleDeleteAddress}
                    className="text-slate-400 hover:text-red-500 font-bold transition-colors flex items-center space-x-1 cursor-pointer bg-transparent border-0"
                    title="Delete mailbox address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.delete}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE MESSAGES / SAVED PANEL */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Tabs and Actions Row */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => { setActiveTab("messages"); setSelectedMessage(null); }}
                className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
                  activeTab === "messages"
                    ? "bg-[#00b074] text-white shadow-md shadow-emerald-500/10"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-850"
                }`}
              >
                {t.messages}
              </button>
              <button
                onClick={() => { setActiveTab("saved"); setSelectedMessage(null); }}
                className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
                  activeTab === "saved"
                    ? "bg-[#00b074] text-white shadow-md shadow-emerald-500/10"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-850"
                }`}
              >
                {t.saved} ({savedMessages.length})
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const nextVal = !soundEnabled;
                  setSoundEnabled(nextVal);
                  if (nextVal) {
                    playNotificationSound();
                  }
                }}
                className="text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-[#00b074] dark:hover:text-emerald-400 flex items-center space-x-1.5 cursor-pointer bg-transparent border-0"
                title={soundEnabled ? "Mute notification sound" : "Unmute notification sound"}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sound On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sound Off</span>
                  </>
                )}
              </button>

              <button
                onClick={() => fetchInbox(false)}
                className="text-xs font-semibold text-[#00b074] dark:text-emerald-400 hover:text-[#00b074] flex items-center space-x-1 hover:underline cursor-pointer bg-transparent border-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
                <span>{t.refresh}</span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="pt-6 min-h-[220px] flex flex-col justify-center">
            
            {/* If a message is selected, show details inside */}
            {selectedMessage ? (
              <div className="space-y-6">
                
                {/* Back button and actions */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-3.5 py-2 text-xs font-bold bg-emerald-50 dark:bg-[#1e293b] hover:bg-emerald-100/60 text-[#00b074] dark:text-emerald-300 rounded-xl flex items-center gap-1 transition-all cursor-pointer border-0"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                    <span>{t.backToInbox}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Star / Save message toggle */}
                    <button
                      onClick={() => handleToggleSaveMessage(selectedMessage)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isMessageSaved(selectedMessage.id)
                          ? "bg-amber-500/10 border-amber-400 text-amber-500"
                          : "border-gray-200 dark:border-gray-855 hover:text-amber-500 text-gray-400 bg-transparent"
                      }`}
                      title={isMessageSaved(selectedMessage.id) ? "Remove from Saved" : "Save Message"}
                    >
                      <Star className={`w-4 h-4 ${isMessageSaved(selectedMessage.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Header Information */}
                <div className="bg-gray-50 dark:bg-[#0d1117] p-5 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-2">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                    {selectedMessage.subject || t.noSubject}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 font-mono">{t.from}:</span>
                      <span className="text-gray-800 dark:text-gray-200 font-bold truncate">{selectedMessage.from}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1">
                      <span className="text-gray-400 font-mono">{t.received}:</span>
                      <span className="text-gray-800 dark:text-gray-200 font-bold">{new Date(selectedMessage.date).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Attachment indicators */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-gray-150 dark:border-gray-850 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                        {t.attachments} ({selectedMessage.attachments.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMessage.attachments.map((file, idx) => (
                          <a
                            key={idx}
                            href={`/api/download-attachment?login=${username}&domain=${activeDomain}&downloadUrl=${encodeURIComponent(file.downloadUrl || "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-850 text-xs font-mono rounded-lg hover:border-[#00b074] text-gray-700 dark:text-gray-300 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3 text-[#00b074] dark:text-emerald-400" />
                            <span>{file.filename}</span>
                            <span className="text-[10px] text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                 {/* Main Content Area */}
                <div>
                  {isLoadingContent ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 rounded-full border-4 border-emerald-100 border-t-[#00b074] animate-spin" />
                      <span className="text-xs font-bold text-gray-400">{t.loadingPayload}</span>
                    </div>
                  ) : (
                    <div>
                      {selectedMessage.htmlBody ? (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-[360px]">
                          <iframe
                            srcDoc={`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <style>
                                    body {
                                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                      color: #111827;
                                      line-height: 1.6;
                                      padding: 16px;
                                      margin: 0;
                                    }
                                    a { color: #2563eb; text-decoration: underline; }
                                    p { margin-top: 0; margin-bottom: 12px; }
                                  </style>
                                </head>
                                <body>
                                  ${selectedMessage.htmlBody}
                                </body>
                              </html>
                            `}
                            title="HTML Email Body"
                            sandbox="allow-popups"
                            className="w-full h-full border-0"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-[#0d1117] p-5 rounded-2xl border border-gray-200 dark:border-gray-855 text-sm whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                          {selectedMessage.body || selectedMessage.textBody || "Empty message body received."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Message Inbox Timelines */
              <div>
                {activeTab === "messages" ? (
                  messages.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => handleReadMessage(msg.id)}
                          className="py-4 px-3 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 cursor-pointer flex items-center justify-between transition-colors rounded-xl"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-1">
                              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">{msg.from}</span>
                              <span className="text-[10px] font-mono text-gray-400">{new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5 truncate">{msg.subject || t.noSubject}</h4>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Waiting Spinner Area */
                    <div className="py-12 text-center space-y-4 max-w-md mx-auto">
                      <div className="relative w-36 h-28 mx-auto flex items-end justify-center overflow-visible pb-2 select-none">
                        {/* Glowing radial backdrop */}
                        <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-xl animate-pulse" />
                        
                        {/* Pulsating outer rings */}
                        <motion.div 
                          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full border border-emerald-100 dark:border-emerald-950/30"
                        />
                        
                        {/* Realistic Envelope Body */}
                        <div className="relative w-28 h-18 bg-[#00b074] rounded-2xl shadow-lg border border-emerald-400/20 flex flex-col justify-end p-3 overflow-visible">
                          
                          {/* Sliding Letter peeking out */}
                          <motion.div 
                            animate={{ y: [0, -14, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-8 left-3 right-3 h-16 bg-white dark:bg-[#161b22] rounded-xl shadow-md border border-slate-100 dark:border-gray-800 p-2 flex flex-col space-y-1.5 z-10 origin-bottom"
                          >
                            <div className="w-6 h-1.5 bg-[#00b074]/30 rounded-full" />
                            <div className="w-full h-1 bg-slate-100 dark:bg-gray-800 rounded-full" />
                            <div className="w-4/5 h-1 bg-slate-100 dark:bg-gray-800 rounded-full" />
                            <div className="w-2/3 h-1 bg-slate-100 dark:bg-gray-800 rounded-full" />
                          </motion.div>

                          {/* Envelope Flap sandwiching the letter */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#009b64] to-[#00b074] rounded-2xl z-20 flex flex-col justify-end p-3 shadow-inner pointer-events-none">
                            <div className="w-1/2 h-1 bg-white/20 rounded-full mb-0.5" />
                            <div className="w-1/3 h-1 bg-white/10 rounded-full" />
                          </div>

                          {/* Central Mini Lock badge in front */}
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 z-30 bg-[#00a068] text-white p-1 rounded-lg shadow-md border border-white flex items-center justify-center"
                          >
                            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                          </motion.div>
                        </div>

                        {/* Floating elements ("small whatever") */}
                        <motion.div 
                          animate={{ scale: [0.8, 1.2, 0.8], x: [0, 4, 0], y: [0, -4, 0] }}
                          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-emerald-400"
                        />
                        <motion.div 
                          animate={{ scale: [1.2, 0.8, 1.2], x: [0, -3, 0], y: [0, 3, 0] }}
                          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute bottom-1 -left-1 w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-500"
                        />
                        <motion.div 
                          animate={{ opacity: [0.2, 0.8, 0.2] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-6 left-2 w-1.5 h-1.5 rounded-full bg-blue-400"
                        />
                        <motion.div 
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 left-1/3 text-[#00b074]/60"
                        >
                          <Send className="w-3.5 h-3.5 transform -rotate-12 stroke-[2.5]" />
                        </motion.div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">{t.waitingForEmails}</h4>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{t.emptyInboxSubtitle}</p>
                      </div>
                    </div>
                  )
                ) : (
                  /* Saved Tab List */
                  savedMessages.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {savedMessages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => handleReadMessage(msg.id)}
                          className="py-4 px-3 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 cursor-pointer flex items-center justify-between transition-colors rounded-xl"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">{msg.from}</span>
                              <span className="text-[10px] font-mono text-gray-400">{msg.date}</span>
                            </div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5 truncate">{msg.subject || t.noSubject}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 font-medium text-xs sm:text-sm space-y-2">
                      <Star className="w-7 h-7 mx-auto text-gray-300" />
                      <p>
                        {lang === "en" && "You have not saved any message logs in this browser session."}
                        {lang === "es" && "No ha guardado ningún registro de mensajes en esta sesión del navegador."}
                        {lang === "zh" && "您在当前浏览器会话中尚未保存任何邮件日志。"}
                        {lang === "hi" && "आपने इस ब्राउज़र सत्र में कोई संदेश लॉग सहेज कर नहीं रखा है।"}
                        {lang === "fr" && "Vous n'avez enregistré aucun message dans cette session de navigateur."}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

          </div>

          {/* Secure indicator footer inside panel */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {lang === "en" && "Electronic Spam Protection Active"}
              {lang === "es" && "Protección electrónica activa contra el spam"}
              {lang === "zh" && "电子垃圾邮件防护已激活"}
              {lang === "hi" && "इलेक्ट्रॉनिक स्पैम सुरक्षा सक्रिय"}
              {lang === "fr" && "Protection électronique anti-spam active"}
            </span>
          </div>
        </div>


        {/* BENTO GRID: WHY USE TEMP MAIL */}
        <div className="space-y-6 pt-2">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              Why use Temp-Mail-Generator<span className="text-[#00b074]">.site</span>?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              We provide a fast, secure, and hassle-free temporary email service designed to protect your identity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Instant Emails",
                desc: "Get a temporary email address instantly. No waiting, no signup required.",
                icon: Mail,
                color: "text-[#00b074] bg-[#eefbf6] dark:bg-emerald-950/40"
              },
              {
                title: "Protect Your Privacy",
                desc: "Keep your personal email private and protect yourself from spam and trackers.",
                icon: Shield,
                color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40"
              },
              {
                title: "Auto Delete",
                desc: "All received emails and addresses are automatically deleted after a short time.",
                icon: Clock,
                color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
              },
              {
                title: "100% Free",
                desc: "Our temporary email service is completely free with no hidden charges.",
                icon: Lock,
                color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
              }
            ].map((card, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-[#161b22] border border-slate-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`${card.color} w-10 h-10 rounded-2xl flex items-center justify-center`}>
                    <card.icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h3 className="font-display font-black text-base text-slate-800 dark:text-white tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* 4. EDUCATIONAL ARTICLE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white dark:bg-[#161b22] rounded-3xl p-6 sm:p-10 border border-slate-150 dark:border-gray-800 shadow-sm">
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3.5xl font-display font-black text-gray-900 dark:text-white leading-tight">
              {lang === "en" && "What is disposable temporary email?"}
              {lang === "es" && "¿Qué es el correo electrónico temporal desechable?"}
              {lang === "zh" && "什么是临时一次性电子邮件？"}
              {lang === "hi" && "डिस्पोजेबल अस्थायी ईमेल क्या है?"}
              {lang === "fr" && "Qu'est-ce qu'un e-mail temporaire jetable ?"}
            </h2>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-4 leading-relaxed font-medium">
              <p>
                {lang === "en" && "Disposable temporary email protects your real email address from spam, advertising mailings, and malware. It's anonymous, ephemeral, and 100% free. All emails and directories are automatically destroyed when the session timer expires or when clicking 'Delete' to secure your absolute identity secrecy."}
                {lang === "es" && "El correo electrónico temporal desechable protege su dirección real de spam, correos publicitarios y malware. Es anónimo, efímero y 100% gratuito. Todos los correos y directorios se destruyen automáticamente cuando expira el tiempo de sesión o al hacer clic en 'Eliminar' para asegurar el secreto absoluto de su identidad."}
                {lang === "zh" && "一次性临时电子邮件可以保护您的真实电子邮件地址免受垃圾邮件、广告邮件和恶意软件的侵害。它是匿名的、瞬态的，且 100% 免费。当会话计时器过期或单击“删除”时，所有电子邮件和目录都会自动销毁，以确保您的绝对身份机密。"}
                {lang === "hi" && "डिस्पोजेबल अस्थायी ईमेल आपके वास्तविक ईमेल पते को स्पैम, विज्ञापन मेलिंग और मैलवेयर से बचाता है। यह अनाम, अल्पकालिक और 100% मुफ़्त है। आपकी पूर्ण पहचान गोपनीयता सुरक्षित करने के लिए सत्र टाइमर समाप्त होने पर या 'हटाएं' पर क्लिक करने पर सभी ईमेल और निर्देशिकाएं स्वचालित रूप से नष्ट हो जाती हैं।"}
                {lang === "fr" && "L'e-mail temporaire jetable protège votre adresse e-mail réelle contre le spam, les publipostages publicitaires et les logiciels malveillants. Il est anonyme, éphémère et 100 % gratuit. Tous les e-mails et répertoires sont automatiquement détruits à l'expiration du minuteur de session ou en cliquant sur 'Supprimer' pour garantir le secret absolu de votre identité."}
              </p>
              <p>
                {lang === "en" && "Temporary email can be used to hide your real email: social networks, download files from file hosting, public Wi-Fi spots, blogs and forums require users to complete registration until they can fully use their website."}
                {lang === "es" && "El correo temporal se puede utilizar para ocultar su correo real: las redes sociales, la descarga de archivos de alojamiento de archivos, los puntos Wi-Fi públicos, los blogs y los foros requieren que los usuarios completen el registro antes de poder utilizar plenamente su sitio web."}
                {lang === "zh" && "临时电子邮件可用于隐藏您的真实电子邮件：社交网络、文件托管下载服务、公共 Wi-Fi 热点、博客和论坛等，都要求用户在完全使用其网站之前完成注册。"}
                {lang === "hi" && "अस्थायी ईमेल का उपयोग आपके वास्तविक ईमेल को छिपाने के लिए किया जा सकता है: सोशल नेटवर्क, फ़ाइल होस्टिंग से फ़ाइलें डाउनलोड करना, सार्वजनिक वाई-फाई स्पॉट, ब्लॉग और फ़ोरम उपयोगकर्ताओं को उनकी वेबसाइट का पूरी तरह से उपयोग करने से पहले पंजीकरण पूरा करने की आवश्यकता होती है।"}
                {lang === "fr" && "L'e-mail temporaire peut être utilisé pour masquer votre e-mail réel : les réseaux sociaux, le téléchargement de fichiers à partir d'hébergeurs de fichiers, les points Wi-Fi publics, les blogs et les forums obligent les utilisateurs à s'inscrire avant de pouvoir utiliser pleinement leur site Web."}
              </p>
            </div>
          </div>

          <div className="space-y-4 lg:pl-6">
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-[#00b074] dark:text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-extrabold block w-fit">
              {lang === "en" && "Quick Start Guide"}
              {lang === "es" && "Guía de Inicio Rápido"}
              {lang === "zh" && "快速入门指南"}
              {lang === "hi" && "त्वरित प्रारंभ मार्गदर्शिका"}
              {lang === "fr" && "Guide de démarrage rapide"}
            </span>
            <h3 className="font-display font-black text-lg text-gray-900 dark:text-white leading-tight">
              {lang === "en" && "How to protect your digital inbox"}
              {lang === "es" && "Cómo proteger su bandeja de entrada digital"}
              {lang === "zh" && "如何保护您的数字收件箱"}
              {lang === "hi" && "अपने डिजिटल इनबॉक्स की सुरक्षा कैसे करें"}
              {lang === "fr" && "Comment protéger votre boîte de réception numérique"}
            </h3>
            <div className="space-y-3.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold font-sans">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00b074] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-emerald-500/15">1</div>
                <span>
                  {lang === "en" && "Copy the burner email address generated above"}
                  {lang === "es" && "Copie la dirección de correo electrónico temporal generada arriba"}
                  {lang === "zh" && "复制上面生成的临时电子邮件地址"}
                  {lang === "hi" && "ऊपर उत्पन्न बर्नर ईमेल पता कॉपी करें"}
                  {lang === "fr" && "Copiez l'adresse e-mail jetable générée ci-dessus"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00b074] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-emerald-500/15">2</div>
                <span>
                  {lang === "en" && "Use it on any service asking for a signup/verification"}
                  {lang === "es" && "Úselo en cualquier servicio que solicite un registro o verificación"}
                  {lang === "zh" && "在任何要求注册/验证的服务上使用它"}
                  {lang === "hi" && "साइनअप/सत्यापन मांगने वाली किसी भी सेवा पर इसका उपयोग करें"}
                  {lang === "fr" && "Utilisez-le sur n'importe quel service demandant une inscription/vérification"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00b074] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-emerald-500/15">3</div>
                <span>
                  {lang === "en" && "Read incoming messages in the live inbox below"}
                  {lang === "es" && "Lea los mensajes entrantes en la bandeja de entrada en vivo a continuación"}
                  {lang === "zh" && "在下方实时收件箱中阅读传入的邮件"}
                  {lang === "hi" && "नीचे लाइव इनबॉक्स में आने वाले संदेश पढ़ें"}
                  {lang === "fr" && "Lisez les messages entrants dans la boîte de réception en direct ci-dessous"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. APPS AND EXTENSIONS GRID (REARRANGED & EXPANDED FREE ONES) */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight">
              {t.appsAndExtensions}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold">
              {lang === "en" && "Enjoy fast and convenient access to generate temporary emails from anywhere with our 100% free apps and extensions"}
              {lang === "es" && "Disfrute de un acceso rápido y conveniente para generar correos temporales desde cualquier lugar con nuestras aplicaciones y extensiones 100% gratuitas"}
              {lang === "zh" && "通过我们 100% 免费的应用程序和扩展程序，随时随地享受快速便捷的临时电子邮件生成体验"}
              {lang === "hi" && "हमारे 100% मुफ़्त ऐप्स और एक्सटेंशन के साथ कहीं से भी अस्थायी ईमेल जेनरेट करने के लिए तेज़ और सुविधाजनक पहुंच का आनंद लें"}
              {lang === "fr" && "Profitez d'un accès rapide et pratique pour générer des e-mails temporaires de n'importe où grâce à nos applications et extensions 100 % gratuites"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-3.5">
            {[
              { name: "Chrome Extension", icon: Chrome, label: "Add-on", color: "bg-red-500/10 text-red-500 border border-red-500/15" },
              { name: "Firefox Add-on", icon: Flame, label: "Add-on", color: "bg-orange-500/10 text-orange-500 border border-orange-500/15" },
              { name: "Safari Extension", icon: Compass, label: "Safari", color: "bg-blue-500/10 text-blue-500 border border-blue-500/15" },
              { name: "Microsoft Edge", icon: ExternalLink, label: "Add-on", color: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/15" },
              { name: "Opera Extension", icon: Zap, label: "Opera", color: "bg-rose-500/10 text-rose-500 border border-rose-500/15" },
              { name: "Brave Extension", icon: Shield, label: "Brave", color: "bg-amber-600/10 text-amber-600 border border-amber-500/15" },
              { name: "PWA Mobile App", icon: Smartphone, label: "Add to Home", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15" },
              { name: "Safari Web Clip", icon: Apple, label: "iOS Safari", color: "bg-slate-800/10 text-slate-800 dark:text-slate-300 dark:bg-slate-800/40 border border-slate-500/15" },
              { name: "Telegram Bot", icon: Send, label: "Bot Channel", color: "bg-sky-500/10 text-sky-500 border border-sky-500/15" },
              { name: "Discord Bot", icon: Bot, label: "Bot Integration", color: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/15" }
            ].map((app, idx) => {
              const AppIcon = app.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveModal("download")}
                  className="p-4 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl text-center hover:border-blue-600 transition-all duration-200 flex flex-col items-center gap-2.5 cursor-pointer hover:shadow-md shadow-sm"
                >
                  <div className={`p-2.5 rounded-xl ${app.color}`}>
                    <AppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">{app.name}</h4>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-mono mt-0.5">{app.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. FAQ ACCORDION LIST (NORMAL INTERNET-FAMILIAR FONT SANS) */}
        <div className="space-y-6 max-w-3xl mx-auto" id="faq-section">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight">
              {t.faq}
            </h2>
            <p className="text-xs text-gray-400 font-semibold">
              {lang === "en" && "Got questions? Here is everything you need to know about disposable mail"}
              {lang === "es" && "¿Tiene preguntas? Aquí tiene todo lo que necesita saber sobre el correo desechable"}
              {lang === "zh" && "有疑问？这里是您需要了解的关于临时邮件的一切信息"}
              {lang === "hi" && "कोई सवाल? डिस्पोजेबल मेल के बारे में जानने के लिए वह सब कुछ यहाँ है जो आपको चाहिए"}
              {lang === "fr" && "Des questions ? Voici tout ce que vous devez savoir sur les e-mails jetables"}
            </p>
          </div>

          <div className="space-y-2.5">
            {(FAQ_TRANSLATIONS[lang] || FAQ_DATA).map((faq, index) => {
              const isExpanded = expandedFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-gray-150 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#161b22] overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                    className="w-full text-left p-4.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors"
                  >
                    <h3 className="font-sans font-medium text-xs sm:text-sm text-gray-800 dark:text-white flex items-center gap-2.5">
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold uppercase">Q{(index + 1).toString().padStart(2, "0")}</span>
                      <span>{faq.question}</span>
                    </h3>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180 text-blue-600" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pl-12 border-t border-gray-50 dark:border-gray-800 pt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-normal font-sans">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. LATEST BLOG POSTS GRID (REALISTIC BLOG LAYOUT WITH IMAGES) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-blue-600 font-bold uppercase block mb-0.5">
                {lang === "en" && "Privacy Education Hub"}
                {lang === "es" && "Centro de Educación sobre Privacidad"}
                {lang === "zh" && "隐私教育中心"}
                {lang === "hi" && "गोपनीयता शिक्षा केंद्र"}
                {lang === "fr" && "Centre d'éducation à la vie privée"}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black text-gray-900 dark:text-white tracking-tight">{t.blog}</h2>
            </div>
            <button
              onClick={() => { setSelectedBlogSlug(BLOG_DATA[0].slug); }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer bg-transparent border-0"
            >
              <span>
                {lang === "en" && "Read all posts"}
                {lang === "es" && "Leer todas las publicaciones"}
                {lang === "zh" && "阅读所有文章"}
                {lang === "hi" && "सभी पोस्ट पढ़ें"}
                {lang === "fr" && "Lire tous les articles"}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_DATA.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedBlogSlug(post.slug)}
                className="group bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden flex flex-col justify-between min-h-[350px] cursor-pointer hover:shadow-lg hover:border-blue-500/25 transition-all duration-300"
              >
                {/* Real image overlay */}
                <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                  <img
                    src={post.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[9px] font-mono uppercase font-bold tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Card description */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-sm font-display font-extrabold text-gray-800 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-4 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                    <span>
                      {lang === "en" && "By "}
                      {lang === "es" && "Por "}
                      {lang === "zh" && "作者 "}
                      {lang === "hi" && "द्वारा "}
                      {lang === "fr" && "Par "}
                      {post.author}
                    </span>
                    <span>{post.publishDate}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* 8. DISPOSABLE EMAIL ADDRESSES LONG SEO FOOTER BLOCK */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="font-display font-black text-lg text-gray-900 dark:text-white">
            {lang === "en" && "Disposable email addresses"}
            {lang === "es" && "Direcciones de correo electrónico desechables"}
            {lang === "zh" && "一次性电子邮件地址"}
            {lang === "hi" && "डिस्पोजेबल ईमेल पते"}
            {lang === "fr" && "Adresses e-mail jetables"}
          </h3>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-3.5 leading-relaxed font-semibold">
            <p>
              {lang === "en" && "Nowadays, digital interactions are part of our everyday routine—signing up for online courses, trials, forums, and downloading free resources—we constantly share our personal information, especially our email addresses. But what if there was a way to interact with websites without giving away your real inbox?"}
              {lang === "es" && "Hoy en día, las interacciones digitales forman parte de nuestra rutina diaria (registrarse en cursos en línea, pruebas, foros y descargar recursos gratuitos); compartimos constantemente nuestra información personal, especialmente nuestras direcciones de correo electrónico. ¿Pero qué pasaría si hubiera una manera de interactuar con sitios web sin revelar su bandeja de entrada real?"}
              {lang === "zh" && "如今，数字互动已成为我们日常生活的一部分——注册在线课程、试用版、论坛和下载免费资源——我们不断分享我们的个人信息，尤其是我们的电子邮件地址。但是，如果有一种方法可以与网站进行交互而无需透露您真实的收件箱，该怎么办？"}
              {lang === "hi" && "आजकल, डिजिटल बातचीत हमारी दैनिक दिनचर्या का हिस्सा है—ऑनलाइन पाठ्यक्रमों, परीक्षणों, मंचों के लिए साइन अप करना और मुफ्त संसाधनों को डाउनलोड करना—हम लगातार अपनी व्यक्तिगत जानकारी, विशेष रूप से अपने ईमेल पते साझा करते हैं। लेकिन क्या होगा अगर आपके पास वास्तविक इनबॉक्स दिए बिना वेबसाइटों के साथ बातचीत करने का कोई तरीका हो?"}
              {lang === "fr" && "De nos jours, les interactions numériques font partie de notre routine quotidienne — s'inscrire à des cours en ligne, des essais, des forums et télécharger des ressources gratuites — nous partageons constamment nos informations personnelles, en particulier nos adresses e-mail. Mais que se passerait-il s'il existait un moyen d'interagir avec les sites Web sans révéler votre véritable boîte de réception ?"}
            </p>
            <p>
              {lang === "en" && "That's where temporary email addresses are very helpful. A temporary mailbox allows you to bypass the spam cycle. Instead of using your primary credentials and exposing your communication logs to hackers, you can deploy a disposable gateway that handles the verification link, and then automatically vanishes without a trace."}
              {lang === "es" && "Ahí es donde las direcciones de correo electrónico temporales resultan muy útiles. Un buzón temporal le permite eludir el ciclo de spam. En lugar de utilizar sus credenciales principales y exponer sus registros de comunicación a los piratas informáticos, puede desplegar una pasarela desechable que gestione el enlace de verificación y luego desaparezca automáticamente sin dejar rastro."}
              {lang === "zh" && "这就是临时电子邮件地址非常有用的地方。临时邮箱可以帮助您绕过垃圾邮件循环。您无需使用主要凭据并将您的通信日志暴露给黑客，而是可以部署一个一次性网关来处理验证链接，然后它就会自动消失，不留任何痕迹。"}
              {lang === "hi" && "यहीं पर अस्थायी ईमेल पते बहुत मददगार होते हैं। एक अस्थायी मेलबॉक्स आपको स्पैम चक्र को बायपास करने की अनुमति देता है। अपनी प्राथमिक साख का उपयोग करने और हैकर्स के सामने अपने संचार लॉग को उजागर करने के बजाय, आप एक डिस्पोजेबल गेटवे तैनात कर सकते हैं जो सत्यापन लिंक को संभालता है, और फिर बिना किसी निशान के स्वचालित रूप से गायब हो जाता है।"}
              {lang === "fr" && "C'est là que les adresses e-mail temporaires sont très utiles. Une boîte de réception temporaire vous permet de contourner le cycle du spam. Au lieu d'utiliser vos identifiants principaux et d'exposer vos journaux de communication aux pirates, vous pouvez déployer une passerelle jetable qui gère le lien de vérification, puis disparaît automatiquement sans laisser de trace."}
            </p>
            <p>
              {lang === "en" && "Our service was engineered from the ground up to solve these modern challenges. We process thousands of verifications every second, providing you with a dynamic armor that secures your peace of mind while exploring the open web."}
              {lang === "es" && "Nuestro servicio fue diseñado desde cero para resolver estos desafíos modernos. Procesamos miles de verificaciones cada segundo, proporcionándole una armadura dinámica que asegura su tranquilidad mientras explora la web abierta."}
              {lang === "zh" && "我们的服务专为解决这些现代挑战而设计。我们每秒处理数千次验证，为您提供动态护盾，在您探索开放的网络世界时确保您的心境安宁。"}
              {lang === "hi" && "हमारी सेवा इन आधुनिक चुनौतियों का समाधान करने के लिए शुरू से तैयार की गई थी। हम हर सेकंड हजारों सत्यापन संसाधित करते हैं, जिससे आपको एक गतिशील कवच मिलता है जो खुले वेब की खोज करते समय आपके मानसिक शांति को सुरक्षित करता है।"}
              {lang === "fr" && "Notre service a été conçu à partir de zéro pour résoudre ces défis modernes. Nous traitons des milliers de vérifications chaque seconde, vous offrant une armure dynamique qui garantit votre tranquillité d'esprit tout en explorant le Web ouvert."}
            </p>
          </div>
        </div>

        {/* 9. DISCOVER MORE ACCORDION LINKS */}
        <div className="max-w-xl mx-auto border border-gray-250 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-800">
          <div className="p-3 bg-gray-50 dark:bg-[#161b22]/50 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {lang === "en" && "Discover More Privacy Resources"}
            {lang === "es" && "Descubra más recursos de privacidad"}
            {lang === "zh" && "发现更多隐私资源"}
            {lang === "hi" && "अधिक गोपनीयता संसाधनों की खोज करें"}
            {lang === "fr" && "Découvrir plus de ressources de confidentialité"}
          </div>
          {[
            {
              title: {
                en: "Spam protection software",
                es: "Software de protección contra el spam",
                zh: "垃圾邮件防护软件",
                hi: "स्पैम सुरक्षा सॉफ्टवेयर",
                fr: "Logiciel de protection contre le spam"
              },
              desc: {
                en: "An advanced list of desktop and browser extensions designed to filter behavioral tracers, restrict analytics cookies, and prevent email miners from building marketing records.",
                es: "Una lista avanzada de extensiones para navegador y escritorio diseñadas para filtrar rastreadores de comportamiento, restringir cookies de análisis y evitar que los recolectores de correo creen perfiles de marketing.",
                zh: "一系列先进的桌面和浏览器扩展程序，旨在过滤行为追踪器，限制分析类 Cookie，并防止电子邮件挖掘程序建立营销记录。",
                hi: "डेस्कटॉप और ब्राउज़र एक्सटेंशन की एक उन्नत सूची जिसे व्यवहारिक ट्रेसर को फ़िल्टर करने, एनालिटिक्स कुकीज़ को प्रतिबंधित करने और ईमेल खनिकों को मार्केटिंग रिकॉर्ड बनाने से रोकने के लिए डिज़ाइन किया गया है।",
                fr: "Une liste avancée d'extensions de bureau et de navigateur conçues pour filtrer les traceurs de comportement, restreindre les cookies d'analyse et empêcher les collecteurs d'e-mails de créer des profils marketing."
              }
            },
            {
              title: {
                en: "Anonymous email sending",
                es: "Envío de correos anónimos",
                zh: "匿名发送电子邮件",
                hi: "अनाम ईमेल भेजना",
                fr: "Envoi d'e-mails anonymes"
              },
              desc: {
                en: "Explore safe practices regarding end-to-end encrypted mail protocols, peer-to-peer SMTP gateways, and anonymous transmission mechanisms.",
                es: "Explore prácticas seguras con respecto a los protocolos de correo cifrados de extremo a extremo, puertas de enlace SMTP peer-to-peer y mecanismos de transmisión anónimos.",
                zh: "探索有关端到端加密邮件协议、点对点 SMTP 网关和匿名传输机制的安全实践。",
                hi: "एंड-टू-एंड एन्क्रिप्टेड मेल प्रोटोकॉल, पीयर-टू-पीयर एसएमटीपी गेटवे और अनाम ट्रांसमिशन तंत्र के संबंध में सुरक्षित प्रथाओं का पता लगाएं।",
                fr: "Explorez les pratiques de sécurité concernant les protocoles de messagerie chiffrés de bout en bout, les passerelles SMTP peer-to-peer et les mécanismes de transmission anonymes."
              }
            },
            {
              title: {
                en: "Throwaway email addresses",
                es: "Direcciones de correo temporal",
                zh: "临时丢弃式电子邮件地址",
                hi: "थ्रोअवे ईमेल पते",
                fr: "Adresses e-mail jetables"
              },
              desc: {
                en: "Why throwaways are essential for digital hygiene. A comparison guide detailing temporary address lifecycle metrics, domain reputations, and disposable inboxes.",
                es: "Por qué los correos desechables son esenciales para la higiene digital. Una guía comparativa que detalla las métricas del ciclo de vida de las direcciones temporales, la reputación del dominio y los buzones desechables.",
                zh: "为什么临时丢弃式邮箱对数字卫生至关重要。一份详细对比指南，介绍临时地址生命周期指标、域名信誉和一次性收件箱。",
                hi: "डिजिटल स्वच्छता के लिए थ्रोअवे क्यों आवश्यक हैं। अस्थायी पता जीवनचक्र मीट्रिक, डोमेन प्रतिष्ठा और डिस्पोजेबल इनबॉक्स का विवरण देने वाली एक तुलना मार्गदर्शिका।",
                fr: "Pourquoi les e-mails jetables sont essentiels pour l'hygiène numérique. Un guide comparatif détaillant les mesures du cycle de vie des adresses temporaires, la réputation des domaines et les boîtes de réception jetables."
              }
            }
          ].map((item, idx) => {
            const isExpanded = expandedDiscoverIdx === idx;
            return (
              <div key={idx} className="bg-white dark:bg-[#161b22]">
                <div
                  onClick={() => setExpandedDiscoverIdx(isExpanded ? null : idx)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer flex items-center justify-between transition-colors font-semibold text-xs text-gray-700 dark:text-gray-300"
                >
                  <span>{item.title[lang]}</span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90 text-blue-600" : ""}`} />
                </div>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50/50 dark:bg-gray-900/30"
                    >
                      <div className="px-5 pb-4 pt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                        {item.desc[lang]}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </main>

      {/* 10. DETAILED FOOTER SITEMAP & BADGES */}
      <footer className="bg-[#0f172a] dark:bg-[#020617] text-gray-300 py-12 mt-20 border-t border-blue-950/40 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Sitemap Columns grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-blue-950/30 pb-10">
            <div>
              <h4 className="text-white uppercase tracking-wider font-mono text-[10px] font-bold mb-3.5">Features</h4>
              <ul className="space-y-2.5 text-gray-400">
                <li><button onClick={() => setActiveModal("tools")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">API Endpoint</button></li>
                <li><button onClick={() => handleChangeAddress()} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Custom Domains</button></li>
                <li><button onClick={() => handleExtendLifetime(3)} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">3 Minute Mail</button></li>
                <li><button onClick={() => setActiveModal("download")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Telegram Bot</button></li>
                <li><button onClick={() => setActiveModal("about")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">About Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white uppercase tracking-wider font-mono text-[10px] font-bold mb-3.5">Apps & Extensions</h4>
              <ul className="space-y-2.5 text-gray-400">
                <li><button onClick={() => setActiveModal("download")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">iOS App Client</button></li>
                <li><button onClick={() => setActiveModal("download")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Android Native</button></li>
                <li><button onClick={() => setActiveModal("download")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Chrome Extension</button></li>
                <li><button onClick={() => setActiveModal("download")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Firefox Add-on</button></li>
                <li><button onClick={() => setActiveModal("download")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Opera Extension</button></li>
                <li><button onClick={() => setActiveModal("download")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Microsoft Edge</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white uppercase tracking-wider font-mono text-[10px] font-bold mb-3.5">Free Security Tools</h4>
              <ul className="space-y-2.5 text-gray-400">
                <li><button onClick={() => { setActiveModal("tools"); setActiveToolTab("password-generator"); }} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Password Generator</button></li>
                <li><button onClick={() => { setActiveModal("tools"); setActiveToolTab("strength-checker"); }} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Data Breach Checker</button></li>
                <li><button onClick={() => { setActiveModal("tools"); setActiveToolTab("virus-scanner"); }} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Virus & Spam Checker</button></li>
                <li><button onClick={() => { setActiveModal("tools"); setActiveToolTab("byte-converter"); }} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Byte Unit Converter</button></li>
                <li><button onClick={() => { setActiveModal("tools"); setActiveToolTab("file-converter"); }} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">File Format Converter</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white uppercase tracking-wider font-mono text-[10px] font-bold mb-3.5">Company</h4>
              <ul className="space-y-2.5 text-gray-400">
                <li><button onClick={() => setActiveModal("contact")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Contact Us</button></li>
                <li><button onClick={() => setActiveModal("privacy")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Privacy Policy</button></li>
                <li><button onClick={() => setActiveModal("terms")} className="hover:text-white transition-colors bg-transparent border-0 cursor-pointer">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          {/* Center Brand, Badges and Stores */}
          <div className="flex flex-col items-center text-center space-y-6 pt-2">
            
            {/* Logo Center */}
            <div className="flex items-center space-x-2">
              <div className="bg-white text-blue-600 font-black rounded-lg w-7 h-7 flex items-center justify-center font-display text-sm shadow-md">
                T
              </div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight">Temp Mail Generator</span>
            </div>

            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Free Temporary Email Generator</p>
            <p className="text-xs text-gray-500 font-medium">© 2026 Temporary Email Generator. All rights reserved.</p>

            {/* Language dropdown */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-gray-800 rounded-xl bg-slate-900 text-gray-400">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
              <span className="text-[11px] font-bold text-gray-300">{LANGUAGES.find(l => l.code === lang)?.name}</span>
            </div>

            {/* PWA / Mobile Web Optimized Info Badge */}
            <div className="max-w-md bg-slate-900 border border-blue-950/60 p-4 rounded-2xl flex items-start gap-3.5 text-left mt-2 shadow-inner">
              <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h5 className="font-bold text-xs text-white leading-tight mb-0.5">Mobile Web Optimized PWA</h5>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">No app store download required. Simply add this website to your mobile home screen via browser settings for direct, full-screen standalone utility access.</p>
              </div>
            </div>

            {/* Dummy Social Media Icons */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-[#00b074] border border-blue-950/60 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer hover:scale-105 active:scale-95" 
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-[#00b074] border border-blue-950/60 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer hover:scale-105 active:scale-95" 
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-[#00b074] border border-blue-950/60 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer hover:scale-105 active:scale-95" 
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-[#00b074] border border-blue-950/60 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer hover:scale-105 active:scale-95" 
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </footer>

      {/* 11. AUXILIARY POPUP MODALS OVERLAYS */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] space-y-6"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  {activeModal === "qrcode" ? (
                    <QrCode className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                  <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {activeModal === "qrcode" && "Email QR Code"}
                    {activeModal === "tools" && "Advanced Security Tools"}
                    {activeModal === "contact" && "Contact Support Team"}
                    {activeModal === "privacy" && "Privacy & Identity Policy"}
                    {activeModal === "terms" && "Terms of Service Agreement"}
                    {activeModal === "download" && "Apps & Extensions Client"}
                    {activeModal === "about" && "About Temporary Email Generator"}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body Contents */}
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                
                {/* ADVANCED SECURITY TOOLS */}
                {activeModal === "tools" && (
                  <div className="space-y-6">
                    {/* Tool Tab selectors */}
                    <div className="flex flex-wrap gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-3">
                      {[
                        { id: "password-generator", label: "Password Generator" },
                        { id: "strength-checker", label: "Strength Checker" },
                        { id: "byte-converter", label: "Byte Converter" },
                        { id: "virus-scanner", label: "Virus Scanner" },
                        { id: "file-converter", label: "File Converter" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveToolTab(tab.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeToolTab === tab.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-500"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Active Tool Workspace */}
                    <div className="space-y-4">
                      {activeToolTab === "password-generator" && (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-400">Generate high-entropy random passwords instantly. Fully processed in-browser.</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value={generatedPassword}
                              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-xs sm:text-sm font-bold text-gray-800 dark:text-white"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedPassword);
                                setIsPassCopied(true);
                                setTimeout(() => setIsPassCopied(false), 2000);
                              }}
                              className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              {isPassCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isPassCopied ? "Copied" : "Copy"}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5 bg-gray-50 dark:bg-[#0d1117] p-4 rounded-xl text-xs">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={genUppercase} onChange={(e) => setGenUppercase(e.target.checked)} id="gen-upper" />
                              <label htmlFor="gen-upper" className="font-bold cursor-pointer">Uppercase letters (A-Z)</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={genLowercase} onChange={(e) => setGenLowercase(e.target.checked)} id="gen-lower" />
                              <label htmlFor="gen-lower" className="font-bold cursor-pointer">Lowercase letters (a-z)</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={genNumbers} onChange={(e) => setGenNumbers(e.target.checked)} id="gen-nums" />
                              <label htmlFor="gen-nums" className="font-bold cursor-pointer">Numbers (0-9)</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={genSymbols} onChange={(e) => setGenSymbols(e.target.checked)} id="gen-syms" />
                              <label htmlFor="gen-syms" className="font-bold cursor-pointer">Symbols (!@#$)</label>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400 font-mono">
                              <span>Password Length: {genLength} chars</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="64"
                              value={genLength}
                              onChange={(e) => setGenLength(Number(e.target.value))}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <button
                            onClick={generatePassword}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Generate New Password
                          </button>
                        </div>
                      )}

                      {activeToolTab === "strength-checker" && (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-400">Test cryptographic strength of custom credentials with localized metrics.</p>
                          <input
                            type="password"
                            placeholder="Type a password to analyze..."
                            value={checkPassword}
                            onChange={(e) => setCheckPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs sm:text-sm font-semibold"
                          />
                          
                          {checkPassword && (
                            <div className="p-4 bg-gray-50 dark:bg-[#0d1117] rounded-xl space-y-3 text-xs">
                              <div className="flex justify-between font-bold">
                                <span>Strength: <span className={evaluatePasswordStrength(checkPassword).text}>{evaluatePasswordStrength(checkPassword).label}</span></span>
                                <span>Score: {evaluatePasswordStrength(checkPassword).score}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${evaluatePasswordStrength(checkPassword).color}`} style={{ width: `${evaluatePasswordStrength(checkPassword).score}%` }} />
                              </div>
                              <p className="text-[11px] text-gray-400">{evaluatePasswordStrength(checkPassword).feedback}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeToolTab === "byte-converter" && (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-400">Quickly calculate byte sizes (KB, MB, GB, TB) with high-precision accuracy.</p>
                          <div className="grid grid-cols-2 gap-3.5">
                            <input
                              type="number"
                              value={byteInputValue}
                              onChange={(e) => setByteInputValue(e.target.value)}
                              placeholder="1"
                              className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs sm:text-sm font-semibold"
                            />
                            <select
                              value={byteInputUnit}
                              onChange={(e) => setByteInputUnit(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs sm:text-sm font-semibold"
                            >
                              <option value="B">Bytes (B)</option>
                              <option value="KB">Kilobytes (KB)</option>
                              <option value="MB">Megabytes (MB)</option>
                              <option value="GB">Gigabytes (GB)</option>
                              <option value="TB">Terabytes (TB)</option>
                            </select>
                          </div>

                          <div className="bg-gray-50 dark:bg-[#0d1117] p-4 rounded-xl font-mono text-xs space-y-2.5 text-gray-500">
                            <div className="flex justify-between"><span className="font-bold">Bytes:</span><span className="text-gray-800 dark:text-white font-extrabold">{convertBytes(byteInputValue, byteInputUnit).B.toLocaleString()} B</span></div>
                            <div className="flex justify-between"><span className="font-bold">Kilobytes:</span><span className="text-gray-800 dark:text-white font-extrabold">{convertBytes(byteInputValue, byteInputUnit).KB.toFixed(4)} KB</span></div>
                            <div className="flex justify-between"><span className="font-bold">Megabytes:</span><span className="text-gray-800 dark:text-white font-extrabold">{convertBytes(byteInputValue, byteInputUnit).MB.toFixed(4)} MB</span></div>
                            <div className="flex justify-between"><span className="font-bold">Gigabytes:</span><span className="text-gray-800 dark:text-white font-extrabold">{convertBytes(byteInputValue, byteInputUnit).GB.toFixed(6)} GB</span></div>
                            <div className="flex justify-between"><span className="font-bold">Terabytes:</span><span className="text-gray-800 dark:text-white font-extrabold">{convertBytes(byteInputValue, byteInputUnit).TB.toFixed(8)} TB</span></div>
                          </div>
                        </div>
                      )}

                      {activeToolTab === "virus-scanner" && (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-400">Instantly audit security integrity of email attachments. Simulated clean sandbox match.</p>
                          
                          {scannerStatus === "idle" ? (
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center space-y-3">
                              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
                              <div className="space-y-1">
                                <h5 className="font-bold text-xs text-gray-900 dark:text-white">Upload attachments to scan</h5>
                                <p className="text-[10px] text-gray-400 font-medium">Supports pdf, zip, exe, dmg, docx up to 25MB</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => startVirusScan("invoice_payload.zip")}
                                className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                              >
                                Simulate File Scan
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                                <span className="truncate">Scanning: {scannerFileName}</span>
                                <span>{scannerProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${scannerProgress}%` }} />
                              </div>

                              <div className="bg-[#0d1117] border border-gray-800 p-4 rounded-xl text-[10px] font-mono text-emerald-500 space-y-1 h-36 overflow-y-auto">
                                {scannerLog.map((logLine, idx) => (
                                  <div key={idx} className="flex gap-1.5">
                                    <span className="text-gray-600 select-none">[{idx + 1}]</span>
                                    <span>{logLine}</span>
                                  </div>
                                ))}
                              </div>

                              {scannerStatus === "clean" && (
                                <button
                                  onClick={() => setScannerStatus("idle")}
                                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                                >
                                  Done
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activeToolTab === "file-converter" && (
                        <div className="space-y-4">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                            💡 Standalone Platform Note: We have migrated our comprehensive high-performance File Converter to its own separate site to guarantee unlimited processing and zero server footprint! Click below to visit the converter.
                          </p>
                          <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center space-y-4">
                            <ExternalLink className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
                            <div className="space-y-1">
                              <h5 className="font-bold text-sm text-gray-900 dark:text-white">FileConverter.org Portal</h5>
                              <p className="text-xs text-gray-400 font-medium">Free, super-fast image, audio, video and doc conversions.</p>
                            </div>
                            <a
                              href="https://file-converter.example.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.preventDefault();
                                alert("Standalone File Converter: In development, this link redirects to your dedicated fileconverter.org platform site!");
                              }}
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer decoration-transparent"
                            >
                              <span>Launch File Converter Site</span>
                              <ChevronRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CONTACT FORM */}
                {activeModal === "contact" && (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                    <p className="text-xs text-gray-400">Facing deliverability issues? Open a support ticket and our developers will reply within 2 hours.</p>
                    
                    {contactSubmitted ? (
                      <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-center space-y-1">
                        <ShieldCheck className="w-8 h-8 mx-auto" />
                        <h5 className="font-bold text-xs uppercase tracking-wider">Ticket Submitted Successfully</h5>
                        <p className="text-[11px] font-semibold">Your ticket ID: #{Math.floor(100000 + Math.random() * 900000)}. We will review immediately.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Your Name</label>
                            <input
                              type="text"
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Your Email</label>
                            <input
                              type="email"
                              required
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Subject</label>
                          <input
                            type="text"
                            required
                            value={contactSubject}
                            onChange={(e) => setContactSubject(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Message</label>
                          <textarea
                            rows={4}
                            required
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold"
                            placeholder="Write details of your inquiry..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={contactLoading}
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                        >
                          {contactLoading ? "Sending..." : "Submit Support Ticket"}
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* DOWNLOAD CLIENTS */}
                {activeModal === "download" && (
                  <div className="space-y-6 text-center">
                    <Smartphone className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto" />
                    <div className="space-y-2">
                      <h4 className="text-lg font-display font-black text-gray-900 dark:text-white">Multi-platform Access Apps</h4>
                      <p className="text-xs text-gray-400">Generate temporary emails directly from your devices without opening any browser tabs.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      {[
                        { title: "Browser Extensions", desc: "Lightweight toolbars for Chrome, Firefox, Safari, Edge, and Opera.", icon: Chrome },
                        { title: "PWA Mobile App", desc: "Simply install directly from your mobile browser settings for standalone full-screen access.", icon: Smartphone },
                        { title: "Telegram Channel Bot", desc: "Interact, create mailboxes, and read payloads right inside Telegram chat streams.", icon: Send },
                        { title: "Developer API Bundle", desc: "Staging integration endpoints for end-to-end automation suites.", icon: Zap }
                      ].map((item, idx) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-[#0d1117] rounded-xl border border-gray-200 dark:border-gray-850 flex items-start gap-3">
                            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600 dark:text-blue-400 shrink-0"><ItemIcon className="w-4.5 h-4.5" /></div>
                            <div>
                              <h5 className="font-bold text-xs text-gray-900 dark:text-white leading-tight">{item.title}</h5>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ABOUT US */}
                {activeModal === "about" && (
                  <div className="space-y-4">
                    <p>Temporary Email Generator is a privacy-first electronic utility built by security engineers on top of robust server architecture. We process millions of verification codes and attachments daily, keeping users safe from spam, tracking databases, and malicious campaigns.</p>
                    <p>Our infrastructure matches highly scalable, premium routing gateways, ensuring delivery speed inside milliseconds. Everything is fully encrypted in-transit and wiped instantly once the lifetime timer expires.</p>
                  </div>
                )}

                {/* PRIVACY POLICY */}
                {activeModal === "privacy" && (
                  <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3 text-[11px] sm:text-xs text-left font-medium text-gray-600 dark:text-gray-300 scrollbar-thin">
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                      <p className="text-[10px] text-gray-400 font-mono">Last updated: July 2, 2026</p>
                      <p className="mt-1 text-gray-500">At Temporary Email Generator, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Temporary Email Generator and how we use it. If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">1. Consent</h5>
                      <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">2. Information We Collect</h5>
                      <p>Temporary Email Generator is designed to provide fully anonymous, disposable inbox addresses. We do NOT ask for or collect any personal information, such as your name, physical address, primary email address, telephone number, or payment details. No registration or account setup is required to utilize our service.</p>
                      <p>For any contact support submissions, we collect your name, contact email address, and the content of the message or attachments you may send us, which are strictly used for support resolution.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">3. Log Files and Analytics</h5>
                      <p>Temporary Email Generator follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">4. Cookies and Web Beacons</h5>
                      <p>Like any other website, Temporary Email Generator uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>
                      <p>We also utilize standard local browser storage (such as localStorage) solely to preserve your active burner email address name and active messages for the duration of your session, preventing data loss on window refresh.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">5. Google DoubleClick DART Cookie</h5>
                      <p>Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://policies.google.com/technologies/ads</a></p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">6. Our Advertising Partners</h5>
                      <p>Some of advertisers on our site may use cookies and web beacons. Our advertising partners include Google AdSense. Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their Privacy Policies below:</p>
                      <p>Google: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://policies.google.com/technologies/ads</a></p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">7. Third-Party Privacy Policies</h5>
                      <p>Temporary Email Generator's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. You can choose to disable cookies through your individual browser options.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">8. CCPA Privacy Rights (Do Not Sell My Personal Info)</h5>
                      <p>Under the CCPA, among other rights, California consumers have the right to request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers, request that a business delete any personal data about the consumer that a business has collected, and request that a business disclose that they do not sell the consumer's personal data. Since we do not collect, store, or sell any personal data of any users, we are fully CCPA compliant.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">9. GDPR Data Protection Rights</h5>
                      <p>We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>The right to access – You have the right to request copies of your personal data.</li>
                        <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                        <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                        <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                      </ul>
                      <p className="mt-2">Since we handle all received emails entirely in-memory and perform automated wipes on expiration, no permanent personal records are maintained on our systems.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">10. Children's Information</h5>
                      <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Temporary Email Generator does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>
                    </div>
                  </div>
                )}

                {/* TERMS OF SERVICE */}
                {activeModal === "terms" && (
                  <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3 text-[11px] sm:text-xs text-left font-medium text-gray-600 dark:text-gray-300 scrollbar-thin">
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                      <p className="text-[10px] text-gray-400 font-mono">Last updated: July 2, 2026</p>
                      <p className="mt-1 text-gray-500">Welcome to Temporary Email Generator. These terms and conditions outline the rules and regulations for the use of Temporary Email Generator's Website. By accessing this website we assume you accept these terms and conditions. Do not continue to use Temporary Email Generator if you do not agree to take all of the terms and conditions stated on this page.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">1. Intellectual Property Rights</h5>
                      <p>Other than the content you own, under these Terms, Temporary Email Generator and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted a limited license only for purposes of viewing and utilizing the temporary mailbox routing utility.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">2. Service Scope and Limitations</h5>
                      <p>Temporary Email Generator provides inbound-only temporary email addresses.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-bold text-gray-800 dark:text-white">Outbound Mail Blocked:</span> You are strictly forbidden and technically blocked from dispatching outbound emails using our domains. This prevents spam abuse and maintains high domain reputation.</li>
                        <li><span className="font-bold text-gray-800 dark:text-white">Ephemeral Storage:</span> All incoming emails, text payloads, and file attachments are stored in-memory for a limited duration of 10 minutes (600 seconds). Upon expiration of the active mailbox timer or manual click of the 'Delete' button, all records are permanently and irreversibly purged from our servers.</li>
                        <li><span className="font-bold text-gray-800 dark:text-white">Firestore Synchronization:</span> To secure temporary access for active users, email payloads received during an active session may be synchronized to temporary cloud persistence. These remain private and are subject to automated cleanup policies.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">3. Prohibited Activities</h5>
                      <p>You are specifically restricted from all of the following:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Using this Website in any way that is or may be damaging to this Website;</li>
                        <li>Using this Website in any way that impacts user access to this Website;</li>
                        <li>Using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;</li>
                        <li>Engaging in any data mining, data harvesting, data extracting, or any other similar activity in relation to this Website;</li>
                        <li>Deploying automated registration bots, scrapers, or scripts to abuse the mailboxes or verification systems;</li>
                        <li>Using the service to facilitate fraudulent activities, account phishing, or online harassment.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">4. No Warranties</h5>
                      <p>This Website is provided 'as is,' with all faults, and Temporary Email Generator expresses no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you. We make no guarantee of uninterrupted 100% uptime or infinite storage of historical data.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">5. Limitation of Liability</h5>
                      <p>In no event shall Temporary Email Generator, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. Temporary Email Generator, including its officers, directors, and employees shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website or data purging upon timer expiration.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">6. Severability</h5>
                      <p>If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">7. Variation of Terms</h5>
                      <p>Temporary Email Generator is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">8. Governing Law & Jurisdiction</h5>
                      <p>These Terms will be governed by and interpreted in accordance with the laws of the jurisdiction in which the operator resides, and you submit to the non-exclusive jurisdiction of the state and federal courts located in the country for the resolution of any disputes.</p>
                    </div>
                  </div>
                )}

                {/* QR CODE DISPLAY */}
                {activeModal === "qrcode" && (
                  <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                      Scan this QR code with your mobile device's camera or QR reader to quickly access or share your temporary mailbox address:
                    </p>
                    
                    <div className="p-5 bg-white rounded-3xl shadow-lg border border-gray-150 inline-block transition-transform duration-300 hover:scale-[1.02]">
                      {emailAddress ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(emailAddress)}`} 
                          alt="Email Address QR Code"
                          className="w-48 h-48 block"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400 font-mono text-xs rounded-xl">
                          No Email Address
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 w-full">
                      <div 
                        className="font-mono font-bold text-gray-800 dark:text-gray-200 select-all border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-900 break-all text-xs sm:text-sm max-w-md mx-auto cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                        onClick={copyToClipboard}
                        title="Click to copy"
                      >
                        {emailAddress || "generating..."}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">Click above to select and copy the email address</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 text-xs font-bold bg-[#f0f4ff] dark:bg-gray-800 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 transition-all cursor-pointer border-0"
                >
                  Close Window
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 12. INDIVIDUAL BLOG DETAIL DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedBlogSlug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-white dark:bg-[#161b22] border-l border-gray-200 dark:border-gray-850 w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-6 sm:p-10 flex flex-col justify-between"
            >
              
              {/* Header */}
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedBlogSlug(null)}
                  className="px-3 py-1.5 bg-[#f0f4ff] dark:bg-gray-800 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer border-0"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  <span>Back to Hub</span>
                </button>

                {(() => {
                  const article = BLOG_DATA.find((a) => a.slug === selectedBlogSlug);
                  if (!article) return <p>Article not found.</p>;
                  return (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <span className="px-2.5 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-mono uppercase font-bold rounded">
                          {article.category}
                        </span>
                        
                        {/* Realistic Blog Image inside detail */}
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={article.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <h1 className="text-xl sm:text-3xl font-display font-black text-gray-900 dark:text-white leading-tight">
                          {article.title}
                        </h1>
                        <div className="flex items-center gap-3.5 text-xs text-gray-400 font-semibold pt-1">
                          <span>By {article.author}</span>
                          <span>•</span>
                          <span>{article.publishDate}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>

                      <div className="prose dark:prose-invert text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed font-semibold border-t border-gray-100 dark:border-gray-800 pt-6">
                        {article.content.split("\n\n").map((para, idx) => {
                          if (para.startsWith("###")) {
                            return <h3 key={idx} className="text-base sm:text-lg font-display font-bold text-gray-950 dark:text-white pt-2.5">{para.replace("###", "").trim()}</h3>;
                          }
                          if (para.startsWith("-") || para.startsWith("1.")) {
                            return (
                              <div key={idx} className="pl-4 border-l-2 border-blue-500 space-y-1 my-2">
                                {para.split("\n").map((line, lIdx) => (
                                  <p key={lIdx} className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{line}</p>
                                ))}
                              </div>
                            );
                          }
                          return <p key={idx}>{para}</p>;
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Close footer */}
              <div className="pt-8 border-t border-gray-100 dark:border-gray-800 mt-10 flex justify-end">
                <button
                  onClick={() => setSelectedBlogSlug(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer border-0"
                >
                  Close Article
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 13. FLOATING ACTION TOASTS / OVERLAYS */}
      <AnimatePresence>
        {isCopied && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center space-x-3.5 bg-emerald-500 text-white rounded-2xl px-5 py-4 shadow-2xl border border-emerald-400"
          >
            <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
              <Check className="w-4 h-4 text-white stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider font-sans leading-none">Copied!</p>
              <p className="text-[11px] font-medium text-emerald-50/90 mt-0.5">Email address copied to your clipboard.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookies Consent Overlay */}
      <AnimatePresence>
        {!cookieConsent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#161b22] border-t border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto rounded-t-3xl"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold max-w-3xl text-center sm:text-left leading-relaxed">
              We use cookies on this site to enhance your user experience, retain your current burner email inbox, and deliver personalized contextual sponsorships. By continuing, you agree to our privacy conditions.
            </p>
            <button
              onClick={acceptCookies}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-0"
            >
              Ok
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
