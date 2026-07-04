import { render } from '@testing-library/react-native';
import { StateView } from '../StateView';

test('error state shows the friendly message and a retry action', () => {
  const { getByText } = render(
    <StateView
      kind="error"
      title="Can't load"
      message="Check your connection."
      actionLabel="Retry"
      onAction={() => {}}
    />,
  );
  getByText('Check your connection.');
  getByText('Retry');
});
