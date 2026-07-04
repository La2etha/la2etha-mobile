import { render, fireEvent } from '@testing-library/react-native';
import { GlowButton } from '../GlowButton';

test('fires onPress with the label visible', () => {
  const fn = jest.fn();
  const { getByText } = render(<GlowButton label="Continue" onPress={fn} />);
  fireEvent.press(getByText('Continue'));
  expect(fn).toHaveBeenCalled();
});
