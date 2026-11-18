import { useEffect, useRef } from 'react';
import lucia from '../lucia';
import auditConfig from '../../content/pipeline-audit/config.json';

// /book-audit: the "Book your free audit" link in the Pipeline Audit PDF points
// here. A PDF can't run the Lucia SDK, so this page records the click as a
// Lucia conversion and then forwards the visitor to the booking page.
//
// This measures clicks on the booking link, not completed bookings.
export const BOOKING_CONVERSION_TAG = 'audit_booking_click';
export const BOOKING_CONVERSION_VALUE = 0.25;

// Don't keep the visitor waiting if Lucia is slow or blocked.
const MAX_WAIT_MS = 1500;

function BookAudit() {
  const destination = auditConfig.auditBookingUrl;
  const started = useRef(false);

  useEffect(() => {
    // Guards against React StrictMode running the effect twice in development.
    if (started.current || !destination) return;
    started.current = true;

    const track = lucia.trackConversion(BOOKING_CONVERSION_TAG, BOOKING_CONVERSION_VALUE, {
      source: 'pipeline-audit-pdf',
      destination,
    });
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
    Promise.race([track, timeout]).finally(() => {
      window.location.replace(destination);
    });
  }, [destination]);

  return (
    <div className="max-w-[768px] mx-auto px-4 py-12 text-gray-700">
      {destination ? (
        <p>
          Taking you to the booking page…{' '}
          <a href={destination} className="underline text-gray-900">
            Continue
          </a>
        </p>
      ) : (
        <p>The booking link isn&apos;t set up yet. Please check back soon.</p>
      )}
    </div>
  );
}

export default BookAudit;
