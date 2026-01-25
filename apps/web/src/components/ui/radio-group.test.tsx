import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { vi } from 'vitest';

describe('RadioGroup', () => {
  it('renders correctly', () => {
    render(
      <RadioGroup defaultValue="option-one">
        <RadioGroupItem value="option-one" id="option-one" aria-label="Option One" />
        <RadioGroupItem value="option-two" id="option-two" aria-label="Option Two" />
      </RadioGroup>
    );
    expect(screen.getByLabelText('Option One')).toBeChecked();
    expect(screen.getByLabelText('Option Two')).not.toBeChecked();
  });

  it('changes value on click', () => {
    const handleValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={handleValueChange}>
         <RadioGroupItem value="option-one" id="option-one" aria-label="Option One" />
         <RadioGroupItem value="option-two" id="option-two" aria-label="Option Two" />
      </RadioGroup>
    );
    fireEvent.click(screen.getByLabelText('Option Two'));
    expect(handleValueChange).toHaveBeenCalledWith('option-two');
  });
});
