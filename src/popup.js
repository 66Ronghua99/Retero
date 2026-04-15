import { resolvePaperMetadata } from "./lib/metadata.js";
import { buildTargetPath } from "./lib/naming.js";
import { getDirectoryHandle, getSettings } from "./lib/storage.js";
import { savePaperFromMetadata } from "./lib/download.js";
import { inspectTabSnapshot } from "./lib/inspection.js";
import {
  collectPageSnapshotFromCurrentDocument,
  fetchHtmlSnapshot
} from "./lib/html-snapshot.js";

const statusElement = document.querySelector("#status");
const saveModeElement = document.querySelector("#save-mode");
const pathPreviewElement = document.querySelector("#path-preview");
const openOptionsButton = document.querySelector("#open-options");
const saveButton = document.querySelector("#save-paper");

const fields = {
  title: document.querySelector("#title"),
  year: document.querySelector("#year"),
  date: document.querySelector("#date"),
  conference: document.querySelector("#conference"),
  authors: document.querySelector("#authors"),
  pdfUrl: document.querySelector("#pdf-url")
};

let currentSettings = null;

function setStatus(message, kind = "info") {
  statusElement.textContent = message;
  statusElement.className = `status status-${kind}`;
}

function getFormMetadata() {
  return {
    title: fields.title.value,
    year: fields.year.value,
    date: fields.date.value,
    conference: fields.conference.value,
    authors: fields.authors.value
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    pdfUrl: fields.pdfUrl.value,
    sourceUrl: fields.pdfUrl.dataset.sourceUrl ?? "",
    sourceHost: fields.pdfUrl.dataset.sourceHost ?? ""
  };
}

function renderPreview() {
  if (!currentSettings) {
    return;
  }

  pathPreviewElement.textContent = buildTargetPath(getFormMetadata(), currentSettings);
}

function setFormMetadata(metadata) {
  fields.title.value = metadata.title ?? "";
  fields.year.value = metadata.year ?? "";
  fields.date.value = metadata.date ?? "";
  fields.conference.value = metadata.conference ?? "";
  fields.authors.value = (metadata.authors ?? []).join(", ");
  fields.pdfUrl.value = metadata.pdfUrl ?? "";
  fields.pdfUrl.dataset.sourceUrl = metadata.sourceUrl ?? "";
  fields.pdfUrl.dataset.sourceHost = metadata.sourceHost ?? "";
  renderPreview();
}

async function describeSaveMode(settings) {
  if (settings.saveMode === "downloads") {
    saveModeElement.textContent = "当前保存模式：浏览器下载目录";
    return;
  }

  const handle = await getDirectoryHandle();
  if (handle) {
    saveModeElement.textContent = `当前保存模式：本地目录 (${handle.name})`;
    return;
  }

  saveModeElement.textContent = settings.allowDownloadsFallback
    ? "当前保存模式：本地目录（未配置，将回退到浏览器下载目录）"
    : "当前保存模式：本地目录（未配置）";
}

async function inspectActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id) {
    throw new Error("找不到当前标签页。");
  }

  return inspectTabSnapshot(
    tab,
    async () => {
      const [injected] = await chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        func: collectPageSnapshotFromCurrentDocument
      });

      if (!injected?.result) {
        throw new Error("无法读取当前页面内容。");
      }

      return injected.result;
    },
    fetchHtmlSnapshot
  );
}

async function bootstrap() {
  currentSettings = await getSettings();
  await describeSaveMode(currentSettings);

  const metadata = await inspectActiveTab();
  setFormMetadata(metadata);

  if (metadata.pdfUrl) {
    setStatus("已检测到论文信息，可以直接保存或微调字段。", "success");
  } else {
    setStatus("没有自动检测到 PDF URL，请手动补充后再保存。", "error");
  }
}

for (const field of Object.values(fields)) {
  field.addEventListener("input", renderPreview);
}

openOptionsButton.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

saveButton.addEventListener("click", async () => {
  try {
    saveButton.disabled = true;
    currentSettings = await getSettings();
    const result = await savePaperFromMetadata(getFormMetadata(), currentSettings);
    renderPreview();

    if (result.mode === "filesystem") {
      setStatus(`已保存到本地目录：${result.relativePath}`, "success");
    } else {
      setStatus(`已通过浏览器下载保存：${result.relativePath}`, "success");
    }
  } catch (error) {
    setStatus(`保存失败：${error.message}`, "error");
  } finally {
    saveButton.disabled = false;
  }
});

bootstrap().catch((error) => {
  setStatus(`当前页面暂不支持：${error.message}`, "error");
  pathPreviewElement.textContent = "请切换到论文页面后再试。";
});
