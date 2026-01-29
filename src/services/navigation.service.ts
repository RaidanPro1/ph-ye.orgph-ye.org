import { Injectable, computed, inject, signal } from '@angular/core';
import { UserService, UserRole } from './user.service';

export interface NavLink {
  key: string;
  name: string;
  icon: string;
  allowedRoles: UserRole[];
  section: 'main' | 'portal' | 'admin';
}

export interface NavRailLink {
  key: string;
  name: string;
  icon: string;
  allowedRoles: UserRole[];
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private userService = inject(UserService);

  private allNavRailLinks = signal<NavRailLink[]>([
    { key: 'role-home', name: 'مساحة عملي', icon: 'home-role-icon', allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
    { key: 'dashboard', name: 'كل الأدوات', icon: 'squares-2x2', allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
    { key: 'ai-core', name: 'النواة المعرفية', icon: 'sparkles', allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
    { key: 'forensic-lab', name: 'المختبر الجنائي', icon: 'beaker', allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
    { key: 'collaboration', name: 'التعاون', icon: 'users', allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
    { key: 'admin', name: 'التحكم الإداري', icon: 'shield-check', allowedRoles: ['institution-journalist', 'super-admin'] },
    { key: 'settings', name: 'الإعدادات', icon: 'cog-6-tooth', allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
  ]);

  navRailLinks = computed(() => {
    const userRole = this.userService.currentUser()?.role;
    if (!userRole) return [];
    return this.allNavRailLinks().filter(link => link.allowedRoles.includes(userRole));
  });
}