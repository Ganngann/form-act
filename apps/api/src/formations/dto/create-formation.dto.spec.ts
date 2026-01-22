import { validate } from 'class-validator';
import { CreateFormationDto } from './create-formation.dto';

describe('CreateFormationDto', () => {
  it('should validate with valid data', async () => {
    const dto = new CreateFormationDto();
    dto.title = 'Test Formation';
    dto.description = 'Description';
    dto.level = 'Beginner';
    dto.duration = '1 Day';
    dto.price = 100;
    dto.methodology = 'Agile';
    dto.inclusions = 'Slides';
    dto.agreementCode = 'CODE123';
    dto.imageUrl = 'https://example.com/image.jpg';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = new CreateFormationDto();
    // Missing title, description, etc.

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with invalid price (negative)', async () => {
    const dto = new CreateFormationDto();
    dto.title = 'Test';
    dto.description = 'Desc';
    dto.level = 'Beginner';
    dto.duration = '1 Day';
    dto.price = -10;

    const errors = await validate(dto);
    const priceError = errors.find((e) => e.property === 'price');
    expect(priceError).toBeDefined();
  });

  it('should fail validation with invalid URL', async () => {
    const dto = new CreateFormationDto();
    dto.title = 'Test';
    dto.description = 'Desc';
    dto.level = 'Beginner';
    dto.duration = '1 Day';
    dto.imageUrl = 'not-a-url';

    const errors = await validate(dto);
    const urlError = errors.find((e) => e.property === 'imageUrl');
    expect(urlError).toBeDefined();
  });
});
