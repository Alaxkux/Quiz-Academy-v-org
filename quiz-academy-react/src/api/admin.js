import client from './client'

export const adminApi = {
  getUsers:    ()          => client.get('/admin/users'),
  deleteUser:  (id)        => client.delete(`/admin/users/${id}`),
  verifyPin:   (pin)       => client.post('/admin/pin/verify', { pin }),
  setPin:      (pin, currentPin) => client.post('/admin/pin/set', { pin, currentPin }),
  getPinStatus:()          => client.get('/admin/pin/status'),
}