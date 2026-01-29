
import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { Tool } from '../../models/tool.model';
import { ViolationReportFormComponent } from '../violation-report-form/violation-report-form.component';

interface Violation {
  id: number;
  case: string;
  journalist: string;
  governorate: string;
  date: string;
  perpetrator: string;
  status: 'Verified' | 'Pending' | 'Closed';
}

@Component({
  selector: 'app-violations-observatory',
  standalone: true,
  imports: [CommonModule, ToolCardComponent, ViolationReportFormComponent],
  templateUrl: './violations-observatory.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViolationsObservatoryComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);
  private sanitizer = inject(DomSanitizer);

  user = this.userService.currentUser;
  activeTab = signal<'dashboard' | 'database' | 'map' | 'report'>('dashboard');
  
  // NocoDB Integration
  nocodbUrl: SafeResourceUrl;

  // Mock data for charts
  stats = {
    total: 1204,
    thisMonth: 15,
    mostDangerous: 'مأرب'
  };

  violationsByYear = [
    { year: 2021, count: 280 },
    { year: 2022, count: 350 },
    { year: 2023, count: 410 },
    { year: 2024, count: 164 },
  ];

  violationsByType = [
    { type: 'اعتقال', count: 450, color: 'bg-red-500' },
    { type: 'تهديد', count: 320, color: 'bg-yellow-500' },
    { type: 'اعتداء', count: 210, color: 'bg-orange-500' },
    { type: 'حجب', count: 150, color: 'bg-blue-500' },
    { type: 'أخرى', count: 74, color: 'bg-gray-500' },
  ];

  violationsByGovernorate = [
    { name: 'مأرب', count: 250 },
    { name: 'صنعاء', count: 210 },
    { name: 'عدن', count: 180 },
    { name: 'تعز', count: 150 },
    { name: 'الحديدة', count: 110 },
    { name: 'شبوة', count: 90 },
  ];

  private perpetratorSourceData = [
    { name: 'جماعة أنصار الله', count: 550, color: 'stroke-red-500', legendColor: 'bg-red-500' },
    { name: 'قوات الحكومة الشرعية', count: 280, color: 'stroke-orange-500', legendColor: 'bg-orange-500' },
    { name: 'المجلس الانتقالي الجنوبي', count: 190, color: 'stroke-yellow-500', legendColor: 'bg-yellow-500' },
    { name: 'مجهولون', count: 120, color: 'stroke-blue-500', legendColor: 'bg-blue-500' },
  ];

  totalPerpetratorCount = computed(() => {
    return this.perpetratorSourceData.reduce((sum, p) => sum + p.count, 0);
  });

  perpetratorChartData = computed(() => {
    const data = this.perpetratorSourceData;
    const total = this.totalPerpetratorCount();
    if (total === 0) return [];

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercentage = 0;

    return data.map(item => {
      const percentage = (item.count / total) * 100;
      const rotation = -90 + (cumulativePercentage / 100) * 360;
      
      const segmentData = {
        ...item,
        percentage: percentage.toFixed(1),
        strokeDasharray: `${circumference}`,
        strokeDashoffset: circumference - (percentage / 100) * circumference,
        rotation,
      };
      cumulativePercentage += percentage;
      return segmentData;
    });
  });

  // Mock data for database table (Fallback)
  violationsData = signal<Violation[]>([
    { id: 1, case: 'اعتقال تعسفي', journalist: 'أحمد خالد', governorate: 'صنعاء', date: '2024-07-15', perpetrator: 'جماعة أنصار الله', status: 'Pending' },
    { id: 2, case: 'تهديدات بالقتل', journalist: 'فاطمة علي', governorate: 'عدن', date: '2024-07-12', perpetrator: 'مسلحون مجهولون', status: 'Verified' },
    { id: 3, case: 'حجب موقع إخباري', journalist: 'N/A', governorate: 'حضرموت', date: '2024-07-10', perpetrator: 'قوات الحكومة الشرعية', status: 'Closed' },
    { id: 4, case: 'اعتداء جسدي', journalist: 'خالد عبدالله', governorate: 'مأرب', date: '2024-06-28', perpetrator: 'مسلحون قبليون', status: 'Verified' },
  ]);

  filteredViolations = computed(() => this.violationsData());


  portalTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'مرصد الانتهاكات الصحفية')
  );
  
  constructor() {
    this.nocodbUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:8086');
  }

  setTab(tab: 'dashboard' | 'database' | 'map' | 'report') {
    this.activeTab.set(tab);
  }

  handleToolToggle(toolId: string) {
    this.toolService.toggleToolStatus(toolId);
  }

  handleToggleFavorite(toolId: string) {
    this.toolService.toggleFavoriteStatus(toolId);
  }

  handleRunTool(tool: Tool) {
    console.log(`Running tool: ${tool.name}`);
  }
}
