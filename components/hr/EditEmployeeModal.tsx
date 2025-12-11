
import React, { useState, useEffect } from 'react';
import type { Employee } from '../../types';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
    onSave: (employeeId: string, updatedData: Partial<Omit<Employee, 'id'>>) => void;
}

// Re-using form components from AddEmployeePage for consistency
const FormInput: React.FC<{id: string, label: string, type?: string, value: string | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean, placeholder?: string, disabled?: boolean}> = 
    ({ id, label, type = 'text', value, onChange, required = false, placeholder, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-blue-900">{label}</label>
        <input type={type} id={id} name={id} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} disabled={disabled} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:bg-slate-100 disabled:text-blue-900" />
    </div>
);

const FormSelect: React.FC<{id: string, label: string, value: string | undefined, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, required?: boolean}> =
    ({ id, label, value, onChange, children, required = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-blue-900">{label}</label>
        <select id={id} name={id} value={value || ''} onChange={onChange} required={required} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
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

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, employee, onSave }) => {
    const [formData, setFormData] = useState<Partial<Employee>>({});

    useEffect(() => {
        if (employee) {
            setFormData(employee);
        }
    }, [employee]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { id, ...updatedData } = formData;
        if (employee.id) {
            onSave(employee.id, updatedData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b z-10">
                    <h2 className="text-xl font-bold text-blue-900">Edit Employee: {employee.firstName} {employee.lastName}</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        <div className="space-y-6">
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
                                <FormInput id="email" label="Official Email (Username)" type="email" value={formData.email} onChange={() => {}} required disabled />
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

                                <FormSelect id="employmentType" label="Employment Type" value={formData.employmentType} onChange={handleChange}>
                                    <option>Permanent</option>
                                    <option>Probation</option>
                                    <option>Intern</option>
                                </FormSelect>
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
                        </div>
                    </div>
                    <div className="sticky bottom-0 bg-slate-50 p-4 flex justify-end gap-4 border-t">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-blue-900 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
                            Cancel
                        </button>
                        <button type="submit" className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;
