import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module'; 
import { UsersService } from './users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService = { findAll: () => [{ email: 'test@example.com', name: 'Test User' }] };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect(usersService.findAll());
  });

  afterAll(async () => {
    await app.close();
  });
});