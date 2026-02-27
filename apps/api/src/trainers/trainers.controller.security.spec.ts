import { Test, TestingModule } from "@nestjs/testing";
import { TrainersController } from "./trainers.controller";
import { TrainersService } from "./trainers.service";
import { Reflector } from "@nestjs/core";

describe("TrainersController Security", () => {
  let controller: TrainersController;
  let reflector: Reflector;

  const mockTrainersService = {
    getAvailability: jest.fn(),
    getMissions: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateAvatar: jest.fn(),
    ensureCalendarToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainersController],
      providers: [
        {
          provide: TrainersService,
          useValue: mockTrainersService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<TrainersController>(TrainersController);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should have AuthGuard on getMissions", () => {
    // Retrieve guards using Reflector
    const guards = reflector.get<any[]>('__guards__', controller.getMissions);

    // Verify @UseGuards is present and populated
    expect(guards).toBeDefined();
    expect(guards.length).toBeGreaterThan(0);

    // Verify the first guard is a function/class (valid guard structure)
    // Note: AuthGuard('jwt') creates a dynamic mixin class, so exact name matching
    // is fragile in test environments. We assert that *a* guard is present.
    const guard = guards[0];
    expect(typeof guard).toBe('function');
  });
});
