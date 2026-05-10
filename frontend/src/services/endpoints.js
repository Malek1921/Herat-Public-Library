import api from './api';

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  register: (username, email, password, role = 'staff') =>
    api.post('/auth/register', { username, email, password, role }),
  
  getMe: () =>
    api.get('/auth/me'),
  
  getUsers: () =>
    api.get('/auth/users'),
  
  updateUser: (id, data) =>
    api.patch(`/auth/users/${id}`, data),
};

export const booksAPI = {
  getBooks: (params) =>
    api.get('/books', { params }),
  
  getBook: (id) =>
    api.get(`/books/${id}`),
  
  getBookCopies: (id) =>
    api.get(`/books/${id}/copies`),
  
  createBook: (data) =>
    api.post('/books', data),
  
  updateBook: (id, data) =>
    api.put(`/books/${id}`, data),
  
  deleteBook: (id) =>
    api.delete(`/books/${id}`),
};

export const authorsAPI = {
  getAuthors: (params) =>
    api.get('/authors', { params }),
  
  getAuthor: (id) =>
    api.get(`/authors/${id}`),
  
  getAuthorBooks: (id) =>
    api.get(`/authors/${id}/books`),
  
  createAuthor: (data) =>
    api.post('/authors', data),
  
  updateAuthor: (id, data) =>
    api.put(`/authors/${id}`, data),
  
  deleteAuthor: (id) =>
    api.delete(`/authors/${id}`),
};

export const translatorsAPI = {
  getTranslators: (params) =>
    api.get('/translators', { params }),
  
  getTranslator: (id) =>
    api.get(`/translators/${id}`),
  
  getTranslatorBooks: (id) =>
    api.get(`/translators/${id}/books`),
  
  createTranslator: (data) =>
    api.post('/translators', data),
  
  updateTranslator: (id, data) =>
    api.put(`/translators/${id}`, data),
  
  deleteTranslator: (id) =>
    api.delete(`/translators/${id}`),
};

export const membersAPI = {
  getMembers: (params) =>
    api.get('/members', { params }),
  
  getMember: (id) =>
    api.get(`/members/${id}`),
  
  getMemberLoans: (id) =>
    api.get(`/members/${id}/loans`),
  
  createMember: (data) =>
    api.post('/members', data),
  
  updateMember: (id, data) =>
    api.put(`/members/${id}`, data),
  
  deleteMember: (id) =>
    api.delete(`/members/${id}`),
};

export const loansAPI = {
  getLoans: (params) =>
    api.get('/loans', { params }),
  
  getLoan: (id) =>
    api.get(`/loans/${id}`),
  
  issueLoan: (data) =>
    api.post('/loans', data),
  
  returnLoan: (id) =>
    api.patch(`/loans/${id}/return`),
  
  updateLoan: (id, data) =>
    api.patch(`/loans/${id}`, data),
  
  deleteLoan: (id) =>
    api.delete(`/loans/${id}`),
};

export const reservationsAPI = {
  getReservations: (params) =>
    api.get('/reservations', { params }),
  
  getReservation: (id) =>
    api.get(`/reservations/${id}`),
  
  createReservation: (data) =>
    api.post('/reservations', data),
  
  updateReservation: (id, data) =>
    api.patch(`/reservations/${id}`, data),
  
  deleteReservation: (id) =>
    api.delete(`/reservations/${id}`),
};

export const lookupsAPI = {
  getLookupsBy: (type, params) =>
    api.get(`/lookups/${type}`, { params }),
  
  getLookup: (type, id) =>
    api.get(`/lookups/${type}/${id}`),
  
  createLookup: (type, data) =>
    api.post(`/lookups/${type}`, data),
  
  updateLookup: (type, id, data) =>
    api.put(`/lookups/${type}/${id}`, data),
  
  deleteLookup: (type, id) =>
    api.delete(`/lookups/${type}/${id}`),
};

export const copiesAPI = {
  getCopies: (params) =>
    api.get('/copies', { params }),
  
  getCopy: (id) =>
    api.get(`/copies/${id}`),
  
  createCopy: (data) =>
    api.post('/copies', data),
  
  updateCopy: (id, data) =>
    api.put(`/copies/${id}`, data),
  
  deleteCopy: (id) =>
    api.delete(`/copies/${id}`),
};

export const statsAPI = {
  getStats: () =>
    api.get('/stats'),
};