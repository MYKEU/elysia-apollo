import KingWorld from 'kingworld'

import staticPlugin from '../src'

import { describe, expect, it } from 'bun:test'

const req = (path: string) => new Request(path)

const takodachi = await Bun.file('public/takodachi.png').text()

describe('Static Plugin', () => {
    it('should get root path', async () => {
        const app = new KingWorld().use(staticPlugin)

        const res = await app.handle(req('/public/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should get nested path', async () => {
        const app = new KingWorld().use(staticPlugin)

        const res = await app.handle(req('/public/nested/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should get different path', async () => {
        const app = new KingWorld().use(staticPlugin, {
            path: 'public-aliased'
        })

        const res = await app.handle(req('/public/tako.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should handle prefix', async () => {
        const app = new KingWorld().use(staticPlugin, {
            prefix: '/static'
        })

        const res = await app.handle(req('/static/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should handle empty prefix', async () => {
        const app = new KingWorld().use(staticPlugin, {
            prefix: ''
        })

        const res = await app.handle(req('/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should supports multiple public', async () => {
        const app = new KingWorld()
            .use(staticPlugin, {
                prefix: '/public-aliased',
                path: 'public-aliased'
            })
            .use(staticPlugin, {
                prefix: '/public'
            })

        const res = await app.handle(req('/public/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should supports mixed folder', async () => {
        const app = new KingWorld()
            .use(staticPlugin, {
                path: 'public-aliased'
            })
            .use(staticPlugin)

        const file1 = await app.handle(req('/public/takodachi.png'))
        const file2 = await app.handle(req('/public/takodachi.png'))
        const blob1 = await file1.blob()
        const blob2 = await file2.blob()

        expect(await blob1.text()).toBe(takodachi)
        expect(await blob2.text()).toBe(takodachi)
    })

    it('ignore string pattern', async () => {
        const app = new KingWorld().use(staticPlugin, {
            ignorePatterns: ['public/takodachi.png']
        })

        const res = await app.handle(req('/public/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe('Not Found')
    })

    it('ignore regex pattern', async () => {
        const app = new KingWorld()
            .use(staticPlugin, {
                ignorePatterns: [/takodachi.png$/]
            })
            .use(staticPlugin, {
                path: 'public-aliased',
                ignorePatterns: [/takodachi.png$/]
            })

            const file1 = await app.handle(req('/public/takodachi.png'))
            const file2 = await app.handle(req('/public/tako.png'))
            const blob1 = await file1.blob()
            const blob2 = await file2.blob()
    
            expect(await blob1.text()).toBe("Not Found")
            expect(await blob2.text()).toBe(takodachi)
        })
})
