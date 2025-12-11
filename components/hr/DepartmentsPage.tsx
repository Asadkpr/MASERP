
import React, { useState } from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

const schoolData = [
    { 
        name: "School of Arts", 
        departments: ["Department of Fine Arts", "Department of Music", "Department of Performing Arts", "Department of Visual Arts"] 
    },
    { 
        name: "School of SIR", 
        departments: ["Department of Information Technology", "Department of Robotics", "Department of Software Engineering", "Department of Data Science"] 
    },
    { 
        name: "School of SADU", 
        departments: ["Department of Architecture & Design", "Department of Urban & Regional Planning", "Department of Interior Design"] 
    },
    { 
        name: "School of SDCA", 
        departments: ["Department of Digital Communication", "Department of Animation & VFX", "Department of Media & Cultural Studies", "Department of Game Design"] 
    }
];


const DepartmentsPage: React.FC = () => {
  const [openSchool, setOpenSchool] = useState<string | null>(null);

  const toggleSchool = (schoolName: string) => {
    if (openSchool === schoolName) {
      setOpenSchool(null);
    } else {
      setOpenSchool(schoolName);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Departments by School</h1>
      <div className="space-y-4">
        {schoolData.map((school) => {
          const isOpen = openSchool === school.name;
          return (
            <div key={school.name} className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleSchool(school.name)}
                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                aria-expanded={isOpen}
                aria-controls={`departments-${school.name}`}
              >
                <h2 className="text-lg font-semibold text-blue-900">{school.name}</h2>
                <ChevronDownIcon
                  className={`w-5 h-5 text-blue-900 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div 
                  id={`departments-${school.name}`}
                  className="bg-white p-4 border-t border-slate-200"
                >
                  <ul className="space-y-2 pl-4 list-disc list-inside">
                    {school.departments.map((dept) => (
                      <li key={dept} className="text-blue-900 text-sm">
                        {dept}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentsPage;
