import api from './axios'

const BASE_PATH = '/api/permission-letters'

export const permissionLettersApi = {
  // Fetch list of permission letters with pagination/search
  getList: (params) => {
    return api.get(BASE_PATH, { params })
  },
  
  // Fetch detailed info including participants
  getById: (id) => {
    return api.get(`${BASE_PATH}/${id}`)
  },
  
  // Submit new permission letter
  create: (data) => {
    return api.post(BASE_PATH, data)
  },
  
  // Update draft
  update: (id, data) => {
    return api.put(`${BASE_PATH}/${id}`, data)
  },
  
  // Transition to PENDING
  submit: (id) => {
    return api.patch(`${BASE_PATH}/${id}/submit`)
  },
  
  // Cancel if possible
  cancel: (id) => {
    return api.patch(`${BASE_PATH}/${id}/cancel`)
  },
  
  // Delete entirely (if DRAFT)
  delete: (id) => {
    return api.delete(BASE_PATH + '/' + id)
  },

  // Download PDF Blob
  printPdf: (id) => {
    return api.get(`${BASE_PATH}/${id}/print`, {
      responseType: 'blob'
    })
  }
}
