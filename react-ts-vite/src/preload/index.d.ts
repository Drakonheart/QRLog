import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    
  }
}

declare global {
  interface Window {
    electron: any;
  }
}
