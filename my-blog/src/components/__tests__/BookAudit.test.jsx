import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BookAudit from '../BookAudit';
import lucia from '../../lucia';

vi.mock('../../lucia', () => ({
  default: { trackConversion: vi.fn().mockResolvedValue(undefined) },
}));

describe('BookAudit', () => {
  it('records a $0.25 Lucia conversion, then forwards to Calendly', async () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { ...window.location, replace });

    render(<BookAudit />);

    expect(lucia.trackConversion).toHaveBeenCalledTimes(1);
    expect(lucia.trackConversion).toHaveBeenCalledWith('audit_booking_click', 0.25, {
      source: 'pipeline-audit-pdf',
      destination: 'https://calendly.com/lingqingmeng',
    });
    await waitFor(() => expect(replace).toHaveBeenCalledWith('https://calendly.com/lingqingmeng'));

    vi.unstubAllGlobals();
  });
});
