import { Injectable, ComponentRef, createComponent, ApplicationRef, Injector, Type } from '@angular/core';
import { CustomNotificationComponent, NotificationData } from '../components/custom-notification/custom-notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: ComponentRef<CustomNotificationComponent>[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  show(data: NotificationData): void {
    // Create component
    const componentRef = createComponent(CustomNotificationComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    // Set input data
    componentRef.instance.data = data;

    // Handle close event
    componentRef.instance.closeNotification.subscribe(() => {
      this.removeNotification(componentRef);
    });

    // Add to DOM
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.right = '0';
    container.style.zIndex = '10000';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    container.appendChild(componentRef.location.nativeElement);
    container.style.pointerEvents = 'auto';

    // Store reference
    this.notifications.push(componentRef);

    // Auto-remove after duration
    if (data.duration && data.duration > 0) {
      setTimeout(() => {
        this.removeNotification(componentRef);
      }, data.duration);
    }

    // Attach to application
    this.appRef.attachView(componentRef.hostView);
  }

  success(title: string, message: string, duration: number = 5000): void {
    this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration: number = 7000): void {
    this.show({
      type: 'error',
      title,
      message,
      duration
    });
  }

  warning(title: string, message: string, duration: number = 6000): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration: number = 5000): void {
    this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  private removeNotification(componentRef: ComponentRef<CustomNotificationComponent>): void {
    const index = this.notifications.indexOf(componentRef);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }

    // Animate out
    const element = componentRef.location.nativeElement;
    element.style.animation = 'slideOut 0.3s ease-in forwards';

    setTimeout(() => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      
      // Remove container if empty
      const container = element.parentElement;
      if (container && container.children.length === 0) {
        document.body.removeChild(container);
      }
    }, 300);
  }

  clearAll(): void {
    this.notifications.forEach(componentRef => {
      this.removeNotification(componentRef);
    });
  }
} 