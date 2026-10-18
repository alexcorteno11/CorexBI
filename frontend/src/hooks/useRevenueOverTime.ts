import { useEffect, useState } from "react";

import { getRevenueOverTime } from "../services/api";
import type { RevenueOverTimeResponse } from "../types/analytics";


export function useRevenueOverTime() {
    const[data, setData] =
    useState<RevenueOverTimeResponse | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        async function loadData() {
            setLoading(true)
            setError(null)

            try {
                const result = await getRevenueOverTime(
                    controller.signal
                )
                
                if(!controller.signal.aborted) {
                    setData(result)
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(
                        err instanceof Error
                        ? err.message
                        : 'No se pudieron cargar los ingresos'
                    )
                    setData(null)
                }
            } finally {
                if(!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadData()

        return () => controller.abort()
    }, [reloadKey])

    return {
        data,
        loading,
        error,
        refresh: () => setReloadKey((value) => value + 1)
    }
}