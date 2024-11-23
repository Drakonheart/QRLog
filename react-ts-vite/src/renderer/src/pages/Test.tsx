import  { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import './Test.css'

const MyComponent = () => {
  const contentRef = useRef<HTMLDivElement>(null)

  // Setup the react-to-print function
  const reactToPrintFn = useReactToPrint({
    contentRef // Ensure it's properly passed to the hook
  })

  return (
    <div className="MyComponent">
      <div>
        <button
          onClick={() => {
            reactToPrintFn() // Trigger print
          }}
          style={{ marginBottom: '100px' }}
        >
          Print
        </button>
        <div ref={contentRef} className="print-content">
          <div className="PrintableName">Aryan AryanAryan</div>
          <div className="PrintableLastName">Farhang-pour Farha</div>
          <div className='PrintableSchoolName'>Byron Sommerset Elementary  Byron Sommerset Elementary</div>
        </div>
      </div>
    </div>
  )
}

export default MyComponent
