
"use client";

import {
  type User,
  type Transaction,
  type Category,
  type Budget,
  type SavingsGoal,
  type AssetPrice,
} from "./types";

const DB_NAME = "WalletWatcherDB";
const DB_VERSION = 3; // Incremented version for new store
const USER_STORE = "user";
const TRANSACTIONS_STORE = "transactions";
const CATEGORIES_STORE = "categories";
const BUDGETS_STORE = "budgets";
const SAVINGS_GOALS_STORE = "savingsGoals";
const ASSET_PRICES_STORE = "assetPrices";


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
          const budgetStore = db.createObjectStore(BUDGETS_STORE, { keyPath: "categoryId" });
          budgetStore.createIndex("recurrence", "recurrence", { unique: false });
        }
        if (!db.objectStoreNames.contains(SAVINGS_GOALS_STORE)) {
           db.createObjectStore(SAVINGS_GOALS_STORE, { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(ASSET_PRICES_STORE)) {
            const assetPriceStore = db.createObjectStore(ASSET_PRICES_STORE, { keyPath: "id", autoIncrement: true });
            assetPriceStore.createIndex("symbol_date", ["symbol", "date"], { unique: true });
            assetPriceStore.createIndex("symbol", "symbol", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error("Database error:", (event.target as IDBOpenDBRequest).error);
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

    const countryData = countries.find(c => c.code === user.country);
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      // Add user
      const userWithId: User = { ...user, id: 1, theme: 'light', currency: countryData?.currency || "USD" };
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
  
  async updateUserTheme(theme: 'light' | 'dark'): Promise<void> {
    const store = await this.getStore(USER_STORE, "readwrite");
    return new Promise((resolve, reject) => {
        const request = store.get(1);
        request.onsuccess = () => {
            const user = request.result;
            if (user) {
                user.theme = theme;
                const updateRequest = store.put(user);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                reject(new Error("User not found"));
            }
        };
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
  
  async deleteTransactionsOlderThan(days: number): Promise<number> {
    const store = await this.getStore(TRANSACTIONS_STORE, "readwrite");
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    let deletedCount = 0;

    return new Promise((resolve, reject) => {
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                const transaction = cursor.value as Transaction;
                if (new Date(transaction.date) < thresholdDate) {
                    cursor.delete();
                    deletedCount++;
                }
                cursor.continue();
            } else {
                resolve(deletedCount);
            }
        };

        cursorRequest.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
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
    const budgetsStore = await this.getStore(BUDGETS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
        const getRequest = budgetsStore.get(budget.categoryId);
        getRequest.onsuccess = () => {
            const existingBudget = getRequest.result;
            const newBudget = { ...(existingBudget || {}), ...budget };
            
            // If the amount or recurrence changes, reset the completion status
            if (!existingBudget || existingBudget.amount !== newBudget.amount || existingBudget.recurrence !== newBudget.recurrence) {
                newBudget.isCompleted = false;
            }

            const putRequest = budgetsStore.put(newBudget);
            putRequest.onsuccess = () => resolve(putRequest.result);
            putRequest.onerror = () => reject(putRequest.error);
        }
        getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async markBudgetAsComplete(categoryId: number): Promise<void> {
      const store = await this.getStore(BUDGETS_STORE, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.get(categoryId);
        request.onsuccess = () => {
          const budget = request.result;
          if (budget) {
            if (budget.recurrence === 'one-time') {
                budget.isCompleted = true;
                const updateRequest = store.put(budget);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                // For recurring goals, we don't mark them permanently complete
                resolve();
            }
          } else {
            reject(new Error(`Budget with categoryId ${categoryId} not found`));
          }
        };
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

  // Savings Goals methods
  async addSavingsGoal(goal: Omit<SavingsGoal, "id" | "currentAmount">): Promise<void> {
    const store = await this.getStore(SAVINGS_GOALS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
        const request = store.add({ ...goal, currentAmount: 0, isCompleted: false });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
  }

  async getSavingsGoals(): Promise<SavingsGoal[]> {
      const store = await this.getStore(SAVINGS_GOALS_STORE, "readonly");
      return new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  }
  
  async addFundsToSavingsGoal(goalId: number, amount: number): Promise<void> {
      const store = await this.getStore(SAVINGS_GOALS_STORE, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.get(goalId);
        request.onsuccess = () => {
          const goal = request.result;
          if (goal) {
            goal.currentAmount += amount;
            const updateRequest = store.put(goal);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
          } else {
            reject(new Error(`Savings goal with id ${goalId} not found`));
          }
        };
        request.onerror = () => reject(request.error);
      });
  }
  
  async markSavingsGoalAsComplete(goalId: number): Promise<void> {
      const store = await this.getStore(SAVINGS_GOALS_STORE, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.get(goalId);
        request.onsuccess = () => {
          const goal = request.result;
          if (goal) {
            if (goal.recurrence === 'one-time') {
                goal.isCompleted = true;
                const updateRequest = store.put(goal);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                resolve();
            }
          } else {
            reject(new Error(`Savings goal with id ${goalId} not found`));
          }
        };
        request.onerror = () => reject(request.error);
      });
  }
  
   // Asset Price methods
  async addAssetPrices(prices: Omit<AssetPrice, "id">[]): Promise<void> {
    const store = await this.getStore(ASSET_PRICES_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const tx = store.transaction;
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      
      for (const price of prices) {
        // Don't add if price is not a valid number
        if (isNaN(price.price)) continue;
        store.add(price);
      }
    });
  }

  async getAssetHistory(symbol: string, days: number = 1): Promise<AssetPrice[]> {
    const store = await this.getStore(ASSET_PRICES_STORE, "readonly");
    const index = store.index("symbol");
    const range = IDBKeyRange.only(symbol);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(range);
      request.onsuccess = () => {
        const sortedResults = request.result.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const now = new Date();
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - days);

        const filtered = sortedResults.filter(p => new Date(p.date) >= cutoff);

        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear data
  async clearUserData(): Promise<void> {
    const db = await this.openDB();
    const storeNames = [USER_STORE, TRANSACTIONS_STORE, CATEGORIES_STORE, BUDGETS_STORE, SAVINGS_GOALS_STORE, ASSET_PRICES_STORE];
    const transaction = db.transaction(storeNames, "readwrite");
    
    return new Promise((resolve, reject) => {
        let count = 0;
        storeNames.forEach(storeName => {
            if (db.objectStoreNames.contains(storeName)) {
                const request = transaction.objectStore(storeName).clear();
                request.onsuccess = () => {
                    count++;
                    if (count === storeNames.length) resolve();
                };
                request.onerror = () => reject(request.error);
            } else {
                count++;
                if (count === storeNames.length) resolve();
            }
        });
    });
  }
}

export const db = new DatabaseService();
const countries = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
];

    