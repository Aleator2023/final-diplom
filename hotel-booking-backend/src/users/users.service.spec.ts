import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;

  
  const mockUserModel = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: jest.fn(() => mockUserModel), 
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user with hashed password', async () => {
    const userData = { email: 'test@example.com', passwordHash: 'password', name: 'Test' };
    const hashedPassword = await bcrypt.hash(userData.passwordHash, 10);

    mockUserModel.save.mockResolvedValue({ ...userData, passwordHash: hashedPassword });

    const newUser = await service.create(userData);
    expect(newUser.passwordHash).toEqual(hashedPassword);
    expect(mockUserModel.save).toHaveBeenCalled();
  });
});