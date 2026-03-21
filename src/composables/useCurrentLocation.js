import { ref } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

export function useCurrentLocation() {
  const latitude = ref(null)
  const longitude = ref(null)
  const accuracy = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Request permissions and fetch current position
   */
  const fetchLocation = async () => {
    loading.value = true
    error.value = null

    try {
      // Check if we need to request permissions (on native devices)
      if (Capacitor.isNativePlatform()) {
        const permResult = await Geolocation.checkPermissions()
        if (permResult.location !== 'granted') {
          const reqResult = await Geolocation.requestPermissions()
          if (reqResult.location !== 'granted') {
            throw new Error('Izin akses lokasi ditolak.')
          }
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })

      latitude.value = position.coords.latitude
      longitude.value = position.coords.longitude
      accuracy.value = position.coords.accuracy

    } catch (err) {
      console.error('Error fetching location:', err)
      error.value = err.message || 'Gagal mengambil lokasi Anda. Pastikan GPS aktif.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Helper to calculate distance in meters between two coordinates using Haversine formula
   */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null
    
    const R = 6371e3 // Earth radius in meters
    const rad = Math.PI / 180
    const phi1 = lat1 * rad
    const phi2 = lat2 * rad
    const deltaPhi = (lat2 - lat1) * rad
    const deltaLambda = (lon2 - lon1) * rad

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  return {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    fetchLocation,
    calculateDistance
  }
}
