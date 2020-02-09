import Subverse from './Subverse'
import Particle from './Particle'
import { Bounds, Optional } from '../types'
import timing, { TimingFunction } from './timing'

export interface UniverseOptions {
    bounds?: Bounds;
    frameRate?: number;
    creationDuration?: number;
    deathDuration?: number;
    creationTimingFn?: TimingFunction;
    deathTimingFn?: TimingFunction;
    onStateChange?: (state: UniverseState, universe: Universe) => void
}

export enum UniverseState {
    Creating = 'Creating',
    Created = 'Created',
    Dying = 'Dying',
    Dead = 'Dead'
}

class Universe extends Subverse {

    private state: UniverseState
    private resolveDeath: (value?: any) => void
    private health: number = 0
    private frameRate: number
    private creationDuration: number
    private creationRate: number = 1
    private deathDuration: number
    private deathRate: number = 1
    private creationTimingFn: TimingFunction
    private deathTimingFn: TimingFunction
    private onStateChange?: (state: UniverseState, universe: Universe) => void

    constructor({ bounds, frameRate = 30, creationDuration = 500, deathDuration = 500, creationTimingFn = timing.easeInQuad, deathTimingFn = timing.easeInQuad, onStateChange }: UniverseOptions = {}) {
        super(null, { bounds })
        this.setFrameRate(frameRate)
        this.setCreationDuration(creationDuration)
        this.setDeathDuration(deathDuration)
        this.creationTimingFn = creationTimingFn
        this.deathTimingFn = deathTimingFn
        this.onStateChange = onStateChange
        this.setState(UniverseState.Creating)
    }

    private setState(val: UniverseState) {
        this.state = val
        this.onStateChange?.(val, this)
    }

    private applyGrowth(particle: Particle) {
        particle.perceivedRadius = particle.radius * this.creationTimingFn(this.health)
    }

    private applyDecay(particle: Particle) {
        particle.perceivedRadius = particle.radius * this.deathTimingFn(this.health)
    }

    setCreationDuration(creationDuration: number) {
        this.creationDuration = creationDuration
        this.creationRate = 1000 / (this.creationDuration * this.frameRate)
    }

    setDeathDuration(deathDuration: number) {
        this.deathDuration = deathDuration
        this.deathRate = 1000 / (this.deathDuration * this.frameRate)
    }

    setFrameRate(frameRate: number) {
        this.frameRate = frameRate
        this.creationRate = 1000 / (this.creationDuration * this.frameRate)
        this.deathRate = 1000 / (this.deathDuration * this.frameRate)
    }

    setOnStateChange(onStateChange: Optional<(state: UniverseState, universe: Universe) => void>) {
        this.onStateChange = onStateChange
    }

    die(): Promise<void> {
        this.setState(UniverseState.Dying)
        return new Promise((resolve) => {
            this.resolveDeath = resolve
        })
    }

    tick() {
        if (this.state === UniverseState.Creating) {
            this.health = Math.min(this.health + this.creationRate, 1)
            this.getParticles().forEach((particle) => {
                this.applyGrowth(particle)
            })
            if (this.health === 1) {
                this.setState(UniverseState.Created)
            }
        }
        else if (this.state === UniverseState.Dying) {
            this.health = Math.max(this.health - this.deathRate, 0)
            this.getParticles().forEach((particle) => {
                this.applyDecay(particle)
            })
            if (this.health === 0) {
                this.setState(UniverseState.Dead)
                this.resolveDeath()
            }
        }
        super.tick()
    }
}

export default Universe