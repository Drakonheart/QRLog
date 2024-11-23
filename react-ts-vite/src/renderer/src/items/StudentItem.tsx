import React, { useEffect, useState } from 'react'
import './StudentItem.css'
import PrintIcon from '@mui/icons-material/Print'
import Checkbox from '@mui/material/Checkbox'

const label = { inputProps: { 'aria-label': 'Checkbox demo' } }

interface ItemProps {
  name: string
  lastName: string
  school: string
  id: string
  attendance: string
  functionPassed: (inputValue: number) => void // Add the function prop here
  readExcelFileData: (fileName: string) => void // Add the function prop here
  currentChosenFile: string
}

const StudentItem: React.FC<ItemProps> = ({
  name,
  lastName,
  school,
  id,
  attendance,
  functionPassed,
  readExcelFileData,
  currentChosenFile
}) => {
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    console.log('Component has loaded!')
    Number(attendance) === 0 ? setIsChecked(false) : setIsChecked(true)
  }, [])

  const handleCheckboxChange = async () => {
    let result

    if (isChecked) {
      result = await window.electron.updateAttendanceTo0(currentChosenFile, String(id))
    } else {
      result = await window.electron.updateAttendance(currentChosenFile, String(id))
    }

    setIsChecked(!isChecked) // Toggle the checkbox state
    await readExcelFileData(currentChosenFile) // Make sure to wait for the file reading to finish
    console.log(result)
  }

  return (
    <div className="item-container">
      <div className="StudentItemInfo ItemFirstName">{name}</div>
      <div className="StudentItemInfo ItemLastName">{lastName}</div>
      <div className="StudentItemInfo ItemSchoolName">{school}</div>
      <div className="StudentItemInfo ItemID">{id}</div>
      <div className="StudentItemInfo ItemAttendance">
        {attendance}
        <Checkbox
          {...label}
          checked={Number(attendance) === 0 ? false : true}
          // checked={isChecked}
          onChange={handleCheckboxChange} // Handle toggle
        />
      </div>

      <button
        className="ItemBtnPrint"
        onClick={() => {
          console.log('Button clicked with ID:', id)

          functionPassed(Number(id))
        }}
      >
        <PrintIcon></PrintIcon>
      </button>
    </div>
  )
}

export default StudentItem
