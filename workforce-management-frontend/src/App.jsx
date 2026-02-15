import './App.css'
import EmployeeComponent from './components/EmployeeComponent'
import FooterComponent from './components/FooterComponent'
import HeaderComponent from './components/HeaderComponent'
import ListEmployeeComponent from './components/ListEmployeeComponent'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
    <BrowserRouter>
      <HeaderComponent />
        <Routes>
          {/* // https://localhost:3030 */}
          <Route path='/' element = { <ListEmployeeComponent /> }></Route>
          {/* // https://localhost:3030/employees */}
          <Route path='/employees' element = { <ListEmployeeComponent /> }></Route>
          {/* // https://localhost:3030/add-employee */}
          <Route path='/add-employee' element = { <EmployeeComponent /> } ></Route>

          {/* // https://localhost:3030/edit-employee/1 */}
          <Route path='/edit-employee/:id' element = { <EmployeeComponent /> }></Route>
        </Routes>
      <FooterComponent />
    </BrowserRouter>
    </>
  )
}

export default App
