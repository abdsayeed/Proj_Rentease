import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appBrokenImage]',
  standalone: true
})
export class BrokenImageDirective {
  @Input() placeholder = '/assets/images/placeholder.svg';
  private hasError = false;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    if (!this.hasError) {
      this.hasError = true;
      const element = this.el.nativeElement;
      element.src = this.placeholder;
      element.alt = 'Image not available';
    }
  }
}
