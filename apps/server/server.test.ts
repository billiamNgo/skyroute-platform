jest.mock('./src/features/auth/auth.routes', () => {
    const express = require('express');

    return {
        _esModule: true,
        defualt: express.Router(),
    };
});

import request from 'supertest';
import app from './server';

describe('Server routes', () => {
  it('GET / returns status 200', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
  });

  it('GET /protected without token returns 401', async () => {
    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
  });
});