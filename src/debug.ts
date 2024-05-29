import electronDebug from 'electron-debug'
import config, { ConfigKey } from './config'

const OPTIONS = {
  showDevTools: false,
  isEnabled: config.get(ConfigKey.DebugMode)
}

export function init(): void {
  electronDebug(OPTIONS)
}
