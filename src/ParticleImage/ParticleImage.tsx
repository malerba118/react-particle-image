import React, { FC, useEffect, useRef, useCallback, useState, HTMLProps } from 'react';
import throttle from 'lodash.throttle'
import { Universe, UniverseState, CanvasRenderer, Simulator, ParticleForce, Vector, forces, PixelManager, Array2D, timing } from '../universe'
import { getMousePosition, getTouchPosition, RGBA } from '../utils'
import createImageUniverse, { ImageUniverseSetupResult } from './createImageUniverse'
import useTransientParticleForce from './useTransientParticleForce';
import { Dimensions, ImageState } from '../types'

export type PixelOptions = {
    x: number;
    y: number;
    image: Array2D<RGBA>
}

/**
 * Options to be applied to particles during their creation. 
 */
export interface ParticleOptions {

    /**
     * Given a pixel in the img, the filter determines whether or not a particle should be created for this pixel. 
     * This is run for all pixels in the image in random order until maxParticles limit is reached. If the filter
     * returns true, a particle will be created for this pixel.
     */
    filter?: (options: PixelOptions) => boolean;

    /**
     * Given a pixel in the img, calculates the radius of the corresponding particle.
     * This function is only executed on pixels whose filters return true.
     */
    radius?: (options: PixelOptions) => number;

    /**
     * Given a pixel in the img, calculates the mass of the corresponding particle.
     * This function is only executed on pixels whose filters return true.
     */
    mass?: (options: PixelOptions) => number;

    /**
     * Given a pixel in the img, calculates the color of the corresponding particle.
     * Fewer colors will result in better performance (higher framerates).
     * This function is only executed on pixels whose filters return true.
     */
    color?: (options: PixelOptions) => string;

    /**
     * Given a pixel in the img, calculates the coefficient of kinetic friction of the corresponding particle.
     * This should have a value between 0 and 1.
     * This function is only executed on pixels whose filters return true.
     */
    friction?: (options: PixelOptions) => number;

    /**
     * Given a pixel in the img, calculates the initial position vector of the corresponding particle.
     * This function is only executed on pixels whose filters return true.
     */
    initialPosition?: (options: PixelOptions & {finalPosition: Vector, canvasDimensions: Dimensions}) => Vector;

    /**
     * Given a pixel in the img, calculates the initial velocity vector of the corresponding particle.
     * This function is only executed on pixels whose filters return true.
     */
    initialVelocity?: (options: PixelOptions) => Vector;
}

/**
 * Available props for ParticleImage.
 * @noInheritDoc
 */
export interface ParticleImageProps extends HTMLProps<HTMLCanvasElement> {
    /**
     * Img src url to load image
     */
    src: string

    /**
     * Height of the canvas.
     */
    height?: number;

    /**
     * Width of the canvas.
     */
    width?: number;

    /**
     * Scales the image provided via src.
     */
    scale?: number;

    /**
     * The maximum number of particles that will be created in the canvas.
     */
    maxParticles?: number;

    /**
     * The amount of entropy to act on the particles.
     */
    entropy?: number;

    /**
     * The background color of the canvas.
     */
    backgroundColor?: string;

    /**
     * Options to be applied to particles during their creation.
     */
    particleOptions?: ParticleOptions;

    /**
     * An interactive force to be applied to the particles during mousemove events.
     */
    mouseMoveForce?: (x: number, y: number) => ParticleForce;

    /**
     * Time in milliseconds that force resulting from mousemove event should last in universe.
     */
    mouseMoveForceDuration?: number;

    /**
     * An interactive force to be applied to the particles during touchmove events.
     */
    touchMoveForce?: (x: number, y: number) => ParticleForce;

    /**
     * Time in milliseconds that force resulting from mousemove event should last in universe.
     */
    touchMoveForceDuration?: number;

    /**
     * An interactive force to be applied to the particles during mousedown events.
     */
    mouseDownForce?: (x: number, y: number) => ParticleForce;

    /**
     * Time in milliseconds that force resulting from mousemove event should last in universe.
     */
    mouseDownForceDuration?: number;

    /**
     * The duration in milliseconds that it should take for the universe to reach full health.
     */
    creationDuration?: number;

    /**
     * The duration in milliseconds that it should take for the universe to die.
     */
    deathDuration?: number;

    /**
     * A timing function to dictate how the particles in the universe grow from radius zero to their full radius.
     * This function receives a progress argument between 0 and 1 and should return a number between 0 and 1.
     */
    creationTimingFn?: timing.TimingFunction;

    /**
     * A timing function to dictate how the particles in the universe shrink from their full radius to radius zero.
     * This function receives a progress argument between 0 and 1 and should return a number between 0 and 1.
     */
    deathTimingFn?: timing.TimingFunction;

    /**
     * Callback invoked on universe state changes.
     */
    onUniverseStateChange?: (state: UniverseState, universe: Universe) => void;

    /**
     * Callback invoked on image loading state changes.
     */
    onImageStateChange?: (state: ImageState) => void;
}

/**
 * Default particle options
 * @internal
 */
