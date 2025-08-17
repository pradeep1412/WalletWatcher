"use client";

import {
  type User,
  type Transaction,
  type Category,
  type Budget,
} from "./types";

const DB_NAME = "WalletWatcherDB";
const DB_VERSION = 1;
const USER_STORE = "user";
const TRANSACTIONS_STORE = "transactions";
const CATEGORIES_STORE = "categories";
const BUDGETS_STORE = "budgets";

class DatabaseService {
  private db: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(USER_STORE)) {
          db.createObjectStore(USER_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
          const transactionStore = db.createObjectStore(TRANSACTIONS_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
          transactionStore.createIndex("date", "date", { unique: false });
          transactionStore.createIndex("categoryId", "categoryId", { unique: false });
        }
        if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
          db.createObjectStore(CATEGORIES_STORE, { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(BUDGETS_STORE)) {
          db.createObjectStore(BUDGETS_STORE, { keyPath: "categoryId" });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private async getStore(
    storeName: string,
    mode: IDBTransactionMode,
    transaction?: IDBTransaction
  ): Promise<IDBObjectStore> {
    if (transaction) {
      return transaction.objectStore(storeName);
    }
    const db = await this.openDB();
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // User methods
  async initUser(user: { username: string; country: string }): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction([USER_STORE, CATEGORIES_STORE], "readwrite");
    const userStore = tx.objectStore(USER_STORE);
    const categoryStore = tx.objectStore(CATEGORIES_STORE);
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      // Add user
      const userWithId: User = { ...user, id: 1 };
      userStore.put(userWithId);

      // Add default categories
      const defaultCategories = [
        { name: "Groceries" }, { name: "Utilities" }, { name: "Rent/Mortgage" }, { name: "Transportation" },
        { name: "Dining Out" }, { name: "Entertainment" }, { name: "Shopping" }, { name: "Income" }
      ];
      for (const cat of defaultCategories) {
        categoryStore.add(cat);
      }
    });
  }

  async getUser(): Promise<User | undefined> {
    const store = await this.getStore(USER_STORE, "readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Transaction methods
  async addTransaction(transaction: Omit<Transaction, "id">): Promise<IDBValidKey> {
    const store = await this.getStore(TRANSACTIONS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.add(transaction);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTransactions(): Promise<Transaction[]> {
    const store = await this.getStore(TRANSACTIONS_STORE, "readonly");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      request.onerror = () => reject(request.error);
    });
  }

  // Category methods
  async addCategory(category: Omit<Category, "id">): Promise<IDBValidKey> {
    const store = await this.getStore(CATEGORIES_STORE, "readwrite");
    return new Promise((resolve, reject) => {
        const request = store.add(category);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  }

  async getCategories(): Promise<Category[]> {
    const store = await this.getStore(CATEGORIES_STORE, "readonly");
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  }

  // Budget methods
  async setBudget(budget: Budget): Promise<IDBValidKey> {
    const store = await this.getStore(BUDGETS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
        const request = store.put(budget);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  }
  
  async getBudgets(): Promise<Budget[]> {
      const store = await this.getStore(BUDGETS_STORE, "readonly");
      return new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  }

  // Clear data
  async clearUserData(): Promise<void> {
    const db = await this.openDB();
    const storeNames = [USER_STORE, TRANSACTIONS_STORE, CATEGORIES_STORE, BUDGETS_STORE];
    const transaction = db.transaction(storeNames, "readwrite");
    
    return new Promise((resolve, reject) => {
        let count = 0;
        storeNames.forEach(storeName => {
            const request = transaction.objectStore(storeName).clear();
            request.onsuccess = () => {
                count++;
                if (count === storeNames.length) resolve();
            };
            request.onerror = () => reject(request.error);
        });
    });
  }
}

export const db = new DatabaseService();
