import { useEffect, useState } from "react";

export function useFetch(url, options) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            try {
                setLoading(true);
                const res = await fetch(url, options);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (e) {
                if (!cancelled) setError(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        if (url) run();
        return () => { cancelled = true; };
    }, [url]);

    return { data, error, loading };
}

