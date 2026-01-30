import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
    // Basic render test - component should mount successfully
    expect(document.body).toBeTruthy();
  });
});
