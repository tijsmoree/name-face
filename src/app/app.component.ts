import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('head') head: ElementRef<SVGGElement>;
  @ViewChild('name') name: ElementRef<SVGGElement>;

  pair: SVGElement[];
  timer: any;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const head = this.head.nativeElement;
    const name = this.name.nativeElement;

    this.makeLines(name);
    this.makeLines(head);

    this.pair = [name, head];
    this.swap();

    name.childNodes.forEach((el: SVGElement) => {
      this.renderer.addClass(el, 'hidden');
    });
  }

  @HostListener('click')
  swap(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const [a, b] = this.pair;

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

    this.pair = [b, a];

    this.timer = setTimeout(() => {
      this.swap();
    }, 10000);
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

    element.childNodes.forEach((el: SVGElement) => {
      if (el.tagName === 'line') {
        const animate = this.renderer.createElement(
          'animate',
          'http://www.w3.org/2000/svg',
        ) as SVGAnimateElement;

        const from = Math.random() * 2 + 2;
        const to = from + Math.random() * 2 + 1;
        const dur = Math.random() * 2 + 2;

        animate.setAttribute('attributeType', 'CSS');
        animate.setAttribute('attributeName', 'stroke-width');
        animate.setAttribute('from', `${from.toFixed(0)}px`);
        animate.setAttribute('to', `${to.toFixed(0)}px`);
        animate.setAttribute('dur', `${dur}s`);
        animate.setAttribute('repeatCount', 'indefinite');

        this.renderer.appendChild(el, animate);
      }
    });
  }
}
