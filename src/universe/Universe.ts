import Particle from './Particle'
import ForceField from './ForceField'
import Vector from './Vector'

class Universe {
    private particles: Particle[]
    private forceFields: ForceField[]

    addParticle(particle: Particle) {
        this.particles.push(particle)
    }

    getParticles(): Particle[] {
        return this.particles
    }

    addForceField(forceField: ForceField) {
        this.forceFields.push(forceField)
    }

    getForceFields(): ForceField[] {
        return this.forceFields
    }

    private applyForces(particle: Particle) {
        const forces: Vector[] = this.forceFields.map(forceField => forceField(particle.position.x, particle.position.y))
        const netForce: Vector = Vector.sum(forces)
        const acceleration: Vector = netForce.divideScalar(particle.mass)
        particle.position.add(particle.velocity)
        particle.velocity.add(acceleration)
    }

    tick() {
        this.particles.forEach((particle) => {
            this.applyForces(particle)
        })
    }
}

export default Universe