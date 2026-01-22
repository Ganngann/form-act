import { validate } from 'class-validator';
import { UpdateFormationDto } from './update-formation.dto';

describe('UpdateFormationDto', () => {
  it('should validate with empty object (all optional)', async () => {
    const dto = new UpdateFormationDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with partial valid data', async () => {
    const dto = new UpdateFormationDto();
    dto.price = 200;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid data', async () => {
    const dto = new UpdateFormationDto();
    dto.price = -50;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
  });
});
