import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
} from '@angular/core';

const NS = 'http://www.w3.org/2000/svg';
const HIDDEN = 'hidden';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('svg') svg: ElementRef<SVGElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

  private pair: SVGGElement[];
  private timer: any;

  private position = { x: innerWidth / 2, y: innerHeight / 2 };
  private counter = 0;

  constructor(private r2: Renderer2) {}

  ngAfterViewInit(): void {
    const svg = this.svg.nativeElement;
    this.pair = Array.from(svg.childNodes).reverse() as SVGGElement[];

    this.pair.forEach(el => this.makeLines(el));

    this.swap();

    this.resize();
  }

  @HostListener('window:resize')
  resize(): void {
    this.canvas.nativeElement.width = innerWidth;
    this.canvas.nativeElement.height = innerHeight;

    const ctx = this.canvas.nativeElement.getContext('2d');
    ctx.fillStyle = 'white';
  }

  @HostListener('mousemove', ['$event'])
  move(event: MouseEvent): void {
    const name = '  Tijs Moree  ';

    const x = event.pageX;
    const y = event.pageY;

    const ctx = this.canvas.nativeElement.getContext('2d');
    ctx.globalAlpha = Math.random() * 0.3 + 0.2;

    const d = Math.sqrt(
      (this.position.x - x) ** 2 + (this.position.y - y) ** 2,
    );
    ctx.font = 5 + d / 2 + 'px Georgia';
    const size = ctx.measureText(name[this.counter]).width;

    if (d > size) {
      const angle = Math.atan2(y - this.position.y, x - this.position.x);

      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(angle);
      ctx.fillText(name[this.counter], 0, 0);
      ctx.restore();

      this.counter++;
      if (this.counter > name.length - 1) {
        this.counter = 0;
      }

      this.position.x += Math.cos(angle) * size;
      this.position.y += Math.sin(angle) * size;
    }
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

    setTimeout(() => {
      const ctx = this.canvas.nativeElement.getContext('2d');
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }, Math.random() * 500);

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
