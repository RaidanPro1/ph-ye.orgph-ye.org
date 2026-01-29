
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social-bot-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-bot-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialBotManagementComponent {
  // Mock data for display
  bots = [
    {
      name: 'WhatsApp Bot',
      status: 'Connected',
      channel: 'قناة بلاغات واتساب',
      icon: 'whatsapp'
    },
    {
      name: 'Telegram Bot',
      status: 'Connected',
      channel: 'بوت بلاغات تيليجرام',
      icon: 'telegram'
    }
  ];

  readonly chatwootUrl = 'https://chat.ph-ye.org';
}
