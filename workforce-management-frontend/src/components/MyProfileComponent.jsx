import { useEffect, useState } from 'react'
import axios from 'axios'

const MyProfileComponent = () => {

    const [employee, setEmployee] = useState({})

    useEffect(() => {
        axios.get('http://localhost:8080/api/employees/me')
            .then(response => {
                setEmployee(response.data)
            })
            .catch(error => console.error(error))
    }, [])

    return (
        <div className='container'>
            <br /><br />
            <h2 className='text-center'>My Profile</h2>
            <br /><br />
            <p className='text-center'>First Name: {employee.firstName}</p>
            <p className='text-center'>Last Name: {employee.lastName}</p>
            <p className='text-center'>Email: {employee.email}</p>
        </div>
    )
}

export default MyProfileComponent