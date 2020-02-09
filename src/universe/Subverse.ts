import Particle from './Particle'
import ParticleForce from './ParticleForce'
import Vector from './Vector'
import { Bounds, Nullable } from '../types'
import flatMap from 'lodash.flatmap'

export interface SubverseOptions {
    bounds?: Bounds
}

class Subverse {
    private particles: Particle[] = []
    private particleForces: ParticleForce[] = []
    private parent: Nullable<Subverse>
    private options: SubverseOptions
    private subverses: Subverse[] = []

    constructor(parent: Nullable<Subverse>, options: SubverseOptions = {}) {
        this.parent = parent
        this.options = options
    }

    createSubverse(): Subverse {
        let subverse = new Subverse(this, this.options)
        this.subverses.push(subverse)
        return subverse
    }

    removeSubverse(subverse: Subverse) {
        this.subverses = this.subverses.filter(s => s !== subverse)
    }

    addParticle(particle: Particle) {
        this.particles.push(particle)
    }

    removeParticle(particle: Particle) {
        this.particles = this.particles.filter(p => p !== particle)
    }

    getParticles(): Particle[] {
        return this.particles.concat(
            flatMap(
                this.subverses,
                subverse => subverse.getParticles()
            )
        )
    }

    addParticleForce(particleForce: ParticleForce) {
        this.particleForces.push(particleForce)
    }

    removeParticleForce(particleForce: ParticleForce) {
        this.particleForces = this.particleForces.filter(pf => pf !== particleForce)
    }

    getParticleForces(): ParticleForce[] {
        if (!this.parent) {
            return this.particleForces
        }
        return this.parent.getParticleForces().concat(this.particleForces)
    }

    private enforceBounds(particle: Particle, bounds: Bounds) {
        if (particle.position.x > bounds.right) {
          particle.position.x = bounds.right;
          particle.velocity.x *= -1;
        } else if (particle.position.x < bounds.left) {
          particle.position.x = bounds.left;
          particle.velocity.x *= -1;
        }
        if (particle.position.y > bounds.bottom) {
          particle.position.y = bounds.bottom;
          particle.velocity.y *= -1;
        } else if (particle.position.y < bounds.top) {
          particle.position.y = bounds.top;
          particle.velocity.y *= -1;
        }
      }

    private applyForces(particle: Particle, particleForces: ParticleForce[]) {
        const forces: Vector[] = particleForces.map(particleForce => particleForce(particle))
        const netForce: Vector = Vector.sum(forces)
        const acceleration: Vector = netForce.divideScalar(particle.mass)
        particle.position.add(particle.velocity)
        particle.velocity.add(acceleration)
    }

    tick() {
        const particleForces = this.getParticleForces()
        this.particles.forEach((particle) => {
            this.applyForces(particle, particleForces)
            if (this.options.bounds) {
                this.enforceBounds(particle, this.options.bounds)
            }
        })
        this.subverses.forEach(subverse => subverse.tick())
    }
}

export default Subverse