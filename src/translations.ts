export type Language = "en" | "es" | "zh" | "hi" | "fr";

export interface TranslationDictionary {
  title: string;
  subtitle: string;
  copy: string;
  copied: string;
  change: string;
  delete: string;
  messages: string;
  saved: string;
  refresh: string;
  waitingForEmails: string;
  emptyInboxSubtitle: string;
  backToInbox: string;
  viewSource: string;
  viewHtml: string;
  from: string;
  received: string;
  noSubject: string;
  attachments: string;
  loadingPayload: string;
  generatingMailbox: string;
  pwaBadgeTitle: string;
  pwaBadgeDesc: string;
  createdBy: string;
  securityTools: string;
  appsAndExtensions: string;
  contactUs: string;
  faq: string;
  blog: string;
  readMore: string;
  cookieConsentText: string;
  cookieConsentAccept: string;
  cookieConsentPrivacy: string;
  cookieConsentTerms: string;
  spamAlertTitle: string;
  spamAlertText: string;
  scanToolsTitle: string;
  scanToolsDesc: string;
  passGenTitle: string;
  passGenDesc: string;
  strengthCheckerTitle: string;
  strengthCheckerDesc: string;
  converterTitle: string;
  converterDesc: string;
}

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "fr", name: "Français", flag: "🇫🇷" }
];

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    title: "Temporary Email Generator",
    subtitle: "Temp mail protects your privacy and keeps your inbox spam-free",
    copy: "copy",
    copied: "copied!",
    change: "change",
    delete: "delete",
    messages: "Messages",
    saved: "Saved",
    refresh: "refresh",
    waitingForEmails: "Waiting for incoming emails...",
    emptyInboxSubtitle: "Your temporary inbox is ready. Any incoming confirmation or verification code emails will automatically appear here within seconds.",
    backToInbox: "Back to Inbox",
    viewSource: "View Source",
    viewHtml: "View HTML",
    from: "From",
    received: "Received",
    noSubject: "(No Subject)",
    attachments: "Attachments",
    loadingPayload: "Loading full message payload...",
    generatingMailbox: "Generating secure mailbox...",
    pwaBadgeTitle: "Mobile Web Optimized PWA",
    pwaBadgeDesc: "No app store download required. Simply add this website to your mobile home screen via browser settings for direct, full-screen standalone utility access.",
    createdBy: "Created by",
    securityTools: "Security Tools",
    appsAndExtensions: "Apps & Extensions",
    contactUs: "Contact Us",
    faq: "Frequently Asked Questions",
    blog: "Security & Anonymity Blog",
    readMore: "Read Full Article",
    cookieConsentText: "We use local storage cookies to maintain your anonymous temp email address during active sessions so you don't lose incoming messages.",
    cookieConsentAccept: "Accept & Secure",
    cookieConsentPrivacy: "Privacy Policy",
    cookieConsentTerms: "Terms of Service",
    spamAlertTitle: "Security Notice",
    spamAlertText: "This temporary address is private and protected. Do not share it on public platforms unless you expect transient registration codes. Never use it for highly confidential credentials.",
    scanToolsTitle: "Malware Quarantine Scanner",
    scanToolsDesc: "Test received email files, PDF downloads, or application attachments securely in our virtual sandbox containment chamber.",
    passGenTitle: "High-Entropy Password Generator",
    passGenDesc: "Instantly create high-strength, uncrackable cryptographic security keys tailored for one-time online profiles.",
    strengthCheckerTitle: "Interactive Password Strength Evaluator",
    strengthCheckerDesc: "Instantly calculate potential cracking speeds, entropy metrics, and visual security indices of your master keys.",
    converterTitle: "Symmetric Byte Unit Converter",
    converterDesc: "Convert payload sizes between Bytes, Kilobytes, Megabytes, and Gigabytes to audit email attachment metrics."
  },
  es: {
    title: "Generador de Correo Temporal",
    subtitle: "El correo temporal protege tu privacidad y mantiene tu bandeja de entrada libre de spam",
    copy: "copiar",
    copied: "¡copiado!",
    change: "cambiar",
    delete: "eliminar",
    messages: "Mensajes",
    saved: "Guardados",
    refresh: "actualizar",
    waitingForEmails: "Esperando correos entrantes...",
    emptyInboxSubtitle: "Tu bandeja de entrada temporal está lista. Cualquier correo entrante con códigos de confirmación o verificación aparecerá automáticamente aquí en segundos.",
    backToInbox: "Volver al buzón",
    viewSource: "Ver código fuente",
    viewHtml: "Ver HTML",
    from: "De",
    received: "Recibido",
    noSubject: "(Sin asunto)",
    attachments: "Adjuntos",
    loadingPayload: "Cargando el contenido completo...",
    generatingMailbox: "Generando buzón seguro...",
    pwaBadgeTitle: "PWA Optimizada para Web Móvil",
    pwaBadgeDesc: "No requiere descarga en tiendas de apps. Simplemente añade este sitio web a la pantalla de inicio de tu móvil desde los ajustes del navegador para un acceso directo de pantalla completa.",
    createdBy: "Creado por",
    securityTools: "Herramientas de seguridad",
    appsAndExtensions: "Aplicaciones y Extensiones",
    contactUs: "Contáctenos",
    faq: "Preguntas Frecuentes",
    blog: "Blog de Seguridad y Anonimato",
    readMore: "Leer artículo completo",
    cookieConsentText: "Utilizamos cookies de almacenamiento local para mantener su dirección de correo temporal anónima durante las sesiones activas para que no pierda los mensajes entrantes.",
    cookieConsentAccept: "Aceptar y Asegurar",
    cookieConsentPrivacy: "Política de Privacidad",
    cookieConsentTerms: "Términos de Servicio",
    spamAlertTitle: "Aviso de Seguridad",
    spamAlertText: "Esta dirección temporal es privada y protegida. No la comparta en plataformas públicas a menos que espere códigos de registro transitorios. Nunca la use para credenciales altamente confidenciales.",
    scanToolsTitle: "Escáner de Cuarentena de Malware",
    scanToolsDesc: "Pruebe los archivos de correo electrónico recibidos, descargas de PDF o archivos adjuntos de aplicaciones de forma segura en nuestra cámara de contención virtual.",
    passGenTitle: "Generador de contraseñas de alta entropía",
    passGenDesc: "Cree instantáneamente claves de seguridad criptográficas inquebrantables de alta resistencia adaptadas para perfiles únicos en línea.",
    strengthCheckerTitle: "Evaluador interactivo de seguridad de contraseña",
    strengthCheckerDesc: "Calcule instantáneamente las velocidades potenciales de descifrado, las métricas de entropía y los índices visuales de seguridad de sus claves maestras.",
    converterTitle: "Conversor simétrico de unidades de bytes",
    converterDesc: "Convierta tamaños de carga útil entre bytes, kilobytes, megabytes y gigabytes para auditar las métricas de los archivos adjuntos de correo electrónico."
  },
  zh: {
    title: "临时邮箱生成器",
    subtitle: "临时邮件保护您的隐私，让您的收件箱免受垃圾邮件的打扰",
    copy: "复制",
    copied: "已复制！",
    change: "更换",
    delete: "删除",
    messages: "邮件列表",
    saved: "已保存",
    refresh: "刷新",
    waitingForEmails: "正在等待新邮件...",
    emptyInboxSubtitle: "您的临时收件箱已准备就绪。任何收到的确认或验证码邮件都将在几秒钟内自动显示在这里。",
    backToInbox: "返回收件箱",
    viewSource: "查看源码",
    viewHtml: "查看HTML",
    from: "发件人",
    received: "收件时间",
    noSubject: "(无主题)",
    attachments: "附件",
    loadingPayload: "正在加载完整邮件内容...",
    generatingMailbox: "正在生成安全邮箱...",
    pwaBadgeTitle: "移动Web优化的 PWA",
    pwaBadgeDesc: "无需从应用商店下载。只需通过浏览器设置将此网站添加到您的移动主屏幕，即可实现直接、全屏的独立工具访问。",
    createdBy: "创建者",
    securityTools: "安全工具",
    appsAndExtensions: "应用与扩展",
    contactUs: "联系我们",
    faq: "常见问题解答",
    blog: "安全与匿名博客",
    readMore: "阅读全文",
    cookieConsentText: "我们使用本地存储Cookie来在活动会话期间维持您的匿名临时电子邮件地址，以便您不会丢失收到的邮件。",
    cookieConsentAccept: "接受并保护",
    cookieConsentPrivacy: "隐私政策",
    cookieConsentTerms: "服务条款",
    spamAlertTitle: "安全须知",
    spamAlertText: "此临时地址是私密且受保护的。除非您需要临时的注册验证码，否则请勿在公共平台上分享它。切勿将其用于高度机密的凭据。",
    scanToolsTitle: "恶意软件隔离扫描器",
    scanToolsDesc: "在我们的虚拟沙箱容纳腔中安全地测试收到的电子邮件文件、PDF下载或应用程序附件。",
    passGenTitle: "高熵密码生成器",
    passGenDesc: "立即创建专为一次性在线个人资料量身定制的高强度、不可破解的加密安全密钥。",
    strengthCheckerTitle: "交互式密码强度评估器",
    strengthCheckerDesc: "立即计算主密钥的潜在破解速度、熵指标和直观的安全指数。",
    converterTitle: "对称字节单位转换器",
    converterDesc: "在字节、千字节、兆字节和吉字节之间转换有效负载大小，以审核电子邮件附件指标。"
  },
  hi: {
    title: "अस्थायी ईमेल जेनरेटर",
    subtitle: "अस्थायी ईमेल आपकी गोपनीयता की रक्षा करता है और आपके इनबॉक्स को स्पैम-मुक्त रखता है",
    copy: "कॉपी",
    copied: "कॉपी हो गया!",
    change: "बदलें",
    delete: "हटाएं",
    messages: "संदेश",
    saved: "सुरक्षित",
    refresh: "रिफ्रेश",
    waitingForEmails: "आने वाले ईमेल की प्रतीक्षा की जा रही है...",
    emptyInboxSubtitle: "आपका अस्थायी इनबॉक्स तैयार है। कोई भी आने वाला पुष्टिकरण या सत्यापन कोड ईमेल कुछ ही सेकंड में स्वचालित रूप से यहां दिखाई देगा।",
    backToInbox: "इनबॉक्स पर वापस जाएं",
    viewSource: "स्रोत देखें",
    viewHtml: "HTML देखें",
    from: "प्रेषक",
    received: "प्राप्त हुआ",
    noSubject: "(कोई विषय नहीं)",
    attachments: "संलग्नक",
    loadingPayload: "पूरा संदेश लोड हो रहा है...",
    generatingMailbox: "सुरक्षित मेलबॉक्स जेनरेट किया जा रहा है...",
    pwaBadgeTitle: "मोबाइल वेब अनुकूलित PWA",
    pwaBadgeDesc: "किसी ऐप स्टोर डाउनलोड की आवश्यकता नहीं है। सीधे, पूर्ण-स्क्रीन स्टैंडअलोन उपयोगिता पहुंच के लिए बस ब्राउज़र सेटिंग्स के माध्यम से इस वेबसाइट को अपने मोबाइल होम स्क्रीन पर जोड़ें।",
    createdBy: "द्वारा निर्मित",
    securityTools: "सुरक्षा उपकरण",
    appsAndExtensions: "ऐप्स और एक्सटेंशन",
    contactUs: "संपर्क करें",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    blog: "सुरक्षा और गोपनीयता ब्लॉग",
    readMore: "पूरा लेख पढ़ें",
    cookieConsentText: "सक्रिय सत्रों के दौरान आपके अनाम अस्थायी ईमेल पते को बनाए रखने के लिए हम स्थानीय भंडारण कुकीज़ का उपयोग करते हैं ताकि आप आने वाले संदेशों को न खोएं।",
    cookieConsentAccept: "स्वीकार करें और सुरक्षित करें",
    cookieConsentPrivacy: "गोपनीयता नीति",
    cookieConsentTerms: "सेवा की शर्तें",
    spamAlertTitle: "सुरक्षा सूचना",
    spamAlertText: "यह अस्थायी पता निजी और सुरक्षित है। इसे सार्वजनिक प्लेटफार्मों पर साझा न करें जब तक कि आप अस्थायी पंजीकरण कोड की अपेक्षा न कर रहे हों। अत्यधिक गोपनीय क्रेडेंशियल्स के लिए इसका उपयोग कभी न करें।",
    scanToolsTitle: "मालवेयर संगरोध स्कैनर",
    scanToolsDesc: "प्राप्त ईमेल फ़ाइलों, पीडीएफ डाउनलोड, या एप्लिकेशन अनुलग्नकों का हमारे वर्चुअल सैंडबॉक्स नियंत्रण कक्ष में सुरक्षित रूप से परीक्षण करें।",
    passGenTitle: "उच्च-एन्ट्रॉपी पासवर्ड जेनरेटर",
    passGenDesc: "एक बार के ऑनलाइन प्रोफाइल के लिए तैयार की गई उच्च-शक्ति, अटूट क्रिप्टोग्राफिक सुरक्षा कुंजियाँ तुरंत बनाएँ।",
    strengthCheckerTitle: "इंटरैक्टिव पासवर्ड शक्ति मूल्यांकक",
    strengthCheckerDesc: "अपनी मास्टर कुंजियों की संभावित क्रैकिंग गति, एन्ट्रॉपी मेट्रिक्स और विज़ुअल सुरक्षा सूचकांकों की तुरंत गणना करें।",
    converterTitle: "सममित बाइट इकाई परिवर्तक",
    converterDesc: "ईमेल अनुलग्नक मेट्रिक्स का ऑडिट करने के लिए बाइट्स, किलोबाइट्स, मेगाबाइट्स और गीगाबाइट्स के बीच पेलोड आकार बदलें।"
  },
  fr: {
    title: "Générateur d'E-mail Temporaire",
    subtitle: "Les e-mails temporaires protègent votre vie privée et préservent votre boîte de réception du spam",
    copy: "copier",
    copied: "copié !",
    change: "changer",
    delete: "supprimer",
    messages: "Messages",
    saved: "Enregistrés",
    refresh: "actualiser",
    waitingForEmails: "En attente d'e-mails entrants...",
    emptyInboxSubtitle: "Votre boîte de réception temporaire est prête. Tout e-mail de confirmation ou de code de vérification entrant apparaîtra automatiquement ici en quelques secondes.",
    backToInbox: "Retour à la boîte de réception",
    viewSource: "Voir le code source",
    viewHtml: "Voir le HTML",
    from: "De",
    received: "Reçu",
    noSubject: "(Sans objet)",
    attachments: "Pièces jointes",
    loadingPayload: "Chargement du contenu du message...",
    generatingMailbox: "Génération d'une boîte de réception sécurisée...",
    pwaBadgeTitle: "PWA optimisée pour le Web mobile",
    pwaBadgeDesc: "Aucun téléchargement sur l'App Store requis. Ajoutez simplement ce site Web à l'écran d'accueil de votre mobile via les paramètres du navigateur pour un accès direct et autonome en plein écran.",
    createdBy: "Créé par",
    securityTools: "Outils de sécurité",
    appsAndExtensions: "Applications et Extensions",
    contactUs: "Nous contacter",
    faq: "Foire Aux Questions",
    blog: "Blog sur la sécurité et l'anonymat",
    readMore: "Lire l'article complet",
    cookieConsentText: "Nous utilisons des cookies de stockage local pour conserver votre adresse e-mail temporaire anonyme pendant les sessions actives afin de ne pas perdre les messages entrants.",
    cookieConsentAccept: "Accepter & Sécuriser",
    cookieConsentPrivacy: "Politique de Confidentialité",
    cookieConsentTerms: "Conditions d'Utilisation",
    spamAlertTitle: "Avis de Sécurité",
    spamAlertText: "Cette adresse temporaire est privée et protégée. Ne la partagez pas sur des plateformes publiques à moins que vous n'attendiez des codes d'inscription temporaires. Ne l'utilisez jamais pour des identifiants hautement confidentiels.",
    scanToolsTitle: "Scanner de quarantaine de logiciels malveillants",
    scanToolsDesc: "Testez les fichiers d'e-mails reçus, les téléchargements PDF ou les pièces jointes d'applications en toute sécurité dans notre chambre de confinement virtuelle du bac à sable.",
    passGenTitle: "Générateur de mots de passe à haute entropie",
    passGenDesc: "Créez instantanément des clés de sécurité cryptographiques à haute résistance et incassables, adaptées aux profils en ligne uniques.",
    strengthCheckerTitle: "Évaluateur de force de mot de passe interactif",
    strengthCheckerDesc: "Calculez instantanément les vitesses potentielles de craquage, les mesures d'entropie et les indices de sécurité visuels de vos clés maîtresses.",
    converterTitle: "Convertisseur d'unités d'octets symétrique",
    converterDesc: "Convertissez la taille de la charge utile entre les octets, les kilo-octets, les méga-octets et les giga-octets pour auditer les paramètres des pièces jointes d'e-mails."
  }
};

