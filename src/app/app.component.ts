import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
  HostListener,
} from '@angular/core';

const NS = 'http://www.w3.org/2000/svg';
const HIDDEN = 'hidden';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('svg') svg: ElementRef<SVGElement>;

  pair: SVGGElement[];
  timer: any;

  constructor(private r2: Renderer2) {}

  ngAfterViewInit(): void {
    const svg = this.svg.nativeElement;
    this.pair = Array.from(svg.childNodes).reverse() as SVGGElement[];

    this.pair.forEach(el => this.makeLines(el));

    this.swap();
  }

  @HostListener('click')
  swap(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const [a, b] = this.pair;

    a.childNodes.forEach((el: SVGElement) => {
      setTimeout(() => {
        this.r2.addClass(el, HIDDEN);
      }, Math.random() * 500);
    });

    b.childNodes.forEach((el: SVGElement) => {
      setTimeout(() => {
        this.r2.removeClass(el, HIDDEN);
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
        const line = this.r2.createElement('line', NS) as SVGLineElement;

        this.r2.setAttribute(line, 'x1', points[i]);
        this.r2.setAttribute(line, 'y1', points[i + 1]);
        this.r2.setAttribute(line, 'x2', points[i + 2]);
        this.r2.setAttribute(line, 'y2', points[i + 3]);

        this.r2.appendChild(element, line);
      }

      elements.push(el);
    });

    elements.forEach(el => el.remove());

    element.childNodes.forEach((el: SVGElement) => {
      this.r2.addClass(el, HIDDEN);

      if (el.tagName !== 'line') {
        return;
      }

      const animate = this.r2.createElement('animate', NS) as SVGAnimateElement;

      const from = Math.random() * 2 + 2;
      const to = from + Math.random() * 2 + 1;
      const dur = Math.random() * 2 + 2;

      this.r2.setAttribute(animate, 'attributeType', 'CSS');
      this.r2.setAttribute(animate, 'attributeName', 'stroke-width');
      this.r2.setAttribute(animate, 'from', `${from.toFixed(0)}px`);
      this.r2.setAttribute(animate, 'to', `${to.toFixed(0)}px`);
      this.r2.setAttribute(animate, 'dur', `${dur}s`);
      this.r2.setAttribute(animate, 'repeatCount', 'indefinite');

      this.r2.appendChild(el, animate);
    });
  }
}
