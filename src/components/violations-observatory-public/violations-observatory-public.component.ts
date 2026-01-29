import { Component, ChangeDetectionStrategy, output, signal, OnDestroy, afterNextRender, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  imageUrl: string;
  title: string;
  subtitle: string;
  actionText: string;
}

@Component({
  selector: 'app-violations-observatory-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './violations-observatory-public.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViolationsObservatoryPublicComponent implements OnDestroy {
  login = output<void>();

  slides = signal<Slide[]>([
    {
      imageUrl: 'assets/images/violations/observatory-1.jpg',
      title: 'مرصد الانتهاكات الصحفية',
      subtitle: 'توثيق، تحليل، وعرض الانتهاكات بحق الصحفيين والمؤسسات الإعلامية في اليمن.',
      actionText: 'الوصول لقاعدة البيانات',
    },
    {
      imageUrl: 'assets/images/violations/report.jpg',
      title: 'بلّغ عن انتهاك بسرية تامة',
      subtitle: 'نظام آمن لاستقبال البلاغات من الصحفيين والمراقبين لحماية المصادر.',
      actionText: 'قدم بلاغاً الآن',
    },
    {
      imageUrl: 'assets/images/violations/analysis.jpg',
      title: 'استكشف التقارير التفاعلية',
      subtitle: 'تصفح تحليلاتنا الدورية ولوحات المعلومات التفاعلية لفهم حالة حرية الصحافة.',
      actionText: 'عرض التقارير',
    },
  ]);
  currentSlide = signal(0);
  private intervalId: any;

  // Mock data for charts
  stats = {
    total: 1204,
    thisMonth: 15,
    mostDangerous: 'مأرب'
  };

  violationsByType = [
    { type: 'اعتقال', count: 450, color: 'bg-red-500' },
    { type: 'تهديد', count: 320, color: 'bg-yellow-500' },
    { type: 'اعتداء', count: 210, color: 'bg-orange-500' },
    { type: 'حجب', count: 150, color: 'bg-blue-500' },
    { type: 'أخرى', count: 74, color: 'bg-gray-500' },
  ];

  violationsByGovernorate = [
    { name: 'مأرب', count: 250, color: 'bg-red-600' },
    { name: 'صنعاء', count: 210, color: 'bg-red-500' },
    { name: 'عدن', count: 180, color: 'bg-orange-500' },
    { name: 'تعز', count: 150, color: 'bg-yellow-500' },
    { name: 'أخرى', count: 414, color: 'bg-gray-400' },
  ];

  perpetratorChartData = computed(() => {
    const data = [
      { name: 'جماعة أنصار الله', count: 550, color: 'stroke-red-500', legendColor: 'bg-red-500' },
      { name: 'قوات الحكومة الشرعية', count: 280, color: 'stroke-orange-500', legendColor: 'bg-orange-500' },
      { name: 'المجلس الانتقالي الجنوبي', count: 190, color: 'stroke-yellow-500', legendColor: 'bg-yellow-500' },
      { name: 'مجهولون', count: 120, color: 'stroke-blue-500', legendColor: 'bg-blue-500' },
      { name: 'أخرى', count: 64, color: 'stroke-gray-400', legendColor: 'bg-gray-400' },
    ];
    const total = data.reduce((sum, p) => sum + p.count, 0);
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


  constructor() {
    afterNextRender(() => {
      this.startAutoSlider();
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startAutoSlider() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide.update(s => (s + 1) % this.slides().length);
  }

  prevSlide() {
    this.currentSlide.update(s => (s - 1 + this.slides().length) % this.slides().length);
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    clearInterval(this.intervalId);
    this.startAutoSlider();
  }

  onLogin() {
    this.login.emit();
  }
}
