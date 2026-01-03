import {
  Component,
  effect,
  ElementRef,
  HostListener,
  Renderer2,
  viewChild,
} from '@angular/core';

const NS = 'http://www.w3.org/2000/svg';
const HIDDEN = 'hidden';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly svg = viewChild.required<ElementRef<SVGElement>>('svg');
  readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private pair?: SVGGElement[];
  private timer?: ReturnType<typeof setTimeout>;

  private position = { x: innerWidth / 2, y: innerHeight / 2 };
  private counter = 0;

  constructor(private r2: Renderer2) {
    effect(() => {
      const svg = this.svg().nativeElement;
      this.pair = Array.from(svg.childNodes) as SVGGElement[];

      this.pair.forEach(el => this.makeLines(el));

      this.swap();
    });

    effect(() => {
      const canvas = this.canvas().nativeElement;

      canvas.width = innerWidth;
      canvas.height = innerHeight;

      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = 'white';
      }
    });
  }

  @HostListener('mousemove', ['$event'])
  move(event: MouseEvent): void {
    const name = '  Tijs Moree  ';

    const x = event.pageX;
    const y = event.pageY;

    const ctx = this.canvas().nativeElement.getContext('2d');

    if (!ctx) return;

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
    if (!this.pair) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    const [a, b] = this.pair;

    a.childNodes.forEach(el => {
      if (el instanceof SVGElement) {
        setTimeout(() => {
          this.r2.addClass(el, HIDDEN);
        }, Math.random() * 500);
      }
    });

    b.childNodes.forEach(el => {
      if (el instanceof SVGElement) {
        setTimeout(() => {
          this.r2.removeClass(el, HIDDEN);
        }, Math.random() * 500);
      }
    });

    setTimeout(() => {
      const ctx = this.canvas().nativeElement.getContext('2d');
      ctx?.clearRect(0, 0, innerWidth, innerHeight);
    }, Math.random() * 500);

    this.pair = [b, a];

    this.timer = setTimeout(() => {
      this.swap();
    }, 10000);
  }

  private makeLines(element: SVGGElement): void {
    const elements: SVGElement[] = [];

    element.childNodes.forEach(el => {
      if (
        !(el instanceof SVGPolylineElement || el instanceof SVGPolygonElement)
      ) {
        return;
      }

      const points = el.getAttribute('points')!.split(' ');

      if (el instanceof SVGPolygonElement) {
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

    element.childNodes.forEach(el => {
      if (el instanceof SVGElement) {
        this.r2.addClass(el, HIDDEN);

        if (el instanceof SVGLineElement) {
          this.r2.setStyle(el, 'stroke-width', Math.random() * 3 + 1);
        }
      }
    });
  }
}
