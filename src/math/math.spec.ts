import Array2D from './Array2D'

describe('Array2D', () => {
    it('should slice', () => {
        const a = new Array2D([[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16]])
        const sliced = a.slice([0, 2], [0, 2])
        expect(sliced).toEqual(new Array2D([[1, 2], [5, 6]]))
    })
})