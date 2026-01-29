import { Component, ChangeDetectionStrategy, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { Tool } from '../../models/tool.model';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { TrialService } from '../../services/trial.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-platform-overview',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  templateUrl: './platform-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformOverviewComponent {
  private toolService = inject(ToolService);
  private trialService = inject(TrialService);
  private userService = inject(UserService);

  login = output<void>();

  // Filter for tools that are marked as publicly visible
  publicTools = computed(() => this.toolService.tools().filter(tool => tool.isVisiblePublicly));

  categorizedTools = computed(() => {
    return this.publicTools().reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
  });

  get categories(): string[] {
    const preferredOrder = [
      'النواة المعرفية والتحليل الذكي',
      'التقصي والاستخبارات مفتوحة المصدر',
      'تحليل الإعلام الاجتماعي',
      'التحقق وكشف التزييف',
      'الخرائط والرصد الجغرافي',
      'التحقيقات المالية والشركات',
      'الأرشفة والتوثيق الرقمي',
      'التواصل وسير العمل',
      'الأمن السيبراني المتقدم',
      'إدارة غرفة الأخبار والنشر',
      'إدارة المشاريع المؤسسية',
      'بوابة التدريب',
      'الدعم الفني',
      'إدارة العلاقات (CRM)',
      'الأتمتة وسير العمل'
    ];
    const allCategories = Object.keys(this.categorizedTools());
    
    // Sort categories based on preferred order, then alphabetically for the rest
    return allCategories.sort((a, b) => {
        const indexA = preferredOrder.indexOf(a);
        const indexB = preferredOrder.indexOf(b);
        if (indexA > -1 && indexB > -1) return indexA - indexB;
        if (indexA > -1) return -1;
        if (indexB > -1) return 1;
        return a.localeCompare(b);
    });
  }

  onTrialClick() {
    this.trialService.recordInteraction();
  }

  onLoginClick() {
    this.login.emit();
  }
}
