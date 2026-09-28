import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter, useParams } from 'react-router-dom';
import PostPage from '../PostPage';
import lucia from '../../lucia';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock('../../lucia', () => ({
  default: {
    pageView: vi.fn(),
    trackConversion: vi.fn(),
  },
}));

vi.mock('../../data/posts', () => ({
  posts: [
    {
      id: 'one',
      date: 'Jan 1, 2025',
      title: 'Hello World',
      fullArticleUrl: 'https://example.com/full',
      content: '<p>Body</p>',
    },
    {
      id: 'math',
      date: 'Jan 2, 2025',
      title: 'Math Post',
      content: String.raw`<p>Inline \(Q_i^l(s, a_J)\) costs $5 and $10.</p><p>$$V_i^l = \max_{a_i' \in \mathcal{A}_i} \underbrace{P(\tilde{g}_j)}_{\text{goal}} \tag{4}$$</p>`,
    },
  ],
}));

describe('PostPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/post/one' },
      writable: true,
    });
  });

  it('renders a valid post with title, date, and full article link', () => {
    vi.mocked(useParams).mockReturnValue({ id: 'one' });

    render(
      <MemoryRouter>
        <PostPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2025')).toBeInTheDocument();

    const fullLink = screen.getByRole('link', { name: /read the full article/i });
    expect(fullLink).toHaveAttribute('href', 'https://example.com/full');

    expect(lucia.pageView).toHaveBeenCalledTimes(1);
    expect(lucia.pageView).toHaveBeenCalledWith('PostPage');
  });

  it('renders 404 state and tracks conversion when back link clicked', async () => {
    vi.mocked(useParams).mockReturnValue({ id: 'missing' });
    window.location.pathname = '/post/missing';

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PostPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Post Not Found')).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /back to posts/i });
    await user.click(backLink);

    expect(lucia.trackConversion).toHaveBeenCalledTimes(1);
    expect(lucia.trackConversion).toHaveBeenCalledWith(
      'back_to_post_click',
      0,
      expect.objectContaining({ page: '/post/missing' })
    );

    expect(lucia.pageView).toHaveBeenCalledTimes(1);
    expect(lucia.pageView).toHaveBeenCalledWith('PostPage');
  });

  it('renders LaTeX with KaTeX and leaves dollar amounts alone', async () => {
    vi.mocked(useParams).mockReturnValue({ id: 'math' });

    const { container } = render(
      <MemoryRouter>
        <PostPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(container.querySelectorAll('.katex').length).toBe(2));
    expect(container.querySelectorAll('.katex-display').length).toBe(1);
    expect(container.querySelector('.katex-error')).toBeNull();
    expect(container.textContent).toContain('costs $5 and $10.');
  });
});
