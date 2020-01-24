
import Universe from './Universe'
import Particle from './Particle'
import Renderer from './Renderer'
// import Vector from './Vector'
import { Nullable } from './types'
import { groupBy, TwoPI } from '../utils'

class CanvasRenderer extends Renderer {

    canvas: HTMLCanvasElement

    constructor(canvas: HTMLCanvasElement) {
      super()
      this.canvas = canvas;
    }

    private context(): Nullable<CanvasRenderingContext2D> {
        return this.canvas.getContext('2d')
    }
  
    private getHeight() {
      return this.canvas.height;
    }
  
    private getWidth() {
      return this.canvas.width;
    }
  
    private clear() {
      const context = this.context()
      if (context) {
          context.clearRect(0, 0, this.getWidth(), this.getHeight());
      }
    }
  
    private drawParticles(particles: Particle[], color: string) {
      const context = this.context()
      if (context) {
        context.fillStyle = color;
        context.beginPath();
        particles.forEach((particle) => {
          context.moveTo( particle.position.x + particle.radius, particle.position.y ); // This was the line you were looking for
          context.arc(particle.position.x, particle.position.y, particle.radius, 0, TwoPI );
        })
        context.fill();
      }
    }

    drawFrame(universe: Universe) {
      this.clear()
      const particles = universe.getParticles()
      const particlesByColor = groupBy(particles, (particle) => particle.color)
      Object.keys(particlesByColor).forEach((color) => {
        this.drawParticles(particlesByColor[color], color)
      })
    }
  }

  export default CanvasRenderer;