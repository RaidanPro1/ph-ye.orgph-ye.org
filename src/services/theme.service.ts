import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface Theme {
  primaryColor: string;
  fontFamily: string;
  logoUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // FIX: Explicitly type the injected document as Document.
  private document: Document = inject(DOCUMENT);

  theme = signal<Theme>({
    primaryColor: '#0D2B6B', // Default ph-blue
    fontFamily: "'Cairo', sans-serif",
    logoUrl: 'assets/logos/press-house-logo.png',
  });

  constructor() {
    this.loadTheme();
    effect(() => this.applyTheme(this.theme()));
  }

  private applyTheme(theme: Theme) {
    const styleTag = this.document.getElementById('app-theme');
    if (styleTag) {
      styleTag.innerHTML = `
        :root {
          --ph-blue-default: ${theme.primaryColor};
          --ph-blue-dark: ${this.adjustColor(theme.primaryColor, -20)};
          --app-font-family: ${theme.fontFamily};
        }
        body, h1, h2, h3, h4, h5, h6 {
          font-family: var(--app-font-family);
        }
        .bg-ph-blue { background-color: var(--ph-blue-default); }
        .text-ph-blue { color: var(--ph-blue-default); }
        .border-ph-blue { border-color: var(--ph-blue-default); }
        .bg-ph-blue-dark { background-color: var(--ph-blue-dark); }
        .hover\\:bg-ph-blue-dark:hover { background-color: var(--ph-blue-dark); }
        .from-ph-blue { --tw-gradient-from: var(--ph-blue-default); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-from); }
        .to-ph-blue-dark { --tw-gradient-to: var(--ph-blue-dark); }
      `;
    }
    const logos = this.document.querySelectorAll('img[src="assets/logos/press-house-logo.png"], img[src="assets/logo.png"]');
    logos.forEach(logo => (logo as HTMLImageElement).src = theme.logoUrl);
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      try {
        this.theme.set(JSON.parse(savedTheme));
      } catch (e) {
        console.error('Failed to parse saved theme', e);
        localStorage.removeItem('app-theme');
      }
    }
  }

  saveTheme(theme: Theme) {
    this.theme.set(theme);
    localStorage.setItem('app-theme', JSON.stringify(theme));
  }
  
  private adjustColor(color: string, amount: number): string {
    return '#' + color.replace(/^#/, '').replace(/../g, c => ('0'+Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2));
  }
}
