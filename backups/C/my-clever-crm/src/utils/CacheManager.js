// CacheManager.js - Intelligent caching system for SpeedyCRM

class CacheManager {
  constructor() {
    this.cache = new Map();
  }
  set(key, value, ttl = 60000) {
    const expires = Date.now() + ttl;
    this.cache.set(key, { value, expires });
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
  clear(key) {
    this.cache.delete(key);
  }
  clearAll() {
    this.cache.clear();
  }
}

export default new CacheManager();
