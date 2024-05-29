import { app } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { is } from 'electron-util'
import config, { ConfigKey } from './config'
import { createNotification } from './notifications'
import { initOrUpdateMenu } from './menu'
import { checkForUpdates } from './update-handlers'

const UPDATE_CHECK_INTERVAL = 60_000 * 60 * 3 // 3 Hours

function onUpdateAvailable(): void {
  createNotification(
    'Update available',
    `Please restart ${app.name} to update to the latest version`,
    () => {
      app.relaunch()
      app.quit()
    }
  )
}

export function init(): void {
  if (!is.development) {
    log.transports.file.level = 'info'
    autoUpdater.logger = log

    if (
      autoUpdater.allowPrerelease &&
      config.get(ConfigKey.ReleaseChannel) === 'stable'
    ) {
      config.set(ConfigKey.ReleaseChannel, 'dev')
      initOrUpdateMenu()
    } else if (
      !autoUpdater.allowPrerelease &&
      config.get(ConfigKey.ReleaseChannel) === 'dev'
    ) {
      autoUpdater.allowPrerelease = true
      checkForUpdates()
      initOrUpdateMenu()
    }

    autoUpdater.on('update-downloaded', onUpdateAvailable)

    if (config.get(ConfigKey.AutoUpdate)) {
      setInterval(() => autoUpdater.checkForUpdates, UPDATE_CHECK_INTERVAL)
      autoUpdater.checkForUpdates()
    }
  }
}
