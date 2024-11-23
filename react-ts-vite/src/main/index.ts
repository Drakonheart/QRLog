import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';



function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()
  createQRLogFolder()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//  _______________________________________Init _______________________________________ 


const userDocumentsPath = app.getPath('documents');   // Get the path to the user's Documents folder
const qrLogFolderPath = path.join(userDocumentsPath, 'QR_Log');


//  _______________________________________Read File Functions_______________________________________



function readExcelFile(fileName: string): string | any[][] {
  try {
    const filePath = path.join(qrLogFolderPath, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return 'File not found';
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Parse the file using xlsx
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to an array of arrays (rows and columns)
    const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    console.log(jsonData);

    return jsonData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return 'Error reading Excel file';
  }
}

ipcMain.handle('read-excel-file', async (_event, fileName) => {
  return readExcelFile(fileName);
});


function getDirectoryFileNames(): string[] | string {
  try {
    if (!fs.existsSync(qrLogFolderPath)) {
      console.error(`Directory not found: ${qrLogFolderPath}`);
      return 'Directory not found';
    }

    // Read directory contents and filter out temporary files
    const files = fs
      .readdirSync(qrLogFolderPath)
      .filter(file => !file.startsWith('~$')); // Exclude temporary files

    console.log('Filtered Files:', files);
    return files;
  } catch (error) {
    console.error('Error reading directory:', error);
    return 'Error reading directory';
  }
}


// IPC handler for fetching directory file names
ipcMain.handle('get-directory-file-names', async () => {
  return getDirectoryFileNames();
});





function updateAttendance(fileName: string, id: string): string {
  try {
    const filePath = path.join(qrLogFolderPath, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return 'File not found';
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Parse the file using xlsx
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to an array of arrays (rows and columns)
    const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Find the row with the matching ID in column C (index 2)
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row[2] && row[2].toString() === id) {
        // Update the value in column E (index 4) to 1
        row[4] = 1;
        console.log(`Updated attendance for ID: ${id} in row ${i + 1}`);
        break;
      }
    }

    // Write the updated data back to the workbook
    const updatedSheet = XLSX.utils.aoa_to_sheet(jsonData);
    workbook.Sheets[sheetName] = updatedSheet;

    // Save the updated file
    XLSX.writeFile(workbook, filePath);

    return 'Attendance updated successfully';
  } catch (error) {
    console.error('Error updating Excel file:', error);
    return 'Error updating Excel file';
  }
}

// Handle the update attendance request
ipcMain.handle('update-attendance', async (_event, fileName, id) => {
  return updateAttendance(fileName, id);
});



function updateAttendanceTo0(fileName: string, id: string): string {
  try {
    const filePath = path.join(qrLogFolderPath, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return 'File not found';
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Parse the file using xlsx
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to an array of arrays (rows and columns)
    const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Find the row with the matching ID in column C (index 2)
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row[2] && row[2].toString() === id) {
        // Update the value in column E (index 4) to 1
        row[4] = 0;
        console.log(`Updated attendance for ID: ${id} in row ${i + 1}`);
        break;
      }
    }

    // Write the updated data back to the workbook
    const updatedSheet = XLSX.utils.aoa_to_sheet(jsonData);
    workbook.Sheets[sheetName] = updatedSheet;

    // Save the updated file
    XLSX.writeFile(workbook, filePath);

    return 'Attendance updated successfully';
  } catch (error) {
    console.error('Error updating Excel file:', error);
    return 'Error updating Excel file';
  }
}

// Handle the update attendance request
ipcMain.handle('update-attendance-to-0', async (_event, fileName, id) => {
  return updateAttendanceTo0(fileName, id);
});




