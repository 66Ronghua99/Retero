function collectSnapshotFromDocument(documentRef, url, contentType = "text/html") {
  const metaTags = Array.from(documentRef.querySelectorAll("meta")).map((element) => ({
    key:
      element.getAttribute("name") ||
      element.getAttribute("property") ||
      element.getAttribute("itemprop") ||
      element.getAttribute("http-equiv") ||
      "",
    content: element.getAttribute("content") || ""
  }));

  const linkTags = Array.from(documentRef.querySelectorAll("link[href], a[href]"))
    .slice(0, 250)
    .map((element) => ({
      href: element.href,
      type: element.getAttribute("type") || "",
      rel: element.getAttribute("rel") || ""
    }));

  const jsonLd = Array.from(documentRef.querySelectorAll('script[type="application/ld+json"]'))
    .slice(0, 20)
    .map((element) => element.textContent || "");

  return {
    url,
    title: documentRef.title,
    contentType,
    metaTags,
    linkTags,
    jsonLd
  };
}

export function collectPageSnapshotFromCurrentDocument() {
  return collectSnapshotFromDocument(document, location.href, document.contentType || "text/html");
}

export async function fetchHtmlSnapshot(url) {
  const response = await fetch(url, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata page: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "text/html";
  const html = await response.text();
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");

  return collectSnapshotFromDocument(parsed, url, contentType);
}
