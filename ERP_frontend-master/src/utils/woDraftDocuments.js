const DB_NAME = "WO_DRAFT_DB";
const STORE = "documents";

const openDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

export const saveDraftDocs = async (draftId, files) => {
  const db = await openDB();
  const tx = db.transaction("draftDocs", "readwrite");
  const store = tx.objectStore("draftDocs");

  await store.put(
    {
      draftId,
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
        blob: file, // 👈 store blob explicitly
      })),
    },
    draftId
  );

  await tx.done;
};


export const getDraftDocs = async (draftId) => {
  const db = await openDB();
  const tx = db.transaction("draftDocs", "readonly");
  const store = tx.objectStore("draftDocs");

  const record = await store.get(draftId);
  if (!record || !record.files) return [];

  return record.files.map(f =>
    new File([f.blob], f.name, {
      type: f.type,
      lastModified: f.lastModified,
    })
  );
};


export const deleteDraftDocs = async (draftId) => {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(draftId);
};
