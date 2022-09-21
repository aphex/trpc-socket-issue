import { createTRPCProxyClient, createWSClient, httpLink, splitLink, wsLink } from '@trpc/client'
import { Router } from '../../server/'
const HTTP_URL = '/trpc'
const WS_URL = 'ws://localhost:8080/'
const app = document.querySelector<HTMLDivElement>('#app')

const client = createTRPCProxyClient<Router>({
  links: [
    splitLink({
      condition(op) {
        return op.type === 'subscription'
      },
      true: wsLink({
        client: createWSClient({
          url: WS_URL,
          onClose() {
            console.log('Socket Connection Closed')
          },
          onOpen() {
            console.log('Socket Connection Opened')
          },
        }),
      }),
      false: httpLink({ url: HTTP_URL }),
    }),
  ],
})

let uptime = 0
const render = () => app && (app.innerHTML = `<p>${uptime}</p>`)

client.uptime.subscribe(undefined, {
  onData(data) {
    uptime = data.uptime
    render()
  },
})

render()
