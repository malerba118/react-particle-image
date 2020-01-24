import React, { useEffect, useRef } from 'react';
import { Universe, Particle, CanvasRenderer, Simulator, ParticleForce, Vector } from '../universe'
import { getImageData, range, shuffle } from '../utils'
import Color from 'color'

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

interface SetupOptions {
    url: string, 
    maxParticles: number, 
    universe: Universe,
}

const setUpImageUniverse = async ({url, maxParticles, universe}: SetupOptions) => {
    const imageData = await getImageData(url, 2.75)
    const imageHeight = imageData.height()
    const imageWidth = imageData.width()
    let numPixels = imageHeight * imageWidth

    let indexArray = shuffle(range(numPixels))

    let selectedPixels = 0

    maxParticles = Math.min(numPixels, maxParticles)

    while (selectedPixels < maxParticles && indexArray.length) {
        const nextIndex = indexArray.pop() || 0
        const x = nextIndex % imageWidth
        const y = Math.floor(nextIndex / imageWidth)
        const pixel = imageData.get(x, y)
        let magnitude = (0.3*pixel.r + 0.59*pixel.g + 0.11*pixel.b) * pixel.a/255
        if (magnitude > 62) {
            const subverse = universe.createSubverse()
            subverse.addParticleForce(blackHole(x, y))
            const color = Color('white')
            subverse.addParticle(new Particle({radius: magnitude/255*2, color: String(color), friction: 25}))
            selectedPixels += 1
        }

    }
    
}

const ParticleImage = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const universeRef = useRef<Universe>()
    const simulatorRef = useRef<Simulator>()

    useEffect(() => {
        if (canvasRef.current) {
            const universe = new Universe({top: 0, left: 0, right: 800, bottom: 600})
            universe.addParticleForce(friction)
            setUpImageUniverse({url: '/sample.png', maxParticles: 10000, universe})
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
        <canvas height={600} width={800} style={{backgroundColor: '#222'}} ref={canvasRef}/>
    )
}

export default ParticleImage