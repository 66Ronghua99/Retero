import test from "node:test";
import assert from "node:assert/strict";

import { inspectTabSnapshot } from "../src/lib/inspection.js";

test("inspectTabSnapshot falls back to tab url when pdf viewer injection fails", async () => {
  const tab = {
    url: "https://arxiv.org/pdf/2501.12948",
    title: "DeepSeek-R1 viewer"
  };

  const metadata = await inspectTabSnapshot(
    tab,
    async () => {
      throw new Error("Cannot access contents of url");
    },
    async (url) => {
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
    }
  );

  assert.equal(
    metadata.title,
    "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
  );
  assert.equal(metadata.pdfUrl, "https://arxiv.org/pdf/2501.12948");
  assert.equal(metadata.year, "2025");
});

test("inspectTabSnapshot keeps the original error when no fallback url exists", async () => {
  await assert.rejects(
    () =>
      inspectTabSnapshot(
        {},
        async () => {
          throw new Error("Cannot access contents of url");
        },
        async () => null
      ),
    /Cannot access contents of url/
  );
});
