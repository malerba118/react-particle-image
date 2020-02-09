
import Universe from './Universe'
import Particle from './Particle'
import Renderer from './Renderer'
import { Nullable } from '../types'
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
  
    private height() {
      return this.canvas.height;
    }
  
    private width() {
      return this.canvas.width;
    }
  
    private clear() {
      this.context()?.clearRect(0, 0, this.width(), this.height());
    }
  
    private drawParticles(particles: Particle[], color: string) {
      const context = this.context()
      if (context) {
        context.fillStyle = color;
        context.beginPath();
        particles.forEach((particle) => {
          context.moveTo( particle.position.x + particle.radius, particle.position.y );
          context.arc(particle.position.x, particle.position.y, particle.perceivedRadius, 0, TwoPI );
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