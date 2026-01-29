import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-security-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityManagementComponent {
  private logger = inject(LoggerService);
  private userService = inject(UserService);

  isUfwActive = signal(true);
  isHstsEnabled = signal(true);

  // In a real app, these methods would make API calls to the backend
  // which would then execute shell commands to manage the services.
  toggleUfw() {
    this.isUfwActive.update(v => !v);
    const currentUser = this.userService.currentUser();
    this.logger.logEvent(
      'تغيير إعدادات جدار الحماية',
      `تم تغيير حالة جدار الحماية (UFW) إلى: ${this.isUfwActive() ? 'نشط' : 'متوقف'}`,
      currentUser?.name,
      true
    );
    console.log(`Simulating UFW status change to: ${this.isUfwActive()}`);
  }

  toggleHsts() {
    this.isHstsEnabled.update(v => !v);
    const currentUser = this.userService.currentUser();
    this.logger.logEvent(
      'تغيير إعدادات الأمان (HSTS)',
      `تم تغيير حالة ترويسات HSTS إلى: ${this.isHstsEnabled() ? 'مُفعَّل' : 'مُعطَّل'}`,
      currentUser?.name,
      true
    );
    console.log(`Simulating HSTS status change to: ${this.isHstsEnabled()}`);
  }
}