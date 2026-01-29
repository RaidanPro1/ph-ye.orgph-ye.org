import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-ai-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiManagementComponent {
  settingsService = inject(SettingsService);

  // --- AI Training State ---
  trainingStatus = signal<'idle' | 'preparing' | 'running' | 'complete'>('idle');
  trainingLogs = signal<string[]>([]);
  
  // --- Model Parameters ---
  temperature = signal(0.7);
  topK = signal(40);
  topP = signal(0.95);

  startFineTuning() {
    this.trainingLogs.set([]); // Clear logs
    this.logTrainingStep('Initiating fine-tuning process...');
    this.trainingStatus.set('preparing');

    setTimeout(() => {
        this.logTrainingStep('Data preparation complete. Found 50 new valid feedback entries.');
        this.logTrainingStep('Starting training job on local AI cluster...');
        this.trainingStatus.set('running');
        
        setTimeout(() => {
            this.logTrainingStep('Training epoch 1/5 complete. Loss: 0.89');
             setTimeout(() => {
              this.logTrainingStep('Training epoch 3/5 complete. Loss: 0.52');
               setTimeout(() => {
                this.logTrainingStep('Training epoch 5/5 complete. Loss: 0.31');
                this.logTrainingStep('Model fine-tuning successful! New model version: yemenjpt-v1.2');
                this.trainingStatus.set('complete');
                setTimeout(() => this.trainingStatus.set('idle'), 5000);
              }, 4000);
            }, 4000);
        }, 2000);
    }, 2000);
  }

  private logTrainingStep(message: string) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.trainingLogs.update(logs => [...logs, `[${timestamp}] ${message}`]);
  }
}