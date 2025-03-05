export const CONVERSATION_STATUSES = {
  NEW: 'new',
  OPEN: 'open',
  BOT: 'bot',
  PENDDING: 'pending',
  CLOSED: 'closed',
  ALL_LIST: ['new', 'open', 'bot', 'pending', 'closed']
};

export const MESSAGE_STATUSES = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  SEEN: 'seen',
  FAILED: 'failed'
};

export const NOTIFICATION_TYPE = {
  gmail: 'You have a new email',
  lead: 'You have got a new lead',
  messenger: 'You have a new message from messenger'
};
