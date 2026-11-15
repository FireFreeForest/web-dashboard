import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import type { ReverseGeocodeResult } from "./types"

type ReverseGeocodeInput = {
  latitude: number
  longitude: number
}

export function reverseGeocode({
  latitude,
  longitude,
}: ReverseGeocodeInput): Promise<ReverseGeocodeResult> {
  return apiFetch<ReverseGeocodeResult>({
    url: "/geocode/reverse",
    params: { lat: latitude, lon: longitude },
  })
}

export function useReverseGeocode() {
  return useMutation<ReverseGeocodeResult, ApiError, ReverseGeocodeInput>({
    mutationFn: reverseGeocode,
  })
}
