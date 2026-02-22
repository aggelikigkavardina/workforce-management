import './App.css'
import EmployeeComponent from './components/EmployeeComponent'
import HeaderComponent from './components/HeaderComponent'
import ListEmployeeComponent from './components/ListEmployeeComponent'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginComponent from './components/login_form/LoginComponent'
import MyProfileComponent from './components/MyProfileComponent';
import ProtectedRouteComponent from './components/ProtectedRouteComponent'

function App() {
  const ScheduleComponent = () => <div className='container'><h2>Schedule</h2></div>;
  const MessagesComponent = () => <div className='container'><h2>Messages</h2></div>;

  return (
    <>
    <BrowserRouter>
      <HeaderComponent />
        <Routes>
        {/* // https://localhost:3030 */}
        <Route path='/' element={<LoginComponent />} />

        <Route element={<ProtectedRouteComponent allowedRoles={['ROLE_ADMIN']} />}>
          {/* // https://localhost:3030/employees */}
          <Route path='/employees' element={<ListEmployeeComponent />} />
          {/* // https://localhost:3030/add-employee */}
          <Route path='/add-employee' element={<EmployeeComponent />} />
          {/* // https://localhost:3030/edit-employee/1 */}
          <Route path='/edit-employee/:id' element={<EmployeeComponent />} />
        </Route>

        <Route element={<ProtectedRouteComponent allowedRoles={['ROLE_EMPLOYEE']} />}>
          {/* // https://localhost:3030/profile */}
          <Route path='/profile' element={<MyProfileComponent />} />
        </Route>
        <Route path="/schedule" element={<ScheduleComponent />} />
        <Route path="/messages" element={<MessagesComponent />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
