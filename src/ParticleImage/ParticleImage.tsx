import React, { FC, useEffect, useRef } from 'react';
import { Universe, Particle, CanvasRenderer, Simulator, ParticleForce, Vector, forces, PixelManager } from '../universe'
import { getImageData, range, shuffle, getMousePosition, RGBA } from '../utils'
import { Array2D } from '../math'

type PixelOptions = {
    x: number;
    y: number;
    image: Array2D<RGBA>
}

interface SetupOptions {
    url: string;
    maxParticles: number; 
    universe: Universe;
    particleOptions: ParticleOptions;
    scale: number;
    canvasWidth: number;
    canvasHeight: number;
}

interface ParticleOptions {
    filter?: (options: PixelOptions) => boolean;
    radius?: (options: PixelOptions) => number;
    mass?: (options: PixelOptions) => number;
    color?: (options: PixelOptions) => string;
    friction?: (options: PixelOptions) => number;
    initialPosition?: (options: PixelOptions & {finalPosition: Vector}) => Vector;
    initialVelocity?: (options: PixelOptions) => Vector;
}

interface DefaultParticleOptions {
    filter: (options: PixelOptions) => boolean;
    radius: (options: PixelOptions) => number;
    mass: (options: PixelOptions) => number;
    color: (options: PixelOptions) => string;
    friction: (options: PixelOptions) => number;
    initialPosition: (options: PixelOptions & {finalPosition: Vector}) => Vector;
    initialVelocity: (options: PixelOptions) => Vector;
}

const defaultParticleOptions: DefaultParticleOptions = {
    filter: () => true,
    radius: () => 1,
    mass: () => 25,
    color: () => 'white',
    friction: () => 10,
    initialPosition: ({finalPosition}) => finalPosition,
    initialVelocity: () => new Vector(0, 0)
}

interface ParticleImageProps {
    src: string
    height?: number;
    width?: number;
    scale?: number;
    maxParticles?: number;
    entropy?: number;
    backgroundColor?: string;
    particleOptions?: ParticleOptions;
    interactiveForce?: (x: number, y: number) => ParticleForce;
}

const setUpImageUniverse = async ({url, maxParticles, universe, particleOptions, scale, canvasWidth, canvasHeight}: SetupOptions) => {

    const image = await getImageData(url, scale)
    const imageHeight = image.height()
    const imageWidth = image.width()
    let numPixels = imageHeight * imageWidth
    let indexArray = shuffle(range(numPixels))
    let selectedPixels = 0
    let pixelManagers: PixelManager[] = []
    maxParticles = Math.min(numPixels, maxParticles)

    while (selectedPixels < maxParticles && indexArray.length) {
        const nextIndex = indexArray.pop() || 0
        const x = nextIndex % imageWidth
        const y = Math.floor(nextIndex / imageWidth)

        let shouldCreateParticle: boolean;
        if (particleOptions.filter) {
            shouldCreateParticle = particleOptions.filter({x, y, image})
        }
        else {
            shouldCreateParticle = defaultParticleOptions.filter({x, y, image})
        }

        if (shouldCreateParticle) {
            const subverse = universe.createSubverse()

            const pixelManager = new PixelManager({pixelX: x, pixelY: y, scale, imageHeight: image.height(), imageWidth: image.width(), canvasHeight, canvasWidth})
            pixelManagers.push(pixelManager)
            subverse.addParticleForce(pixelManager.getParticleForce())

            let color: string;
            if (particleOptions.color) {
                color = particleOptions.color({x, y, image})
            }
            else {
                color = defaultParticleOptions.color({x, y, image})
            }

            let radius: number;
            if (particleOptions.radius) {
                radius = particleOptions.radius({x, y, image})
            }
            else {
                radius = defaultParticleOptions.radius({x, y, image})
            }

            let friction: number;
            if (particleOptions.friction) {
                friction = particleOptions.friction({x, y, image})
            }
            else {
                friction = defaultParticleOptions.friction({x, y, image})
            }

            let mass: number;
            if (particleOptions.mass) {
                mass = particleOptions.mass({x, y, image})
            }
            else {
                mass = defaultParticleOptions.mass({x, y, image})
            }

            let position: Vector;
            if (particleOptions.initialPosition) {
                position = particleOptions.initialPosition({x, y, image, finalPosition: pixelManager.getPixelPosition()})
            }
            else {
                position = defaultParticleOptions.initialPosition({x, y, image, finalPosition: pixelManager.getPixelPosition()})
            }

            let velocity: Vector;
            if (particleOptions.initialVelocity) {
                velocity = particleOptions.initialVelocity({x, y, image})
            }
            else {
                velocity = defaultParticleOptions.initialVelocity({x, y, image})
            }

            subverse.addParticle(new Particle({radius, mass, color, friction, position, velocity}))
            selectedPixels += 1
        }

    }

    return pixelManagers
    
}

const defaultInteractiveForce =  (x: number, y: number) => forces.whiteHole(x, y, 3)

const ParticleImage: FC<ParticleImageProps> = ({src, height = 400, width = 400, scale = 1, maxParticles = 5000, entropy = 10, backgroundColor = '#222', particleOptions = defaultParticleOptions, interactiveForce = defaultInteractiveForce}) => {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const universeRef = useRef<Universe>()
    const simulatorRef = useRef<Simulator>()
    const mouseParticleForce = useRef<ParticleForce>()
    const pixelManagersRef = useRef<PixelManager[]>([])
    const interactionTimeoutId = useRef<number>()

    useEffect(() => {
        if (canvasRef.current) {
            const universe = new Universe()
            universe.addParticleForce(forces.friction)
            universe.addParticleForce(forces.entropy(entropy))
            setUpImageUniverse({url: src, maxParticles, universe, particleOptions, scale, canvasWidth: width, canvasHeight: height})
                .then((pixelManagers) => {
                    pixelManagersRef.current = pixelManagers
                })
            const renderer = new CanvasRenderer(canvasRef.current)
            const simulator = new Simulator(universe, renderer)
            universeRef.current = universe
            simulatorRef.current = simulator
            simulator.start()
            return () => simulator.stop()
        }
    }, [canvasRef.current])


    useEffect(() => {
        pixelManagersRef.current.forEach((pixelManager) => {
            pixelManager.setScale(scale)
        })
    }, [scale])

    useEffect(() => {
        pixelManagersRef.current.forEach((pixelManager) => {
            pixelManager.setCanvasWidth(width)
        })
    }, [width])

    useEffect(() => {
        pixelManagersRef.current.forEach((pixelManager) => {
            pixelManager.setCanvasHeight(height)
        })
    }, [height])

    return (
        <canvas 
            onMouseMove={(e) => {
                const position = getMousePosition(e)
                if (universeRef.current) {
                    if (mouseParticleForce.current) {
                        window.clearTimeout(interactionTimeoutId.current)
                        universeRef.current.removeParticleForce(mouseParticleForce.current)
                    }
                    const nextForce = interactiveForce(position.x, position.y)
                    mouseParticleForce.current = nextForce
                    universeRef.current.addParticleForce(mouseParticleForce.current)
                    interactionTimeoutId.current = window.setTimeout(() => {
                        universeRef.current?.removeParticleForce(nextForce)
                    }, 100)
                }
            }} 
            height={height} 
            width={width} 
            style={{backgroundColor}} 
            ref={canvasRef}
        />
    )
}

export default ParticleImage