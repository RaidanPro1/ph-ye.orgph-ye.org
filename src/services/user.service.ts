
import { Injectable, signal, inject, effect } from '@angular/core';
import { LoggerService } from './logger.service';

// 1. تعريف الرتب بدقة حسب الطلب
export type UserRole = 
  | 'super-admin'             // الجذر
  | 'institution-journalist'  // صحفي تابع لمؤسسة (صلاحيات كاملة + تعاون)
  | 'independent-journalist'  // صحفي مستقل (أدوات فردية)
  | 'guest';                  // ضيف (تجربة محدودة)

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: UserStatus;
  joinedDate: string;
  organizationId?: string; // لربط الصحفي المؤسسي بمؤسسته
}

export const ROLES: UserRole[] = ['super-admin', 'institution-journalist', 'independent-journalist', 'guest'];

export const ROLE_DISPLAY_NAMES: { [key in UserRole]: string } = {
  'super-admin': 'مدير النظام (Root)',
  'institution-journalist': 'صحفي مؤسسي (Editor)',
  'independent-journalist': 'صحفي مستقل',
  'guest': 'زائر (تجربة مجانية)'
};

export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] || role;
}

const pagePermissions: Record<string, UserRole[]> = {
    'dashboard': ['super-admin', 'institution-journalist', 'independent-journalist', 'guest'],
    'ai-core': ['super-admin', 'institution-journalist', 'independent-journalist'], // Guest restricted by trial service
    'newsroom': ['super-admin', 'institution-journalist'], // المؤسسات فقط
    'collaboration': ['super-admin', 'institution-journalist'], // المؤسسات فقط
    'admin': ['super-admin'],
    'users': ['super-admin'],
    'settings': ['super-admin', 'institution-journalist', 'independent-journalist'],
    'profile': ['super-admin', 'institution-journalist', 'independent-journalist'],
    'violations-observatory': ['super-admin', 'institution-journalist', 'independent-journalist'],
    // ... other mappings
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private logger = inject(LoggerService);

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  
  // Mock Database of Users
  private users: User[] = [
     { id: 1, name: 'مستخدم الجذر', email: 'root@ph-ye.org', role: 'super-admin', avatar: 'assets/team/mohammed-alharibi.jpg', status: 'active', joinedDate: '2024-01-01' },
     { id: 2, name: 'مازن فارس', email: 'mazen@ph-ye.org', role: 'institution-journalist', avatar: 'assets/team/mazen-fares.jpg', status: 'active', joinedDate: '2024-02-01', organizationId: 'ph-ye' },
     { id: 3, name: 'صحفي مستقل', email: 'freelancer@email.com', role: 'independent-journalist', avatar: 'https://i.pravatar.cc/150?u=free', status: 'active', joinedDate: '2024-03-01' },
  ];

  constructor() {
    // 2. استرجاع بيانات المستخدم من التخزين المحلي لضمان استمرارية الصلاحيات (Persistence)
    const savedUser = localStorage.getItem('yemenjpt_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (e) {
        console.error('Failed to restore user session', e);
        localStorage.removeItem('yemenjpt_user');
      }
    }
  }

  login(role: UserRole = 'independent-journalist') {
    // محاكاة عملية تسجيل الدخول بناءً على الرتبة المطلوبة
    let user = this.users.find(u => u.role === role);
    
    // إذا لم نجد مستخدم محدد (مثل حالة guest)، ننشئ مستخدم مؤقت
    if (!user && role === 'guest') {
        user = { 
            id: 0, 
            name: 'زائر', 
            email: 'guest@temp', 
            role: 'guest', 
            avatar: 'assets/logo.png', 
            status: 'active', 
            joinedDate: new Date().toISOString() 
        };
    } else if (!user) {
        user = this.users[0]; // Fallback to root
    }
    
    this.currentUser.set(user);
    this.isAuthenticated.set(role !== 'guest'); // الضيف لا يعتبر "موثق" بالمعنى الكامل

    // تخزين الجلسة
    localStorage.setItem('yemenjpt_user', JSON.stringify(user));

    this.logger.logEvent(
      'تسجيل دخول', 
      `تم تفعيل الجلسة للمستخدم "${user.name}" برتبة: ${getRoleDisplayName(user.role)}.`, 
      user.name,
      user.role === 'super-admin'
    );
  }

  logout() {
    const loggedOutUser = this.currentUser();
    if (loggedOutUser && loggedOutUser.role !== 'guest') {
        this.logger.logEvent(
            'تسجيل خروج',
            `قام المستخدم بتسجيل الخروج.`,
            loggedOutUser.name,
            loggedOutUser.role === 'super-admin'
        );
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('yemenjpt_user');
  }
  
  // 3. Guards: قيود برمجية للتحقق من الصلاحيات
  
  hasPermission(pageKey: string): boolean {
    const userRole = this.currentUser()?.role || 'guest';
    const allowedRoles = pagePermissions[pageKey];
    
    // إذا لم يتم تعريف الصفحة، فهي متاحة للجميع (مثل الصفحة الرئيسية)
    if (!allowedRoles) return true;
    
    return allowedRoles.includes(userRole);
  }

  /**
   * Guard: هل يسمح للمستخدم باستخدام أدوات عالية التكلفة (مثل تحليل الفيديو، Gemini Pro)؟
   * يمنع الضيوف من استهلاك موارد باهظة.
   */
  canUseHighCostTools(): boolean {
    const role = this.currentUser()?.role;
    if (!role || role === 'guest') return false;
    return true; // مسموح للمستقلين والمؤسسات
  }

  /**
   * Guard: هل يسمح للمستخدم بالوصول للأرشيف الحساس أو البيانات الخاصة؟
   * يمنع الضيوف والصحفيين المستقلين (أحياناً) من رؤية بيانات المؤسسة.
   */
  canAccessSensitiveArchives(): boolean {
    const role = this.currentUser()?.role;
    return role === 'super-admin' || role === 'institution-journalist';
  }

  /**
   * Guard: هل يسمح للمستخدم بدعوة أعضاء آخرين للفريق؟
   */
  canManageTeam(): boolean {
      const role = this.currentUser()?.role;
      return role === 'super-admin' || role === 'institution-journalist';
  }
}
