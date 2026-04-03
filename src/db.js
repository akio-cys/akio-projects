import { db, storage } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const setItemDB = async (key, val) => {
  try {
    await setDoc(doc(db, "akioStore", key), { data: val });
    return true;
  } catch (error) {
    console.error("Firebase Set Error:", error);
    throw error;
  }
};

export const getItemDB = async (key) => {
  try {
    const docRef = doc(db, "akioStore", key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().data;
    } else {
      // Fallback for old local data migration
      const oldData = localStorage.getItem(key);
      if (oldData) {
        try {
          const result = JSON.parse(oldData);
          await setItemDB(key, result);
          return result;
        } catch(e) {}
      }
      return null;
    }
  } catch (error) {
    console.error("Firebase Get Error:", error);
    return null;
  }
};

export const uploadMediaToStorage = async (file, pathPrefix = 'media') => {
  if (!file) return null;
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};
