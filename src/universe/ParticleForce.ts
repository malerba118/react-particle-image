import Vector from './Vector'
import Particle from './Particle'

type ParticleForce = (particle: Particle) => Vector

export default ParticleForce