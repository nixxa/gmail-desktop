import * as path from 'path'
import { nativeImage, NativeImage } from 'electron'
import { platform as selectPlatform, is } from 'electron-util'

// URL: `mail.google.com/mail/u/<local_account_id>`
export function getUrlAccountId(url: string): string | undefined {
  const accountIdRegExpResult = /mail\/u\/(\d+)/.exec(url)
  return accountIdRegExpResult?.[1]
}

export const platform: 'macos' | 'linux' | 'windows' = selectPlatform({
  macos: 'macos',
  linux: 'linux',
  windows: 'windows'
})

/**
 * Create a tray icon.
 *
 * @param unread Number of unread messages
 */
export function createTrayIcon(unread: number): NativeImage {
  let iconFileName

  if (is.macos) {
    iconFileName = 'tray-icon.macos.Template.png'
  } else {
    iconFileName =
      unread > 0
        ? `tray-icon-unread-${unread < 10 ? unread : 'm'}.png`
        : 'tray-icon.png'
  }

  return nativeImage.createFromPath(
    path.join(__dirname, '..', 'static', iconFileName)
  )
}
