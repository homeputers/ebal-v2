import { useEffect, useState } from 'react';

import {
  subscribeToAnnouncements,
  type Announcement,
} from '@/lib/announcer';

const defaultMessages = {
  polite: '',
  assertive: '',
};

type LiveMessages = typeof defaultMessages;

export function LiveAnnouncer() {
  const [messages, setMessages] = useState<LiveMessages>(() => ({ ...defaultMessages }));

  useEffect(() => {
    const unsubscribe = subscribeToAnnouncements((announcement: Announcement) => {
      setMessages((previous) =>
        announcement.politeness === 'assertive'
          ? { ...previous, assertive: announcement.message }
          : { ...previous, polite: announcement.message },
      );
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {messages.polite}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true" role="alert">
        {messages.assertive}
      </div>
    </>
  );
}

export default LiveAnnouncer;
