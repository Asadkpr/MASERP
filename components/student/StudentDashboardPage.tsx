
import React, { useState, useMemo, useEffect } from 'react';
import { HomeIcon } from '../icons/HomeIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { MasbotLogo } from '../icons/MasbotLogo';
import { RecruitmentIcon } from '../icons/RecruitmentIcon';
import { StudentIcon } from '../icons/StudentIcon';
import { TrainingIcon } from '../icons/TrainingIcon';
import { PayrollIcon } from '../icons/PayrollIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { AttendanceIcon } from '../icons/AttendanceIcon';
import { AnalyticsIcon } from '../icons/AnalyticsIcon';
import { DollarIcon } from '../icons/DollarIcon';
import { ChatIcon } from '../icons/ChatIcon';
import { studentPages } from '../moduleNavigation';
import AcademicSetupPage from './AcademicSetupPage';
import ApplicantsPage from './ApplicantsPage';
import StudentDirectoryPage from './StudentDirectoryPage';
import CourseOfferingsPage from './CourseOfferingsPage';
import CourseRegistrationPage from './CourseRegistrationPage';
import TimetableManagementPage from './TimetableManagementPage';
import AttendanceTrackingPage from './AttendanceTrackingPage';
import CourseActivitiesPage from './CourseActivitiesPage';
import ExamManagementPage from './ExamManagementPage';
import MarksEntryPage from './MarksEntryPage';
import ResultProcessingPage from './ResultProcessingPage';
import StudentServicesPage from './StudentServicesPage';
import NotificationsPage from './NotificationsPage';
import type { AcademicSession, DegreeProgram, CourseCatalog, AcademicPolicy, ModulePermissions, Applicant, Student, OfferedCourse, CourseRegistration, Employee, Classroom, TimetableEntry, StudentAttendance, CourseActivity, ExamSchedule, StudentMark, StudentRequest, AcademicNotification } from '../../types';

interface StudentDashboardPageProps {
    onBack: () => void;
    onLogout: () => void;
    currentUserEmail: string;
    permissions?: ModulePermissions;
    sessions: AcademicSession[];
    programs: DegreeProgram[];
    courses: CourseCatalog[];
    policies: AcademicPolicy[];
    applicants: Applicant[];
    students: Student[];
    offeredCourses: OfferedCourse[];
    registrations: CourseRegistration[];
    employees: Employee[];
    classrooms: Classroom[];
    timetable: TimetableEntry[];
    studentAttendance: StudentAttendance[];
    courseActivities: CourseActivity[];
    examSchedules: ExamSchedule[];
    studentMarks: StudentMark[];
    studentRequests: StudentRequest[];
    academicNotifications: AcademicNotification[];
    onAddSession: (s: Omit<AcademicSession, 'id'>) => Promise<void>;
    onAddProgram: (p: Omit<DegreeProgram, 'id'>) => Promise<void>;
    onAddCourse: (c: Omit<CourseCatalog, 'id'>) => Promise<void>;
    onAddPolicy: (p: Omit<AcademicPolicy, 'id'>) => Promise<void>;
    onAddApplicant: (a: Omit<Applicant, 'id'>) => Promise<void>;
    onAdmitStudent: (applicantId: string, s: Omit<Student, 'id'>, password: string) => Promise<void>;
    onOfferCourse: (c: Omit<OfferedCourse, 'id' | 'currentEnrollment'>) => Promise<void>;
    onRegisterStudent: (reg: Omit<CourseRegistration, 'id' | 'registrationDate' | 'status'>) => Promise<void>;
    onAddClassroom: (c: Omit<Classroom, 'id'>) => Promise<void>;
    onAddTimetableEntry: (e: Omit<TimetableEntry, 'id'>) => Promise<void>;
    onMarkAttendance: (records: Omit<StudentAttendance, 'id'>[]) => Promise<void>;
    onAddActivity: (a: Omit<CourseActivity, 'id'>) => Promise<void>;
    onAddExamSchedule: (e: Omit<ExamSchedule, 'id'>) => Promise<void>;
    onSaveMarks: (marks: Omit<StudentMark, 'id' | 'status' | 'entryDate'>[]) => Promise<void>;
    onPublishResults: (sessionId: string) => Promise<void>;
    onActionRequest: (id: string, action: 'In Review' | 'Approved' | 'Rejected', remarks?: string) => Promise<void>;
    onPostNotification: (n: Omit<AcademicNotification, 'id'>) => Promise<void>;
}

