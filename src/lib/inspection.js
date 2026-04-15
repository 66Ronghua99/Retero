import { resolvePaperMetadata } from "./metadata.js";

function inferContentTypeFromUrl(url = "") {
  const lowerUrl = String(url).toLowerCase();
  if (lowerUrl.endsWith(".pdf") || lowerUrl.includes("/pdf/")) {
    return "application/pdf";
  }

  return "text/html";
}

export function createFallbackSnapshotFromTab(tab) {
  return {
    url: tab?.url ?? "",
    title: tab?.title ?? "",
    contentType: inferContentTypeFromUrl(tab?.url),
    metaTags: [],
    linkTags: [],
    jsonLd: []
  };
}

export async function inspectTabSnapshot(tab, collectCurrentPageSnapshot, fetchSnapshotByUrl) {
  try {
    const currentSnapshot = await collectCurrentPageSnapshot();
    return resolvePaperMetadata(currentSnapshot, fetchSnapshotByUrl);
  } catch (error) {
    if (!tab?.url) {
      throw error;
    }

    const fallbackSnapshot = createFallbackSnapshotFromTab(tab);
    return resolvePaperMetadata(fallbackSnapshot, fetchSnapshotByUrl);
  }
}
