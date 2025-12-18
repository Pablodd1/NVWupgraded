class StorageService {
  private storage: Storage | null = null;

  constructor(storageType: "local" | "session") {
    if (typeof window !== "undefined") {
      this.storage = storageType === "local" ? localStorage : sessionStorage;
    }
  }

  setConfig(data: Record<string, any>): void {
    if (!this.storage) return;
    const existingConfig = this.storage.getItem("config");
    const updatedConfig = existingConfig ? { ...JSON.parse(existingConfig), ...data } : data;
    this.storage.setItem("config", JSON.stringify(updatedConfig));
  }

  getConfig<T = Record<string, any>>(): T | null {
    if (!this.storage) return null;
    const config = this.storage.getItem("config");
    return config ? (JSON.parse(config) as T) : null;
  }
}

export const LocalStorageService = new StorageService("local");
export const SessionStorageService = new StorageService("session");
