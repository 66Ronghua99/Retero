import { DEFAULT_SETTINGS } from "./defaults.js";

const DB_NAME = "retero-storage";
const DB_VERSION = 1;
const HANDLE_STORE = "handles";
const DIRECTORY_KEY = "library-root";

function openHandleDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(HANDLE_STORE)) {
        request.result.createObjectStore(HANDLE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getSettings() {
  const result = await chrome.storage.local.get("settings");
  return {
    ...DEFAULT_SETTINGS,
    ...(result.settings ?? {})
  };
}

export async function saveSettings(nextSettings) {
  const merged = {
    ...(await getSettings()),
    ...nextSettings
  };

  await chrome.storage.local.set({
    settings: merged
  });

  return merged;
}

export async function getDirectoryHandle() {
  const db = await openHandleDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLE_STORE, "readonly");
    const store = transaction.objectStore(HANDLE_STORE);
    const request = store.get(DIRECTORY_KEY);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function saveDirectoryHandle(handle) {
  const db = await openHandleDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLE_STORE, "readwrite");
    const store = transaction.objectStore(HANDLE_STORE);
    const request = store.put(handle, DIRECTORY_KEY);

    request.onsuccess = () => resolve(handle);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function clearDirectoryHandle() {
  const db = await openHandleDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLE_STORE, "readwrite");
    const store = transaction.objectStore(HANDLE_STORE);
    const request = store.delete(DIRECTORY_KEY);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}