const defaultParticleOptions: Required<ParticleOptions> = {
    filter: () => true,
    radius: () => 1,
    mass: () => 50,
    color: () => 'white',
    friction: () => .15,
    initialPosition: ({finalPosition}) => finalPosition,
    initialVelocity: () => new Vector(0, 0)
}

const ParticleImage: FC<ParticleImageProps> = ({
    src, 
    height = 400, 
    width = 400, 
    scale = 1, 
    maxParticles = 5000, 
    entropy = 20, 
    backgroundColor = '#222', 
    particleOptions = {}, 
    mouseMoveForce, 
    touchMoveForce, 
    mouseDownForce,
    mouseMoveForceDuration = 100,
    touchMoveForceDuration = 100,
    mouseDownForceDuration = 100,
    creationTimingFn,
    creationDuration,
    deathTimingFn,
    deathDuration,
    onUniverseStateChange,
    onImageStateChange,
    style={}, 
    ...otherProps
}) => {
    
    const [canvas, setCanvas] = useState<HTMLCanvasElement>()
    const [universe, setUniverse] = useState<Universe>()
    const simulatorRef = useRef<Simulator>()
    const entropyForceRef = useRef<ParticleForce>()
    const [pixelManagers, setPixelManagers] = useState<PixelManager[]>([])

    const mergedParticleOptions: Required<ParticleOptions> = {
        ...defaultParticleOptions,
        ...particleOptions
    }

    useEffect(() => {
        if (canvas) {
            const renderer = new CanvasRenderer(canvas)
            const simulator = new Simulator(renderer)
            simulatorRef.current = simulator
            simulator.start()
            return () => simulator.stop()
        }
    }, [canvas])

    useEffect(() => {
        if (canvas) {
            const canvasDimensions = {
                width: canvas.width,
                height: canvas.height
            }
            const death = universe?.die()
            const setUp = createImageUniverse({
                url: src, 
                maxParticles, 
                particleOptions: mergedParticleOptions, 
                scale, 
                canvasDimensions,
                creationTimingFn,
                creationDuration,
                deathTimingFn,
                deathDuration,
                onUniverseStateChange
            })
            onImageStateChange?.(ImageState.Loading)
            setUp
                .then(() => {
                    onImageStateChange?.(ImageState.Loaded)
                })
                .catch(() => {
                    onImageStateChange?.(ImageState.Error)
                })
            Promise.all<ImageUniverseSetupResult, void>([setUp, death])
                .then(([{universe, pixelManagers}]) => {
                    setPixelManagers(pixelManagers)
                    universe.addParticleForce(forces.friction)
                    simulatorRef.current?.setUniverse(universe)
                    setUniverse(universe)
                })
                .catch(() => {
                    // Eat it here, let the consumer handle it via onImageStateChange
                })
        }
    }, [canvas, src])

    useEffect(() => {
        universe?.setOnStateChange(onUniverseStateChange)
    }, [universe, onUniverseStateChange])

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
    }, [scale, updateScale])

    useEffect(() => {
        updateWidth(width)
    }, [width, updateWidth])

    useEffect(() => {
        updateHeight(height)
    }, [height, updateHeight])

    useEffect(() => {
        const entropyForce = forces.entropy(entropy)
        universe?.addParticleForce(entropyForce)
        entropyForceRef.current = entropyForce
        return () => {
            universe?.removeParticleForce(entropyForce)
        }
    }, [entropy, canvas, universe])

    const [mouseMoveParticleForce, setMouseMoveParticleForce] = useTransientParticleForce({universe, duration: mouseMoveForceDuration})
    const [touchMoveParticleForce, setTouchMoveParticleForce] = useTransientParticleForce({universe, duration: touchMoveForceDuration})
    const [mouseDownParticleForce, setMouseDownParticleForce] = useTransientParticleForce({universe, duration: mouseDownForceDuration})

    const handleMouseMove = (e) => {
        if (mouseMoveForce) {
            const position = getMousePosition(e)
            setMouseMoveParticleForce(() => mouseMoveForce(position.x, position.y))
        }
        otherProps.onMouseMove?.(e)
    }

    const handleTouchMove = (e) => {
        if (touchMoveForce) {
            const position = getTouchPosition(e)
            setTouchMoveParticleForce(() => touchMoveForce(position.x, position.y))
        }
        otherProps.onTouchMove?.(e)
    }

    const handleMouseDown = (e) => {
        if (mouseDownForce) {
            const position = getMousePosition(e)
            setMouseDownParticleForce(() => mouseDownForce(position.x, position.y))
        }
        otherProps.onMouseDown?.(e)
    }

    return (
        <canvas
            {...otherProps}
            onMouseMove={handleMouseMove} 
            onTouchMove={handleTouchMove} 
            onMouseDown={handleMouseDown}
            height={height} 
            width={width} 
            style={{backgroundColor, touchAction: 'none', ...style}} 
            ref={(c) =>  {
                if (c?.getContext('2d')) {
                    setCanvas(c)
                }
            }}
        />
    )
}

export default ParticleImage