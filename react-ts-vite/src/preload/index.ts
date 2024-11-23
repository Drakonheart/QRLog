import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron';

// Expose generic IPC methods to the Renderer process
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
    ipcRenderer.on(channel, listener);
  },
  off(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
    ipcRenderer.off(channel, listener);
  },
  send(channel: string, ...args: any[]) {
    ipcRenderer.send(channel, ...args);
  },
  invoke(channel: string, ...args: any[]) {
    return ipcRenderer.invoke(channel, ...args);
  }
});


// import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'


// // Custom APIs for renderer
// const api = {}

// // Use `contextBridge` APIs to expose Electron APIs to
// // renderer only if context isolation is enabled, otherwise
// // just add to the DOM global.
// if (process.contextIsolated) {
//   try {
//     contextBridge.exposeInMainWorld('electron', electronAPI)
//     contextBridge.exposeInMainWorld('api', api)
//   } catch (error) {
//     console.error(error)
//   }
// } else {
//   // @ts-ignore (define in dts)
//   window.electron = electronAPI
//   // @ts-ignore (define in dts)
//   window.api = api
// }



// contextBridge.exposeInMainWorld('electron', {
//   getPrinters: async () => {
//     return ipcRenderer.invoke('get-printers');
//   }
// });

contextBridge.exposeInMainWorld('electron', {
  getPrinters: async () => {
    return ipcRenderer.invoke('get-printers');
  },
  printImage: async () => {
    return await ipcRenderer.invoke('print-image');
  },
  copyExcelToQRLog: async () => {
    return await ipcRenderer.invoke('copy-excel-to-qr-log');
  },
  readExcelFile: async (fileName: string) => {
    return await ipcRenderer.invoke('read-excel-file', fileName);
  },
  readExcelFileWithId: async (fileName: string, id: number) => {
    return await ipcRenderer.invoke('read-excel-file-with-id', fileName, id);
  },
  updateAttendance: async (fileName: string, id: string) => {
    return await ipcRenderer.invoke('update-attendance', fileName, id);
  },
  updateAttendanceTo0: async (fileName: string, id: string) => {
    return await ipcRenderer.invoke('update-attendance-to-0', fileName, id);
  },
  getDirectoryFileNames: async () => {
    return ipcRenderer.invoke('get-directory-file-names');
  },
});
