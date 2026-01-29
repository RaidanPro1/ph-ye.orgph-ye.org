
import { Injectable, signal, computed, inject } from '@angular/core';
import { UserService } from './user.service';

const TRIAL_LIMIT = 3;

@Injectable({
  providedIn: 'root',
})
export class TrialService {
  private userService = inject(UserService);

  trialClicks = signal(0);
  showLoginModal = signal(false);
  
  remainingClicks = computed(() => TRIAL_LIMIT - this.trialClicks());
  
  // Check if user is strictly a guest. Registered users (Independent/Institution) bypass trial logic.
  isGuest = computed(() => {
      const user = this.userService.currentUser();
      return !user || user.role === 'guest';
  });

  isTrialOver = computed(() => this.isGuest() && this.trialClicks() >= TRIAL_LIMIT);

  recordInteraction() {
    // If not a guest, do nothing (unlimited access)
    if (!this.isGuest()) return;

    if (!this.isTrialOver()) {
      this.trialClicks.update(c => c + 1);
    }
    
    if (this.isTrialOver()) {
      this.showLoginModal.set(true);
    }
  }

  closeModal() {
    this.showLoginModal.set(false);
  }
}
