import test from "node:test";
import assert from "node:assert/strict";

import { buildTargetPath, buildTemplateTokens } from "../src/lib/naming.js";

test("buildTemplateTokens creates stable fallback-friendly values", () => {
  const tokens = buildTemplateTokens({
    title: "A Study: Retrieval/Generation?",
    conference: "ACL 2024",
    year: "2024",
    date: "2024-08-11",
    authors: ["Ada Lovelace", "Alan Turing"],
    sourceUrl: "https://aclanthology.org/2024.acl-long.1/",
    sourceHost: "aclanthology.org"
  });

  assert.equal(tokens.author, "Ada Lovelace");
  assert.equal(tokens.authors, "Ada Lovelace, Alan Turing");
  assert.equal(tokens.sourceHost, "aclanthology.org");
});

test("buildTargetPath renders sanitized subdirectories and filename", () => {
  const path = buildTargetPath(
    {
      title: "A Study: Retrieval/Generation?",
      conference: "ACL 2024",
      year: "2024",
      date: "2024-08-11",
      authors: ["Ada Lovelace", "Alan Turing"],
      sourceUrl: "https://aclanthology.org/2024.acl-long.1/",
      sourceHost: "aclanthology.org"
    },
    {
      subdirectoryTemplate: "papers/{{year}}/{{conference}}",
      filenameTemplate: "{{year}} - {{conference}} - {{title}}"
    }
  );

  assert.equal(
    path,
    "papers/2024/ACL 2024/2024 - ACL 2024 - A Study Retrieval Generation.pdf"
  );
});

test("buildTargetPath falls back to searchable defaults when fields are missing", () => {
  const path = buildTargetPath(
    {
      title: "",
      conference: "",
      year: "",
      date: "",
      authors: [],
      sourceUrl: "https://example.org/paper"
    },
    {
      subdirectoryTemplate: "papers/{{year}}/{{conference}}",
      filenameTemplate: "{{title}}"
    }
  );

  assert.equal(path, "papers/undated/unknown-venue/untitled-paper.pdf");
});

