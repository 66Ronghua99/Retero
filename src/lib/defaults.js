export const DEFAULT_SETTINGS = {
  saveMode: "filesystem",
  allowDownloadsFallback: true,
  subdirectoryTemplate: "papers/{{year}}/{{conference}}",
  filenameTemplate: "{{year}} - {{conference}} - {{title}}"
};

export const TOKEN_NAMES = [
  "title",
  "conference",
  "year",
  "date",
  "author",
  "authors",
  "sourceHost"
];

export const SAMPLE_METADATA = {
  title: "Retrieval Augmented Everything",
  conference: "ACL",
  year: "2024",
  date: "2024-08-11",
  authors: ["Ada Lovelace", "Alan Turing"],
  sourceUrl: "https://aclanthology.org/2024.acl-long.1/",
  sourceHost: "aclanthology.org",
  pdfUrl: "https://aclanthology.org/2024.acl-long.1.pdf"
};

