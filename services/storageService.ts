import { Person, Expense } from "../types";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// 1. Firebase Yapılandırması
// GÜVENLİK UYARISI: GitHub'a yüklemeden önce hardcoded anahtarlar kaldırıldı.
// Bu değerler sadece process.env üzerinden okunmalıdır.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const COLLECTION_NAME = "kahve_takip";
const DOC_ID = "oda_2012_listesi";
const STORAGE_KEY = 'office-coffee-data';

let db: any = null;
let isFirebaseInitialized = false;

// 2. Firebase Başlatma
// Sadece gerekli config değerleri environment variable olarak varsa başlat
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseInitialized = true;
    console.log("🔥 Firebase environment değişkenleri ile başlatıldı.");
  } catch (error) {
    console.error("Firebase başlatma hatası:", error);
  }
} else {
  console.warn("⚠️ Firebase config bulunamadı. Uygulama sadece LocalStorage modunda çalışacak.");
  console.warn("Yayınlama yapıyorsanız (Vercel/Netlify) Environment Variable'ları eklemeyi unutmayın.");
}

// Veriyi kaydet (Önce LocalStorage, sonra Firebase)
export const saveData = async (people: Person[], expenses: Expense[]) => {
  const dataToSave = {
    people,
    expenses,
    lastUpdated: new Date().toISOString()
  };

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
      console.error("Firebase save error:", error);
    }
  }
};

// Veriyi dinle
export const subscribeToData = (callback: (people: Person[], expenses: Expense[]) => void) => {
  // 1. İlk açılışta hemen veri göstermek için LocalStorage'dan yükle
  const loadFromLocal = () => {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
           callback(parsed, []);
        } else {
           callback(parsed.people || [], parsed.expenses || []);
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
        
        // Firebase'den gelen en güncel veriyi LocalStorage'a da yedekle
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
            people, 
            expenses, 
            lastUpdated: new Date().toISOString() 
        }));
        
        console.log("🔥 Firebase'den güncel veri geldi.");
        callback(people, expenses);
      }
    }, (error) => {
      console.error("Firebase dinleme hatası:", error);
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