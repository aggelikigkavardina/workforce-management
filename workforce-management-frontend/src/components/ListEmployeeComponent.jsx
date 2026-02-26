import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteEmployee, listEmployees } from '../services/EmployeeService';
import { isAdminUser } from '../services/AuthService';
import { Eye, Pencil, Trash2 } from 'lucide-react';

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

  function viewEmployeeDetails(id) {
    navigator(`/employees/${id}`);
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

      <table className='table table-striped table-bordered table-hover align-middle'>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            {isAdminUser() && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}
              style={{ cursor: 'pointer' }}
              onClick={() => viewEmployeeDetails(employee.id)}
            >
              <td>{employee.firstName}</td>
              <td>{employee.lastName}</td>
              <td>{employee.email}</td>
              <td>{null}</td>

              {isAdminUser() && (
                <td
                  style={{ width: '1%', whiteSpace: 'nowrap' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className='d-flex gap-2'>

                    <button
                      className='btn btn-link text-secondary p-0'
                      onClick={() => viewEmployeeDetails(employee.id)}
                      title='View Details'
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className='btn btn-link text-primary p-0'
                      onClick={() => updateEmployee(employee.id)}
                      title='Edit Employee'
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className='btn btn-link text-danger p-0'
                      onClick={() => removeEmployee(employee.id)}
                      title='Delete Employee'
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
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