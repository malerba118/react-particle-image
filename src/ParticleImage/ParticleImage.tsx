import React, { useEffect, useRef } from 'react';
import { Universe, Particle, CanvasRenderer, Simulator, ParticleForce, Vector } from '../universe'

function blackHole(blackHoleX: number, blackHoleY: number, strength: number = 1): ParticleForce {
    return (particle: Particle) => {
      let blackHolePosition = new Vector(blackHoleX, blackHoleY);
      return blackHolePosition.subtract(particle.position).multiplyScalar(strength);
    };
  }

const friction: ParticleForce = (particle: Particle) => {
    const friction = Math.max(particle.friction, 0)
    return particle.velocity.clone().multiplyScalar(-friction)
};

const hole: ParticleForce = blackHole(200, 200)

const ParticleImage = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const universeRef = useRef<Universe>()
    const simulatorRef = useRef<Simulator>()

    useEffect(() => {
        if (canvasRef.current) {
            const universe = new Universe({top: 0, left: 0, right: 400, bottom: 400})
            const sub1 = universe.createSubverse()
            sub1.addParticle(new Particle({radius: 5, mass: 500, friction: 10, color: 'black'}))
            universe.addParticleForce(hole)
            sub1.addParticleForce(friction)
            const renderer = new CanvasRenderer(canvasRef.current)
            const simulator = new Simulator(universe, renderer)
            universeRef.current = universe
            simulatorRef.current = simulator

            simulator.start()

            return () => simulator.stop()
        }
        return () => {}
    }, [canvasRef.current])

    return (
        <canvas height={400} width={400} style={{backgroundColor: 'efefef'}} ref={canvasRef}/>
    )
}

export default ParticleImage