function readExcelFileWithId(fileName: string, id: number): (string | undefined)[][] {
  try {
    const filePath = path.join(qrLogFolderPath, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return [['File not found']];
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    console.log('File successfully read');

    // Parse the file using xlsx
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to an array of arrays (rows and columns)
    const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    console.log('Excel Data:', jsonData);  // Log the parsed data

    if (jsonData.length === 0) {
      console.error('No data found in the Excel file');
      return [['No data found']];
    }

    // Find rows where the value in column 2 (index 2) matches the given id (id is in column 2)
    const result: (string | undefined)[][] = [];

    for (let row = 0; row < jsonData.length; row++) {
      const rowData = jsonData[row];
      console.log(`Processing row ${row}:`, rowData);  // Log each row being processed

      // Check if column 2 (index 2) matches the id
      if (Number(rowData[2]) === id) {  // Convert the value to a number for comparison
        // Push columns 1 (index 0), 0 (index 1), and 3 (index 3) in an array
        result.push([rowData[0], rowData[1], rowData[3]]);
      }
    }

    if (result.length === 0) {
      console.log('No matching rows found for the given id');
    }

    return result;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [['Error reading Excel file']];
  }
}


// IPC handler to interact with the renderer process
ipcMain.handle('read-excel-file-with-id', async (_event, fileName: string, id: number) => {
  return readExcelFileWithId(fileName, id);
});




//  _______________________________________Drag/Choose File Function_______________________________________

// Function to select and copy an Excel file to the QR_Log folder
async function copyExcelFileToQRLog(): Promise<string> {
  

  // Ensure the QR_Log folder exists
  if (!fs.existsSync(qrLogFolderPath)) {
    try {
      fs.mkdirSync(qrLogFolderPath);
      console.log('QR_Log folder created successfully');
    } catch (err) {
      console.error('Error creating QR_Log folder:', err);
      return 'Error creating QR_Log folder';
    }
  }

  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    // Open a file dialog to select an Excel file
    const result = await dialog.showOpenDialog(focusedWindow, {
      title: 'Select an Excel File',
      filters: [{ name: 'Excel Files', extensions: ['xls', 'xlsx'] }],
      properties: ['openFile'],
    });

    if (result.canceled || !result.filePaths.length) {
      return 'No file selected';
    }

    const selectedFilePath = result.filePaths[0];
    const fileName = path.basename(selectedFilePath);
    const destinationPath = path.join(qrLogFolderPath, fileName);

    try {
      // Copy the selected file to the QR_Log folder
      fs.copyFileSync(selectedFilePath, destinationPath);
      console.log(`File copied to ${destinationPath}`);
      return `File copied to ${destinationPath}`;
    } catch (err) {
      console.error('Error copying file:', err);
      return 'Error copying file';
    }
  }

  return 'No focused window found';
}

// Expose the function via IPC with async/await
ipcMain.handle('copy-excel-to-qr-log', async () => {
  return await copyExcelFileToQRLog();
});


//  _______________________________________Creating Folder Functions _______________________________________ 

function createQRLogFolder(): void {
  
  // Construct the full path to the QR_Log folder
  const qrLogFolderPath = path.join(userDocumentsPath, 'QR_Log');
  
  // Check if the folder already exists
  if (!fs.existsSync(qrLogFolderPath)) {
    try {
      // Create the folder if it doesn't exist
      fs.mkdirSync(qrLogFolderPath);
      console.log('QR_Log folder created successfully');
    } catch (err) {
      console.error('Error creating QR_Log folder:', err);
    }
  } else {
    console.log('QR_Log folder already exists');
  }
}







//  _______________________________________ Pritner Functions _______________________________________ 


function getAvailablePrinters() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    // Use getPrintersAsync() which returns a promise
    return focusedWindow.webContents.getPrintersAsync();
  }
  return Promise.resolve([]); // Return an empty array wrapped in a resolved promise if no focused window is found
}


// Expose the function via IPC with async/await
ipcMain.handle('get-printers', async () => {
  return await getAvailablePrinters(); // Await the result of getAvailablePrinters
});


const imagePath = 'C:\\Users\\Aryan Farhang\\Downloads\\bob10.png';

function printImage() {
  const printWindow = new BrowserWindow({
    show: false, // Hide the window
    width: 500,  // 62mm converted to pixels
    height: 500, // 100mm converted to pixels
    backgroundColor: '#FFFFFF', // Set a white background
    webPreferences: {
      nodeIntegration: true, // Enable Node integration if needed
      contextIsolation: false, // Disable context isolation if required
    },

  });

  // Load the PNG image using the absolute path
  printWindow.loadURL(`file://${imagePath}`);

  // Print options with no margins
  const printOptions = {
    silent: false,         // Show print dialog if needed
    printBackground: true, // Print background images
    margins: { top: 0, left: 0, bottom: 0, right: 0 }, // No margins
    scale: 120 

  };

  // Trigger the print job
  printWindow.webContents.on('did-finish-load', () => {
    printWindow.webContents.print(printOptions, (success, errorType) => {
      if (success) {
        console.log('Printing succeeded');
      } else {
        console.error('Printing failed:', errorType);
      }
    });
  });
}

// IPC handler to invoke the printImage function
ipcMain.handle('print-image', async () => {
  printImage(); // Call printImage function
});