export const FAQ_TRANSLATIONS: Record<Language, { question: string; answer: string }[]> = {
  en: [
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
    }
  ],
  es: [
    {
      question: "¿Qué es un correo temporal / desechable / anónimo?",
      answer: "Una dirección de correo electrónico temporal, desechable o anónima es una cuenta de correo de corta duración que se genera al instante y bajo demanda. Le permite recibir correos (como enlaces de confirmación, códigos de activación o boletines) sin revelar su dirección real, manteniéndolo a salvo de rastreadores y publicidad no solicitada."
    },
    {
      question: "¿Por qué necesita una dirección de correo temporal?",
      answer: "Usar un correo desechable le permite descargar archivos, registrarse en foros o probar servicios web sin exponer su identidad real. Esto bloquea por completo la llegada de correos basura, ofertas promocionales e intentos de rastreo a su bandeja de entrada personal o profesional."
    },
    {
      question: "¿Cuánto tiempo se conservan los correos?",
      answer: "Por defecto, su dirección desechable permanece activa durante 3 minutos. Dado que utilizamos almacenamiento de memoria estrictamente efímero con cero registros para proteger su privacidad, todos los mensajes se eliminan automáticamente de forma permanente cuando expira el temporizador de 3 minutos, o al hacer clic en 'Eliminar'. Puede extender fácilmente el temporizador dentro del panel si necesita más tiempo."
    },
    {
      question: "¿Los correos siguen siendo privados? ¿Leen mis mensajes?",
      answer: "No, nunca leemos sus mensajes y no los almacenamos de forma permanente. Todos los correos entrantes se procesan en memoria y se eliminan de forma irreversible cuando expira su temporizador o cuando hace clic manualmente en el botón 'Eliminar'. Su privacidad está garantizada al 100%."
    },
    {
      question: "¿Dónde veo si he recibido un correo?",
      answer: "Todos los correos electrónicos entrantes se muestran en tiempo real en la sección de bandeja de entrada directamente en nuestra página de inicio. La bandeja de entrada se actualiza automáticamente cada 5-10 segundos, por lo que ni siquiera necesita actualizar la página manualmente."
    }
  ],
  zh: [
    {
      question: "什么是临时/一次性/匿名邮箱？",
      answer: "临时、一次性或匿名电子邮件地址是一种即时按需生成的短期电子邮件帐户。它允许您接收电子邮件（例如确认链接、激活码或新闻通讯），而无需泄露您的真实、个人或专业电子邮件地址，从而保护您免受未经请求的营销和跟踪器的侵害。"
    },
    {
      question: "为什么需要临时电子邮件地址？",
      answer: "使用临时邮箱可以让您在不暴露真实身份的情况下下载文件、在论坛上注册或测试 Web 服务。这彻底阻止了垃圾邮件、促销优惠和跟踪企图到达您的个人或专业收件箱。"
    },
    {
      question: "电子邮件保存多长时间？",
      answer: "默认情况下，您生成的一次性地址保持有效状态3分钟。由于我们使用严格的临时内存存储，零日志，以节省服务器存储并保护您的隐私，因此当 3 分钟计时器过期或您单击“删除”时，所有消息都会自动删除并永久清除。如果您需要更多时间，可以在仪表板内轻松延长计时器。"
    },
    {
      question: "电子邮件是否保密？你们会阅读邮件吗？",
      answer: "不，我们绝不会阅读您的邮件，也不会永久存储它们。所有传入的电子邮件都在内存中处理，并在此计时器过期或您手动单击“删除”按钮时从我们的系统中不可逆地删除。您的隐私得到100%的保证。"
    },
    {
      question: "我在哪里查看是否收到电子邮件？",
      answer: "所有传入的电子邮件都会直接在主页的收件箱部分实时显示。收件箱每5至10秒自动刷新一次，因此您甚至不需要手动刷新页面。"
    }
  ],
  hi: [
    {
      question: "अस्थायी / डिस्पोजेबल / अनाम मेल क्या है?",
      answer: "एक अस्थायी, डिस्पोजेबल, या अनाम ईमेल पता एक अल्पकालिक ईमेल खाता है जो तुरंत और मांग पर उत्पन्न होता है। यह आपको अपना वास्तविक, व्यक्तिगत या व्यावसायिक ईमेल पता दिए बिना ईमेल (जैसे पुष्टिकरण लिंक, सक्रियण कोड, या समाचार पत्र) प्राप्त करने की अनुमति देता है, जिससे आप अवांछित विपणन और ट्रैकर्स से सुरक्षित रहते हैं।"
    },
    {
      question: "आपको अस्थायी ईमेल पते की आवश्यकता क्यों है?",
      answer: "एक बर्नर ईमेल का उपयोग करने से आप अपनी वास्तविक पहचान उजागर किए बिना फ़ाइलें डाउनलोड कर सकते हैं, फ़ोरम पर पंजीकरण कर सकते हैं, या वेब सेवाओं का परीक्षण कर सकते हैं। यह पूरी तरह से स्पैम ईमेल, प्रचार ऑफ़र और ट्रैकिंग प्रयासों को आपके व्यक्तिगत या व्यावसायिक इनबॉक्स तक पहुँचने से रोकता है।"
    },
    {
      question: "ईमेल कितने समय तक रखे जाते हैं?",
      answer: "डिफ़ॉल्ट रूप से, आपका उत्पन्न डिस्पोजेबल पता 3 मिनट के लिए सक्रिय रहता है। चूंकि हम आपकी गोपनीयता की रक्षा करने और सर्वर स्टोरेज को बचाने के लिए शून्य लॉग के साथ सख्त क्षणभंगुर मेमोरी स्टोरेज का उपयोग करते हैं, इसलिए 3 मिनट का टाइमर समाप्त होने पर, या जब आप 'डिलीट' पर क्लिक करते हैं, तो सभी संदेश स्वचालित रूप से हटा दिए जाते हैं और स्थायी रूप से मिटा दिए जाते हैं।"
    },
    {
      question: "क्या ईमेल निजी रहते हैं? क्या आप संदेश पढ़ते हैं?",
      answer: "नहीं, हम आपके संदेशों को कभी नहीं पढ़ते हैं, और हम उन्हें स्थायी रूप से संग्रहीत नहीं करते हैं। सभी आने वाले ईमेल इन-मेमोरी में संसाधित होते हैं और जब उनका टाइमर समाप्त हो जाता है या जब आप मैन्युअल रूप से 'हटाएं' बटन पर क्लिक करते हैं तो हमारे सिस्टम से अपरिवर्तनीय रूप से हटा दिए जाते हैं। आपकी गोपनीयता 100% सुरक्षित है।"
    },
    {
      question: "मुझे कैसे पता चलेगा कि मुझे ईमेल प्राप्त हुआ है?",
      answer: "सभी आने वाले ईमेल सीधे हमारे होमपेज पर इनबॉक्स अनुभाग में वास्तविक समय में प्रदर्शित होते हैं। इनबॉक्स हर 5-10 सेकंड में ऑटो-रिफ्रेश होता है, इसलिए आपको पेज को मैन्युअल रूप से रिफ्रेश करने की भी आवश्यकता नहीं है।"
    }
  ],
  fr: [
    {
      question: "Qu'est-ce qu'un e-mail temporaire / jetable / anonyme ?",
      answer: "Une adresse e-mail temporaire, jetable ou anonyme est un compte de messagerie éphémère généré instantanément et à la demande. Il vous permet de recevoir des e-mails (tels que des liens de confirmation, des codes d'activation ou des newsletters) sans révéler votre adresse e-mail réelle, personnelle ou professionnelle, vous protégeant ainsi du marketing non sollicité et des trackers."
    },
    {
      question: "Pourquoi avez-vous besoin d'une adresse e-mail temporaire ?",
      answer: "L'utilisation d'un e-mail jetable vous permet de télécharger des fichiers, de vous inscrire sur des forums ou de tester des services Web sans exposer votre identité réelle. Cela empêche complètement les spams, les offres promotionnelles et les tentatives de suivi d'atteindre votre boîte de réception personnelle ou professionnelle."
    },
    {
      question: "Combien de temps les e-mails sont-ils conservés ?",
      answer: "Par défaut, votre adresse jetable générée reste active pendant 3 minutes. Comme nous utilisons un stockage en mémoire strictement éphémère sans aucun journal pour protéger votre vie privée, tous les messages sont automatiquement supprimés et définitivement effacés lorsque le minuteur de 3 minutes expire, ou lorsque vous cliquez sur 'Supprimer'."
    },
    {
      question: "Les e-mails restent-ils privés ? Lisez-vous mes messages ?",
      answer: "Non, nous ne lisons jamais vos messages et nous ne les stockons pas de manière permanente. Tous les e-mails entrants sont traités en mémoire et sont supprimés de manière irréversible lorsque leur minuteur expire ou lorsque vous cliquez manuellement sur le bouton 'Supprimer'. Votre vie privée est garantie à 100%."
    },
    {
      question: "Où puis-je voir si j'ai reçu un e-mail ?",
      answer: "Tous les e-mails entrants sont affichés en temps-réel dans la section de la boîte de réception directement sur notre page d'accueil. La boîte de réception s'actualise automatiquement toutes les 5 à 10 secondes, vous n'avez donc pas besoin de rafraîchir la page manuellement."
    }
  ]
};
