import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';

beforeAll(async () => {
  await connectToDatabase();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase(); 
  await disconnectFromDatabase(); 
});

describe('User API', () => {
  describe('POST /api/users/register', () => {
    it('should register a user successfully', async () => {
      const res = await request(app).post('/api/users/register').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should return validation errors for invalid data', async () => {
      const res = await request(app).post('/api/users/register').send({
        username: '',
        email: 'invalid-email',
        password: '123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveLength(3); 
    });
  });

  describe('POST /api/users/login', () => {
    it('should login a user successfully', async () => {
      await request(app).post('/api/users/register').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/users/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token'); 
    });

    it('should return validation errors for invalid login data', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: '',
        password: '',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveLength(2); 
    });
  });
});