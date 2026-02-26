import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployee } from '../services/EmployeeService';

const EmployeeDetailsComponent = () => {
  const { id } = useParams();
  const navigator = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setLoadError(null);
    getEmployee(id)
      .then((response) => setEmployee(response.data))
      .catch((error) => {
        console.error('getEmployee failed:', error);
        const status = error?.response?.status;
        setLoadError(status ? `Request failed with status ${status}` : 'Request failed');
      });
  }, [id]);

  function goBack() {
    navigator('/employees');
  }

  function goEdit() {
    navigator(`/edit-employee/${id}`);
  }

  return (
    <div className='container'>
      <br /><br />

      <div className='row'>
        <div className='card col-md-6 offset-md-3'>
          <h2 className='text-center' style={{ marginTop: '10px' }}>
            Employee Details
          </h2>

          <div className='card-body'>
            {loadError && <div className='alert alert-danger'>{loadError}</div>}

            {!loadError && !employee && <div>Loading...</div>}

            {!loadError && employee && (
              <>
                <div className='mb-2'>
                  <strong>Employee ID:</strong> {employee.id}
                </div>
                <div className='mb-2'>
                  <strong>First Name:</strong> {employee.firstName}
                </div>
                <div className='mb-2'>
                  <strong>Last Name:</strong> {employee.lastName}
                </div>
                <div className='mb-2'>
                  <strong>Email:</strong> {employee.email}
                </div>

                {/*
                <div className='mb-2'><strong>Phone:</strong> {employee.phone}</div>
                <div className='mb-2'><strong>Address:</strong> {employee.address}</div>
                */}

                <div className='d-flex justify-content-between' style={{ marginTop: '15px' }}>
                  <button type='button' className='btn btn-secondary' onClick={goBack}>
                    Back
                  </button>
                  <button type='button' className='btn btn-primary' onClick={goEdit}>
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsComponent;