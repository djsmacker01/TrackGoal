import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  private defaultData: SEOData = {
    title: 'TrackGoal - Achieve Your Goals with Smart Tracking',
    description: 'TrackGoal helps you set, track, and achieve your personal and professional goals with intelligent progress tracking, milestone management, and detailed analytics.',
    keywords: 'goal tracking, personal goals, goal management, progress tracking, milestone tracking, productivity, goal achievement',
    author: 'TrackGoal Team',
    ogTitle: 'TrackGoal - Achieve Your Goals with Smart Tracking',
    ogDescription: 'Set, track, and achieve your goals with intelligent progress tracking and detailed analytics.',
    ogImage: '/assets/images/trackgoal-og-image.png',
    ogUrl: 'https://trackgoal.app',
    twitterCard: 'summary_large_image',
    twitterTitle: 'TrackGoal - Achieve Your Goals with Smart Tracking',
    twitterDescription: 'Set, track, and achieve your goals with intelligent progress tracking and detailed analytics.',
    twitterImage: '/assets/images/trackgoal-twitter-image.png',
    canonicalUrl: 'https://trackgoal.app'
  };

  constructor(
    private title: Title,
    private meta: Meta
  ) {}

  updateSEO(data: SEOData = {}): void {
    const seoData = { ...this.defaultData, ...data };
    
    // Update title
    if (seoData.title) {
      this.title.setTitle(seoData.title);
    }

    // Update meta tags
    this.updateMetaTags(seoData);
    
    // Update Open Graph tags
    this.updateOpenGraphTags(seoData);
    
    // Update Twitter Card tags
    this.updateTwitterCardTags(seoData);
    
    // Update canonical URL
    this.updateCanonicalUrl(seoData.canonicalUrl);
    
    // Update structured data
    if (seoData.structuredData) {
      this.updateStructuredData(seoData.structuredData);
    }
  }

  private updateMetaTags(data: SEOData): void {
    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
    }
    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }
    if (data.author) {
      this.meta.updateTag({ name: 'author', content: data.author });
    }
  }

  private updateOpenGraphTags(data: SEOData): void {
    if (data.ogTitle) {
      this.meta.updateTag({ property: 'og:title', content: data.ogTitle });
    }
    if (data.ogDescription) {
      this.meta.updateTag({ property: 'og:description', content: data.ogDescription });
    }
    if (data.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: data.ogImage });
    }
    if (data.ogUrl) {
      this.meta.updateTag({ property: 'og:url', content: data.ogUrl });
    }
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'TrackGoal' });
  }

  private updateTwitterCardTags(data: SEOData): void {
    if (data.twitterCard) {
      this.meta.updateTag({ name: 'twitter:card', content: data.twitterCard });
    }
    if (data.twitterTitle) {
      this.meta.updateTag({ name: 'twitter:title', content: data.twitterTitle });
    }
    if (data.twitterDescription) {
      this.meta.updateTag({ name: 'twitter:description', content: data.twitterDescription });
    }
    if (data.twitterImage) {
      this.meta.updateTag({ name: 'twitter:image', content: data.twitterImage });
    }
  }

  private updateCanonicalUrl(url?: string): void {
    if (url) {
      let canonical = this.meta.getTag('rel="canonical"');
      if (canonical) {
        this.meta.removeTag('rel="canonical"');
      }
      this.meta.addTag({ rel: 'canonical', href: url });
    }
  }

  private updateStructuredData(data: any): void {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Specific SEO methods for different pages
  setDashboardSEO(): void {
    this.updateSEO({
      title: 'Dashboard - TrackGoal',
      description: 'View your goal progress, recent activities, and insights on your personal dashboard.',
      keywords: 'dashboard, goal progress, goal tracking, personal goals, progress overview',
      ogTitle: 'Dashboard - TrackGoal',
      ogDescription: 'View your goal progress, recent activities, and insights on your personal dashboard.',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'TrackGoal Dashboard',
        'description': 'Personal goal tracking dashboard',
        'applicationCategory': 'ProductivityApplication',
        'operatingSystem': 'Web Browser'
      }
    });
  }

  setGoalsListSEO(): void {
    this.updateSEO({
      title: 'My Goals - TrackGoal',
      description: 'View and manage all your personal and professional goals in one place.',
      keywords: 'goals list, goal management, personal goals, professional goals, goal tracking',
      ogTitle: 'My Goals - TrackGoal',
      ogDescription: 'View and manage all your personal and professional goals in one place.',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'My Goals',
        'description': 'List of personal and professional goals'
      }
    });
  }

  setGoalDetailSEO(goalTitle: string, goalDescription: string): void {
    this.updateSEO({
      title: `${goalTitle} - Goal Details - TrackGoal`,
      description: `Track progress and manage milestones for: ${goalDescription}`,
      keywords: `goal details, ${goalTitle}, goal tracking, milestone management, progress tracking`,
      ogTitle: `${goalTitle} - Goal Details - TrackGoal`,
      ogDescription: `Track progress and manage milestones for: ${goalDescription}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        'name': goalTitle,
        'description': goalDescription,
        'genre': 'Goal Tracking'
      }
    });
  }

  setAnalyticsSEO(): void {
    this.updateSEO({
      title: 'Analytics & Insights - TrackGoal',
      description: 'Get detailed insights into your goal progress, trends, and performance analytics.',
      keywords: 'goal analytics, progress insights, goal statistics, performance tracking, goal trends',
      ogTitle: 'Analytics & Insights - TrackGoal',
      ogDescription: 'Get detailed insights into your goal progress, trends, and performance analytics.',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'TrackGoal Analytics',
        'description': 'Goal progress analytics and insights',
        'applicationCategory': 'AnalyticsApplication'
      }
    });
  }

  setLoginSEO(): void {
    this.updateSEO({
      title: 'Login - TrackGoal',
      description: 'Sign in to your TrackGoal account to continue tracking your goals and progress.',
      keywords: 'login, sign in, trackgoal account, goal tracking login',
      ogTitle: 'Login - TrackGoal',
      ogDescription: 'Sign in to your TrackGoal account to continue tracking your goals and progress.',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'TrackGoal Login',
        'description': 'Sign in to TrackGoal'
      }
    });
  }

  setSignupSEO(): void {
    this.updateSEO({
      title: 'Sign Up - TrackGoal',
      description: 'Create your free TrackGoal account and start achieving your goals with smart tracking.',
      keywords: 'sign up, register, create account, trackgoal registration, goal tracking signup',
      ogTitle: 'Sign Up - TrackGoal',
      ogDescription: 'Create your free TrackGoal account and start achieving your goals with smart tracking.',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'TrackGoal Sign Up',
        'description': 'Create your TrackGoal account'
      }
    });
  }
} 