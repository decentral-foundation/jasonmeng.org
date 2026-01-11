import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CookieConsent from '../CookieConsent';
import lucia from '../../lucia';

vi.mock('../../lucia', () => ({
  default: {
    buttonClick: vi.fn(),
  },
}));

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows the banner when no consent value is stored', () => {
    render(<CookieConsent />);
    expect(
      screen.getByText(/we use cookies to improve your experience/i)
    ).toBeInTheDocument();
  });

  it('hides the banner when consent is already granted', () => {
    localStorage.setItem('cookieConsent', 'true');
    render(<CookieConsent />);
    expect(
      screen.queryByText(/we use cookies to improve your experience/i)
    ).not.toBeInTheDocument();
  });

  it('accept click stores true, hides, and tracks button click', async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    await user.click(screen.getByRole('button', { name: /accept/i }));

    expect(localStorage.getItem('cookieConsent')).toBe('true');
    expect(
      screen.queryByText(/we use cookies to improve your experience/i)
    ).not.toBeInTheDocument();
    expect(lucia.buttonClick).toHaveBeenCalledWith('accept_cookie_consent');
  });

  it('decline click stores false, hides, and tracks button click', async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    await user.click(screen.getByRole('button', { name: /no thanks/i }));

    expect(localStorage.getItem('cookieConsent')).toBe('false');
    expect(
      screen.queryByText(/we use cookies to improve your experience/i)
    ).not.toBeInTheDocument();
    expect(lucia.buttonClick).toHaveBeenCalledWith('decline_cookie_consent');
  });
});
