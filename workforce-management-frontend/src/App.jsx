import './App.css'
import EmployeeComponent from './components/EmployeeComponent'
import HeaderComponent from './components/HeaderComponent'
import ListEmployeeComponent from './components/ListEmployeeComponent'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginComponent from './components/login_form/LoginComponent'
import MyProfileComponent from './components/MyProfileComponent'
import ProtectedRouteComponent from './components/ProtectedRouteComponent'
import MyShiftsCalendar from './components/MyShiftsCalendar'
import ChangePasswordComponent from './components/ChangePasswordComponent'
import ForcePasswordChangeGuard from './guards/ForcePasswordChangeGuard'
import PublicRoute from './guards/PublicRoute'
import AdminShiftsCalendar from './components/AdminShiftsCalendar'
import MessagesListPage from './components/MessagesListPage'
import MessagesThreadPage from './components/MessagesThreadPage'
import MessagesLayout from './components/MessagesLayout'

function App() {
  
  return (
    <>
    <BrowserRouter>
      <HeaderComponent />
        <Routes>
          <Route element = {<PublicRoute />}>
            {/* // https://localhost:3000 */}
            <Route path='/' element={<LoginComponent />} />
          </Route>

          <Route element={<ProtectedRouteComponent allowedRoles={['ROLE_ADMIN','ROLE_EMPLOYEE']} />}>
            <Route element={<ForcePasswordChangeGuard />}>
              <Route path="/messages" element={<MessagesLayout />}>
              <Route index element={<MessagesListPage />} />
              <Route path=":id" element={<MessagesThreadPage />} />
            </Route>
              <Route path='/profile' element={<MyProfileComponent />} />
            </Route>
          </Route>

          <Route element={<ProtectedRouteComponent allowedRoles={['ROLE_ADMIN']} />}>
            {/* // https://localhost:3000/employees */}
            <Route path='/employees' element={<ListEmployeeComponent />} />
            {/* // https://localhost:3000/add-employee */}
            <Route path='/add-employee' element={<EmployeeComponent />} />
            {/* // https://localhost:3000/edit-employee/1 */}
            <Route path='/edit-employee/:id' element={<EmployeeComponent />} />
            <Route path='/shifts' element={<AdminShiftsCalendar />} />
          </Route>

          <Route element={<ProtectedRouteComponent allowedRoles={['ROLE_EMPLOYEE']} />}>
            <Route path='/change-password' element={<ChangePasswordComponent />} />

            <Route element={<ForcePasswordChangeGuard />}>   
              {/* // https://localhost:3000/profile */}
              <Route path='/my-shifts' element={<MyShiftsCalendar />} />          
            </Route>
          </Route>
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
