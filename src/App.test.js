import React from 'react';
import { render, screen } from '@testing-library/react';

test('renders dummy text', () => {
  render(<div>Hello UshaSree</div>);
  expect(screen.getByText(/usha/i)).toBeInTheDocument();
});
