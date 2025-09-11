import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { throttleTime, debounceTime } from 'rxjs/operators';

export interface TouchGesture {
    type: 'swipe' | 'pinch' | 'tap' | 'longpress';
    direction?: 'left' | 'right' | 'up' | 'down';
    distance?: number;
    duration?: number;
    startX?: number;
    startY?: number;
    endX?: number;
    endY?: number;
}

@Injectable({
    providedIn: 'root'
})
export class TouchInteractionService {
    private touchStartSubject = new Subject<TouchEvent>();
    private touchMoveSubject = new Subject<TouchEvent>();
    private touchEndSubject = new Subject<TouchEvent>();

    private gestureSubject = new BehaviorSubject<TouchGesture | null>(null);
    public gesture$ = this.gestureSubject.asObservable();

    private isLongPress = false;
    private longPressTimer: any;
    private touchStartTime = 0;
    private touchStartX = 0;
    private touchStartY = 0;
    private touchEndX = 0;
    private touchEndY = 0;
    private minSwipeDistance = 50;
    private longPressDelay = 500;

    constructor() {
        this.initializeTouchListeners();
    }

    private initializeTouchListeners(): void {
        // Listen for touch events on the document
        fromEvent<TouchEvent>(document, 'touchstart', { passive: false })
            .subscribe(event => this.handleTouchStart(event));

        fromEvent<TouchEvent>(document, 'touchmove', { passive: false })
            .pipe(throttleTime(16)) // ~60fps
            .subscribe(event => this.handleTouchMove(event));

        fromEvent<TouchEvent>(document, 'touchend', { passive: false })
            .subscribe(event => this.handleTouchEnd(event));
    }

    private handleTouchStart(event: TouchEvent): void {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchStartTime = Date.now();
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.isLongPress = false;

            // Start long press timer
            this.longPressTimer = setTimeout(() => {
                this.isLongPress = true;
                this.emitGesture({
                    type: 'longpress',
                    startX: this.touchStartX,
                    startY: this.touchStartY,
                    duration: this.longPressDelay
                });
            }, this.longPressDelay);
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        if (event.touches.length === 1 && !this.isLongPress) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;

            // Cancel long press if user moves too much
            if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                this.cancelLongPress();
            }
        }
    }

    private handleTouchEnd(event: TouchEvent): void {
        this.cancelLongPress();

        if (event.changedTouches.length === 1) {
            const touch = event.changedTouches[0];
            this.touchEndX = touch.clientX;
            this.touchEndY = touch.clientY;

            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = this.touchEndY - this.touchStartY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const duration = Date.now() - this.touchStartTime;

            if (!this.isLongPress) {
                if (distance < 10 && duration < 300) {
                    // Tap gesture
                    this.emitGesture({
                        type: 'tap',
                        startX: this.touchStartX,
                        startY: this.touchStartY,
                        endX: this.touchEndX,
                        endY: this.touchEndY,
                        duration
                    });
                } else if (distance > this.minSwipeDistance) {
                    // Swipe gesture
                    const direction = this.getSwipeDirection(deltaX, deltaY);
                    this.emitGesture({
                        type: 'swipe',
                        direction,
                        distance,
                        startX: this.touchStartX,
                        startY: this.touchStartY,
                        endX: this.touchEndX,
                        endY: this.touchEndY,
                        duration
                    });
                }
            }
        }
    }

    private cancelLongPress(): void {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    private getSwipeDirection(deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    private emitGesture(gesture: TouchGesture): void {
        this.gestureSubject.next(gesture);

        // Add haptic feedback for supported devices
        this.addHapticFeedback(gesture);
    }

    private addHapticFeedback(gesture: TouchGesture): void {
        if ('vibrate' in navigator) {
            switch (gesture.type) {
                case 'tap':
                    navigator.vibrate(10);
                    break;
                case 'longpress':
                    navigator.vibrate([50, 50, 50]);
                    break;
                case 'swipe':
                    navigator.vibrate(25);
                    break;
            }
        }
    }

    // Public methods for components to use
    public enableSwipeNavigation(element: HTMLElement, onSwipeLeft?: () => void, onSwipeRight?: () => void): void {
        this.gesture$.pipe(debounceTime(100)).subscribe(gesture => {
            if (gesture && gesture.type === 'swipe') {
                if (gesture.direction === 'left' && onSwipeLeft) {
                    onSwipeLeft();
                } else if (gesture.direction === 'right' && onSwipeRight) {
                    onSwipeRight();
                }
            }
        });
    }

    public enablePullToRefresh(element: HTMLElement, onRefresh: () => void): void {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;

        element.addEventListener('touchstart', (e) => {
            if (element.scrollTop === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (isPulling) {
                currentY = e.touches[0].clientY;
                const pullDistance = currentY - startY;

                if (pullDistance > 100) {
                    // Show pull to refresh indicator
                    element.style.transform = `translateY(${Math.min(pullDistance * 0.5, 50)}px)`;
                }
            }
        }, { passive: true });

        element.addEventListener('touchend', () => {
            if (isPulling) {
                const pullDistance = currentY - startY;

                if (pullDistance > 100) {
                    onRefresh();
                }

                element.style.transform = '';
                isPulling = false;
            }
        }, { passive: true });
    }

    public addTouchRipple(element: HTMLElement): void {
        element.addEventListener('touchstart', (e) => {
            const ripple = document.createElement('div');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.touches[0].clientX - rect.left - size / 2;
            const y = e.touches[0].clientY - rect.top - size / 2;

            ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
      `;

            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }, { passive: true });
    }

    public optimizeScroll(element: HTMLElement): void {
        // Add smooth scrolling and momentum
        (element.style as any).webkitOverflowScrolling = 'touch';
        (element.style as any).overflowScrolling = 'touch';

        // Prevent overscroll bounce on iOS
        element.addEventListener('touchmove', (e) => {
            if (element.scrollTop === 0 && e.touches[0].clientY > e.touches[0].clientY) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// Add CSS animation for ripple effect
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
