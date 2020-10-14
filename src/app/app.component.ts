import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('head') head: ElementRef<SVGGElement>;
  @ViewChild('name') name: ElementRef<SVGGElement>;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const head = this.head.nativeElement;
    const name = this.name.nativeElement;

    this.makeLines(name);
    this.makeLines(head);

    head.childNodes.forEach((el: SVGElement) => {
      this.setWidth(el);
    });

    name.childNodes.forEach((el: SVGElement) => {
      this.setWidth(el);
    });

    this.swap(name, head);

    name.childNodes.forEach((el: SVGElement) => {
      this.renderer.addClass(el, 'hidden');
    });
  }

  private setWidth(element: SVGElement): void {
    this.renderer.setStyle(
      element,
      'stroke-width',
      `${Math.random() * 4 + 3}px`,
    );

    setTimeout(() => {
      this.setWidth(element);
    }, Math.random() * 3000);
  }

  private swap(a: SVGElement, b: SVGElement): void {
    a.childNodes.forEach((el: SVGElement) => {
      this.renderer.removeClass(el, 'hidden');

      setTimeout(() => {
        this.renderer.addClass(el, 'hidden');
      }, Math.random() * 500);
    });

    b.childNodes.forEach((el: SVGElement) => {
      this.renderer.addClass(el, 'hidden');

      setTimeout(() => {
        this.renderer.removeClass(el, 'hidden');
      }, Math.random() * 500);
    });

    setTimeout(() => {
      this.swap(b, a);
    }, 4000);
  }

  private makeLines(element: SVGGElement): void {
    const elements = [];

    element.childNodes.forEach((el: SVGElement) => {
      if (!['polyline', 'polygon'].includes(el.tagName)) {
        return;
      }

      const points = el.getAttribute('points').split(' ');

      if (el.tagName === 'polygon') {
        points.push(points[0], points[1]);
      }

      for (let i = 0; i < points.length - 2; i += 2) {
        const line = this.renderer.createElement(
          'line',
          'http://www.w3.org/2000/svg',
        ) as SVGLineElement;

        line.setAttribute('x1', points[i]);
        line.setAttribute('y1', points[i + 1]);
        line.setAttribute('x2', points[i + 2]);
        line.setAttribute('y2', points[i + 3]);

        this.renderer.appendChild(element, line);
      }

      elements.push(el);
    });

    elements.forEach(el => el.remove());
  }
}
