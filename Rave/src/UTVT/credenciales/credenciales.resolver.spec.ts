import { Test, TestingModule } from '@nestjs/testing';
import { CredencialesResolver } from './credenciales.resolver';
import { CredencialesService } from './credenciales.service';

describe('CredencialesResolver', () => {
  let resolver: CredencialesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CredencialesResolver, CredencialesService],
    }).compile();

    resolver = module.get<CredencialesResolver>(CredencialesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
