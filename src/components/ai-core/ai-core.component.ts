
import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageAnalysisComponent } from '../image-analysis/image-analysis.component';
import { GeminiService } from '../../services/gemini.service';
import { SettingsService } from '../../services/settings.service';
import { UserService } from '../../services/user.service';
import { Content, GenerateContentResponse, Tool as GeminiTool, Type } from '@google/genai';
import { TranslationService } from '../../services/translation.service';
import { ToolStateService } from '../../services/tool-state.service';
import { ToolService } from '../../services/tool.service';
import { LoggerService } from '../../services/logger.service';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'ai';
  translatedText?: string;
  isTranslating?: boolean;
}

interface SystemInstruction {
  id: string;
  name: string;
  instruction: string;
}

type AiCoreTab = 'assistant' | 'transcription' | 'imageAnalysis' | 'quickSummary';
type TranscriptionFormat = 'Text' | 'SRT' | 'VTT';

const MAX_CHAT_PROMPT_LENGTH = 4000;
const MAX_SUMMARY_TEXT_LENGTH = 10000;

@Component({
  selector: 'app-ai-core',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageAnalysisComponent],
  templateUrl: './ai-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiCoreComponent {
  private geminiService = inject(GeminiService);
  private settingsService = inject(SettingsService);
  private userService = inject(UserService);
  private translationService = inject(TranslationService);
  private toolStateService = inject(ToolStateService);
  private toolService = inject(ToolService);
  private logger = inject(LoggerService);
  
  user = this.userService.currentUser;

  // AI Provider setting
  currentAiProvider = this.settingsService.aiProvider;

  // Feature flags from settings
  isChatbotEnabled = computed(() => this.settingsService.isChatbotEnabled() || this.user()?.role === 'super-admin' || this.user()?.role === 'editor-in-chief');
  isImageAnalysisEnabled = computed(() => this.settingsService.isImageAnalysisEnabled() || this.user()?.role === 'super-admin' || this.user()?.role === 'editor-in-chief');
  isQuickSummaryEnabled = computed(() => this.settingsService.isQuickSummaryEnabled() || this.user()?.role === 'super-admin' || this.user()?.role === 'editor-in-chief');

  // Tab state
  activeTab = signal<AiCoreTab>('assistant');

  // Chat state
  messages = signal<Message[]>([]); // Initialize empty
  isTyping = signal(false);
  chatError = signal<string>('');
  
  // Quick Summary state
  summaryInputText = signal<string>('');
  summaryResult = signal<string>('');
  isSummarizing = signal<boolean>(false);

  // Whisper tool state
  dialects = ['اللهجة الصنعانية', 'اللهجة التعزية', 'اللهجة العدنية', 'اللهجة الحضرمية', 'اللهجة الإبية', 'اللهجة التهامية (الحديدة)'];
  selectedDialect = signal<string>('اللهجة الصنعانية');
  outputFormats: TranscriptionFormat[] = ['Text', 'SRT', 'VTT'];
  transcriptionFormat: TranscriptionFormat = 'Text';
  selectedFile = signal<File | null>(null);
  isTranscribing = signal<boolean>(false);
  transcriptionResult = signal<string>('');
  copySuccess = signal<boolean>(false);
  showYoutubeInput = signal(false);
  youtubeUrl = signal('');

  // New preprocessing options
  enableNoiseReduction = signal(true);
  enableNormalization = signal(true);
  enableDiarization = signal(false); // Speaker separation
  transcriptionStatusText = signal('');

  // System Instructions
  systemInstructions: SystemInstruction[] = [
    { id: 'neutral', name: 'مساعد محايد', instruction: 'You are a helpful and neutral assistant for journalists.' },
    { id: 'investigative', name: 'تركيز استقصائي', instruction: 'You are an investigative assistant. Be critical, ask clarifying questions, focus on evidence and potential leads, and suggest next steps for the investigation.' },
    { id: 'data', name: 'محلل بيانات', instruction: 'You are a data analyst assistant. Focus on finding patterns, interpreting data, and suggesting visualizations. Be precise and factual.' },
  ];
  selectedInstructionId = signal<string>('neutral');

  private getAllToolsForAI = computed(() => {
    const user = this.user();
    if (!user) return [];
    return this.toolService.tools().filter(tool => {
        if (!tool.isActive || tool.id === 'ai-assistant') return false;
        if (user.role === 'super-admin') return true;
        return tool.allowedRoles.includes(user.role);
    });
  });

  // Computed signal to generate tool schema for Gemini
  geminiTools = computed((): GeminiTool[] | undefined => {
    const allowedTools = this.getAllToolsForAI();
    if (!allowedTools.length || this.currentAiProvider() === 'local') return undefined;

    return [{
        functionDeclarations: [
            {
                name: 'run_tool',
                description: 'تشغيل أداة متخصصة متاحة على منصة YemenJPT. استخدم هذه الوظيفة لفتح الأدوات للتحليل أو التحقيق أو مهام أخرى عندما يطلبها المستخدم.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        toolId: {
                            type: Type.STRING,
                            description: 'المعرف الفريد للأداة المراد تشغيلها.',
                            enum: allowedTools.map(t => t.id)
                        }
                    },
                    required: ['toolId'],
                },
            },
        ],
    }];
  });

  private systemInstruction = computed(() => {
    if (this.currentAiProvider() === 'local') return undefined;

    const selectedPersonality = this.systemInstructions.find(i => i.id === this.selectedInstructionId())?.instruction 
                                || 'You are a helpful and neutral assistant for journalists.';

    const toolsList = this.getAllToolsForAI().map(t => `- ${t.name} (id: ${t.id}): ${t.description}`).join('\n');
    
    return `${selectedPersonality} You are also an expert OSINT assistant named YemenJPT, integrated within a larger platform.
Your primary function is to help journalists by running tools. When a user's request directly matches a tool's capability, you MUST call the 'run_tool' function with the appropriate toolId. Do not answer the question yourself if a tool can do it. Be direct and concise.

Here are the available tools:
${toolsList}

Example:
User: "أريد البحث عن حسابات المستخدم 'testuser' على وسائل التواصل الاجتماعي"
You MUST call: run_tool(toolId='sherlock-maigret')

User: "أريد حفظ نسخة من هذا الرابط"
You MUST call: run_tool(toolId='archivebox')`;
  });
  
  constructor() {
    this.messages.set([
      { id: Date.now(), text: this.translationService.translate('ai_welcome'), from: 'ai' }
    ]);
  }

  setTab(tab: AiCoreTab) {
    this.activeTab.set(tab);
  }

  // --- Chat methods ---
  async handleSend(event: Event) {
    event.preventDefault();
    const input = (event.target as HTMLFormElement).querySelector('input');
    if (!input || !input.value) return;

    const userMessageText = input.value;
    
    // Input Validation
    if (userMessageText.length > MAX_CHAT_PROMPT_LENGTH) {
        this.chatError.set(this.translationService.translate('prompt_too_long'));
        return;
    }
    if (/<script>/i.test(userMessageText)) {
        this.chatError.set(this.translationService.translate('prompt_invalid_content'));
        return;
    }

    const userMessage: Message = { id: Date.now(), text: userMessageText, from: 'user' };
    this.messages.update(m => [...m, userMessage]);
    input.value = '';
    this.isTyping.set(true);
    this.chatError.set('');

    const history: Content[] = this.messages().slice(0, -1).map(msg => ({
      role: msg.from === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    try {
      const response = await this.geminiService.getChatResponse(history, userMessageText, this.geminiTools(), this.systemInstruction());
      let hasContent = false;

      // Handle function calls by checking the response parts
      const functionCallParts = response.candidates?.[0]?.content?.parts?.filter(p => !!p.functionCall);
      if (functionCallParts && functionCallParts.length > 0) {
        hasContent = true;
        for (const part of functionCallParts) {
          const call = part.functionCall;
          if (call && call.name === 'run_tool') {
            const { toolId } = call.args;
            if (typeof toolId === 'string') {
              const toolToRun = this.toolService.tools().find(t => t.id === toolId);
              const currentUser = this.user();

              // SECURITY CHECK (RBAC Enforcement):
              // Verify that the user is actually allowed to run this tool, 
              // even if the AI suggested it (prevents prompt injection attacks).
              const isAllowed = toolToRun && currentUser && 
                (currentUser.role === 'super-admin' || toolToRun.allowedRoles.includes(currentUser.role));
              
              if (isAllowed && toolToRun) {
                this.toolStateService.runTool(toolId);
                this.logger.logEvent(
                  'AI Tool Execution',
                  `AI triggered tool: ${toolToRun.name} (ID: ${toolId}) in response to prompt: "${userMessageText}"`,
                  currentUser?.name ?? 'Unknown',
                  currentUser?.role === 'super-admin'
                );
                const toolRunMessage: Message = { 
                  id: Date.now(), 
                  text: `جاري فتح أداة: ${toolToRun.name}...`, 
                  from: 'ai' 
                };
                this.messages.update(m => [...m, toolRunMessage]);
              } else {
                 const permissionDeniedMessage: Message = { 
                  id: Date.now(), 
                  text: `عذراً، الأداة المطلوبة غير متاحة أو ليس لديك صلاحية للوصول إليها.`, 
                  from: 'ai' 
                };
                this.messages.update(m => [...m, permissionDeniedMessage]);
                this.logger.logEvent(
                  'Unauthorized AI Tool Access',
                  `AI attempted to run tool "${toolId}" for user "${currentUser?.name}" but access was denied.`,
                  currentUser?.name ?? 'Unknown',
                  false
                );
              }
            }
          }
        }
      }

      // Handle text response using the convenience .text getter
      const text = response.text;
      if (text) {
        hasContent = true;
        const aiMessage: Message = { id: Date.now(), text, from: 'ai' };
        this.messages.update(m => [...m, aiMessage]);
      }

      // Handle cases where response is empty or blocked
      if (!hasContent) {
          const emptyResponseMessage: Message = { 
              id: Date.now(), 
              text: 'لم يتمكن المساعد من إنشاء رد. قد يكون الطلب غير واضح أو أن المحتوى تم حجبه.', 
              from: 'ai' 
          };
          this.messages.update(m => [...m, emptyResponseMessage]);
      }

    } catch (error) {
      console.error("Error getting chat response:", error);
      const errorMessage = this.translationService.translate('gemini_error');
      const aiMessage: Message = {id: Date.now(), text: errorMessage, from: 'ai'};
      this.messages.update(m => [...m, aiMessage]);
    } finally {
      this.isTyping.set(false);
    }
  }

  async translateMessage(messageId: number) {
    const message = this.messages().find(m => m.id === messageId);
    if (!message) return;

    // Set loading state
    this.messages.update(msgs => msgs.map(m => m.id === messageId ? { ...m, isTranslating: true } : m));

    try {
      const targetLang = this.translationService.getCurrentLanguage() === 'ar' ? 'en' : 'ar';
      const translated = await this.geminiService.translateText(message.text, targetLang);
      // Update with translated text
      this.messages.update(msgs => msgs.map(m => m.id === messageId ? { ...m, isTranslating: false, translatedText: translated } : m));
    } catch (error) {
      console.error('Translation error:', error);
       this.messages.update(msgs => msgs.map(m => m.id === messageId ? { ...m, isTranslating: false, translatedText: this.translationService.translate('translation_failed') } : m));
    }
  }
  
  // --- Quick Summary methods ---
  async getQuickSummary() {
    if(!this.summaryInputText()) return;

    // Input Validation
    if (this.summaryInputText().length > MAX_SUMMARY_TEXT_LENGTH) {
        this.summaryResult.set(this.translationService.translate('summary_text_too_long'));
        return;
    }

    this.isSummarizing.set(true);
    this.summaryResult.set('');
    try {
      const result = await this.geminiService.quickResponse(`لخص النص التالي في نقاط رئيسية موجزة: ${this.summaryInputText()}`);
      this.summaryResult.set(result);
    } catch (e) {
      this.summaryResult.set(this.translationService.translate('summary_error'));
    } finally {
      this.isSummarizing.set(false);
    }
  }

  // --- Whisper methods ---
  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.transcriptionResult.set('');
      this.youtubeUrl.set('');
      this.showYoutubeInput.set(false);
    }
  }
  
  async startTranscription() {
    if (!this.selectedFile() && !this.youtubeUrl()) return;
    this.isTranscribing.set(true);
    this.transcriptionResult.set('');
    
    const steps = [];
    if (this.enableNoiseReduction()) steps.push('تطبيق تقليل الضوضاء...');
    if (this.enableNormalization()) steps.push('تطبيع مستوى الصوت...');
    if (this.enableDiarization()) steps.push('تحليل وتحديد المتحدثين...');
    steps.push('بدء عملية التفريغ الصوتي...');
    steps.push('تنسيق المخرجات...');

    for (let i = 0; i < steps.length; i++) {
        this.transcriptionStatusText.set(`الخطوة ${i + 1}/${steps.length}: ${steps[i]}`);
        await new Promise(res => setTimeout(res, 1000 + Math.random() * 500)); // Simulate variable step time
    }

    const selectedDialectValue = this.selectedDialect();
    let baseText = `هذا هو النص الذي تم تفريغه من ${this.selectedFile() ? 'الملف الصوتي' : 'فيديو يوتيوب'}. تم التحليل باستخدام نموذج مخصص لـ"${selectedDialectValue}" لضمان أفضل النتائج.`;
    
    if (this.enableNoiseReduction()) {
      baseText += " تم تطبيق تقليل الضوضاء لتحسين الوضوح.";
    }
    
    if (this.enableDiarization()) {
        baseText = `[المتحدث 1]: ${baseText}\n\n[المتحدث 2]: هذا جزء آخر من الحوار تم تحديده بواسطة خاصية تحديد المتحدثين.`;
    }

    switch(this.transcriptionFormat) {
      case 'SRT':
        this.transcriptionResult.set(`1\n00:00:01,000 --> 00:00:08,000\n${baseText.replace(/\n\n/g, '\n')}`);
        break;
      case 'VTT':
          this.transcriptionResult.set(`WEBVTT\n\n00:01.000 --> 00:08.000\n${baseText}`);
          break;
      default:
        this.transcriptionResult.set(baseText);
        break;
    }
    this.isTranscribing.set(false);
    this.transcriptionStatusText.set('');
  }

  copyResult() {
    if (!this.transcriptionResult()) return;
    navigator.clipboard.writeText(this.transcriptionResult());
    this.copySuccess.set(true);
    setTimeout(() => this.copySuccess.set(false), 2000);
  }

  toggleYoutubeInput() {
    this.showYoutubeInput.update(v => !v);
    this.selectedFile.set(null);
  }
}
