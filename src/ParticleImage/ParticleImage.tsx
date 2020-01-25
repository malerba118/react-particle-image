import React, { useEffect, useRef } from 'react';
import { Universe, Particle, CanvasRenderer, Simulator, ParticleForce, Vector } from '../universe'
import { getImageData, range, shuffle, getMousePosition } from '../utils'
import Color from 'color'

function blackHole(blackHoleX: number, blackHoleY: number, strength: number = 1): ParticleForce {
    return (particle: Particle) => {
      let blackHolePosition = new Vector(blackHoleX, blackHoleY);
      return blackHolePosition.subtract(particle.position).multiplyScalar(strength);
    };
  }

  function whiteHole(x: number, y: number, strength: number = 1): ParticleForce {
    return (particle: Particle) => {
      let holePosition = new Vector(x, y);
      holePosition.subtract(particle.position).multiplyScalar(-1)
      holePosition.divideScalar((holePosition.getMagnitude()^10)/strength + .01)
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
    const friction = Math.max(particle.friction, 0)
    return particle.velocity.clone().multiplyScalar(-friction)
};

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
    const mouseParticleForce = useRef<ParticleForce>()
    const interactionTimeoutId = useRef<number>()


    useEffect(() => {
        if (canvasRef.current) {
            const universe = new Universe()
            universe.addParticleForce(friction)
            universe.addParticleForce(entropy(25))
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
        <canvas 
            onMouseMove={(e) => {
                const position = getMousePosition(e)
                if (universeRef.current) {
                    if (mouseParticleForce.current) {
                        window.clearTimeout(interactionTimeoutId.current)
                        universeRef.current.removeParticleForce(mouseParticleForce.current)
                    }
                    const nextForce = whiteHole(position.x, position.y, 3)
                    mouseParticleForce.current = nextForce
                    universeRef.current.addParticleForce(mouseParticleForce.current)
                    interactionTimeoutId.current = window.setTimeout(() => {
                        universeRef.current?.removeParticleForce(nextForce)
                    }, 100)
                }
            }} 
            height={600} 
            width={800} 
            style={{backgroundColor: '#222'}} 
            ref={canvasRef}
        />
    )
}

export default ParticleImage