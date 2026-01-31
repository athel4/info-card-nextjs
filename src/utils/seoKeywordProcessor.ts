export class SEOKeywordProcessor {
  static async processKeywords(): Promise<void> {
    const seoFolderPath = '/seostuff';
    const masterFile = 'seo_keywords_master_300.json';
    
    try {
      // 1) Load master keywords
      const masterResponse = await fetch(`${seoFolderPath}/${masterFile}`);
      const masterKeywords = await masterResponse.json();
      
      // 2) Get all other JSON files (you'll need to manually list them)
      const otherJsonFiles = ["seo_keywords_batch16_rotated.json",
"seo_keywords_batch17_rotated.json",
"seo_keywords_batch18_rotated.json",
"seo_keywords_batch1_rotated.json",
"seo_keywords_batch2_rotated.json",
"seo_keywords_batch3_rotated.json",
"seo_keywords_batch4_rotated.json",
"seo_keywords_batch5_rotated.json",
"seo_keywords_batch6_rotated.json",
"seo_keywords_batch7_rotated.json",
"seo_keywords_batch8_rotated.json",
"seo_keywords_batch9_rotated.json",
"seo_keywords_batch10_rotated.json",
"seo_keywords_batch11_rotated.json",
"seo_keywords_batch12_rotated.json",
"seo_keywords_batch13_rotated.json",
"seo_keywords_batch14_rotated.json",
"seo_keywords_batch15_rotated.json"]; // Add your files here
      
      // 3) Process each file
      for (const fileName of otherJsonFiles) {
        const fileResponse = await fetch(`${seoFolderPath}/${fileName}`);
        let fileContent = await fileResponse.text();
        
        // Replace all keys with values
        Object.entries(masterKeywords).forEach(([key, value]) => {
          fileContent = fileContent.replace(new RegExp(key, 'g'), value as string);
        });
        
        // Generate and download processed file
        this.downloadProcessedFile(fileName, fileContent);
      }
    } catch (error) {
      console.error('SEO processing failed:', error);
    }
  }

  static downloadProcessedFile(fileName: string, content: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed_${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static downloadAllAsZip(processedFiles: {name: string, content: string}[]): void {
    // For ZIP download, you'd need a library like JSZip
    console.log('Processed files ready for ZIP download:', processedFiles);
  }
}