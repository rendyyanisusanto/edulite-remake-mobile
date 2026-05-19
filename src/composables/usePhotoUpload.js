import { ref } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export function usePhotoUpload() {
  const photoPreview = ref(null)
  const photoFile = ref(null)

  const selectPhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos // Automatically opens file picker/gallery to prevent "no camera found" on desktops
      })

      photoPreview.value = image.webPath

      // Convert local URI to Blob/File for multipart upload
      const response = await fetch(image.webPath)
      const blob = await response.blob()
      
      const fileName = `photo_${new Date().getTime()}.${image.format}`
      photoFile.value = new File([blob], fileName, { type: `image/${image.format || 'jpeg'}` })

    } catch (error) {
      if (error.message !== 'User cancelled photos app') {
        console.error('Camera error:', error)
      }
    }
  }

  const clearPhoto = () => {
    photoPreview.value = null
    photoFile.value = null
  }

  return {
    photoPreview,
    photoFile,
    selectPhoto,
    clearPhoto
  }
}
