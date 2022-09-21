import type { inferAsyncReturnType } from '@trpc/server'
import { initTRPC } from '@trpc/server'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { observable } from '@trpc/server/observable'
import ws from 'ws'
import { performance } from 'perf_hooks'

const PORT = 8080

const createContext = () => ({})
type Context = inferAsyncReturnType<typeof createContext>

const t = initTRPC.context<Context>().create()
const start = performance.now()

const router = t.router({
  uptime: t.procedure.subscription(() => {
    console.log('uptime subscription hit')
    return observable<{ start: number; uptime: number }>((emit) => {
      const interval = setInterval(() => {
        const now = performance.now()
        const uptime = now - start
        emit.next({ start, uptime })
        console.log('uptime emitting')
      }, 1000)

      return () => clearInterval(interval)
    })
  }),
})

export type Router = typeof router

const { server, listen } = createHTTPServer({
  router,
  createContext,
})

const wss = new ws.Server({ server })
applyWSSHandler<Router>({ wss, router, createContext })

console.log(`🚀 tRPC listening on port ${PORT}`)
listen(PORT)
