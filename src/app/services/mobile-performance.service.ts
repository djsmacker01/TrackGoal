import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent, interval } from 'rxjs';
import { throttleTime, debounceTime, takeUntil } from 'rxjs/operators';

export interface PerformanceMetrics {
    fps: number;
    memoryUsage: number;
    isLowEndDevice: boolean;
    connectionType: string;
    batteryLevel?: number;
}

@Injectable({
    providedIn: 'root'
})
export class MobilePerformanceService {
    private performanceSubject = new BehaviorSubject<PerformanceMetrics>({
        fps: 60,
        memoryUsage: 0,
        isLowEndDevice: false,
        connectionType: 'unknown'
    });

    public performance$ = this.performanceSubject.asObservable();

    private isLowEndDevice = false;
    private connectionType = 'unknown';
    private batteryLevel: number | undefined;
    private fpsCounter = 0;
    private lastTime = 0;
    private frameCount = 0;

    constructor(private ngZone: NgZone) {
        this.initializePerformanceMonitoring();
        this.detectDeviceCapabilities();
        this.monitorNetworkConnection();
        this.monitorBatteryStatus();
    }

    private initializePerformanceMonitoring(): void {
        // Monitor FPS
        this.ngZone.runOutsideAngular(() => {
            const measureFPS = () => {
                const now = performance.now();
                this.frameCount++;

                if (now - this.lastTime >= 1000) {
                    this.fpsCounter = Math.round((this.frameCount * 1000) / (now - this.lastTime));
                    this.frameCount = 0;
                    this.lastTime = now;

                    this.updatePerformanceMetrics();
                }

                requestAnimationFrame(measureFPS);
            };

            measureFPS();
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            interval(5000).subscribe(() => {
                this.updatePerformanceMetrics();
            });
        }

        // Monitor page visibility
        fromEvent(document, 'visibilitychange')
            .subscribe(() => {
                if (document.hidden) {
                    this.pauseNonEssentialOperations();
                } else {
                    this.resumeOperations();
                }
            });
    }

    private detectDeviceCapabilities(): void {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        // Check for low-end device indicators
        const indicators = [
            navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2, // Low CPU cores
            screen.width <= 480 || screen.height <= 800, // Small screen
            !window.matchMedia('(min-resolution: 2dppx)').matches, // Low DPI
            !gl, // No WebGL support
            navigator.userAgent.includes('Android') && navigator.userAgent.includes('Chrome/5'), // Old Android
        ];

        this.isLowEndDevice = indicators.filter(Boolean).length >= 2;

        // Apply performance optimizations for low-end devices
        if (this.isLowEndDevice) {
            this.applyLowEndOptimizations();
        }
    }

    private applyLowEndOptimizations(): void {
        // Reduce animation complexity
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        document.documentElement.style.setProperty('--transition-duration', '0.15s');

        // Disable expensive visual effects
        document.documentElement.style.setProperty('--backdrop-filter', 'none');
        document.documentElement.style.setProperty('--box-shadow', '0 2px 4px rgba(0,0,0,0.1)');

        // Reduce image quality
        this.optimizeImages();

        // Limit concurrent operations
        this.limitConcurrentOperations();
    }

    private optimizeImages(): void {
        // Add lazy loading to all images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });

        // Use lower quality images for low-end devices
        if (this.isLowEndDevice) {
            const style = document.createElement('style');
            style.textContent = `
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
      `;
            document.head.appendChild(style);
        }
    }

    private limitConcurrentOperations(): void {
        // Limit the number of concurrent HTTP requests
        const originalFetch = window.fetch;
        let activeRequests = 0;
        const maxConcurrentRequests = 3;
        const requestQueue: Array<() => void> = [];

        window.fetch = (...args) => {
            return new Promise((resolve, reject) => {
                const executeRequest = () => {
                    activeRequests++;
                    originalFetch(...args)
                        .then(resolve)
                        .catch(reject)
                        .finally(() => {
                            activeRequests--;
                            if (requestQueue.length > 0) {
                                const nextRequest = requestQueue.shift();
                                nextRequest?.();
                            }
                        });
                };

                if (activeRequests < maxConcurrentRequests) {
                    executeRequest();
                } else {
                    requestQueue.push(executeRequest);
                }
            });
        };
    }

    private monitorNetworkConnection(): void {
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            this.connectionType = connection.effectiveType || connection.type || 'unknown';

            connection.addEventListener('change', () => {
                this.connectionType = connection.effectiveType || connection.type || 'unknown';
                this.updatePerformanceMetrics();

                // Adjust behavior based on connection
                this.adjustForConnectionType();
            });
        }
    }

