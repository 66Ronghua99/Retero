function normalizeText(value) {
  return String(value ?? "").trim();
}

function sanitizeSegment(value, fallback = "") {
  const cleaned = normalizeText(value)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/[.]+$/g, "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^.\- \p{L}\p{N}()_[\]&+,]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || fallback;
}

function collapseDecorators(value) {
  return value
    .replace(/\s+-\s+-/g, " - ")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildTemplateTokens(metadata) {
  const authors = Array.isArray(metadata.authors) ? metadata.authors.filter(Boolean) : [];

  return {
    title: sanitizeSegment(metadata.title, "untitled-paper"),
    conference: sanitizeSegment(metadata.conference, "unknown-venue"),
    year: sanitizeSegment(metadata.year, "undated"),
    date: sanitizeSegment(metadata.date, "undated"),
    author: sanitizeSegment(authors[0], "unknown-author"),
    authors: sanitizeSegment(authors.join(", "), "unknown-authors"),
    sourceHost: sanitizeSegment(metadata.sourceHost || (() => {
      try {
        return new URL(metadata.sourceUrl ?? "").hostname.replace(/^www\./, "");
      } catch {
        return "unknown-source";
      }
    })(), "unknown-source")
  };
}

function renderTemplate(template, tokens) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, token) => tokens[token] ?? "");
}

function renderPathSegments(template, tokens) {
  return renderTemplate(template, tokens)
    .split("/")
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean);
}

export function buildTargetPath(metadata, settings) {
  const tokens = buildTemplateTokens(metadata);
  const directories = renderPathSegments(settings.subdirectoryTemplate, tokens);
  const rawBaseName = renderTemplate(settings.filenameTemplate, tokens);
  const fileBaseName = sanitizeSegment(collapseDecorators(rawBaseName), tokens.title);
  const fileName = fileBaseName.toLowerCase().endsWith(".pdf") ? fileBaseName : `${fileBaseName}.pdf`;

  return [...directories, fileName].join("/");
}
