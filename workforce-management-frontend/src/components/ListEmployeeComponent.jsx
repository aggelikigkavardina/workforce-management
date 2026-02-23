import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteEmployee, listEmployees } from '../services/EmployeeService';
import { isAdminUser } from '../services/AuthService';

const ListEmployeeComponent = () => {
  const [employees, setEmployees] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const navigator = useNavigate();

  useEffect(() => {
    getAllEmployees();
  }, []);

  function getAllEmployees() {
    setLoadError(null);

    listEmployees()
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error('listEmployees failed:', error);
        const status = error?.response?.status;
        setLoadError(status ? `Request failed with status ${status}` : 'Request failed');
      });
  }

  function addNewEmployee() {
    navigator('/add-employee');
  }

  function updateEmployee(id) {
    navigator(`/edit-employee/${id}`);
  }

  function removeEmployee(id) {
    deleteEmployee(id)
      .then(() => getAllEmployees())
      .catch((error) => {
        console.error('deleteEmployee failed:', error);
      });
  }

  return (
    <div className='container'>
      <br /><br />
      <h2 className='text-center'>List of Employees</h2>

      {loadError && (
        <div className='alert alert-danger'>
           No employees loaded {loadError}. Console/Network.
        </div>
      )}

      {isAdminUser() && (
        <button className='btn btn-primary mb-2' onClick={addNewEmployee}>
          Add Employee
        </button>
      )}

      <table className='table table-striped table-bordered'>
        <thead>
          <tr>
            <th>Employee Id</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            {isAdminUser() && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.firstName}</td>
              <td>{employee.lastName}</td>
              <td>{employee.email}</td>

              {isAdminUser() && (
                <td>
                  <button className='btn btn-info' onClick={() => updateEmployee(employee.id)}>
                    Update
                  </button>
                  <button
                    className='btn btn-danger'
                    onClick={() => removeEmployee(employee.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!loadError && employees.length === 0 && (
        <div className='text-muted'>Employees doen't exist or data didn't loaded</div>
      )}
    </div>
  );
};

export default ListEmployeeComponent;