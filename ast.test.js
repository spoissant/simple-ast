import analyze from './src/analyzer';
import filter from './src/interpreter'

it('should convert a simple string query to an AST', () => {
    const query = 'POWER > 9000'
    const root = analyze(query)

    expect(root.token).toBe('>')
    expect(root.left.token).toBe('POWER')
    expect(root.right.token).toBe('9000')
})

it('should convert a complex string query to an AST', () => {
    const query = 'SKAVEN & (MA > 40 || MD < 50) & TYPE != MONSTER'
    const root = analyze(query)

    expect(root.token).toBe('&')
    expect(root.left.token).toBe('&')
    expect(root.left.left.token).toBe('SKAVEN')
    expect(root.left.right.token).toBe('||')
    expect(root.left.right.left.token).toBe('>')
    expect(root.left.right.left.left.token).toBe('MA')
    expect(root.left.right.left.right.token).toBe('40')
    expect(root.left.right.right.token).toBe('<')
    expect(root.left.right.right.left.token).toBe('MD')
    expect(root.left.right.right.right.token).toBe('50')
    expect(root.right.token).toBe('!=')
    expect(root.right.left.token).toBe('TYPE')
    expect(root.right.right.token).toBe('MONSTER')
})

it('example interpreter should filter with numbers', () => {
    const query = 'power > 9000'
    const root = analyze(query)

    const objects = [
        {
            key: 'Unit1',
            power: 8000
        },
        {
            key: 'Unit2',
            power: 10000
        }
    ]

    const res = objects.filter((v) => filter(root, v))

    expect(res.length).toBe(1)
    expect(res[0].key).toBe('Unit2')
})

it('example interpreter should look for simple text query in every fields', () => {
    const query = 'Bob'
    const root = analyze(query)

    const objects = [
        {
            key: 'Unit1',
            name: 'Bob',
            favoriteSport: 'Ultimate Frisbee'
        },
        {
            key: 'Unit2',
            name: 'Hulk',
            favoriteSport: 'Bobsleigh"'
        }
    ]

    const res = objects.filter((v) => filter(root, v))

    expect(res.length).toBe(2)
    expect(res[0].key).toBe('Unit1')
    expect(res[1].key).toBe('Unit2')
})