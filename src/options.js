import { DEFAULT_SETTINGS, SAMPLE_METADATA, TOKEN_NAMES } from "./lib/defaults.js";
import { chooseDirectoryHandle, supportsFilesystemAccess } from "./lib/fs-access.js";
import { buildTargetPath } from "./lib/naming.js";
import {
  clearDirectoryHandle,
  getDirectoryHandle,
  getSettings,
  saveDirectoryHandle,
  saveSettings
} from "./lib/storage.js";

const saveModeSelect = document.querySelector("#save-mode-select");
const downloadsFallbackCheckbox = document.querySelector("#downloads-fallback");
const folderStatus = document.querySelector("#folder-status");
const pickFolderButton = document.querySelector("#pick-folder");
const clearFolderButton = document.querySelector("#clear-folder");
const subdirectoryTemplateInput = document.querySelector("#subdirectory-template");
const filenameTemplateInput = document.querySelector("#filename-template");
const templatePreview = document.querySelector("#template-preview");
const settingsStatus = document.querySelector("#settings-status");
const tokenList = document.querySelector("#token-list");

function setStatus(message, kind = "info") {
  settingsStatus.textContent = message;
  settingsStatus.className = `status status-${kind}`;
}

function renderTemplatePreview() {
  const settings = {
    ...DEFAULT_SETTINGS,
    saveMode: saveModeSelect.value,
    allowDownloadsFallback: downloadsFallbackCheckbox.checked,
    subdirectoryTemplate: subdirectoryTemplateInput.value,
    filenameTemplate: filenameTemplateInput.value
  };

  templatePreview.textContent = buildTargetPath(SAMPLE_METADATA, settings);
}

async function persistFormState(partial = {}) {
  await saveSettings({
    saveMode: saveModeSelect.value,
    allowDownloadsFallback: downloadsFallbackCheckbox.checked,
    subdirectoryTemplate: subdirectoryTemplateInput.value,
    filenameTemplate: filenameTemplateInput.value,
    ...partial
  });

  renderTemplatePreview();
  setStatus("设置已保存。", "success");
}

async function refreshFolderStatus() {
  const handle = await getDirectoryHandle();
  if (handle) {
    folderStatus.textContent = `已连接目录：${handle.name}`;
    return;
  }

  folderStatus.textContent = supportsFilesystemAccess()
    ? "尚未选择目录"
    : "当前浏览器不支持本地目录访问，将只能使用下载目录模式。";
}

async function bootstrap() {
  const settings = await getSettings();

  saveModeSelect.value = settings.saveMode;
  downloadsFallbackCheckbox.checked = settings.allowDownloadsFallback;
  subdirectoryTemplateInput.value = settings.subdirectoryTemplate;
  filenameTemplateInput.value = settings.filenameTemplate;
  tokenList.textContent = TOKEN_NAMES.map((name) => `{{${name}}}`).join("  ");
  renderTemplatePreview();
  await refreshFolderStatus();

  if (!supportsFilesystemAccess()) {
    pickFolderButton.disabled = true;
    clearFolderButton.disabled = true;
  }
}

pickFolderButton.addEventListener("click", async () => {
  try {
    const handle = await chooseDirectoryHandle();
    await saveDirectoryHandle(handle);
    await refreshFolderStatus();
    setStatus("目录已连接。", "success");
  } catch (error) {
    setStatus(`目录选择失败：${error.message}`, "error");
  }
});

clearFolderButton.addEventListener("click", async () => {
  await clearDirectoryHandle();
  await refreshFolderStatus();
  setStatus("已清除目录连接。", "info");
});

saveModeSelect.addEventListener("change", () => {
  persistFormState();
});
downloadsFallbackCheckbox.addEventListener("change", () => {
  persistFormState();
});
subdirectoryTemplateInput.addEventListener("input", () => {
  renderTemplatePreview();
  persistFormState();
});
filenameTemplateInput.addEventListener("input", () => {
  renderTemplatePreview();
  persistFormState();
});

bootstrap().catch((error) => {
  setStatus(`设置页初始化失败：${error.message}`, "error");
});

