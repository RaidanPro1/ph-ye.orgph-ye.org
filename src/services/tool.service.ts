
import { Injectable, signal, inject } from '@angular/core';
import { Tool } from '../models/tool.model';
import { LoggerService } from './logger.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private logger = inject(LoggerService);
  private userService = inject(UserService);

  // Updated roles: 'guest', 'independent-journalist', 'institution-journalist', 'super-admin'
  tools = signal<Tool[]>([
    // 1. AI Core & Specialized Agents
    {
      id: 'ai-assistant', name: 'المساعد التحريري (YemenJPT)', englishName: 'Local LLM Assistant', category: 'النواة المعرفية والتحليل الذكي',
      description: 'المساعدة في صياغة العناوين، تلخيص التقارير الطويلة، وتوليد أفكار للقصص.',
      iconSvg: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456Z',
      iconColor: 'text-ph-blue', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'independent-journalist', 'institution-journalist', 'guest'],
    },
    {
      id: 'whisper', name: 'المفرغ الصوتي (Whisper)', englishName: 'Audio Transcription', category: 'النواة المعرفية والتحليل الذكي',
      description: 'تفريغ المقابلات الطويلة، التسريبات الصوتية، ومحاضر الاجتماعات تلقائياً.',
      iconSvg: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM17 8h-1.35c-.32 3.11-2.94 5.5-6.15 5.5S3.67 11.11 3.35 8H2c.36 3.82 3.24 6.88 7 7.29V19H5v2h14v-2h-4v-3.71c3.76-.41 6.64-3.47 7-7.29z',
      iconColor: 'text-cyan-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'independent-journalist', 'institution-journalist'],
    },
    { 
      id: 'libretranslate', name: 'الترجمة الآمنة', englishName: 'LibreTranslate', category: 'النواة المعرفية والتحليل الذكي',
      description: 'ترجمة الوثائق الأجنبية الحساسة دون إرسال البيانات لسيرفرات خارجية (مثل Google).',
      iconSvg: 'M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.18 7.061 14.287 7.5 15.5 7.5c1.213 0 2.32-.439 3.166-1.136m0 0 is greater than 3.032 3.032 0 0 1-3.675 3.675-3.032 3.032 0 0 1-3.675-3.675M12 12.75h.008v.008H12v-.008Z', 
      iconColor: 'text-blue-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'independent-journalist', 'institution-journalist'] 
    },
    
    // 2. OSINT & Verification
    { id: 'searxng', name: 'محرك البحث الاستقصائي', englishName: 'SearXNG Metasearch', category: 'التقصي والاستخبارات مفتوحة المصدر', description: 'البحث في مصادر متعددة دون ترك بصمة رقمية أو تتبع للإعلانات.', iconSvg: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', iconColor: 'text-emerald-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'independent-journalist', 'institution-journalist', 'guest'], },
    { id: 'spiderfoot', name: 'أداة SpiderFoot', englishName: 'OSINT Automation', category: 'التقصي والاستخبارات مفتوحة المصدر', description: 'جمع كل المعلومات المتاحة عن هدف معين (إيميل، دومين، اسم مستخدم) بضغطة زر.', iconSvg: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4M9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0', iconColor: 'text-pink-500', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'independent-journalist', 'institution-journalist'], },
    { id: 'changedetection', name: 'راصد التغييرات', englishName: 'ChangeDetection.io', category: 'التقصي والاستخبارات مفتوحة المصدر', description: 'تلقي تنبيه عند تغيير أي كلمة في صفحة ويب (حذف تصريح رسمي، تغيير سعر).', iconSvg: 'M12 4.5C7.305 4.5 3.197 7.633 1.5 12c1.697 4.367 5.805 7.5 10.5 7.5s8.803-3.133 10.5-7.5C20.803 7.633 16.695 4.5 12 4.5zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z', iconColor: 'text-orange-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'independent-journalist', 'institution-journalist'] },

    // 3. Social Media Analysis
    { id: 'sherlock-maigret', name: 'أداة Sherlock', englishName: 'Username Search', category: 'تحليل الإعلام الاجتماعي', description: 'البحث عن اسم مستخدم معين (Username) عبر مئات المنصات الاجتماعية لكشف حسابات الهدف.', iconSvg: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.683c.65-.935 1-2.104 1-3.328M3 4.5a5.25 5.25 0 0 1 10.5 0v.75a5.25 5.25 0 0 1-10.5 0v-.75z', iconColor: 'text-violet-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'independent-journalist', 'institution-journalist'], },
    { id: 'social-analyzer', name: 'المحلل الاجتماعي', englishName: 'Social Analyzer', category: 'تحليل الإعلام الاجتماعي', description: 'تحليل سلوك حساب معين، أوقات نشاطه، ومن يتفاعل معه.', iconSvg: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', iconColor: 'text-blue-400', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin', 'institution-journalist'] }, // High cost/value tool, restricted to institutions/admin
    
    // 4. Verification & Forensics
    { id: 'invid-weverify', name: 'مختبر التحقق (InVID)', englishName: 'InVID/WeVerify Toolkit', category: 'التحقق وكشف التزييف', description: 'تجزئة الفيديوهات إلى صور للبحث العكسي، وكشف التلاعب في البيانات الوصفية (Metadata).', iconSvg: 'm15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z', iconColor: 'text-red-600', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
    
    // 7. Archiving & Data Vaults
    { id: 'archivebox', name: 'أرشيف الويب الدائم', englishName: 'ArchiveBox', category: 'الأرشفة والتوثيق الرقمي', description: 'حفظ نسخة "قانونية" من صفحات الويب والتغريدات كدليل قبل أن يتم حذفها.', iconSvg: 'M3.75 9.75h16.5v1.5H3.75v-1.5Z M4.5 3.75h15v1.5h-15v-1.5Z M3 19.5h18V21H3v-1.5Z M3.75 14.25h16.5v1.5H3.75v-1.5Z', iconColor: 'text-indigo-500', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['super-admin', 'independent-journalist', 'institution-journalist'] },
    { id: 'nocodb', name: 'قاعدة بيانات الانتهاكات', englishName: 'Violations Database', category: 'الأرشفة والتوثيق الرقمي', description: 'نظام لتوثيق وأرشفة الانتهاكات ضد الصحفيين لغرض التقارير الحقوقية.', iconSvg: 'M3 7.5h18M3 12h18m-9 4.5h9M3.75 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z', iconColor: 'text-amber-600', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },

    // 8. Communication & Workflow
    { id: 'mattermost', name: 'منصة التعاون (Mattermost)', englishName: 'Team Collaboration', category: 'التواصل وسير العمل', description: 'التواصل الداخلي الآمن والمشفر بين أعضاء الفريق بعيداً عن الرقابة.', iconSvg: 'M12 20.25c.966 0 1.896-.166 2.774-.474a11.232 11.232 0 0 1-5.548 0c.878.308 1.808.474 2.774.474ZM12 4.5a.75.75 0 0 0-.75.75v3.669a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 0-.75-.75h-.008a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-3.669a.75.75 0 0 1 1.5 0v3.669a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75V5.25a.75.75 0 0 0-.75-.75h-.008ZM12 11.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z', iconColor: 'text-sky-600', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['institution-journalist', 'super-admin'] }, // Independent likely don't need team chat
    { id: 'nextcloud', name: 'المكتب السحابي (Nextcloud)', englishName: 'Nextcloud Hub', category: 'التواصل وسير العمل', description: 'مشاركة المستندات وتخزين مسودات التحقيقات بأمان (بديل Google Drive).', iconSvg: 'M12 4.5C9.507 4.5 7.422 6.01 6.5 8.016A4.5 4.5 0 0 0 4.5 15.5H19.5a3.5 3.5 0 0 0 .5-6.965C19.18 6.556 15.82 4.5 12 4.5z', iconColor: 'text-blue-600', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
    
    // 9. Advanced Cyber Security
    { id: 'webtop', name: 'المتصفح الآمن', englishName: 'Secure Browser (Webtop)', category: 'الأمن السيبراني المتقدم', description: 'فتح الروابط المشبوهة داخل بيئة معزولة (Sandbox) لحماية جهاز الصحفي من الاختراق.', iconSvg: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M10.5 3.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z M15 6.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z M18.75 10.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5Z M6.75 15a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z', iconColor: 'text-gray-600', isActive: true, isFavorite: true, isVisiblePublicly: true, allowedRoles: ['independent-journalist', 'institution-journalist', 'super-admin'] },
    
    // Other categories...
    { id: 'superdesk', name: 'إدارة المحتوى (Superdesk)', englishName: 'Superdesk CMS', category: 'إدارة غرفة الأخبار والنشر', description: 'قلب غرفة الأخبار؛ استقبال الخيوط الصحفية، توزيع المهام، ومراجعة المقالات (Workflow).', iconSvg: 'M3.75 9.75h16.5v1.5H3.75v-1.5Zm0-4.5h16.5v1.5H3.75v-1.5Zm0 9h16.5v1.5H3.75v-1.5Zm-1.5 6h19.5v1.5H2.25v-1.5Z', iconColor: 'text-gray-700', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['institution-journalist', 'super-admin'] },
    { id: 'civicrm', name: 'إدارة العلاقات (CiviCRM)', englishName: 'CRM Platform', category: 'إدارة العلاقات (CRM)', description: 'نظام لإدارة العلاقات مع المصادر، الشركاء، والجهات المانحة.', iconSvg: 'M16 17v2h-4v-2h4zm2-10v10h-8V7h8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2z', iconColor: 'text-orange-600', isActive: true, isFavorite: false, isVisiblePublicly: true, allowedRoles: ['super-admin'] },
  ]);

  toggleToolStatus(toolId: string) {
    this.tools.update(tools =>
      tools.map(tool =>
        tool.id === toolId ? { ...tool, isActive: !tool.isActive } : tool
      )
    );
    const tool = this.tools().find(t => t.id === toolId);
    if (tool) {
        this.logger.logEvent(
            `Tool Status Changed: ${tool.name}`,
            `New status: ${tool.isActive ? 'Active' : 'Inactive'}`,
            this.userService.currentUser()?.name,
            this.userService.currentUser()?.role === 'super-admin'
        );
    }
  }

  toggleFavoriteStatus(toolId: string) {
    this.tools.update(tools =>
      tools.map(tool =>
        tool.id === toolId ? { ...tool, isFavorite: !tool.isFavorite } : tool
      )
    );
  }

  updateTool(toolId: string, updates: Partial<Tool>) {
    this.tools.update(tools =>
      tools.map(tool =>
        tool.id === toolId ? { ...tool, ...updates } : tool
      )
    );
  }
}
