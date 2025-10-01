export type PolitenessSetting = 'polite' | 'assertive';

export type Announcement = {
  id: number;
  message: string;
  politeness: PolitenessSetting;
};

type AnnouncementListener = (announcement: Announcement) => void;

const listeners = new Set<AnnouncementListener>();
const lastMessages = new Map<PolitenessSetting, string>();
let counter = 0;

export function subscribeToAnnouncements(listener: AnnouncementListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function announce(
  rawMessage: string,
  politeness: PolitenessSetting = 'polite',
) {
  const message = rawMessage.trim();

  if (!message) {
    return;
  }

  const lastMessage = lastMessages.get(politeness);

  if (lastMessage === message) {
    return;
  }

  lastMessages.set(politeness, message);

  const announcement: Announcement = {
    id: ++counter,
    message,
    politeness,
  };

  listeners.forEach((listener) => listener(announcement));
}
