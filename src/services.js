// Thin wrappers around the EXISTING Spring Boot endpoints. Auth headers / 401 handling live in api.js.
import api from './api'

const data = r => r.data

/** PUT /tasks/{id} replaces every field, so always send the full task and override only what changes. */
export const taskBody = (t, over = {}) => ({
  title: t.title, description: t.description, subjectId: t.subjectId, priority: t.priority,
  dueDate: t.dueDate, estimatedMinutes: t.estimatedMinutes, status: t.status, ...over,
})
export const sessionBody = (s, over = {}) => ({
  taskId: s.taskId, subjectId: s.subjectId, startTime: s.startTime, endTime: s.endTime, status: s.status, ...over,
})

export const tasksApi = {
  list: () => api.get('/tasks').then(data),
  create: body => api.post('/tasks', body).then(data),
  save: (id, body) => api.put(`/tasks/${id}`, body).then(data),
  patch: (task, over) => api.put(`/tasks/${task.id}`, taskBody(task, over)).then(data),
  remove: id => api.delete(`/tasks/${id}`),
}
export const subjectsApi = {
  list: () => api.get('/subjects').then(data),
  create: body => api.post('/subjects', body).then(data),
  save: (id, body) => api.put(`/subjects/${id}`, body).then(data),
  remove: id => api.delete(`/subjects/${id}`),
}
export const sessionsApi = {
  list: () => api.get('/study-sessions').then(data),
  create: body => api.post('/study-sessions', body).then(data),
  save: (id, body) => api.put(`/study-sessions/${id}`, body).then(data),
  patch: (s, over) => api.put(`/study-sessions/${s.id}`, sessionBody(s, over)).then(data),
  remove: id => api.delete(`/study-sessions/${id}`),
}
export const reportsApi = {
  progress: () => api.get('/progress').then(data),
  dashboard: () => api.get('/dashboard').then(data),
}
