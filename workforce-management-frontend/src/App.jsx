import './App.css'
import EmployeeComponent from './components/EmployeeComponent'
import HeaderComponent from './components/HeaderComponent'
import ListEmployeeComponent from './components/ListEmployeeComponent'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginComponent from './components/login_form/LoginComponent'
import MyProfileComponent from './components/MyProfileComponent'
import ProtectedRouteComponent from './components/ProtectedRouteComponent'
import MyShiftsCalendar from './components/MyShiftsCalendar'
import ShiftsCalendar from './components/ShiftsCalendar'
import EmployeeDetailsComponent from './components/EmployeeDetailsComponent'
import ChangePasswordComponent from './components/ChangePasswordComponent'
import ForcePasswordChangeGuard from './guards/ForcePasswordChangeGuard'
import PublicRoute from './guards/PublicRoute'
import AdminShiftsCalendar from './components/AdminShiftsCalendar'
import MessagesComponent from './components/MessagesComponent'

function App() {
  
  return (
    <>
    <BrowserRouter>
      <HeaderComponent />
        <Routes>
          <Route element = {<PublicRoute />}>
            {/* // https://localhost:3030 */}
            <Route path='/' element={<LoginComponent />} />
          </Route>

          <Route element={<ProtectedRouteComponent allowedRoles={['ROLE_ADMIN']} />}>
            {/* // https://localhost:3030/employees */}
            <Route path='/employees' element={<ListEmployeeComponent />} />
            {/* // https://localhost:3030/add-employee */}
            <Route path='/add-employee' element={<EmployeeComponent />} />
            {/* // https://localhost:3030/edit-employee/1 */}
            <Route path='/edit-employee/:id' element={<EmployeeComponent />} />
            <Route path='/shifts' element={<AdminShiftsCalendar />} />
            <Route path='/employees/:id' element={<EmployeeDetailsComponent />} />
            <Route path='/messages' element={<MessagesComponent />} />
          </Route>

          <Route element={<ProtectedRouteComponent allowedRoles={['ROLE_EMPLOYEE']} />}>
            <Route path='/change-password' element={<ChangePasswordComponent />} />

            <Route element={<ForcePasswordChangeGuard />}>   
              {/* // https://localhost:3030/profile */}
              <Route path='/profile' element={<MyProfileComponent />} />
              <Route path='/my-shifts' element={<MyShiftsCalendar />} />
              <Route path='/messages' element={<MessagesComponent />} />           
            </Route>
          </Route>
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
