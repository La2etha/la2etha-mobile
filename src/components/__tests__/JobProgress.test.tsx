import { render } from '@testing-library/react-native';
import { JobProgress } from '../JobProgress';

test('determinate mode shows the real count', () => {
  const { getByText } = render(<JobProgress title="Scanning…" processed={3} total={12} />);
  getByText('3 / 12');
});

test('indeterminate mode (no total) shows the hint, no count', () => {
  const { getByText, queryByText } = render(
    <JobProgress title="Finding you…" hint="This usually takes a few seconds." total={0} />
  );
  getByText('This usually takes a few seconds.');
  expect(queryByText(/\/ 0/)).toBeNull();
});
