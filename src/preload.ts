import { ipcRenderer as ipc } from 'electron'
import log from 'electron-log'
import elementReady from 'element-ready'
import { type ConfigKey } from './config'
import initDarkMode from './dark-mode'

const INTERVAL = 1000
let count: number

initDarkMode()

function getUnreadCount(): number {
  // Find the number next to the inbox label
  const navigation = document.querySelector('div[role=navigation]')

  if (navigation) {
    const label = navigation.querySelector('div[role=link]>span>span')

    // Return the unread count (0 by default)
    if (label?.textContent) {
      return Number(/\d*/.exec(label.textContent))
    }
  }

  return 0
}

function updateUnreadCount(): void {
  const newCount = getUnreadCount()

  // Only fire the event when necessary
  if (count !== newCount) {
    ipc.send('unread-count', newCount)
    count = newCount
  }
}

function attachButtonListeners(): void {
  // For windows that won't include the selectors we are expecting,
  //   don't wait for them appear as they never will
  if (!window.location.search.includes('&search=inbox')) {
    return
  }

  const selectors = [
    'lR', // Archive
    'nX' // Delete
  ]

  for (const selector of selectors) {
    const buttonReady = elementReady(`body.xE .G-atb .${selector}`)
    const readyTimeout = setTimeout(() => {
      buttonReady.stop()
    }, 10_000)

    buttonReady.then((button) => {
      clearTimeout(readyTimeout)

      if (button) {
        button.addEventListener('click', () => {
          window.close()
        })
      } else {
        log.error(`Detect button "${selector}" timed out`)
      }
    })
  }
}

window.addEventListener('load', () => {
  // Set the initial unread count
  updateUnreadCount()

  // Listen to changes to the document title
  const title = document.querySelector('title')

  if (title) {
    const observer = new MutationObserver(updateUnreadCount)
    observer.observe(title, { childList: true })
  }

  // Check the unread count on an interval timer for instances where
  //   the title doesn't change
  setInterval(updateUnreadCount, INTERVAL)

  // Attaching the button listeners to the buttons
  //   that should close the new window
  attachButtonListeners()
})

// Toggle a custom style class when a message is received from the main process
ipc.on(
  'set-custom-style',
  (_: Electron.IpcRendererEvent, key: ConfigKey, enabled: boolean) => {
    document.body.classList[enabled ? 'add' : 'remove'](key)
  }
)

// Toggle a full screen class when a message is received from the main process
ipc.on('set-full-screen', (_: Electron.IpcRendererEvent, enabled: boolean) => {
  document.body.classList[enabled ? 'add' : 'remove']('full-screen')
})

function clickElement(selector: string) {
  const element = document.querySelector<HTMLDivElement>(selector)
  if (element) {
    element.click()
  }
}

ipc.on('compose', () => {
  clickElement('div[gh="cm"]')
})

ipc.on('inbox', () => {
  clickElement('#\\:3d')
})

ipc.on('snoozed', () => {
  clickElement('#\\:3f')
})

ipc.on('sent', () => {
  clickElement('#\\:3i')
})

ipc.on('all-mail', () => {
  clickElement('#\\:3l')
})
