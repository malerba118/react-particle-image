
import Particle from './Particle'
import Renderer from './Renderer'
import { Nullable } from './types'

class CanvasRenderer extends Renderer {

    canvas: HTMLCanvasElement
    context: Nullable<CanvasRenderingContext2D>

    constructor(canvas: HTMLCanvasElement) {
      super()
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
    }
  
    getHeight() {
      return this.canvas.height;
    }
  
    getWidth() {
      return this.canvas.width;
    }
  
    clear() {
      this.context && this.context.clearRect(0, 0, this.getWidth(), this.getHeight());
    }
  
    drawParticle(particle: Particle) {
        if (this.context) {
            this.context.fillStyle = particle.color;
            this.context.fillRect(particle.position.x, particle.position.y, particle.radius, particle.radius);
        }
    }
  }

  export default CanvasRenderer;