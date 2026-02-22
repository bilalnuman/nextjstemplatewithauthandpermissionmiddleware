type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function cachedProfile<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>
): Promise<T> {
    const now = Date.now();
    const hit = store.get(key) as Entry<T> | undefined;
    if (hit && now < hit.expiresAt) return hit.value;

    const existing = inflight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const p = (async () => {
        const value = await fetcher();
        store.set(key, { value, expiresAt: Date.now() + ttlMs });
        return value;
    })();

    inflight.set(key, p);
    try {
        return await p;
    } finally {
        inflight.delete(key);
    }
}

export function invalidateProfile(key: string) {
    store.delete(key);
    inflight.delete(key);
}