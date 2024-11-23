import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import AttendancePage from './pages/AttendancePage'
// import Test from './pages/Test'


function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AttendancePage />} />
        {/* <Route path="/Test" element={<Test />} /> */}

      </Routes>
    </Router>
  )
}

export default App

// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
// import React, { useEffect, useState } from 'react'

// function App(): JSX.Element {
//   const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

//   const [printerList, setPrinterList] = useState<{ name: string; description: string }[]>([])

//   useEffect(() => {
//     const fetchPrinters = async () => {
//       try {
//         const printers = await window.electron.getPrinters()
//         setPrinterList(printers)
//       } catch (error) {
//         console.error('Error fetching printers:', error)
//       }
//     }

//     fetchPrinters()
//   }, [])

//   const printImage = async () => {
//     try {
//       const printers = await window.electron.print()
//       setPrinterList(printers)
//     } catch (error) {
//       console.error('Error fetching printers:', error)
//     }
//   }

//   return (
//     <div>
//       <h1>Available Printers</h1>
//       {printerList.length > 0 ? (
//         <ul>
//           {printerList.map((printer, index) => (
//             <li key={index}>
//               <strong>{printer.name}</strong>: {printer.description}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No printers found.</p>
//       )}

//       <button
//         onClick={async () => {
//           await window.electron.printImage()
//         }}
//       >
//         hello
//       </button>
//     </div>

//   )
// }

// export default App
