import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EvidenceFile {
  id: number;
  name: string;
  type: 'video' | 'image' | 'audio';
  hash: string;
  status: 'Uploaded' | 'Analyzing' | 'Complete' | 'Error';
  thumbnail: string;
  metadata?: { key: string, value: string }[];
}

type AnalysisTab = 'metadata' | 'ela' | 'deepfake' | 'geolocation';

@Component({
  selector: 'app-forensic-lab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forensic-lab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForensicLabComponent {
  evidenceFiles = signal<EvidenceFile[]>([
    { 
      id: 1, name: 'video_evidence_01.mp4', type: 'video', 
      hash: 'a1b2c3d4e5f6...', 
      status: 'Complete', thumbnail: 'assets/images/violations/report.jpg',
      metadata: [
        { key: 'Format', value: 'MPEG-4' },
        { key: 'Duration', value: '1m 32s' },
        { key: 'Codec', value: 'H.264' },
      ]
    },
    { 
      id: 2, name: 'suspicious_image.jpg', type: 'image', 
      hash: 'f6e5d4c3b2a1...', 
      status: 'Complete', thumbnail: 'assets/images/violations/analysis.jpg',
      metadata: [
        { key: 'Dimensions', value: '1920x1080' },
        { key: 'Camera Model', value: 'Canon EOS R5' },
        { key: 'Software', value: 'Adobe Photoshop 23.0' },
      ]
    },
     { 
      id: 3, name: 'audio_leak.mp3', type: 'audio', 
      hash: '9h8g7f6e5d4c...', 
      status: 'Analyzing', thumbnail: 'assets/images/support/portal-1.jpg'
    },
  ]);
  
  selectedFile = signal<EvidenceFile | null>(this.evidenceFiles()[1]);
  activeAnalysisTab = signal<AnalysisTab>('metadata');

  selectFile(file: EvidenceFile) {
    this.selectedFile.set(file);
    this.activeAnalysisTab.set('metadata'); // Reset to default tab on new file selection
  }
  
  setTab(tab: AnalysisTab) {
    this.activeAnalysisTab.set(tab);
  }
}
