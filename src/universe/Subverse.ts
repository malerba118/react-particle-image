import Particle from './Particle'
import ParticleForce from './ParticleForce'
import Vector from './Vector'
import { Bounds, Nullable } from './types'


class Subverse {
    private particles: Particle[] = []
    private particleForces: ParticleForce[] = []
    private parent: Nullable<Subverse>
    private bounds: Bounds
    private subverses: Subverse[] = []

    constructor(parent: Nullable<Subverse>, bounds: Bounds) {
        this.parent = parent
        this.bounds = bounds
    }

    createSubverse(): Subverse {
        let subverse = new Subverse(this, this.bounds)
        this.subverses.push(subverse)
        return subverse
    }

    addParticle(particle: Particle) {
        this.particles.push(particle)
    }

    getParticles(): Particle[] {
        return this.particles.concat(
            this.subverses.flatMap(
                subverse => subverse.getParticles()
            )
        )
    }

    addParticleForce(particleForce: ParticleForce) {
        this.particleForces.push(particleForce)
    }

    getParticleForces(): ParticleForce[] {
        if (!this.parent) {
            return this.particleForces
        }
        return this.parent.getParticleForces().concat(this.particleForces)
    }

    private enforceBounds(particle: Particle) {
        if (particle.position.x > this.bounds.right) {
          particle.position.x = this.bounds.right;
          particle.velocity.x *= -1;
        } else if (particle.position.x < this.bounds.left) {
          particle.position.x = this.bounds.left;
          particle.velocity.x *= -1;
        }
        if (particle.position.y > this.bounds.bottom) {
          particle.position.y = this.bounds.bottom;
          particle.velocity.y *= -1;
        } else if (particle.position.y < this.bounds.top) {
          particle.position.y = this.bounds.top;
          particle.velocity.y *= -1;
        }
      }

    private applyForces(particle: Particle, particleForces: ParticleForce[]) {
        const forces: Vector[] = particleForces.map(particleForce => particleForce(particle))
        const netForce: Vector = Vector.sum(forces)
        const acceleration: Vector = netForce.divideScalar(particle.mass)
        particle.position.add(particle.velocity)
        particle.velocity.add(acceleration)
        this.enforceBounds(particle)
    }

    tick() {
        const particleForces = this.getParticleForces()
        this.particles.forEach((particle) => {
            this.applyForces(particle, particleForces)
        })
        this.subverses.forEach(subverse => subverse.tick())
    }
}

export default Subverse