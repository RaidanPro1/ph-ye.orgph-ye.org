import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-violation-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './violation-report-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViolationReportFormComponent {
  private logger = inject(LoggerService);
  private userService = inject(UserService);

  reportAs = signal<'victim' | 'proxy'>('victim');

  // Proxy reporter's data
  proxyName = signal('');
  proxyPhone = signal('');
  proxyRelationship = signal('');
  
  // Victim's data
  victimFullName = signal('');
  victimAlias = signal('');
  victimMediaOrg = signal('');
  victimSocialAccounts = signal('');
  victimWhatsapp = signal('');
  
  // Incident details
  incidentGovernorate = signal('');
  incidentDistrict = signal('');
  incidentDate = signal('');
  
  // Perpetrator details
  perpetrators = signal<string[]>([]);
  incidentReason = signal('');
  incidentStory = signal('');

  // Evidence
  evidenceTypes = signal<string[]>([]);
  evidenceLink = signal('');

  // Needs
  urgentNeeds = signal<string[]>([]);
  
  // Publication policy
  publicationPolicy = signal('');
  
  governorates = [
    'أمانة العاصمة صنعاء', 'عدن', 'تعز', 'الحديدة', 'مأرب', 'حضرموت', 'شبوة', 'إب', 'ذمار', 'لحج', 'الضالع', 'أبين', 'صعدة', 'عمران', 'حجة', 'البيضاء', 'المهرة', 'سقطرى', 'المحويت', 'ريمة', 'الجوف'
  ];
  
  relationshipOptions = ['زميل عمل', 'محامي العائلة', 'أحد أفراد الأسرة', 'شاهد عيان', 'أخرى'];
  
  perpetratorOptions = [
    'جماعة أنصار الله الحوثيين', 'قوات المجلس الانتقالي الجنوبي والحزام الأمني', 'قوات الحكومة الشرعية والأمن العام', 'قوات المقاومة الوطنية في الساحل الغربي', 'تشكيلات عسكرية مدعومة من التحالف', 'تنظيمات متطرفة القاعدة أو داعش', 'مسلحون قبليون', 'عصابات مجهولة أو قطاع طرق', 'جهة العمل المؤسسة الإعلامية نفسها'
  ];

  evidenceOptions = ['صور إصابات', 'رسائل تهديد', 'وثائق قضائية', 'فيديو', 'لا يوجد حالياً'];
  needsOptions = ['دعم قانوني ومحام', 'تدخل طبي عاجل', 'نقل لمكان آمن', 'دعم نفسي', 'مجرد توثيق للواقعة', 'نشر وتضامن إعلامي'];

  // --- Checkbox Handlers ---
  onCheckboxChange(event: Event, item: string, collection: (typeof this.perpetrators | typeof this.evidenceTypes | typeof this.urgentNeeds)) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      collection.update(values => [...values, item]);
    } else {
      collection.update(values => values.filter(v => v !== item));
    }
  }

  isPerpetratorSelected(item: string): boolean {
    return this.perpetrators().includes(item);
  }

  isEvidenceSelected(item: string): boolean {
    return this.evidenceTypes().includes(item);
  }

  isNeedSelected(item: string): boolean {
    return this.urgentNeeds().includes(item);
  }
  // --- End Checkbox Handlers ---

  submitForm() {
    const formData = {
      reportAs: this.reportAs(),
      proxyInfo: this.reportAs() === 'proxy' ? {
        name: this.proxyName(),
        phone: this.proxyPhone(),
        relationship: this.proxyRelationship(),
      } : null,
      victimInfo: {
        fullName: this.victimFullName(),
        alias: this.victimAlias(),
        mediaOrg: this.victimMediaOrg(),
        social: this.victimSocialAccounts(),
        whatsapp: this.victimWhatsapp(),
      },
      incidentDetails: {
        governorate: this.incidentGovernorate(),
        district: this.incidentDistrict(),
        date: this.incidentDate(),
      },
      perpetratorDetails: {
        perpetrators: this.perpetrators(),
        reason: this.incidentReason(),
        story: this.incidentStory(),
      },
      evidence: {
        types: this.evidenceTypes(),
        link: this.evidenceLink(),
      },
      needs: this.urgentNeeds(),
      policy: this.publicationPolicy(),
    };
    console.log('Violation Report Submitted:', formData);

    const currentUser = this.userService.currentUser();
    this.logger.logEvent(
        'تقديم بلاغ انتهاك جديد',
        `تم تقديم بلاغ جديد بخصوص الصحفي "${this.victimFullName()}".`,
        currentUser?.name ?? 'مُبلِّغ عام',
        currentUser?.role === 'super-admin'
    );
    // Here you would typically send this data to a secure backend.
  }
}