import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'es' | 'fr' | 'de';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<Language>('en');
  
  public readonly availableLanguages: LanguageConfig[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
  ];

  constructor() {
    this.initializeLanguage();
  }

  get language$() {
    return this.currentLanguage.asObservable();
  }

  get currentLanguageValue(): Language {
    return this.currentLanguage.value;
  }

  private initializeLanguage() {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && this.isValidLanguage(savedLanguage)) {
      this.setLanguage(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (this.isValidLanguage(browserLang)) {
        this.setLanguage(browserLang);
      } else {
        this.setLanguage('en');
      }
    }
  }

  private isValidLanguage(lang: string): lang is Language {
    return this.availableLanguages.some(l => l.code === lang);
  }

  setLanguage(language: Language) {
    this.currentLanguage.next(language);
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('data-lang', language);
  }

  getLanguageConfig(language: Language): LanguageConfig | undefined {
    return this.availableLanguages.find(l => l.code === language);
  }

  // Translation helper (basic implementation)
  translate(key: string, params?: Record<string, string>): string {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'settings.title': 'Settings',
        'settings.notifications': 'Notifications',
        'settings.privacy': 'Privacy',
        'settings.display': 'Display',
        'settings.theme': 'Theme',
        'settings.language': 'Language',
        'settings.timeFormat': 'Time Format',
        'settings.save': 'Save Changes',
        'settings.saved': 'Settings Saved',
        'settings.error': 'Error saving settings',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.back': 'Back',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success'
      },
      es: {
        'settings.title': 'Configuración',
        'settings.notifications': 'Notificaciones',
        'settings.privacy': 'Privacidad',
        'settings.display': 'Pantalla',
        'settings.theme': 'Tema',
        'settings.language': 'Idioma',
        'settings.timeFormat': 'Formato de Hora',
        'settings.save': 'Guardar Cambios',
        'settings.saved': 'Configuración Guardada',
        'settings.error': 'Error al guardar configuración',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.back': 'Atrás',
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito'
      },
      fr: {
        'settings.title': 'Paramètres',
        'settings.notifications': 'Notifications',
        'settings.privacy': 'Confidentialité',
        'settings.display': 'Affichage',
        'settings.theme': 'Thème',
        'settings.language': 'Langue',
        'settings.timeFormat': 'Format d\'Heure',
        'settings.save': 'Enregistrer les Modifications',
        'settings.saved': 'Paramètres Enregistrés',
        'settings.error': 'Erreur lors de l\'enregistrement',
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler',
        'common.back': 'Retour',
        'common.loading': 'Chargement...',
        'common.error': 'Erreur',
        'common.success': 'Succès'
      },
      de: {
        'settings.title': 'Einstellungen',
        'settings.notifications': 'Benachrichtigungen',
        'settings.privacy': 'Datenschutz',
        'settings.display': 'Anzeige',
        'settings.theme': 'Design',
        'settings.language': 'Sprache',
        'settings.timeFormat': 'Zeitformat',
        'settings.save': 'Änderungen Speichern',
        'settings.saved': 'Einstellungen Gespeichert',
        'settings.error': 'Fehler beim Speichern',
        'common.save': 'Speichern',
        'common.cancel': 'Abbrechen',
        'common.back': 'Zurück',
        'common.loading': 'Laden...',
        'common.error': 'Fehler',
        'common.success': 'Erfolg'
      }
    };

    const langTranslations = translations[this.currentLanguage.value];
    let translation = langTranslations[key] || key;

    // Replace parameters
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }

    return translation;
  }
} 