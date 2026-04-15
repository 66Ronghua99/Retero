import test from "node:test";
import assert from "node:assert/strict";

import { extractPaperMetadata, resolvePaperMetadata } from "../src/lib/metadata.js";

test("extractPaperMetadata prefers citation tags and normalizes date fields", () => {
  const snapshot = {
    url: "https://aclanthology.org/2024.acl-long.1/",
    title: "Ignored document title",
    contentType: "text/html",
    metaTags: [
      { key: "citation_title", content: "Retrieval Augmented Everything" },
      { key: "citation_pdf_url", content: "https://aclanthology.org/2024.acl-long.1.pdf" },
      { key: "citation_conference_title", content: "ACL" },
      { key: "citation_publication_date", content: "2024-08-11" },
      { key: "citation_author", content: "Ada Lovelace" },
      { key: "citation_author", content: "Alan Turing" }
    ],
    linkTags: [],
    jsonLd: []
  };

  const metadata = extractPaperMetadata(snapshot);

  assert.equal(metadata.title, "Retrieval Augmented Everything");
  assert.equal(metadata.pdfUrl, "https://aclanthology.org/2024.acl-long.1.pdf");
  assert.equal(metadata.conference, "ACL");
  assert.equal(metadata.year, "2024");
  assert.equal(metadata.date, "2024-08-11");
  assert.deepEqual(metadata.authors, ["Ada Lovelace", "Alan Turing"]);
  assert.equal(metadata.sourceHost, "aclanthology.org");
});

test("extractPaperMetadata can recover from direct pdf pages and json-ld", () => {
  const snapshot = {
    url: "https://arxiv.org/pdf/2404.12345.pdf",
    title: "Cool Paper PDF",
    contentType: "application/pdf",
    metaTags: [],
    linkTags: [],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        name: "Cool Paper",
        datePublished: "2024-04-12",
        isPartOf: {
          name: "arXiv"
        },
        author: [
          { name: "Jane Doe" }
        ]
      }
    ]
  };

  const metadata = extractPaperMetadata(snapshot);

  assert.equal(metadata.pdfUrl, "https://arxiv.org/pdf/2404.12345.pdf");
  assert.equal(metadata.title, "Cool Paper");
  assert.equal(metadata.conference, "arXiv");
  assert.equal(metadata.year, "2024");
  assert.equal(metadata.date, "2024-04-12");
  assert.deepEqual(metadata.authors, ["Jane Doe"]);
});

test("extractPaperMetadata can derive year from venue text when date is missing", () => {
  const snapshot = {
    url: "https://example.org/papers/acl-demo",
    title: "Doc title",
    contentType: "text/html",
    metaTags: [
      { key: "citation_title", content: "A Small Demo Paper" },
      { key: "citation_conference_title", content: "ACL 2025 Findings" },
      { key: "citation_pdf_url", content: "https://example.org/papers/acl-demo.pdf" }
    ],
    linkTags: [],
    jsonLd: []
  };

  const metadata = extractPaperMetadata(snapshot);

  assert.equal(metadata.year, "2025");
  assert.equal(metadata.date, "");
});

test("resolvePaperMetadata enriches arxiv pdf pages from the abstract page", async () => {
  const pdfSnapshot = {
    url: "https://arxiv.org/pdf/2501.12948",
    title: "",
    contentType: "application/pdf",
    metaTags: [],
    linkTags: [],
    jsonLd: []
  };

  const metadata = await resolvePaperMetadata(pdfSnapshot, async (url) => {
    assert.equal(url, "https://arxiv.org/abs/2501.12948");

    return {
      url,
      title: "",
      contentType: "text/html",
      metaTags: [
        {
          key: "citation_title",
          content: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
        },
        {
          key: "citation_author",
          content: "DeepSeek-AI"
        },
        {
          key: "citation_date",
          content: "2025/01/22"
        },
        {
          key: "citation_pdf_url",
          content: "https://arxiv.org/pdf/2501.12948"
        }
      ],
      linkTags: [],
      jsonLd: []
    };
  });

  assert.equal(
    metadata.title,
    "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
  );
  assert.equal(metadata.year, "2025");
  assert.deepEqual(metadata.authors, ["DeepSeek-AI"]);
  assert.equal(metadata.pdfUrl, "https://arxiv.org/pdf/2501.12948");
});
