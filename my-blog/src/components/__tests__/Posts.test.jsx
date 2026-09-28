import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Posts from '../Posts';
import lucia from '../../lucia';

vi.mock('../../lucia', () => ({
  default: {
    pageView: vi.fn(),
  },
}));

vi.mock('../../data/posts', () => ({
  posts: [
    { id: 'one', date: 'Jan 1st, 2025', title: 'First' },
    { id: 'two', date: 'Feb 2nd 2025', title: 'Second' },
  ],
}));

describe('Posts', () => {
  it('calls lucia.pageView with "posts" on render', () => {
    render(
      <MemoryRouter>
        <Posts />
      </MemoryRouter>
    );
    expect(lucia.pageView).toHaveBeenCalledWith('posts');
  });

  it('renders all posts with dates and correct links', () => {
    render(
      <MemoryRouter>
        <Posts />
      </MemoryRouter>
    );

    expect(screen.getByText('Jan 1st, 2025')).toBeInTheDocument();
    expect(screen.getByText('Feb 2nd 2025')).toBeInTheDocument();

    const firstLink = screen.getByRole('link', { name: 'First' });
    const secondLink = screen.getByRole('link', { name: 'Second' });

    expect(firstLink).toHaveAttribute('href', '/post/one');
    expect(secondLink).toHaveAttribute('href', '/post/two');
  });

  it('lists posts newest first', () => {
    render(
      <MemoryRouter>
        <Posts />
      </MemoryRouter>
    );

    const titles = screen.getAllByRole('link').map((link) => link.textContent);
    expect(titles).toEqual(['Second', 'First']);
  });
});
