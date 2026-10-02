import { Person, Expense } from "../types";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDocFromServer } from "firebase/firestore";

// 1. Firebase Yapılandırması
// Use process.env instead of import.meta.env to avoid type errors
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const COLLECTION_NAME = "kahve_takip";
const DOC_ID = "oda_2012_listesi";
const STORAGE_KEY = 'office-coffee-data';

let db: any = null;
let isFirebaseInitialized = false;

// 2. Firebase Başlatma
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseInitialized = true;
    console.log("🔥 Firebase environment değişkenleri ile başlatıldı.");
    
    // Bağlantı testi
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, COLLECTION_NAME, DOC_ID));
        console.log("✅ Firestore bağlantısı başarılı.");
      } catch (error) {
        if (error instanceof Error && error.message.includes('offline')) {
          console.error("❌ Firebase bağlantı hatası: İstemci çevrimdışı veya yapılandırma hatalı.");
        } else {
          console.warn("⚠️ Firestore erişim uyarısı (Kurallar kaynaklı olabilir):", error);
        }
      }
    };
    testConnection();
  } catch (error) {
    console.error("Firebase başlatma hatası:", error);
  }
} else {
  console.warn("⚠️ Firebase config bulunamadı. Uygulama sadece LocalStorage modunda çalışacak.");
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: any, operationType: OperationType, path: string) => {
  const errInfo = {
    error: error?.message || String(error),
    operationType,
    path,
    code: error?.code
  };
  console.error(`🔥 Firestore Hatası [${operationType}]:`, JSON.stringify(errInfo, null, 2));
  return error;
};

// Veriyi kaydet (Önce LocalStorage, sonra Firebase)
export const saveData = async (
  people: Person[], 
  expenses: Expense[], 
  settings?: { monthlyDue?: number; consumption?: number; startDate?: string }
) => {
  // Read existing settings if not explicitly passed
  let mergedSettings = settings;
  if (!mergedSettings) {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.settings) mergedSettings = parsed.settings;
        else if (parsed.monthlyDue) mergedSettings = { monthlyDue: parsed.monthlyDue };
      }
    } catch (e) {}
  }

  const dataToSave: any = {
    people,
    expenses,
    lastUpdated: new Date().toISOString()
  };

  if (mergedSettings) {
    dataToSave.settings = mergedSettings;
    if (mergedSettings.monthlyDue !== undefined) {
      dataToSave.monthlyDue = mergedSettings.monthlyDue;
    }
  }

  // A. LocalStorage'a yaz (Hız ve offline desteği için)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error("LocalStorage save error:", e);
  }

  // B. Firebase'e yaz
  if (isFirebaseInitialized && db) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, DOC_ID), dataToSave);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${DOC_ID}`);
    }
  }
};

// Veriyi dinle
export const subscribeToData = (
  callback: (
    people: Person[], 
    expenses: Expense[], 
    settings?: { monthlyDue?: number; consumption?: number; startDate?: string }
  ) => void
) => {
  // 1. İlk açılışta hemen veri göstermek için LocalStorage'dan yükle
  const loadFromLocal = () => {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
           callback(parsed, []);
        } else {
           const settings = parsed.settings || (parsed.monthlyDue ? { monthlyDue: parsed.monthlyDue } : undefined);
           callback(parsed.people || [], parsed.expenses || [], settings);
        }
      } catch (e) {
        console.error("Local data parse error", e);
      }
    }
  };

  loadFromLocal();

  // 2. Eğer Firebase aktifse oradan canlı dinle (Realtime updates)
  if (isFirebaseInitialized && db) {
    const unsubscribe = onSnapshot(doc(db, COLLECTION_NAME, DOC_ID), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const people = data.people || (Array.isArray(data) ? data : []);
        const expenses = data.expenses || [];
        const settings = data.settings || (data.monthlyDue ? { monthlyDue: data.monthlyDue } : undefined);
        
        // Firebase'den gelen en güncel veriyi LocalStorage'a da yedekle
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
            people, 
            expenses, 
            settings,
            monthlyDue: settings?.monthlyDue,
            lastUpdated: new Date().toISOString() 
        }));
        
        console.log("🔥 Firebase'den güncel veri geldi.");
        callback(people, expenses, settings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${DOC_ID}`);
    });

    return unsubscribe;
  }

  // 3. Firebase yoksa sadece sekmeler arası senkronizasyon yap
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
        loadFromLocal();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
};
