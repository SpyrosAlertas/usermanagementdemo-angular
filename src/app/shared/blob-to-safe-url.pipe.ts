import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'blobToSafeUrl'
})
export class BlobToSafeUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  // Converts Blob images to SafeUrl objects, so we can easily display profile images anywhere
  // without re-writting this convertion from Blob to SafeUrl
  transform(blob: Blob): SafeUrl | undefined {
    const unsafeImageUrl: string = URL.createObjectURL(blob);
    const safeImage: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
    return safeImage;
  }

}
