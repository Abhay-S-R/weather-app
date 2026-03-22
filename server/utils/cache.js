import { LRUCache } from "lru-cache";

const options = {
  max: 1000,
  ttl: 10 * 60 * 1000, //default TTL of 10mins, it can be overridden
  updateAgeOnGet: false,
};

const cache = new LRUCache(options);

export function cacheGet(key) {
  return cache.get(key) || null;
}

export function cacheSet(key, data, ttlMs = options.ttl) {
  cache.set(key, data, { ttl: ttlMs });
}
