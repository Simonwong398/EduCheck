const request = require('supertest');
const app = require('../server'); // 假设server.js导出了Express应用

describe('GET /api/data', () => {
  it('should return data with status 200', async () => {
    const response = await request(app).get('/api/data').set('Authorization', 'Bearer your_jwt_token');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
