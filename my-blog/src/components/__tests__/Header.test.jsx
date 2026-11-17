import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';

vi.mock('../../lucia', () => ({
  default: { pageView: vi.fn() },
}));

describe('Header', () => {
  it('ends the nav with a Pipeline Audit link to /pipeline-audit', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const links = screen.getByRole('navigation').querySelectorAll('a');
    const last = links[links.length - 1];
    expect(last).toHaveTextContent('Pipeline Audit');
    expect(last).toHaveAttribute('href', '/pipeline-audit');
  });
});
