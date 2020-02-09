import { useEffect, useState } from 'react';
import { Universe, ParticleForce } from '../universe'
import { Optional, Nullable } from '../universe/types'

interface UseTransientParticleForceParams  {
    universe: Optional<Universe>; 
    duration?: number;
}

type UseTransientParticleForceReturn = [
    Nullable<ParticleForce>, 
    React.Dispatch<React.SetStateAction<Nullable<ParticleForce>>>
]

const useTransientParticleForce = ({universe, duration = 100}: UseTransientParticleForceParams): UseTransientParticleForceReturn => {
    const [particleForce, setParticleForce] = useState<Nullable<ParticleForce>>(null)

    useEffect(() => {
        if (universe && particleForce) {
            universe.addParticleForce(particleForce)
            const timeoutId = window.setTimeout(() => {
                universe.removeParticleForce(particleForce)
                setParticleForce(null)
            }, duration)
            return () => {
                window.clearTimeout(timeoutId)
                universe.removeParticleForce(particleForce)
                setParticleForce(null)
            }
        }
    }, [universe, particleForce, duration])

    return [particleForce, setParticleForce]
}

export default useTransientParticleForce