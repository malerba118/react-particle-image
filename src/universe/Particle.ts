import Vector from './Vector'

class Particle {
    radius: number;
    perceivedRadius: number = 0;
    friction: number;
    mass: number;
    position: Vector;
    velocity: Vector;
    color: string;
    growthRate: number;
    decayRate: number;
    
    constructor({
        radius = 1,
        friction = 10,
        mass = 100,
        position = new Vector(0, 0),
        velocity = new Vector(0, 0),
        color = 'black',
        growthRate = .05,
        decayRate = .05
    } = {}) {
        this.radius = radius
        this.friction = friction
        this.mass = mass
        this.position = position
        this.velocity = velocity
        this.color = color
        this.growthRate = growthRate
        this.decayRate = decayRate
    }
  }
  

export default Particle