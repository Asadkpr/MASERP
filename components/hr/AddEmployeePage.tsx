
import React, { useState, useEffect, useMemo } from 'react';
import type { Employee } from '../../types';
import EditEmployeeModal from './EditEmployeeModal';

interface AddEmployeePageProps {
  onAddEmployee: (employee: Omit<Employee, 'id'>, password: string) => void;
  employees: Employee[];
  onResignEmployee: (employeeId: string) => Promise<{ success: boolean; message: string }>;
  onUpdateEmployee: (employeeId: string, updatedData: Partial<Omit<Employee, 'id'>>) => Promise<{ success: boolean; message: string }>;
}

const initialFormData = {
    employeeId: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    cnic: '',
    dob: '',
    gender: 'Male' as Employee['gender'],
    maritalStatus: 'Single' as Employee['maritalStatus'],
    currentAddress: '',
    permanentAddress: '',
    email: '',
    personalEmail: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    department: 'Human Resources',
    designation: '',
    joiningDate: '',
    employmentType: 'Probation' as Employee['employmentType'], // Default to Probation
    status: 'Active' as Employee['status'],
    salary: '',
    shift: 'Morning (09:00 AM - 06:00 PM)',
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    role: 'Employee' as Employee['role'],
    password: '',
    confirmPassword: '',
};

