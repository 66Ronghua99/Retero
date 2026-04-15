function normalizeText(value) {
  if (value == null) {
    return "";
  }

  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeUrl(value, baseUrl) {
  const text = normalizeText(value);
  if (!text) {
    return "";
  }

  try {
    return new URL(text, baseUrl).toString();
  } catch {
    return text;
  }
}

function mapMetaTags(metaTags = []) {
  const mapped = new Map();

  for (const entry of metaTags) {
    const key = normalizeText(entry.key ?? entry.name ?? entry.property ?? entry.itemprop ?? entry.httpEquiv).toLowerCase();
    const content = normalizeText(entry.content);

    if (!key || !content) {
      continue;
    }

    if (!mapped.has(key)) {
      mapped.set(key, []);
    }

    mapped.get(key).push(content);
  }

  return mapped;
}

function pickFirst(metaMap, keys) {
  for (const key of keys) {
    const values = metaMap.get(key.toLowerCase());
    if (values?.length) {
      return values[0];
    }
  }

  return "";
}

function pickMany(metaMap, keys) {
  const values = [];

  for (const key of keys) {
    const found = metaMap.get(key.toLowerCase()) ?? [];
    for (const item of found) {
      if (!values.includes(item)) {
        values.push(item);
      }
    }
  }

  return values;
}

function normalizeJsonLd(jsonLd = []) {
  const normalized = [];

  for (const entry of jsonLd) {
    if (!entry) {
      continue;
    }

    if (typeof entry === "string") {
      try {
        normalized.push(JSON.parse(entry));
      } catch {
        continue;
      }
      continue;
    }

    normalized.push(entry);
  }

  return normalized.flatMap((entry) => Array.isArray(entry) ? entry : [entry]);
}

function collectJsonLdValue(entries, selector) {
  for (const entry of entries) {
    const value = selector(entry);
    if (Array.isArray(value)) {
      const first = value.find(Boolean);
      if (first) {
        return first;
      }
      continue;
    }

    if (value) {
      return value;
    }
  }

  return "";
}

function collectAuthorsFromJsonLd(entries) {
  const authors = [];

  for (const entry of entries) {
    const author = entry?.author;
    const candidates = Array.isArray(author) ? author : author ? [author] : [];

    for (const candidate of candidates) {
      const value = normalizeText(candidate?.name ?? candidate);
      if (value && !authors.includes(value)) {
        authors.push(value);
      }
    }
  }

  return authors;
}

function extractDateParts(dateText) {
  const normalized = normalizeText(dateText);
  const match = normalized.match(/\b(\d{4})(?:[-/](\d{2})[-/](\d{2}))?/);

  if (!match) {
    return {
      date: "",
      year: ""
    };
  }

  if (match[2] && match[3]) {
    return {
      date: `${match[1]}-${match[2]}-${match[3]}`,
      year: match[1]
    };
  }

  return {
    date: match[1],
    year: match[1]
  };
}

function extractYearFromText(value) {
  const match = normalizeText(value).match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : "";
}

function isPdfLikeUrl(url = "", contentType = "") {
  const lowerUrl = url.toLowerCase();
  const lowerType = contentType.toLowerCase();

  return lowerUrl.endsWith(".pdf") || lowerUrl.includes("/pdf/") || lowerType.includes("pdf");
}

function deriveMetadataLookupUrl(snapshot) {
  const sourceUrl = normalizeText(snapshot.url);

  try {
    const parsed = new URL(sourceUrl);
    if (parsed.hostname === "arxiv.org" && parsed.pathname.startsWith("/pdf/")) {
      const paperId = parsed.pathname.replace(/^\/pdf\//, "").replace(/\.pdf$/i, "");
      if (paperId) {
        return `https://arxiv.org/abs/${paperId}`;
      }
    }
  } catch {
    return "";
  }

  return "";
}

function mergeMetadata(primary, fallback) {
  const primaryLooksLikeViewerTitle =
    !primary.title ||
    /viewer/i.test(primary.title) ||
    /\.pdf$/i.test(primary.title);

  return {
    ...fallback,
    ...primary,
    title: primaryLooksLikeViewerTitle ? fallback.title || primary.title : primary.title || fallback.title,
    pdfUrl: primary.pdfUrl || fallback.pdfUrl,
    conference: primary.conference || fallback.conference,
    year: primary.year || fallback.year,
    date: primary.date || fallback.date,
    authors: primary.authors?.length ? primary.authors : fallback.authors,
    doi: primary.doi || fallback.doi,
    sourceUrl: primary.sourceUrl || fallback.sourceUrl,
    sourceHost: primary.sourceHost || fallback.sourceHost
  };
}

function pickPdfUrl(snapshot, metaMap) {
  if (isPdfLikeUrl(snapshot.url, snapshot.contentType)) {
    return snapshot.url;
  }

  const metaPdfUrl = pickFirst(metaMap, ["citation_pdf_url", "pdf_url"]);
  if (metaPdfUrl) {
    return normalizeUrl(metaPdfUrl, snapshot.url);
  }

  for (const link of snapshot.linkTags ?? []) {
    const href = normalizeUrl(link.href, snapshot.url);
    const type = normalizeText(link.type).toLowerCase();
    if (isPdfLikeUrl(href, type)) {
      return href;
    }
  }

  return "";
}

export function extractPaperMetadata(snapshot) {
  const metaMap = mapMetaTags(snapshot.metaTags);
  const jsonLdEntries = normalizeJsonLd(snapshot.jsonLd);
  const dateSource =
    pickFirst(metaMap, ["citation_publication_date", "citation_date", "dc.date", "article:published_time"]) ||
    collectJsonLdValue(jsonLdEntries, (entry) => entry?.datePublished);
  const dateParts = extractDateParts(dateSource);
  const authors = pickMany(metaMap, ["citation_author"]).length
    ? pickMany(metaMap, ["citation_author"])
    : collectAuthorsFromJsonLd(jsonLdEntries);

  const conference =
    pickFirst(metaMap, [
      "citation_conference_title",
      "citation_journal_title",
      "citation_publication_title",
      "og:site_name"
    ]) ||
    normalizeText(collectJsonLdValue(jsonLdEntries, (entry) => entry?.isPartOf?.name)) ||
    "";

  const sourceHost = (() => {
    try {
      return new URL(snapshot.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  return {
    title:
      pickFirst(metaMap, ["citation_title", "dc.title", "og:title", "twitter:title"]) ||
      normalizeText(collectJsonLdValue(jsonLdEntries, (entry) => entry?.headline ?? entry?.name)) ||
      normalizeText(snapshot.title),
    pdfUrl: pickPdfUrl(snapshot, metaMap),
    conference,
    year: dateParts.year || extractYearFromText(conference),
    date: dateParts.date,
    authors,
    doi: pickFirst(metaMap, ["citation_doi", "dc.identifier"]),
    sourceUrl: normalizeText(snapshot.url),
    sourceHost
  };
}

export async function resolvePaperMetadata(snapshot, fetchSnapshotByUrl) {
  const initialMetadata = extractPaperMetadata(snapshot);

  if (
    initialMetadata.title &&
    initialMetadata.authors.length > 0 &&
    initialMetadata.year
  ) {
    return initialMetadata;
  }

  const lookupUrl = deriveMetadataLookupUrl(snapshot);
  if (!lookupUrl || typeof fetchSnapshotByUrl !== "function") {
    return initialMetadata;
  }

  const fallbackSnapshot = await fetchSnapshotByUrl(lookupUrl);
  if (!fallbackSnapshot) {
    return initialMetadata;
  }

  const fallbackMetadata = extractPaperMetadata(fallbackSnapshot);
  return mergeMetadata(initialMetadata, fallbackMetadata);
}
