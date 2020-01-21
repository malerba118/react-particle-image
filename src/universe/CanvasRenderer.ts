
import Particle from './Particle'
import Renderer from './Renderer'
import Vector from './Vector'
import { Nullable } from './types'

class CanvasRenderer extends Renderer {

    canvas: HTMLCanvasElement

    constructor(canvas: HTMLCanvasElement) {
      super()
      this.canvas = canvas;
    }

    context(): Nullable<CanvasRenderingContext2D> {
        return this.canvas.getContext('2d')
    }
  
    getHeight() {
      return this.canvas.height;
    }
  
    getWidth() {
      return this.canvas.width;
    }
  
    clear() {
      const context = this.context()
      if (context) {
          context.clearRect(0, 0, this.getWidth(), this.getHeight());
      }
    }
  
    drawParticle(particle: Particle) {
        const context = this.context()
        if (context) {
            this.drawCircle(particle.radius, particle.position, particle.color);
        }
    }

    private drawCircle(radius: number, position: Vector, color: string) {
        const context = this.context()
        if (context) {
            context.beginPath();
            context.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
            context.fillStyle = color;
            context.fill();
        }
    }
  }

  export default CanvasRenderer;