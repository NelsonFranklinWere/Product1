export function createWs(url: string) {
  const socket = new WebSocket(url)
  const listeners: Array<(data: any) => void> = []

  socket.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data)
      listeners.forEach((l) => l(data))
    } catch {
      // ignore
    }
  }

  return {
    socket,
    onMessage(cb: (data: any) => void) {
      listeners.push(cb)
    },
    send(data: any) {
      socket.send(JSON.stringify(data))
    },
    close() {
      socket.close()
    },
  }
}


