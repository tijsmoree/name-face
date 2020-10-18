import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
  HostListener,
} from '@angular/core';

const NS = 'http://www.w3.org/2000/svg';

const DUR = 500;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('svg') svg: ElementRef<SVGElement>;

  center = [0, 0];

  pair: SVGGElement[];
  timer: any;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const head = this.svg.nativeElement.childNodes[0] as SVGGElement;
    const name = this.svg.nativeElement.childNodes[1] as SVGGElement;

    const viewBox = this.svg.nativeElement
      .getAttribute('viewBox')
      .split(' ')
      .map(Number);
    this.center[0] = viewBox[0] + viewBox[2] / 2;
    this.center[1] = viewBox[1] + viewBox[3] / 2;

    this.makeLines(name);
    this.makeLines(head);

    name.childNodes.forEach((el: SVGElement) => {
      this.renderer.addClass(el, 'hidden');
    });
    head.childNodes.forEach((el: SVGElement) => {
      this.renderer.addClass(el, 'hidden');
    });

    this.swap1(name, head);
    this.pair = [head, name];

    this.timer = setTimeout(() => {
      this.swap();
    }, 10000);
  }

  @HostListener('click')
  swap(): void {
    clearTimeout(this.timer);
    this.timer = null;

    const [a, b] = this.pair;

    if (Math.random() < 0.5) {
      this.swap1(a, b);
    } else {
      this.swap2(a, b);
    }

    this.pair = [b, a];

    this.timer = setTimeout(() => {
      this.swap();
    }, 10000);
  }

  private swap1(a: SVGGElement, b: SVGGElement): void {
    a.childNodes.forEach((el: SVGElement) => this.flashOut(el));

    b.childNodes.forEach((el: SVGElement) => this.flashIn(el));
  }

  private swap2(a: SVGGElement, b: SVGGElement): void {
    const aNodes = Array.from(a.childNodes).filter(
      (el: SVGElement) => el.tagName === 'line',
    );
    const bNodes = Array.from(b.childNodes).filter(
      (el: SVGElement) => el.tagName === 'line',
    );

    if (aNodes.length > bNodes.length) {
      aNodes.forEach((aNode: SVGElement) => {
        const bNode = bNodes[Math.floor(Math.random() * bNodes.length)];

        this.moveTo(aNode, bNode as SVGElement, true);
      });
    } else {
      bNodes.forEach((bNode: SVGElement) => {
        const aNode = aNodes[Math.floor(Math.random() * aNodes.length)];

        this.moveTo(aNode as SVGElement, bNode, false);
      });
    }

    a.childNodes.forEach(el => {
      if (!aNodes.includes(el)) {
        this.flashOut(el as SVGElement);
      }
    });

    b.childNodes.forEach(el => {
      if (!bNodes.includes(el)) {
        this.flashIn(el as SVGElement);
      }
    });
  }

  private flashOut(el: SVGElement): void {
    setTimeout(() => {
      this.renderer.addClass(el, 'hidden');
    }, Math.random() * DUR);
  }

  private flashIn(el: SVGElement): void {
    setTimeout(() => {
      this.renderer.removeClass(el, 'hidden');
    }, Math.random() * DUR);
  }

  private moveTo(a: SVGElement, b: SVGElement, moveA = true): void {
    const attributes = ['x1', 'y1', 'x2', 'y2'];

    const start = attributes.map(k => Number(a.getAttribute(k)));
    const end = attributes.map(k => Number(b.getAttribute(k)));

    if (!moveA) {
      this.renderer.addClass(a, 'hidden');
      this.renderer.removeClass(b, 'hidden');

      attributes.forEach((attr, i) => {
        this.renderer.setAttribute(b, attr, start[i].toFixed(0));
      });
    }

    const duration = Math.random() * DUR;
    attributes.forEach((attr, i) => {
      this.changeAttribute(moveA ? a : b, attr, start[i], end[i], duration);
    });

    setTimeout(() => {
      if (moveA) {
        this.renderer.addClass(a, 'hidden');
        this.renderer.removeClass(b, 'hidden');
      }

      attributes.forEach((attr, i) => {
        this.renderer.setAttribute(a, attr, start[i].toFixed(0));
        this.renderer.setAttribute(b, attr, end[i].toFixed(0));
      });
    }, DUR * 1.1);
  }

  private changeAttribute(
    element: SVGElement,
    attrName: string,
    attrStartVal: number,
    attrEndVal: number,
    duration: number,
  ): void {
    let startTime: number;

    const animateStep = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        const currentVal =
          (attrEndVal - attrStartVal) * progress + attrStartVal;
        this.renderer.setAttribute(element, attrName, currentVal.toFixed(0));
        requestAnimationFrame(animateStep);
      } else {
        this.renderer.setAttribute(element, attrName, attrEndVal.toFixed(0));
      }
    };

    requestAnimationFrame(animateStep);
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
        const line = this.renderer.createElement('line', NS) as SVGLineElement;

        this.renderer.setAttribute(line, 'x1', points[i]);
        this.renderer.setAttribute(line, 'y1', points[i + 1]);
        this.renderer.setAttribute(line, 'x2', points[i + 2]);
        this.renderer.setAttribute(line, 'y2', points[i + 3]);

        this.renderer.appendChild(element, line);
      }

      elements.push(el);
    });

    elements.forEach(el => el.remove());

    element.childNodes.forEach((el: SVGElement) => {
      if (el.tagName === 'line') {
        const animate = this.renderer.createElement(
          'animate',
          NS,
        ) as SVGAnimateElement;

        const from = Math.random() * 2 + 2;
        const to = from + Math.random() * 2 + 1;
        const dur = Math.random() * 2 + 2;

        this.renderer.setAttribute(animate, 'attributeType', 'CSS');
        this.renderer.setAttribute(animate, 'attributeName', 'stroke-width');
        this.renderer.setAttribute(animate, 'from', `${from.toFixed(0)}px`);
        this.renderer.setAttribute(animate, 'to', `${to.toFixed(0)}px`);
        this.renderer.setAttribute(animate, 'dur', `${dur}s`);
        this.renderer.setAttribute(animate, 'repeatCount', 'indefinite');

        this.renderer.appendChild(el, animate);
      }
    });
  }
}
