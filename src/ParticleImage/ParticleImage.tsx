import React, { FC, useEffect, useRef, useCallback, useState } from 'react';
import { Universe, Particle, CanvasRenderer, Simulator, ParticleForce, Vector, forces, PixelManager } from '../universe'
import { getImageData, range, shuffle, getMousePosition, RGBA } from '../utils'
import { Array2D } from '../math'
import throttle from 'lodash.throttle'

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

type DefaultParticleOptions = Required<ParticleOptions>

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

    const image = await getImageData(url)
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

    const [canvas, setCanvas] = useState<HTMLCanvasElement>()
    const universeRef = useRef<Universe>()
    const simulatorRef = useRef<Simulator>()
    const mouseParticleForce = useRef<ParticleForce>()
    const entropyForceRef = useRef<ParticleForce>()
    const [pixelManagers, setPixelManagers] = useState<PixelManager[]>([])
    const interactionTimeoutId = useRef<number>()

    useEffect(() => {
        if (canvas) {
            const universe = new Universe()
            universe.addParticleForce(forces.friction)
            setUpImageUniverse({url: src, maxParticles, universe, particleOptions, scale, canvasWidth: width, canvasHeight: height})
                .then((managers) => {
                    setPixelManagers(managers)
                })
            const renderer = new CanvasRenderer(canvas)
            const simulator = new Simulator(universe, renderer)
            universeRef.current = universe
            simulatorRef.current = simulator
            simulator.start()
            return () => simulator.stop()
        }
    }, [canvas, src])

    const updateScale = useCallback(throttle((scale: number) => {
        pixelManagers.forEach((pixelManager) => {
            pixelManager.setScale(scale)
        })
    }, 50), [pixelManagers])

    const updateWidth = useCallback(throttle((width: number) => {
        pixelManagers.forEach((pixelManager) => {
            pixelManager.setCanvasWidth(width)
        })
    }, 50), [pixelManagers])

    const updateHeight = useCallback(throttle((height: number) => {
        pixelManagers.forEach((pixelManager) => {
            pixelManager.setCanvasHeight(height)
        })
    }, 50), [pixelManagers])

    useEffect(() => {
        updateScale(scale)
    }, [scale, pixelManagers])

    useEffect(() => {
        updateWidth(width)
    }, [width, pixelManagers])

    useEffect(() => {
        updateHeight(height)
    }, [height, pixelManagers])

    useEffect(() => {
        const entropyForce = forces.entropy(entropy)
        universeRef.current?.addParticleForce(entropyForce)
        entropyForceRef.current = entropyForce
        return () => {
            universeRef.current?.removeParticleForce(entropyForce)
        }
    }, [entropy, canvas, src])

    const handleMouseMove = useCallback((e) => {
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
    }, [])

    return (
        <canvas 
            onMouseMove={handleMouseMove} 
            height={height} 
            width={width} 
            style={{backgroundColor}} 
            ref={(c) =>  {
                if (c?.getContext('2d')) {
                    setCanvas(c)
                }
            }}
        />
    )
}

export default ParticleImage