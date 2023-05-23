import type { UpdateStatus } from '../types'
import { Singleton } from '@common/function/singletonDecorator'
import { createGetRelease } from '../utils/release'
import { getDownloadUrlExtension, getDownloadUrlSuffix } from '@main/utils/os'
import { createCheckUpdate } from '../utils/update'
import CoreLoader from '@main/coreLoader'
import InstallerBase from '../installer'

@Singleton
export default class CoreInstaller extends InstallerBase {
  checkUpdate: () => Promise<UpdateStatus>

  constructor() {
    super('Maa Core', 'core')

    const getRelease = createGetRelease(
      [
        'https://gh.cirno.xyz/api.github.com/repos/MaaAssistantArknights/MaaAssistantArknights/releases',
        'https://api.github.com/repos/MaaAssistantArknights/MaaAssistantArknights/releases',
      ],
      this.componentType
    )

    const suffix = getDownloadUrlSuffix()
    const ext = getDownloadUrlExtension()

    this.checkUpdate = createCheckUpdate(
      getRelease,
      {
        OTA: (cur, late) => `MAAComponent-OTA-${cur}_${late}${suffix}${ext}`,
        Full: () => new RegExp(`MAA-v(.+)${suffix}${ext.replaceAll('.', '\\.')}`, 'g'),
      },
      this.componentType,
      this.componentDir,
      (oldUrl: string) => {
        const urlMatches =
          /^https:\/\/(.+)\/MaaAssistantArknights\/MaaAssistantArknights\/releases\/download\/(.+)\/(.+)$/.exec(
            oldUrl
          )
        if (!urlMatches) {
          throw new Error(`Invalid update url: ${oldUrl}`)
        }
        const [, host, version, filename] = urlMatches
        return `https://s3.maa-org.net:25240/maa-release/MaaAssistantArknights/MaaAssistantArknights/releases/download/${version}/${filename}`
      }
    )
  }

  beforeExtractCheck() {
    const version = new CoreLoader().GetCoreVersion()
    return !version
  }
}
