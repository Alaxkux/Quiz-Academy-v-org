import client from './client'

export const coursesApi = {
  getAll:  ()           => client.get('/courses'),
  getOne:  (code)       => client.get(`/courses/${encodeURIComponent(code)}`),
  create:  (data)       => client.post('/courses', data),
  update:  (code, data) => client.put(`/courses/${encodeURIComponent(code)}`, data),
  remove:          (code)                => client.delete(`/courses/${encodeURIComponent(code)}`),
  getShared:       (token)             => client.get(`/courses/shared/${token}`),
  generateShare:   (code)              => client.post(`/courses/${encodeURIComponent(code)}/share`),
  uploadQuestions: (code, questions, replace = false) =>
    client.post(`/courses/${encodeURIComponent(code)}/questions?replace=${replace}`, { questions }),
}
