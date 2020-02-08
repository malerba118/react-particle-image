import { useEffect } from 'react';
import { Universe, ParticleForce } from '../universe'
import { Optional } from '../universe/types'

interface UseTransientParticleForceParams  {
    universe: Optional<Universe>; 
    particleForce: Optional<ParticleForce>;
    duration?: number;
}

const useTransientParticleForce = ({universe, particleForce, duration = 100}: UseTransientParticleForceParams) => {
    useEffect(() => {
        if (universe && particleForce) {
            universe.addParticleForce(particleForce)
            const timeoutId = window.setTimeout(() => {
                universe.removeParticleForce(particleForce)
            }, duration)
            return () => {
                window.clearTimeout(timeoutId)
                universe.removeParticleForce(particleForce)
            }
        }
    }, [universe, particleForce, duration])
}

export default useTransientParticleForce