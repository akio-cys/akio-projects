export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AkioDB', 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('store');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const setItemDB = async (key, val) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('store', 'readwrite');
    const store = transaction.objectStore('store');
    const req = store.put(val, key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
};

export const getItemDB = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('store', 'readonly');
    const store = transaction.objectStore('store');
    const req = store.get(key);
    req.onsuccess = async () => {
      let result = req.result;
      if (!result) {
        // Migration from localStorage
        const oldData = localStorage.getItem(key);
        if (oldData) {
          try {
            result = JSON.parse(oldData);
            await setItemDB(key, result);
          } catch(e) {}
        }
      }
      resolve(result);
    };
    req.onerror = () => reject(req.error);
  });
};
