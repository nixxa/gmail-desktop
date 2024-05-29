import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import config, { ConfigKey } from './config'
import { createNotification } from './notifications'
import { viewLogs } from './logs'

export function changeReleaseChannel(channel: 'stable' | 'dev') {
  autoUpdater.allowPrerelease = channel === 'dev'
  autoUpdater.allowDowngrade = true
  checkForUpdates()
  config.set(ConfigKey.ReleaseChannel, channel)
}

export async function checkForUpdates(): Promise<void> {
  try {
    const { downloadPromise } = await autoUpdater.checkForUpdates()

    // If there isn't an update, notify the user
    if (!downloadPromise) {
      dialog.showMessageBox({
        type: 'info',
        message: 'There are currently no updates available.'
      })
    }
  } catch (error: unknown) {
    log.error('Check for updates failed', error)

    createNotification(
      'Check for updates failed',
      'View the logs for more information',
      viewLogs
    )
  }
}
