import { useEffect, useState } from 'react'
import { createEmployee, getEmployee, updateEmployee } from '../services/EmployeeService'
import { useNavigate, useParams } from 'react-router-dom'
import { isValidEmail, isValidPassword } from '../helpers/ValidationHelper'

const EmployeeComponent = () => {

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const {id} = useParams();

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    })

    const navigator = useNavigate();

    useEffect(() => {

        if(id) {
            getEmployee(id).then((response) => {
                setFirstName(response.data.firstName);
                setLastName(response.data.lastName);
                setEmail(response.data.email);
            }).catch(error => {
                console.error(error);
            })
        }

    }, [id])

    function saveOrUpdateEmployee(e) {
        e.preventDefault();

        if(validateForm()) {

            const employee = {id: Number(id), firstName, lastName, email}

            if (password.trim()) {
                employee.password = password;
}
            console.log(employee)

            if(id) {
                updateEmployee(id, employee).then((response) => {
                    console.log(response.data);
                    navigator('/employees')
                }).catch(error => {
                    console.log('STATUS:', error?.response?.status);
                    console.log('DATA:', JSON.stringify(error?.response?.data, null, 2));
                })
            } else {
                createEmployee(employee).then((response) => {
                console.log(response.data);
                navigator('/employees')
                }).catch(error => {
                    console.log('STATUS:', error?.response?.status);
                    console.log('DATA:', JSON.stringify(error?.response?.data, null, 2));
                })
            }
        }   
    }

    function validateForm() {
        let valid = true;

        const errorsCopy = {... errors}

        if(!firstName.trim()) {
            errorsCopy.firstName = 'First name is required';
            valid = false;
        } else if (firstName.length > 50) {
            errorsCopy.firstName = "Max 50 characters";
            valid = false;
        } else {
            errorsCopy.firstName = '';        
        }

        if(!lastName.trim()) {
            errorsCopy.lastName = 'Last name is required';
            valid = false;
        } else if (lastName.length > 50) {
            errorsCopy.lastName = 'Max 50 characters';
            valid = false;
        } else {
            errorsCopy.lastName = '';        
        }

        if(!email.trim()) {
            errorsCopy.email = 'Email is required';
            valid = false;
        } else if (!isValidEmail(email)) {
            errorsCopy.email = 'Invalid email format';
            valid = false;
        } else if (email.length > 120) {
            errorsCopy.email = 'Max 120 characters';
            valid = false;
        } else {
            errorsCopy.email = '';        
        }

        if (!id) {
            if(!password.trim()) {
            errorsCopy.password = 'Password is required';
            valid = false;
            } else if (!isValidPassword(password)) {
                errorsCopy.password = 'Password must be 6-64 characters';
                valid = false;
            } else {
                errorsCopy.password = '';        
            }
        } else {
            if (password.trim()  && !isValidPassword(password)) {
                errorsCopy.password = 'Password must be 6-64 characters';
                valid = false;
            }
        }

        setErrors(errorsCopy);

        return valid;
    }

    function pageTitle() {
        if(id) {
            return <h2 className='text-center' style={{ marginTop: '10px' }}>Update Employee</h2>
        } else {
            return <h2 className='text-center' style={{ marginTop: '10px' }}>Add Employee</h2>
        }
    }

    function goBack() {
        navigator('/employees');
    }

  return (
    <div className='container'>
        <br /> <br />
        <div className='row'>
            <div className='card col-md-6 offset-md-3 offset-md-3'>
                {
                    pageTitle()
                }
                <div className='card-body'>
                    <form>
                        <div className='form-group mb-2'>
                            <label className='form-label'>First Name:</label>
                            <input
                                type='text'
                                placeholder='Enter Employee First Name'
                                name='firstName'
                                value={firstName}
                                className={`form-control ${ errors.firstName ? 'is-invalid': ''}`}
                                onChange={(e) => setFirstName(e.target.value)}
                            >
                            </input>
                            {errors.firstName && <div className='invalid-feedback'> {errors.firstName} </div>}
                        </div>
                        <div className='form-group mb-2'>
                            <label className='form-label'>Last Name:</label>
                            <input
                                type='text'
                                placeholder='Enter Employee Last Name'
                                name='lastName'
                                value={lastName}
                                className={`form-control ${ errors.lastName ? 'is-invalid': ''}`}
                                onChange={(e) => setLastName(e.target.value)}
                            >
                            </input>
                            {errors.lastName && <div className='invalid-feedback'> {errors.lastName} </div>}
                        </div>
                        <div className='form-group mb-2'>
                            <label className='form-label'>Email:</label>
                            <input
                                type='text'
                                placeholder='Enter Employee Email'
                                name='email'
                                value={email}
                                className={`form-control ${ errors.email ? 'is-invalid': ''}`}
                                onChange={(e) => setEmail(e.target.value)}
                            >
                            </input>
                            {errors.email && <div className='invalid-feedback'> {errors.email} </div>}
                        </div>
                        <div className='form-group mb-2'>
                            <label className='form-label'>New Password:</label>
                            <input
                                type='password'
                                placeholder='Leave blank to keep current password'
                                name='password'
                                value={password}
                                className={`form-control ${ errors.password ? 'is-invalid': ''}`}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && <div className='invalid-feedback'> {errors.password} </div>}
                            </div>
                        <div className='d-flex justify-content-between' style={{marginTop: '10px'}}>
                            <button type='button' className='btn btn-secondary' onClick={goBack}>Back</button>
                            <button type='button' className='btn btn-success' onClick={saveOrUpdateEmployee} >Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default EmployeeComponent