import { Component, ChangeDetectionStrategy, inject, output, signal, OnDestroy, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Stat } from '../../services/content.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  private contentService = inject(ContentService);
  settingsService = inject(SettingsService);
  
  login = output<void>();
  navigate = output<string>();
  
  private animationIntervals: any[] = [];

  // --- Data Signals from ContentService ---
  stats = this.contentService.stats;
  projects = this.contentService.projects;
  team = this.contentService.team;
  partners = this.contentService.partners;
  news = this.contentService.news;
  aboutContent = this.contentService.aboutContent;

  constructor() {
    afterNextRender(() => {
      this.animateStats();
    });
  }

  ngOnDestroy() {
    this.animationIntervals.forEach(clearInterval);
  }

  private animateStats() {
    // Re-initialize displayValue to 0 for animation on component load
    this.stats.update(stats => stats.map(s => ({...s, displayValue: 0})));

    this.stats().forEach((stat, index) => {
      const duration = 1500; // ms
      const stepTime = 20; // ms
      const totalSteps = duration / stepTime;
      const increment = stat.value / totalSteps;

      const interval = setInterval(() => {
        this.stats.update(currentStats => {
          const newStats = [...currentStats];
          const currentStat = newStats.find(s => s.label === stat.label); // find by unique property
          if(currentStat) {
            if (currentStat.displayValue < currentStat.value) {
              currentStat.displayValue = Math.min(currentStat.value, currentStat.displayValue + increment);
            } else {
              currentStat.displayValue = currentStat.value; // Ensure it ends on the exact value
              clearInterval(interval);
            }
          }
          return newStats;
        });
      }, stepTime);
      this.animationIntervals.push(interval);
    });
  }

  onNavigate(page: string) {
    if (page.startsWith('#')) {
      document.querySelector(page)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.navigate.emit(page);
    }
  }
}
