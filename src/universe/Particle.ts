import Vector from './Vector'

class Particle {
    radius: number;
    friction: number;
    mass: number;
    position: Vector;
    velocity: Vector;
    color: string;
    
    constructor({
        radius = 1,
        friction = 10,
        mass = 100,
        position = new Vector(0, 0),
        velocity = new Vector(0, 0),
        color = 'white'
    } = {}) {
        this.radius = radius
        this.friction = friction
        this.mass = mass
        this.position = position
        this.velocity = velocity
        this.color = color
    }
  }
  

export default Particle