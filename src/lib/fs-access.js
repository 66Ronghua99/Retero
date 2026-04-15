export function supportsFilesystemAccess() {
  return typeof globalThis.showDirectoryPicker === "function";
}

export async function chooseDirectoryHandle() {
  return globalThis.showDirectoryPicker({
    mode: "readwrite"
  });
}

export async function ensureDirectoryPermission(handle) {
  if (!handle) {
    return false;
  }

  const existing = await handle.queryPermission?.({
    mode: "readwrite"
  });
  if (existing === "granted") {
    return true;
  }

  const requested = await handle.requestPermission?.({
    mode: "readwrite"
  });
  return requested === "granted";
}

export async function writeBlobToDirectory(handle, relativePath, blob) {
  const segments = relativePath.split("/").filter(Boolean);
  const fileName = segments.pop();

  if (!fileName) {
    throw new Error("Missing target filename.");
  }

  let currentDirectory = handle;
  for (const segment of segments) {
    currentDirectory = await currentDirectory.getDirectoryHandle(segment, {
      create: true
    });
  }

  const fileHandle = await currentDirectory.getFileHandle(fileName, {
    create: true
  });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