const StudentDashboardPage: React.FC<StudentDashboardPageProps> = (props) => {
    const isAdmin = props.currentUserEmail === 'admin';
    
    // FILTER ACCESSIBLE SIDEBAR PAGES
    const visiblePages = useMemo(() => {
        if (isAdmin) return studentPages;
        return studentPages.filter(page => props.permissions?.[page.id]?.view);
    }, [isAdmin, props.permissions]);

    // AUTO-SELECT FIRST ACCESSIBLE PAGE
    const [activePage, setActivePage] = useState<string>('std_dashboard');

    useEffect(() => {
        if (!isAdmin && !props.permissions?.['std_dashboard']?.view && visiblePages.length > 0) {
            setActivePage(visiblePages[0].id);
        }
    }, [visiblePages, isAdmin, props.permissions]);

    const renderContent = () => {
        if (!isAdmin && !props.permissions?.[activePage]?.view) {
            return <div className="p-20 text-center text-slate-400 font-bold uppercase italic">Access Restricted. Contact HR Manager.</div>;
        }

        const pagePerms = props.permissions?.[activePage] || { view: true, edit: isAdmin, delete: isAdmin, update: isAdmin };

        switch (activePage) {
            case 'std_dashboard':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Service Requests</p>
                                <p className="text-3xl font-black text-orange-600">{props.studentRequests.filter(r => r.status === 'Pending').length}</p>
                                <p className="text-xs text-orange-400 mt-2 font-bold uppercase tracking-tighter">Awaiting Action</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Campus Alerts</p>
                                <p className="text-3xl font-black text-blue-900">{props.academicNotifications.length}</p>
                                <p className="text-xs text-blue-400 mt-2 font-bold uppercase tracking-tighter">Broadcasted Items</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Student Body</p>
                                <p className="text-3xl font-black text-purple-900">{props.students.length}</p>
                                <p className="text-xs text-purple-400 mt-2 font-bold uppercase tracking-tighter">Verified Enrollments</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Faculty Strength</p>
                                <p className="text-3xl font-black text-green-600">42</p>
                                <p className="text-xs text-green-400 mt-2 font-bold uppercase tracking-tighter">Active Educators</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10 max-w-2xl">
                                <h2 className="text-3xl font-black mb-4 tracking-tight">Institutional Services & Comms</h2>
                                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                                    Manage student formal requests for leaves, withdrawals, and degree issuances. Broadcast important alerts and general notices to the campus community.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {(isAdmin || props.permissions?.['std_services']?.view) && (
                                        <button 
                                            onClick={() => setActivePage('std_services')}
                                            className="bg-white text-blue-900 px-8 py-3 rounded-xl font-black text-sm shadow-lg hover:scale-105 transition-transform active:scale-95"
                                        >
                                            Student Helpdesk &rarr;
                                        </button>
                                    )}
                                    {(isAdmin || props.permissions?.['std_notifications']?.view) && (
                                        <button 
                                            onClick={() => setActivePage('std_notifications')}
                                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg hover:bg-indigo-500 transition-all active:scale-95 border border-indigo-500"
                                        >
                                            Notification Center
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                                <MasbotLogo className="w-96 h-96" />
                            </div>
                        </div>
                    </div>
                );
            case 'academic_setup':
                return <AcademicSetupPage 
                    sessions={props.sessions} 
                    programs={props.programs} 
                    courses={props.courses} 
                    policies={props.policies}
                    onAddSession={props.onAddSession}
                    onAddProgram={props.onAddProgram}
                    onAddCourse={props.onAddCourse}
                    onAddPolicy={props.onAddPolicy}
                    canEdit={pagePerms.edit}
                />;
            case 'applicants':
                return <ApplicantsPage 
                    applicants={props.applicants}
                    programs={props.programs}
                    sessions={props.sessions}
                    onAddApplicant={props.onAddApplicant}
                    onAdmitStudent={props.onAdmitStudent}
                    canEdit={pagePerms.edit}
                />;
            case 'student_directory':
                return <StudentDirectoryPage 
                    students={props.students}
                    programs={props.programs}
                    sessions={props.sessions}
                />;
            case 'course_offerings':
                return <CourseOfferingsPage 
                    sessions={props.sessions}
                    courses={props.courses}
                    employees={props.employees}
                    offeredCourses={props.offeredCourses}
                    onOfferCourse={props.onOfferCourse}
                    canEdit={pagePerms.edit}
                />;
            case 'course_registrations':
                return <CourseRegistrationPage 
                    students={props.students}
                    programs={props.programs}
                    offeredCourses={props.offeredCourses}
                    courseCatalog={props.courses}
                    sessions={props.sessions}
                    registrations={props.registrations}
                    onRegister={props.onRegisterStudent}
                    canEdit={pagePerms.edit}
                />;
            case 'std_timetable':
                return <TimetableManagementPage 
                    offeredCourses={props.offeredCourses}
                    courses={props.courses}
                    employees={props.employees}
                    classrooms={props.classrooms}
                    timetable={props.timetable}
                    onAddClassroom={props.onAddClassroom}
                    onAddTimetableEntry={props.onAddTimetableEntry}
                    canEdit={pagePerms.edit}
                />;
            case 'std_attendance':
                return <AttendanceTrackingPage 
                    currentUserEmail={props.currentUserEmail}
                    offeredCourses={props.offeredCourses}
                    courseCatalog={props.courses}
                    registrations={props.registrations}
                    students={props.students}
                    timetable={props.timetable}
                    attendance={props.studentAttendance}
                    onMarkAttendance={props.onMarkAttendance}
                    canEdit={pagePerms.edit}
                />;
            case 'course_delivery':
                return <CourseActivitiesPage 
                    currentUserEmail={props.currentUserEmail}
                    offeredCourses={props.offeredCourses}
                    courseCatalog={props.courses}
                    activities={props.courseActivities}
                    onAddActivity={props.onAddActivity}
                    canEdit={pagePerms.edit}
                />;
            case 'exam_mgmt':
                return <ExamManagementPage 
                    sessions={props.sessions}
                    offeredCourses={props.offeredCourses}
                    courseCatalog={props.courses}
                    employees={props.employees}
                    classrooms={props.classrooms}
                    examSchedules={props.examSchedules}
                    onAddExamSchedule={props.onAddExamSchedule}
                    canEdit={pagePerms.edit}
                />;
            case 'std_marks':
                return <MarksEntryPage 
                    currentUserEmail={props.currentUserEmail}
                    offeredCourses={props.offeredCourses}
                    courseCatalog={props.courses}
                    registrations={props.registrations}
                    students={props.students}
                    marks={props.studentMarks}
                    onSaveMarks={props.onSaveMarks}
                    canEdit={pagePerms.edit}
                />;
            case 'std_results':
                return <ResultProcessingPage 
                    sessions={props.sessions}
                    offeredCourses={props.offeredCourses}
                    courseCatalog={props.courses}
                    students={props.students}
                    marks={props.studentMarks}
                    onPublishResults={props.onPublishResults}
                    canEdit={pagePerms.edit}
                />;
            case 'std_services':
                return <StudentServicesPage 
                    requests={props.studentRequests}
                    students={props.students}
                    onAction={props.onActionRequest}
                    canEdit={pagePerms.edit}
                />;
            case 'std_notifications':
                return <NotificationsPage 
                    notifications={props.academicNotifications}
                    currentUserEmail={props.currentUserEmail}
                    programs={props.programs}
                    onPost={props.onPostNotification}
                    canEdit={pagePerms.edit}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4">
                    <MasbotLogo className="h-8 w-auto" />
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2 italic">Campus Ecosystem</div>
                    
                    {visiblePages.map(page => (
                        <button
                            key={page.id}
                            onClick={() => setActivePage(page.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                                activePage === page.id ? 'bg-purple-50 text-purple-900 shadow-sm border-r-4 border-purple-900 font-bold' : 'text-blue-900 hover:bg-purple-50 hover:text-purple-900'
                            }`}
                        >
                             <page.icon className={`w-5 h-5 ${activePage === page.id ? 'text-purple-900' : 'text-blue-900'}`} />
                            <span className="text-sm font-bold">{page.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-900 font-bold text-xs uppercase">
                            {props.currentUserEmail[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-blue-900 truncate uppercase tracking-tight">{props.currentUserEmail.split('@')[0]}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">System Operator</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-purple-900 border-b border-purple-800 h-16 flex-shrink-0 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={props.onBack} className="flex items-center gap-2 text-sm font-black text-purple-100 hover:text-white transition-colors uppercase tracking-widest">
                            <HomeIcon className="w-5 h-5" />
                            <span>System Home</span>
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={props.onLogout} 
                            className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-x-hidden overflow-y-auto p-10">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboardPage;