const FormInput: React.FC<{id: string, label: string, type?: string, value: string | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean, placeholder?: string}> = 
    ({ id, label, type = 'text', value, onChange, required = false, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-blue-900">{label}</label>
        <input type={type} id={id} name={id} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 text-blue-900 focus:outline-none focus:ring-blue-900 focus:border-blue-900 sm:text-sm" />
    </div>
);

const FormSelect: React.FC<{id: string, label: string, value: string | undefined, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, required?: boolean}> =
    ({ id, label, value, onChange, children, required = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-blue-900">{label}</label>
        <select id={id} name={id} value={value || ''} onChange={onChange} required={required} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 text-blue-900 focus:outline-none focus:ring-blue-900 focus:border-blue-900 sm:text-sm rounded-md">
            {children}
        </select>
    </div>
);

const FormSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="pt-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 border-b pb-2">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);


const AddEmployeePage: React.FC<AddEmployeePageProps> = ({ onAddEmployee, employees, onResignEmployee, onUpdateEmployee }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [formMessage, setFormMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [listMessage, setListMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  useEffect(() => {
    if (listMessage) {
      const timer = setTimeout(() => setListMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [listMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEmploymentTypeChange = (type: 'Probation' | 'Permanent') => {
      setFormData(prev => ({ ...prev, employmentType: type }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setFormMessage({ type: 'error', text: 'Passwords do not match.'});
      return;
    }
    if (formData.password.length < 6) {
      setFormMessage({ type: 'error', text: 'Password must be at least 6 characters long.'});
      return;
    }

    const { password, confirmPassword, ...employeeData } = formData;
    onAddEmployee(employeeData, password);

    setListMessage({ type: 'success', text: `Employee ${formData.firstName} ${formData.lastName} added successfully.` });
    setFormData(initialFormData);
    setShowAddForm(false);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingEmployee(null);
    setIsEditModalOpen(false);
  };
  
  const handleUpdate = async (employeeId: string, updatedData: Partial<Omit<Employee, 'id'>>) => {
    const result = await onUpdateEmployee(employeeId, updatedData);
    setListMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if(result.success) {
      handleCloseEditModal();
    }
  };

  const handleResignClick = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to mark ${employee.firstName} ${employee.lastName} as resigned?`)) {
        const result = await onResignEmployee(employee.id);
        setListMessage({ type: result.success ? 'success' : 'error', text: result.message });
    }
  };

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
        if (a.status === 'Resigned' && b.status !== 'Resigned') return 1;
        if (a.status !== 'Resigned' && b.status === 'Resigned') return -1;
        return 0;
    });
  }, [employees]);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-900">Employee Management</h1>
        <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white transition-colors ${showAddForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-900 hover:bg-blue-800'}`}
        >
            {showAddForm ? 'Cancel Adding' : 'Add New Employee'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-6xl mx-auto border border-blue-100">
            <h2 className="text-xl font-bold text-blue-900 mb-6">Add New Employee</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Details */}
                <FormSection title="Personal Details">
                    <FormInput id="employeeId" label="Employee ID" value={formData.employeeId} onChange={handleChange} placeholder="e.g., EMP-001" />
                    <FormInput id="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                    <FormInput id="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
                    <FormInput id="fatherName" label="Father's Name" value={formData.fatherName} onChange={handleChange} required />
                    <FormInput id="cnic" label="CNIC" value={formData.cnic} onChange={handleChange} placeholder="e.g., 35202-1234567-1" />
                    <FormInput id="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} />
                    <FormSelect id="gender" label="Gender" value={formData.gender} onChange={handleChange}>
                        <option>Male</option><option>Female</option><option>Other</option>
                    </FormSelect>
                    <FormSelect id="maritalStatus" label="Marital Status" value={formData.maritalStatus} onChange={handleChange}>
                        <option>Single</option><option>Married</option>
                    </FormSelect>
                </FormSection>

                {/* Contact Details */}
                <FormSection title="Contact & Address">
                    <FormInput id="phone" label="Phone Number" value={formData.phone} onChange={handleChange} placeholder="e.g., 0300-1234567" />
                    <FormInput id="email" label="Official Email" type="email" value={formData.email} onChange={handleChange} required />
                    <FormInput id="personalEmail" label="Personal Email" type="email" value={formData.personalEmail} onChange={handleChange} />
                    <FormInput id="currentAddress" label="Current Address" value={formData.currentAddress} onChange={handleChange} />
                    <FormInput id="permanentAddress" label="Permanent Address" value={formData.permanentAddress} onChange={handleChange} />
                </FormSection>

                {/* Employment Details */}
                <FormSection title="Employment Details">
                    <FormSelect id="department" label="Department" value={formData.department} onChange={handleChange} required>
                        <option>Human Resources</option><option>IT</option><option>Finance</option><option>Engineering</option><option>Marketing</option><option>Sales</option>
                    </FormSelect>
                    <FormInput id="designation" label="Designation" value={formData.designation} onChange={handleChange} required />
                    <FormInput id="joiningDate" label="Joining Date" type="date" value={formData.joiningDate} onChange={handleChange} required />
                    
                    <FormSelect id="shift" label="Shift Timing" value={formData.shift} onChange={handleChange} required>
                        <option>Morning (09:00 AM - 06:00 PM)</option>
                        <option>Evening (02:00 PM - 11:00 PM)</option>
                        <option>Night (10:00 PM - 07:00 AM)</option>
                    </FormSelect>

                    {/* REPLACED DROPDOWN WITH CHECKBOXES */}
                    <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">Employment Status</label>
                        <div className="flex space-x-6 mt-2">
                            <label className="inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox h-5 w-5 text-blue-900 rounded focus:ring-blue-900 border-slate-300"
                                    checked={formData.employmentType === 'Probation'}
                                    onChange={() => handleEmploymentTypeChange('Probation')}
                                />
                                <span className="ml-2 text-blue-900">Probation</span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox h-5 w-5 text-blue-900 rounded focus:ring-blue-900 border-slate-300"
                                    checked={formData.employmentType === 'Permanent'}
                                    onChange={() => handleEmploymentTypeChange('Permanent')}
                                />
                                <span className="ml-2 text-blue-900">Permanent</span>
                            </label>
                        </div>
                        <p className="text-xs text-blue-900 mt-1">
                            {formData.employmentType === 'Probation' 
                                ? 'Leaves are not allocated during probation.' 
                                : 'Leaves will be allocated pro-rata based on joining date.'}
                        </p>
                    </div>

                    <FormSelect id="status" label="Status" value={formData.status} onChange={handleChange}>
                        <option>Active</option><option>Resigned</option><option>Terminated</option>
                    </FormSelect>
                </FormSection>
                
                {/* Financial & Access */}
                <FormSection title="Financial & System Access">
                    <FormInput id="salary" label="Salary (PKR)" type="number" value={formData.salary} onChange={handleChange} required />
                    <FormInput id="bankName" label="Bank Name" value={formData.bankName} onChange={handleChange} />
                    <FormInput id="accountTitle" label="Account Title" value={formData.accountTitle} onChange={handleChange} />
                    <FormInput id="accountNumber" label="Account Number" value={formData.accountNumber} onChange={handleChange} />
                    <FormSelect id="role" label="System Role" value={formData.role} onChange={handleChange} required>
                        <option value="Employee">Employee</option><option value="HOD">HOD</option><option value="HR">HR</option>
                    </FormSelect>
                </FormSection>

                <FormSection title="Create User Account">
                    <FormInput id="password" label="Password for User Account" type="password" value={formData.password} onChange={handleChange} required placeholder="Min. 6 characters" />
                    <FormInput id="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                </FormSection>

                {formMessage && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {formMessage.text}
                    </div>
                )}
                <div className="flex justify-end pt-4 gap-4">
                    <button 
                        type="button" 
                        onClick={() => setShowAddForm(false)}
                        className="py-2 px-6 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-blue-900 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
                        Cancel
                    </button>
                    <button type="submit" className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900">
                    Add Employee
                    </button>
                </div>
            </form>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-sm max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Employee List</h2>
        {listMessage && (
            <div className={`mb-4 p-3 rounded-md text-sm ${listMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {listMessage.text}
            </div>
        )}
        <div className="overflow-x-auto">
          {employees.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Emp. ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Designation</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Shift</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Salary (PKR)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedEmployees.map((emp) => (
                  <tr key={emp.id} className={`${emp.status === 'Resigned' ? 'bg-slate-50 opacity-60' : ''} hover:bg-purple-50 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-900">{emp.employeeId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                        {emp.firstName} {emp.lastName}
                        <div className="text-xs text-blue-900 font-normal">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{emp.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{emp.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{emp.shift || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{emp.salary}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <button onClick={() => handleOpenEditModal(emp)} className="text-blue-900 hover:text-blue-950">Edit</button>
                        <button 
                            onClick={() => handleResignClick(emp)} 
                            disabled={emp.status === 'Resigned'}
                            className="text-orange-600 hover:text-orange-900 disabled:text-blue-900 disabled:cursor-not-allowed disabled:no-underline"
                        >
                            Resign
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-blue-900 py-10">There are no employees to display. Click "Add New Employee" to get started.</p>
          )}
        </div>
      </div>
      {isEditModalOpen && editingEmployee && (
        <EditEmployeeModal 
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          employee={editingEmployee}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default AddEmployeePage;
