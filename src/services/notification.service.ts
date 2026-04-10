import { 
  isPermissionGranted, 
  requestPermission, 
  sendNotification 
} from '@tauri-apps/plugin-notification';

interface NotificationRequest {
  title: string;
  body: string;
  service?: string;
}

class NotificationService {
  private queue: NotificationRequest[] = [];
  private isProcessing = false;
  private permissionGranted = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      this.permissionGranted = await isPermissionGranted();
      if (!this.permissionGranted) {
        const permission = await requestPermission();
        this.permissionGranted = permission === 'granted';
      }
    } catch (err) {
      console.error('Failed to init notification service:', err);
    }
  }

  /**
   * Adds a notification to the queue to be sent one-by-one.
   */
  public async notify({ title, body, service }: NotificationRequest) {
    const brandedTitle = service ? `[${service.toUpperCase()}] ${title}` : `ArrDeck | ${title}`;
    
    this.queue.push({ title: brandedTitle, body });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    
    const next = this.queue.shift();
    if (next && this.permissionGranted) {
      try {
        sendNotification({
          title: next.title,
          body: next.body,
        });
      } catch (err) {
        console.error('Failed to send native notification:', err);
      }
    }

    // Wait 4 seconds between notifications as per user request (one at a time)
    setTimeout(() => this.processQueue(), 4000);
  }
}

export const notificationService = new NotificationService();
