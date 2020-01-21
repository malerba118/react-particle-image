import React, { useEffect, useRef } from 'react';
import { Universe, Particle, CanvasRenderer, Simulator, ParticleForce, Vector } from '../universe'
import { getImageData } from '../utils'

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

// const hole: ParticleForce = blackHole(200, 200)

const setUpImageUniverse = async (url: string, binSize: number, universe: Universe) => {
    const imageData = await getImageData(url)
    imageData.toGrid(binSize).forEach((cell, x, y) => {
        cell.forEach((rgba) => {
            let magnitude = 0.3*rgba.r + 0.59*rgba.g + 0.11*rgba.b
            if (magnitude > 230) {
                const subverse = universe.createSubverse()
                subverse.addParticleForce(blackHole(x*binSize, y*binSize))
                subverse.addParticle(new Particle({radius: magnitude / 100, color: 'white'}))
            }
        })
    })
}

const ParticleImage = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const universeRef = useRef<Universe>()
    const simulatorRef = useRef<Simulator>()

    useEffect(() => {
        if (canvasRef.current) {
            const universe = new Universe({top: 0, left: 0, right: 400, bottom: 400})
            universe.addParticleForce(friction)
            setUpImageUniverse('/sample.png', 5, universe)
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
        <canvas height={400} width={400} style={{backgroundColor: '#222'}} ref={canvasRef}/>
    )
}

export default ParticleImage