import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';

interface Stat {
  name: string;
  value: number;
  unit: string;
  color: string;
}

@Component({
  selector: 'app-system-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemStatsComponent {
  private logger = inject(LoggerService);
  private userService = inject(UserService);

  cpuStat = signal<Stat>({ name: 'المعالج', value: 25, unit: '%', color: 'bg-green-500' });
  ramStat = signal<Stat>({ name: 'الذاكرة', value: 60, unit: '%', color: 'bg-yellow-500' });
  diskStat = signal<Stat>({ name: 'التخزين', value: 85, unit: '%', color: 'bg-red-500' });
  networkStat = signal<Stat>({ name: 'الشبكة (تنزيل)', value: 12.5, unit: 'MB/s', color: 'bg-sky-500' });
  
  services = [
    { name: 'Gateway (Traefik)', status: 'Online', color: 'text-green-500' },
    { name: 'AI Core (Ollama)', status: 'Online', color: 'text-green-500' },
    { name: 'Database (Postgres)', status: 'Online', color: 'text-green-500' },
    { name: 'Mail Server', status: 'Degraded', color: 'text-yellow-500' },
    { name: 'Archive Service', status: 'Offline', color: 'text-red-500' },
  ];

  isChecking = signal(false);

  restartService(serviceName: string) {
    // In a real application, this would trigger a backend API call
    // that executes a command like `docker restart <container_name>`
    console.log(`[SIMULATION] Attempting to restart service: ${serviceName}`);
    const currentUser = this.userService.currentUser();
    this.logger.logEvent(
      'إعادة تشغيل خدمة',
      `محاولة إعادة تشغيل خدمة: ${serviceName}`,
      currentUser?.name,
      currentUser?.role === 'super-admin'
    );
  }

  runHealthCheck() {
    this.isChecking.set(true);
    console.log('[SIMULATION] Running health check...');
    setTimeout(() => {
      const offlineService = this.services.find(s => s.status === 'Offline');
      if (offlineService) {
        this.logger.logEvent(
          'فشل فحص صحة النظام',
          `تم اكتشاف أن خدمة "${offlineService.name}" في حالة Offline.`,
          'System Monitor',
          true // This is a root-level event
        );
      }
      this.isChecking.set(false);
    }, 2000);
  }
}