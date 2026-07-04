export interface MailMessage {
  id: string | number;
  from: string;
  subject: string;
  date: string;
}

export interface MailDetails {
  id: string | number;
  from: string;
  subject: string;
  date: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  body: string;
  textBody: string;
  htmlBody: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishDate: string;
  readTime: string;
  author: string;
  image?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
