
/**
 * WebSocket Debugging Utilities
 * 
 * This file provides helpful utilities for debugging WebSocket connections
 * in the inbox module. It wraps console methods with detailed context
 * information and formatting specific to WebSocket operations.
 */

const DEBUG_ENABLED = true;

// Utility for WebSocket logging with standardized format
export const wsLog = {
  // Information level logs (blue)
  info: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[WebSocket][${context}] ${message}`, 
      'color: #0066cc; font-weight: bold;', 
      data || ''
    );
  },
  
  // Success level logs (green)
  success: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[WebSocket][${context}] ${message}`, 
      'color: #00cc66; font-weight: bold;', 
      data || ''
    );
  },
  
  // Warning level logs (orange)
  warn: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.warn(
      `%c[WebSocket][${context}] ${message}`, 
      'color: #ff9900; font-weight: bold;', 
      data || ''
    );
  },
  
  // Error level logs (red)
  error: (context: string, message: string, error?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.error(
      `%c[WebSocket][${context}] ${message}`, 
      'color: #cc0000; font-weight: bold;',
      error || ''
    );
  },
  
  // Connection lifecycle logs (purple)
  connection: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[WebSocket][${context}] ${message}`, 
      'color: #9900cc; font-weight: bold;', 
      data || ''
    );
  },
  
  // Message lifecycle logs (cyan)
  message: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[WebSocket][${context}] ${message}`, 
      'color: #00cccc; font-weight: bold;', 
      data || ''
    );
  }
};

// Monitor connection states
export const wsConnectionMonitor = {
  connected: (context: string, id?: string) => {
    wsLog.success(context, `Connection established${id ? ` for ${id}` : ''}`);
  },
  
  disconnected: (context: string, id?: string, reason?: string) => {
    wsLog.warn(context, `Connection closed${id ? ` for ${id}` : ''}${reason ? `: ${reason}` : ''}`);
  },
  
  connecting: (context: string, id?: string) => {
    wsLog.info(context, `Attempting to connect${id ? ` for ${id}` : ''}`);
  },
  
  error: (context: string, error: any, id?: string) => {
    wsLog.error(context, `Connection error${id ? ` for ${id}` : ''}`, error);
  },
  
  reconnecting: (context: string, attempt: number, id?: string) => {
    wsLog.warn(context, `Reconnection attempt #${attempt}${id ? ` for ${id}` : ''}`);
  }
};

// Export a utility for monitoring subscription lifecycle
export const wsSubscriptionMonitor = {
  created: (context: string, subscriptionName: string, variables?: any) => {
    wsLog.info(context, `Subscription created: ${subscriptionName}`, variables);
  },
  
  active: (context: string, subscriptionName: string) => {
    wsLog.success(context, `Subscription active: ${subscriptionName}`);
  },
  
  data: (context: string, subscriptionName: string, data: any) => {
    wsLog.message(context, `Subscription data received: ${subscriptionName}`, data);
  },
  
  error: (context: string, subscriptionName: string, error: any) => {
    wsLog.error(context, `Subscription error: ${subscriptionName}`, error);
  },
  
  closed: (context: string, subscriptionName: string) => {
    wsLog.warn(context, `Subscription closed: ${subscriptionName}`);
  }
};

export default {
  wsLog,
  wsConnectionMonitor,
  wsSubscriptionMonitor
};
