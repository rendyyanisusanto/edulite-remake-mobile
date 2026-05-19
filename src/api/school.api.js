import axios from './axios'

export const schoolApi = {
  getPublicProfile: () => axios.get('/api/settings/school-profile/public')
}
