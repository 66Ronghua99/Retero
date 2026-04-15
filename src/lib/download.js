import { buildTargetPath } from "./naming.js";
import { ensureDirectoryPermission, writeBlobToDirectory } from "./fs-access.js";
import { getDirectoryHandle } from "./storage.js";

async function fetchPdfBlob(url) {
  const response = await fetch(url, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status}`);
  }

  return response.blob();
}

async function saveViaDownloads(relativePath, pdfUrl) {
  const downloadId = await chrome.downloads.download({
    url: pdfUrl,
    filename: relativePath,
    conflictAction: "uniquify",
    saveAs: false
  });

  return {
    mode: "downloads",
    relativePath,
    downloadId
  };
}

export async function savePaperFromMetadata(metadata, settings) {
  if (!metadata.pdfUrl) {
    throw new Error("Missing PDF URL.");
  }

  const relativePath = buildTargetPath(metadata, settings);

  if (settings.saveMode === "filesystem") {
    const handle = await getDirectoryHandle();

    if (!handle) {
      if (!settings.allowDownloadsFallback) {
        throw new Error("No library directory has been configured.");
      }

      return saveViaDownloads(relativePath, metadata.pdfUrl);
    }

    const hasPermission = await ensureDirectoryPermission(handle);
    if (!hasPermission) {
      if (!settings.allowDownloadsFallback) {
        throw new Error("Directory permission was not granted.");
      }

      return saveViaDownloads(relativePath, metadata.pdfUrl);
    }

    try {
      const blob = await fetchPdfBlob(metadata.pdfUrl);
      await writeBlobToDirectory(handle, relativePath, blob);

      return {
        mode: "filesystem",
        relativePath
      };
    } catch (error) {
      if (!settings.allowDownloadsFallback) {
        throw error;
      }

      return saveViaDownloads(relativePath, metadata.pdfUrl);
    }
  }

  return saveViaDownloads(relativePath, metadata.pdfUrl);
}

