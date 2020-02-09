
import { Particle, ParticleForce, Vector } from '../universe'

function blackHole(blackHoleX: number, blackHoleY: number, strength: number = 1): ParticleForce {
    return (particle: Particle) => {
      let blackHolePosition = new Vector(blackHoleX, blackHoleY);
      return blackHolePosition.subtract(particle.position).multiplyScalar(strength);
    };
  }

function disturbance(x: number, y: number, strength: number = 1): ParticleForce {
    return (particle: Particle) => {
      let holePosition = new Vector(x, y);
      holePosition.subtract(particle.position).multiplyScalar(-1)
      holePosition.divideScalar((holePosition.getMagnitude()^12)/(strength + .001) + .01)
      return holePosition
    };
}

function entropy(n: number): ParticleForce {
    return () => {
        let randomForce = new Vector(Math.random() - 0.5, Math.random() - 0.5);
        return randomForce.multiplyScalar(n);
    };
}

const friction: ParticleForce = (particle: Particle) => {
    const friction = Math.min(Math.max(particle.friction, 0), 1)
    if (particle.velocity.getMagnitude() === 0) {
        return new Vector(0, 0)
    }
    return particle.velocity.clone().multiplyScalar(-(friction * particle.mass))
};

export {
    blackHole,
    disturbance,
    entropy,
    friction
}