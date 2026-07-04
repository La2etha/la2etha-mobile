import { render } from '@testing-library/react-native';
import { ScanRing } from '../ScanRing';

test('exposes captured/total progress for accessibility', () => {
  const { getByLabelText } = render(<ScanRing total={5} captured={2} />);
  getByLabelText('Captured 2 of 5');
});
