import Array2D from './Array2D'

describe('Array2D', () => {
    it('should slice', () => {
        const a = new Array2D([[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16]])
        const sliced = a.slice([0, 2], [0, 2])
        expect(sliced).toEqual(new Array2D([[1, 2], [5, 6]]))
    })

    it('should gridify', () => {
        const a = new Array2D([[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16]])
        const sliced = a.toGrid(2)
        const expected = new Array2D<Array2D<number>>([])
        expected.set(0, 0, new Array2D([[1,2],[5,6]]))
        expected.set(0, 1, new Array2D([[3,4],[7,8]]))
        expected.set(1, 0, new Array2D([[9,10],[13,14]]))
        expected.set(1, 1, new Array2D([[11,12],[15,16]]))
        expect(sliced).toEqual(expected)
    })
})