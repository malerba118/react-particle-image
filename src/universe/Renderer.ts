
import Particle from './Particle'

abstract class Renderer {
    abstract getHeight(): number
    abstract getWidth(): number
    abstract clear(): void
    abstract drawParticle(particle: Particle): void
}

export default Renderer