    private adjustForConnectionType(): void {
        const isSlowConnection = ['slow-2g', '2g'].includes(this.connectionType);

        if (isSlowConnection) {
            // Disable auto-loading of non-critical resources
            this.disableNonCriticalFeatures();
        }
    }

    private disableNonCriticalFeatures(): void {
        // Disable animations for slow connections
        document.documentElement.style.setProperty('--animation-duration', '0s');
        document.documentElement.style.setProperty('--transition-duration', '0s');

        // Reduce image quality
        const style = document.createElement('style');
        style.textContent = `
      img {
        filter: blur(0.5px);
        image-rendering: -webkit-optimize-contrast;
      }
    `;
        document.head.appendChild(style);
    }

    private monitorBatteryStatus(): void {
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                this.batteryLevel = Math.round(battery.level * 100);

                battery.addEventListener('levelchange', () => {
                    this.batteryLevel = Math.round(battery.level * 100);
                    this.updatePerformanceMetrics();

                    // Adjust performance based on battery level
                    if (this.batteryLevel < 20) {
                        this.enablePowerSavingMode();
                    }
                });
            });
        }
    }

    private enablePowerSavingMode(): void {
        // Reduce frame rate
        document.documentElement.style.setProperty('--animation-duration', '0.3s');

        // Disable non-essential animations
        const style = document.createElement('style');
        style.textContent = `
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
    `;
        document.head.appendChild(style);
    }

    private updatePerformanceMetrics(): void {
        const metrics: PerformanceMetrics = {
            fps: this.fpsCounter,
            memoryUsage: this.getMemoryUsage(),
            isLowEndDevice: this.isLowEndDevice,
            connectionType: this.connectionType,
            batteryLevel: this.batteryLevel
        };

        this.performanceSubject.next(metrics);
    }

    private getMemoryUsage(): number {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            return Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
        }
        return 0;
    }

    private pauseNonEssentialOperations(): void {
        // Pause animations and timers when page is not visible
        document.documentElement.style.setProperty('--animation-play-state', 'paused');
    }

    private resumeOperations(): void {
        // Resume operations when page becomes visible
        document.documentElement.style.setProperty('--animation-play-state', 'running');
    }

    // Public methods
    public isLowEnd(): boolean {
        return this.isLowEndDevice;
    }

    public getConnectionType(): string {
        return this.connectionType;
    }

    public getBatteryLevel(): number | undefined {
        return this.batteryLevel;
    }

    public optimizeForMobile(): void {
        // Preload critical resources
        this.preloadCriticalResources();

        // Optimize touch interactions
        this.optimizeTouchInteractions();

        // Enable service worker caching
        this.enableServiceWorkerCaching();
    }

    private preloadCriticalResources(): void {
        // Preload critical CSS and fonts
        const criticalResources = [
            '/assets/fonts/inter.woff2',
            '/assets/css/critical.css'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.woff2') ? 'font' : 'style';
            if (resource.endsWith('.woff2')) {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }

    private optimizeTouchInteractions(): void {
        // Add touch-action CSS property to prevent default behaviors
        const style = document.createElement('style');
        style.textContent = `
      * {
        touch-action: manipulation;
      }
      
      .scrollable {
        touch-action: pan-y;
      }
      
      .swipeable {
        touch-action: pan-x;
      }
    `;
        document.head.appendChild(style);
    }

    private enableServiceWorkerCaching(): void {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    public getPerformanceMetrics(): PerformanceMetrics {
        return this.performanceSubject.value;
    }
}
