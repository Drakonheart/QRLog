import './AttendancePage.css'
// import React, { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import StudentItem from '@renderer/items/StudentItem'
import { useEffect, useState, useRef } from 'react'
import { Dialog } from '@mui/material'
import { useReactToPrint } from 'react-to-print'
import FileCopyIcon from '@mui/icons-material/FileCopy'

const AttendancePage: React.FC = () => {
  // ______________________ init ______________________
  //   const [count, setCount] = useState<number>(0)
  const [openScanDialog, setOpenScanDialog] = useState(false)
  const [openScanDialogWarning, setOpenScanDialogWarning] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')

  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [stickerName, setStickerName] = useState('')
  const [stickerLastName, setStickerLastName] = useState('')
  const [stickerSchoollName, setStickerSchoollName] = useState('')

  const [excelDataArray, setExcelDataArray] = useState<any[]>([])
  const [excelFileNameArray, setexcelFileNameArray] = useState<any[]>([])

  const [chosenFileName, setChosenFileName] = useState('')

  // ______________________ On load ______________________

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        await readExcelFileData(chosenFileName)
        fetchFileNames()
      } catch (error) {
        console.error('Error in useEffect while reading Excel file:', error)
      }
    }

    fetchExcelData()
  }, [])

  // ______________________ On click Functions ______________________

  const getFile = async () => {
    try {
      const response = await window.electron.copyExcelToQRLog()
      console.log('Response:', response) // Output the response (success or error message)
      fetchFileNames()
    } catch (error) {
      console.error('Error while copying file:', error)
    }
  }

  // ______________________ Functions ______________________

  // const copyExcelDataToArray = async (
  //   fileName: string,
  //   setArray: React.Dispatch<React.SetStateAction<any[]>>
  // ) => {
  //   try {
  //     // Call the function to read data from the Excel file
  //     const data = await readExcelFileData(fileName)

  //     // Check if data exists and is an array
  //     if (Array.isArray(data)) {
  //       // Use setArray to update the state
  //       setArray([...data]) // This copies all the elements from the data array
  //       console.log('Data copied to array:', data)
  //     } else {
  //       console.error('Data format is invalid')
  //     }
  //   } catch (error) {
  //     console.error('Error copying Excel data:', error)
  //   }
  // }

  async function fetchFileNames() {
    const fileNames = await window.electron.getDirectoryFileNames()
    setexcelFileNameArray(fileNames)
    console.log('File Names:', fileNames)
  }

  const readExcelFileData = async (fileName: string) => {
    try {
      const data = await window.electron.readExcelFile(fileName)
      if (!data || typeof data !== 'object' || !Array.isArray(data)) {
        throw new Error('Invalid data format returned from readExcelFile')
      }
      setExcelDataArray(data)
      console.log('Excel Data:', data)
    } catch (error) {
      console.error('Error reading Excel file:', error)
    }
  }

  // async function fetchExcelData(fileName, id) {
  //   try {
  //     const result = await window.electron.readExcelFileWithId(fileName, id)
  //     console.log('Excel Data:', result)
  //   } catch (error) {
  //     console.error('Error fetching Excel data:', error)
  //   }
  // }

  const filteredStudents = excelDataArray.filter((item) => {
    const firstName = item[1]?.toLowerCase() || ''
    const lastName = item[0]?.toLowerCase() || ''
    return (
      firstName.includes(searchTerm.toLowerCase()) || lastName.includes(searchTerm.toLowerCase())
    )
  })

  // _____________________________Dialog Functions: _____________________________

  const contentRef = useRef<HTMLDivElement>(null)

  const reactToPrintFn = useReactToPrint({
    contentRef // Ensure it's properly passed to the hook
  })

  const [shouldPrint, setShouldPrint] = useState(false)

  useEffect(() => {
    if (shouldPrint) {
      reactToPrintFn() // Trigger print
      setShouldPrint(false) // Reset the flag
    }
  }, [shouldPrint, reactToPrintFn])

  const handleOpen = () => setOpenScanDialog(true)
  const handleClose = () => {
    setOpenScanDialog(false)
    setInputValue('')
  }

  const handleOpenScanDialogWarning = () => setOpenScanDialogWarning(false)

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      console.log('Processing:', inputValue) // Log input value
      setInputValue('') // Clear input for the next scan
      inputRef.current?.focus() // Keep the input ready
      searchById(Number(inputValue)) // Search the data
    }
  }

  const printBasedOnID = (inputValue: number): void => {
    searchById(inputValue) // Search the data
    window.electron.updateAttendance(chosenFileName, String(inputValue))
    readExcelFileData(chosenFileName) // Make sure to wait for the file reading to finish
    setTimeout(() => {
      reactToPrintFn() // Trigger print after delay
    }, 100) // Delay of 100ms (adjust if needed)
  }

  useEffect(() => {
    // Focus on the input when the component mounts
    keepFocused()

    // Add a global click event listener to refocus the input when clicked elsewhere
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        keepFocused() // Re-focus input if clicked outside
      }
    }

    document.addEventListener('click', handleClickOutside)

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const keepFocused = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Setup the react-to-print function

  function searchById(id: number): void {
    // Find the row with the matching ID
    const result = excelDataArray.find((row) => row[2] === id) // Find returns the first matching row or undefined

    if (result) {
      // Assign values from the matching row
      setStickerName(result[1]) // First Name
      setStickerLastName(result[0]) // Last Name
      setStickerSchoollName(result[3]) // School Name
      window.electron.updateAttendance(chosenFileName, String(inputValue))
      readExcelFileData(chosenFileName) // Make sure to wait for the file reading to finish

      setTimeout(() => {
        reactToPrintFn() // Trigger print after delay
      }, 100) // Delay of 100ms (adjust if needed)
    } else {
      // Handle the case where no matching row is found
      console.warn('No matching data found for the given ID')
      setStickerName('No Name Found')
      setStickerLastName('No Last Name Found')
      setStickerSchoollName('No School Found')
      setOpenScanDialogWarning(true)
    }
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev)
  }

  return (
    <div className="AttendancePage_Div">
      <div className="topHeader">
        <div className="SearchBar">
          <SearchIcon style={{ color: 'grey' }} />
          <input
            placeholder="Search student..."
            className="SearchText"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update the search term
          />
        </div>
        <button onClick={toggleDropdown} className="ChooseFile ScanButton">
          Choose File
        </button>

        {isDropdownOpen && (
          <div className="dropdown">
            {excelFileNameArray.map((index) => (
              <div
                className="FileItem"
                onClick={() => {
                  setChosenFileName(excelFileNameArray[index])
                  console.log('chosen file: ' + excelFileNameArray[index])
                  readExcelFileData(excelFileNameArray[index])
                }}
              >
                {excelFileNameArray[index]}
              </div>
            ))}
          </div>
        )}
        <button onClick={getFile} className="AddFileBtn ScanButton">
          Add File
        </button>

        <button
          onClick={() => {
            handleOpen()
          }}
          className="ScanButton"
        >
          SCAN
        </button>
      </div>

      <div className="StudentsList">
        <div className="StudentsListTopHeader">
          <div className="StudentItemInfo ItemFirstName">First Name</div>
          <div className="StudentItemInfo ItemLastName">Last Name</div>
          <div className="StudentItemInfo ItemSchoolName">School</div>
          <div className="StudentItemInfo ItemID">ID</div>
          <div className="StudentItemInfo ItemAttendance">Mark</div>
        </div>
        {excelDataArray.length === 0 ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              fontSize: '18px'
            }}
          >
            <FileCopyIcon sx={{ fontSize: '250px', color: 'rgb(122, 177, 199)' }}></FileCopyIcon>
            <div style={{ marginTop: '10px' }}>No File or Student</div>
            <div>Found</div>
          </div>
        ) : (
          <div style={{ overflowY: 'scroll' }}>
            {filteredStudents.map((item, index) => (
              <StudentItem
                key={index}
                name={item[1]} // 1 for first name
                lastName={item[0]} // 0 for last name
                school={item[3]}
                id={item[2]}
                attendance={item[4]}
                functionPassed={printBasedOnID}
                readExcelFileData={readExcelFileData}
                currentChosenFile={chosenFileName}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={openScanDialog} onClose={handleClose}>
        <div className="ScanDialog">
          <input
            className="QRCodeInput"
            autoFocus
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            // placeholder="Scan or type QR code..."
          />

          <div className="TitleScanDialog" style={{ fontSize: '20px', marginTop: '30px' }}>
            START
          </div>
          <div
            onClick={() => {
              setOpenScanDialogWarning(true)
            }}
            className="TitleScanDialog"
          >
            SCANNING
          </div>
          <div
            style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div className="anim-box center spacer">
              <div></div>
              <div className="scanner"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-md"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-sm"></div>
              <div className="anim-item anim-item-lg"></div>
            </div>
          </div>

          <div className="InstructionScanDialog">Make sure you have added the file.</div>
          <div className="InstructionScanDialog">Connect the scanner and printer.</div>
          <div className="InstructionScanDialog">Start scanning from this app.</div>
          <div className="InstructionScanDialog" style={{ marginBottom: '40px' }}>
            You must be in this app while scanning.
          </div>
        </div>

        <Dialog open={openScanDialogWarning} onClose={handleOpenScanDialogWarning}>
          <div className="WarningDialog">
            <div style={{ fontSize: '23px', fontWeight: '600' }}>NO STUDENT FOUND</div>
            <div>Entered ID: </div>
            <div>{1234}</div>
          </div>
        </Dialog>
      </Dialog>

      <div
        onClick={() => {
          setOpenScanDialogWarning(true)
        }}
        className="CurrentName"
      >
        <div ref={contentRef} className="print-content">
          <div className="PrintableName">{stickerName}</div>
          <div className="PrintableLastName">{stickerLastName}</div>
          <div className="PrintableSchoolName">{stickerSchoollName}</div>
        </div>
      </div>
    </div>
  )
}

export default AttendancePage
