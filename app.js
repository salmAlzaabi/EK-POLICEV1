const { useState, useEffect } = React;

// مكتبة الأيقونات البسيطة
const Icon = ({ name, className = "" }) => {
    const icons = {
        shield: "🛡️",
        search: "🔍",
        plus: "➕",
        fileText: "📄",
        users: "👥",
        home: "🏠",
        logout: "🚪",
        userCog: "⚙️",
        star: "⭐",
        userPlus: "👤➕",
        bell: "🔔",
        megaphone: "📢",
        alertTriangle: "⚠️"
    };
    
    return <span className={className}>{icons[name] || "•"}</span>;
};

const PoliceSystem = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [loginForm, setLoginForm] = useState({ id: '', password: '' });
    const [currentPage, setCurrentPage] = useState('dashboard');
    
    const [users, setUsers] = useState([{
        id: '1001',
        password: 'commander',
        name: 'عبدالله محمد',
        role: 'قائد',
        rank: 'فريق أول',
        department: 'القيادة العامة'
    }]);
    
    const [criminals, setCriminals] = useState([]);
    const [reports, setReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [militaryPersonnel, setMilitaryPersonnel] = useState([{
        id: 1,
        name: 'عبدالله محمد',
        rank: 'فريق أول',
        empId: '1001',
        department: 'القيادة العامة',
        status: 'نشط'
    }]);

    const [searchTerm, setSearchTerm] = useState('');
    const [newCriminal, setNewCriminal] = useState({ name: '', crime: '', danger: 'متوسط' });
    const [newUser, setNewUser] = useState({ id: '', password: '', name: '', role: 'جندي', rank: 'جندي', department: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasSeenNotifications, setHasSeenNotifications] = useState(false);

    // حفظ البيانات في localStorage
    useEffect(() => {
        const savedUsers = localStorage.getItem('police_users');
        const savedCriminals = localStorage.getItem('police_criminals');
        const savedReports = localStorage.getItem('police_reports');
        const savedAnnouncements = localStorage.getItem('police_announcements');
        const savedMilitary = localStorage.getItem('police_military');

        if (savedUsers) setUsers(JSON.parse(savedUsers));
        if (savedCriminals) setCriminals(JSON.parse(savedCriminals));
        if (savedReports) setReports(JSON.parse(savedReports));
        if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements));
        if (savedMilitary) setMilitaryPersonnel(JSON.parse(savedMilitary));
    }, []);

    useEffect(() => {
        localStorage.setItem('police_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('police_criminals', JSON.stringify(criminals));
    }, [criminals]);

    useEffect(() => {
        localStorage.setItem('police_reports', JSON.stringify(reports));
    }, [reports]);

    useEffect(() => {
        localStorage.setItem('police_announcements', JSON.stringify(announcements));
    }, [announcements]);

    useEffect(() => {
        localStorage.setItem('police_military', JSON.stringify(militaryPersonnel));
    }, [militaryPersonnel]);

    const hasPermission = (action) => {
        if (!currentUser) return false;
        
        const permissions = {
            'قائد': ['view', 'add', 'edit', 'delete', 'manage_personnel'],
            'ضابط': ['view', 'add', 'edit'],
            'جندي': ['view']
        };
        
        return permissions[currentUser.role]?.includes(action);
    };

    const handleLogin = () => {
        const user = users.find(u => u.id === loginForm.id && u.password === loginForm.password);
        
        if (user) {
            setCurrentUser(user);
            setIsLoggedIn(true);
            setLoginError('');
        } else {
            setLoginError('الرقم العسكري أو كلمة المرور غير صحيحة');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setLoginForm({ id: '', password: '' });
        setCurrentPage('dashboard');
    };

    const addCriminal = () => {
        if (!hasPermission('add')) {
            alert('ليس لديك صلاحية لإضافة مجرمين');
            return;
        }
        
        if (newCriminal.name && newCriminal.crime) {
            const criminal = {
                id: Date.now(),
                ...newCriminal,
                status: 'مطلوب',
                date: new Date().toISOString().split('T')[0]
            };
            setCriminals([...criminals, criminal]);
            setNewCriminal({ name: '', crime: '', danger: 'متوسط' });
            setHasSeenNotifications(false);
            alert('تم إضافة المجرم بنجاح!');
        }
    };

    const deleteCriminal = (id) => {
        if (!hasPermission('delete')) {
            alert('ليس لديك صلاحية للحذف - هذه الصلاحية للقائد فقط');
            return;
        }
        setCriminals(criminals.filter(c => c.id !== id));
    };

    const deleteReport = (id) => {
        if (!hasPermission('delete')) {
            alert('ليس لديك صلاحية للحذف - هذه الصلاحية للقائد فقط');
            return;
        }
        setReports(reports.filter(r => r.id !== id));
    };

    const addUser = () => {
        if (!hasPermission('manage_personnel')) {
            alert('ليس لديك صلاحية لإدارة المستخدمين - هذه الصلاحية للقائد فقط');
            return;
        }
        
        if (newUser.id && newUser.password && newUser.name && newUser.department) {
            const userExists = users.find(u => u.id === newUser.id);
            if (userExists) {
                alert('الرقم الوظيفي موجود مسبقاً! استخدم رقم آخر');
                return;
            }
            setUsers([...users, newUser]);
            
            // إضافة للقائمة العسكرية أيضاً
            const newMilitary = {
                id: Date.now(),
                name: newUser.name,
                rank: newUser.rank,
                empId: newUser.id,
                department: newUser.department,
                status: 'نشط'
            };
            setMilitaryPersonnel([...militaryPersonnel, newMilitary]);
            
            setNewUser({ id: '', password: '', name: '', role: 'جندي', rank: 'جندي', department: '' });
            alert('تم إضافة المستخدم بنجاح!');
        } else {
            alert('الرجاء تعبئة جميع الحقول');
        }
    };

    const updateUser = () => {
        if (!hasPermission('manage_personnel')) {
            alert('ليس لديك صلاحية لإدارة المستخدمين');
            return;
        }
        
        if (editingUser.id && editingUser.password && editingUser.name && editingUser.department) {
            setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
            
            // تحديث في القائمة العسكرية
            setMilitaryPersonnel(militaryPersonnel.map(m => 
                m.empId === editingUser.id ? {
                    ...m,
                    name: editingUser.name,
                    rank: editingUser.rank,
                    department: editingUser.department
                } : m
            ));
            
            setEditingUser(null);
            alert('تم تحديث المستخدم بنجاح!');
            
            if (currentUser.id === editingUser.id) {
                setCurrentUser(editingUser);
            }
        } else {
            alert('الرجاء تعبئة جميع الحقول');
        }
    };

    const deleteUser = (userId) => {
        if (!hasPermission('manage_personnel')) {
            alert('ليس لديك صلاحية لإدارة المستخدمين');
            return;
        }
        if (userId === currentUser.id) {
            alert('لا يمكنك حذف حسابك الخاص!');
            return;
        }
        setUsers(users.filter(u => u.id !== userId));
        setMilitaryPersonnel(militaryPersonnel.filter(m => m.empId !== userId));
        alert('تم حذف المستخدم');
    };

    const addReport = () => {
        const type = prompt('نوع البلاغ:');
        const location = prompt('الموقع:');
        const time = prompt('الوقت (مثال: 14:30):');
        const date = prompt('التاريخ (مثال: 2025-01-20):');
        
        if (type && location && time && date) {
            const report = {
                id: Date.now(),
                type,
                location,
                time,
                date,
                status: 'جديد'
            };
            setReports([...reports, report]);
            setHasSeenNotifications(false);
            alert('تم إضافة البلاغ بنجاح!');
        }
    };

    const addAnnouncement = () => {
        if (!hasPermission('add')) {
            alert('ليس لديك صلاحية لإضافة بيانات - هذه الصلاحية للقائد والضابط فقط');
            return;
        }
        
        if (newAnnouncement.title && newAnnouncement.content) {
            const announcement = {
                id: Date.now(),
                ...newAnnouncement,
                author: currentUser.name,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            };
            setAnnouncements([...announcements, announcement]);
            setNewAnnouncement({ title: '', content: '' });
            alert('تم نشر البيان بنجاح!');
        } else {
            alert('الرجاء تعبئة جميع الحقول');
        }
    };

    const deleteAnnouncement = (id) => {
        if (!hasPermission('delete')) {
            alert('ليس لديك صلاحية للحذف - هذه الصلاحية للقائد فقط');
            return;
        }
        setAnnouncements(announcements.filter(a => a.id !== id));
        alert('تم حذف البيان');
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setHasSeenNotifications(true);
        }
    };

    const notificationCount = reports.filter(r => r.status === 'جديد').length + criminals.filter(c => c.status === 'مطلوب').length;
    const filteredCriminals = criminals.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.crime.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // صفحة تسجيل الدخول
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-2xl p-8 w-full max-w-md border border-blue-800/50 relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
                    
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4 relative">
                            <img 
                                src="https://cdn.discordapp.com/attachments/1382852151063347210/1463017745686728819/LSPD.webp" 
                                alt="Ministry Logo" 
                                className="w-32 h-32 mx-auto object-contain relative z-10"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <div className="p-4 bg-blue-600 rounded-full" style={{display: 'none'}}>
                                <Icon name="shield" className="text-6xl" />
                            </div>
                        </div>
                        
                        <div className="border-b border-blue-800/50 pb-4 mb-4">
                            <h1 className="text-3xl font-bold text-white mb-2">نظام وزارة الداخلية</h1>
                            <p className="text-blue-400/80 text-sm">Ministry of Interior System</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-blue-400 mb-2 text-right font-semibold">الرقم العسكري</label>
                            <input 
                                type="text" 
                                value={loginForm.id}
                                onChange={(e) => setLoginForm({...loginForm, id: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-800/50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-right text-white placeholder-gray-500"
                                placeholder="أدخل الرقم العسكري"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-blue-400 mb-2 text-right font-semibold">كلمة المرور</label>
                            <input 
                                type="password" 
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-800/50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-right text-white placeholder-gray-500"
                                placeholder="أدخل كلمة المرور"
                            />
                        </div>

                        {loginError && (
                            <div className="bg-red-900/40 border border-red-600 text-red-400 px-4 py-3 rounded-lg text-right font-semibold">
                                {loginError}
                            </div>
                        )}
                        
                        <button 
                            onClick={handleLogin}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition font-bold text-lg shadow-lg"
                        >
                            دخول النظام
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // يتبع في الجزء الثاني...
    return null;
};

ReactDOM.render(<Policonst { useState, useEffect } = React;

const Icon = ({ name, className = "" }) => {
    const icons = {
        shield: "🛡️", search: "🔍", plus: "➕", fileText: "📄", users: "👥",
        home: "🏠", logout: "🚪", userCog: "⚙️", star: "⭐", userPlus: "👤➕",
        bell: "🔔", megaphone: "📢", alertTriangle: "⚠️"
    };
    return <span className={className}>{icons[name] || "•"}</span>;
};

const PoliceSystem = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [loginForm, setLoginForm] = useState({ id: '', password: '' });
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [users, setUsers] = useState([{
        id: '1001', password: 'commander', name: 'عبدالله محمد',
        role: 'قائد', rank: 'فريق أول', department: 'القيادة العامة'
    }]);
    const [criminals, setCriminals] = useState([]);
    const [reports, setReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [militaryPersonnel, setMilitaryPersonnel] = useState([{
        id: 1, name: 'عبدالله محمد', rank: 'فريق أول',
        empId: '1001', department: 'القيادة العامة', status: 'نشط'
    }]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCriminal, setNewCriminal] = useState({ name: '', crime: '', danger: 'متوسط' });
    const [newUser, setNewUser] = useState({ id: '', password: '', name: '', role: 'جندي', rank: 'جندي', department: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasSeenNotifications, setHasSeenNotifications] = useState(false);

    useEffect(() => {
        const load = (key, setter) => {
            const saved = localStorage.getItem(key);
            if (saved) setter(JSON.parse(saved));
        };
        load('police_users', setUsers);
        load('police_criminals', setCriminals);
        load('police_reports', setReports);
        load('police_announcements', setAnnouncements);
        load('police_military', setMilitaryPersonnel);
    }, []);

    useEffect(() => localStorage.setItem('police_users', JSON.stringify(users)), [users]);
    useEffect(() => localStorage.setItem('police_criminals', JSON.stringify(criminals)), [criminals]);
    useEffect(() => localStorage.setItem('police_reports', JSON.stringify(reports)), [reports]);
    useEffect(() => localStorage.setItem('police_announcements', JSON.stringify(announcements)), [announcements]);
    useEffect(() => localStorage.setItem('police_military', JSON.stringify(militaryPersonnel)), [militaryPersonnel]);

    const hasPermission = (action) => {
        if (!currentUser) return false;
        const permissions = {
            'قائد': ['view', 'add', 'edit', 'delete', 'manage_personnel'],
            'ضابط': ['view', 'add', 'edit'],
            'جندي': ['view']
        };
        return permissions[currentUser.role]?.includes(action);
    };

    const handleLogin = () => {
        const user = users.find(u => u.id === loginForm.id && u.password === loginForm.password);
        if (user) {
            setCurrentUser(user);
            setIsLoggedIn(true);
            setLoginError('');
        } else {
            setLoginError('الرقم العسكري أو كلمة المرور غير صحيحة');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setLoginForm({ id: '', password: '' });
        setCurrentPage('dashboard');
    };

    const addCriminal = () => {
        if (!hasPermission('add')) return alert('ليس لديك صلاحية لإضافة مجرمين');
        if (newCriminal.name && newCriminal.crime) {
            setCriminals([...criminals, {
                id: Date.now(), ...newCriminal, status: 'مطلوب',
                date: new Date().toISOString().split('T')[0]
            }]);
            setNewCriminal({ name: '', crime: '', danger: 'متوسط' });
            setHasSeenNotifications(false);
            alert('تم إضافة المجرم بنجاح!');
        }
    };

    const deleteCriminal = (id) => {
        if (!hasPermission('delete')) return alert('ليس لديك صلاحية للحذف');
        setCriminals(criminals.filter(c => c.id !== id));
    };

    const deleteReport = (id) => {
        if (!hasPermission('delete')) return alert('ليس لديك صلاحية للحذف');
        setReports(reports.filter(r => r.id !== id));
    };

    const addUser = () => {
        if (!hasPermission('manage_personnel')) return alert('ليس لديك صلاحية لإدارة المستخدمين');
        if (!newUser.id || !newUser.password || !newUser.name || !newUser.department) return alert('الرجاء تعبئة جميع الحقول');
        if (users.find(u => u.id === newUser.id)) return alert('الرقم الوظيفي موجود مسبقاً!');
        setUsers([...users, newUser]);
        setMilitaryPersonnel([...militaryPersonnel, {
            id: Date.now(), name: newUser.name, rank: newUser.rank,
            empId: newUser.id, department: newUser.department, status: 'نشط'
        }]);
        setNewUser({ id: '', password: '', name: '', role: 'جندي', rank: 'جندي', department: '' });
        alert('تم إضافة المستخدم بنجاح!');
    };

    const updateUser = () => {
        if (!hasPermission('manage_personnel')) return alert('ليس لديك صلاحية');
        if (!editingUser.id || !editingUser.password || !editingUser.name || !editingUser.department) return alert('الرجاء تعبئة جميع الحقول');
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setMilitaryPersonnel(militaryPersonnel.map(m => 
            m.empId === editingUser.id ? { ...m, name: editingUser.name, rank: editingUser.rank, department: editingUser.department } : m
        ));
        if (currentUser.id === editingUser.id) setCurrentUser(editingUser);
        setEditingUser(null);
        alert('تم تحديث المستخدم بنجاح!');
    };

    const deleteUser = (userId) => {
        if (!hasPermission('manage_personnel')) return alert('ليس لديك صلاحية');
        if (userId === currentUser.id) return alert('لا يمكنك حذف حسابك الخاص!');
        setUsers(users.filter(u => u.id !== userId));
        setMilitaryPersonnel(militaryPersonnel.filter(m => m.empId !== userId));
        alert('تم حذف المستخدم');
    };

    const addReport = () => {
        const type = prompt('نوع البلاغ:');
        const location = prompt('الموقع:');
        const time = prompt('الوقت:');
        const date = prompt('التاريخ:');
        if (type && location && time && date) {
            setReports([...reports, { id: Date.now(), type, location, time, date, status: 'جديد' }]);
            setHasSeenNotifications(false);
            alert('تم إضافة البلاغ!');
        }
    };

    const addAnnouncement = () => {
        if (!hasPermission('add')) return alert('ليس لديك صلاحية');
        if (!newAnnouncement.title || !newAnnouncement.content) return alert('الرجاء تعبئة جميع الحقول');
        setAnnouncements([...announcements, {
            id: Date.now(), ...newAnnouncement, author: currentUser.name,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        }]);
        setNewAnnouncement({ title: '', content: '' });
        alert('تم نشر البيان!');
    };

    const deleteAnnouncement = (id) => {
        if (!hasPermission('delete')) return alert('ليس لديك صلاحية');
        setAnnouncements(announcements.filter(a => a.id !== id));
        alert('تم حذف البيان');
    };

    const notificationCount = reports.filter(r => r.status === 'جديد').length + criminals.filter(c => c.status === 'مطلوب').length;
    const filteredCriminals = criminals.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.crime.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-2xl p-8 w-full max-w-md border border-blue-800/50 relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4 p-4 bg-blue-600 rounded-full">
                            <Icon name="shield" className="text-6xl" />
                        </div>
                        <div className="border-b border-blue-800/50 pb-4 mb-4">
                            <h1 className="text-3xl font-bold text-white mb-2">نظام وزارة الداخلية</h1>
                            <p className="text-blue-400/80 text-sm">Ministry of Interior System</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-blue-400 mb-2 text-right font-semibold">الرقم العسكري</label>
                            <input type="text" value={loginForm.id}
                                onChange={(e) => setLoginForm({...loginForm, id: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-800/50 rounded-lg focus:ring-2 focus:ring-blue-600 text-right text-white"
                                placeholder="أدخل الرقم العسكري" />
                        </div>
                        <div>
                            <label className="block text-blue-400 mb-2 text-right font-semibold">كلمة المرور</label>
                            <input type="password" value={loginForm.password}
                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-800/50 rounded-lg focus:ring-2 focus:ring-blue-600 text-right text-white"
                                placeholder="أدخل كلمة المرور" />
                        </div>
                        {loginError && <div className="bg-red-900/40 border border-red-600 text-red-400 px-4 py-3 rounded-lg text-right font-semibold">{loginError}</div>}
                        <button onClick={handleLogin}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition font-bold text-lg">
                            دخول النظام
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
            <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-2xl border-b-2 border-blue-800/50">
                <div className="container mx-auto flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Icon name="shield" className="text-4xl" />
                        <div>
                            <h1 className="text-2xl font-bold">نظام وزارة الداخلية</h1>
                            <p className="text-xs text-blue-400/70">Ministry of Interior System</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Icon name="bell" className="text-2xl cursor-pointer" onClick={() => setShowNotifications(!showNotifications)} />
                            {notificationCount > 0 && !hasSeenNotifications && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                    {notificationCount}
                                </span>
                            )}
                        </div>
                        <div className="text-right bg-slate-800/50 px-4 py-2 rounded border border-blue-800/30">
                            <p className="font-bold text-white">{currentUser.name}</p>
                            <p className="text-xs text-blue-400/70"><Icon name="star" /> {currentUser.rank} - {currentUser.role}</p>
                        </div>
                        <button onClick={handleLogout}
                            className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition">
                            <Icon name="logout" />
                            <span className="font-bold">خروج</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
                    {[
                        {page: 'dashboard', icon: 'home', label: 'الرئيسية'},
                        {page: 'criminals', icon: 'users', label: 'المطلوبين'},
                        {page: 'reports', icon: 'fileText', label: 'البلاغات'},
                        {page: 'announcements', icon: 'megaphone', label: 'البيانات'},
                        {page: 'military', icon: 'userCog', label: 'الضباط'},
                    ].map(({page, icon, label}) => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
                                currentPage === page ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' : 
                                'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
                            }`}>
                            <Icon name={icon} className="text-2xl" />
                            <span className="font-semibold text-sm">{label}</span>
                        </button>
                    ))}
                    {hasPermission('manage_personnel') && (
                        <button onClick={() => setCurrentPage('users')}
                            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
                                currentPage === 'users' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' : 
                                'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
                            }`}>
                            <Icon name="userPlus" className="text-2xl" />
                            <span className="font-semibold text-sm">الحسابات</span>
                        </button>
                    )}
                    {hasPermission('add') && (
                        <button onClick={() => setCurrentPage('add')}
                            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
                                currentPage === 'add' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' : 
                                'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
                            }`}>
                            <Icon name="plus" className="text-2xl" />
                            <span className="font-semibold text-sm">إضافة</span>
                        </button>
                    )}
                </div>

                {currentPage === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-lg shadow-lg">
                            <div className="text-5xl font-bold mb-2">{criminals.filter(c => c.status === 'مطلوب').length}</div>
                            <h3 className="text-xl font-semibold">مجرمين مطلوبين</h3>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
                            <div className="text-5xl font-bold mb-2">{reports.length}</div>
                            <h3 className="text-xl font-semibold">البلاغات النشطة</h3>
                        </div>
                        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-lg shadow-lg">
                            <div className="text-5xl font-bold mb-2">{militaryPersonnel.length}</div>
                            <h3 className="text-xl font-semibold">العسكريين النشطين</h3>
                        </div>
                    </div>
                )}

                {currentPage === 'criminals' && (
                    <div className="space-y-4">
                        <div className="bg-slate-800 p-4 rounded-lg border border-blue-800/30">
                            <input type="text" placeholder="بحث عن مجرم..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-700 border border-blue-800/30 rounded-lg text-white" />
                        </div>
                        {filteredCriminals.map(criminal => (
                            <div key={criminal.id} className="bg-slate-800 p-6 rounded-lg border border-blue-800/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{criminal.name}</h3>
                                        <p className="text-gray-400"><span className="font-semibold">الجريمة:</span> {criminal.crime}</p>
                                        <p className="text-gray-400"><span className="font-semibold">الخطورة:</span> {criminal.danger}</p>
                                        <p className="text-gray-500 text-sm">التاريخ: {criminal.date}</p>
                                    </div>
                                    {hasPermission('delete') && (
                                        <button onClick={() => deleteCriminal(criminal.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">حذف</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {currentPage === 'add' && hasPermission('add') && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-blue-800/30 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-white">إضافة مجرم جديد</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="الاسم الكامل" value={newCriminal.name}
                                onChange={(e) => setNewCriminal({...newCriminal, name: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white" />
                            <input type="text" placeholder="نوع الجريمة" value={newCriminal.crime}
                                onChange={(e) => setNewCriminal({...newCriminal, crime: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white" />
                            <select value={newCriminal.danger}
                                onChange={(e) => setNewCriminal({...newCriminal, danger: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white">
                                <option value="منخفض">منخفض</option>
                                <option value="متوسط">متوسط</option>
                                <option value="عالي">عالي</option>
                            </select>
                            <button onClick={addCriminal}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold">
                                <Icon name="plus" /> إضافة للنظام
                            </button>
                        </div>
                    </div>
                )}

                {currentPage === 'users' && hasPermission('manage_personnel') && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-blue-800/30">
                        <h2 className="text-2xl font-bold mb-4 text-white">إدارة المستخدمين</h2>
                        {users.map(user => (
                            <div key={user.id} className="bg-slate-700/50 p-4 rounded-lg mb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                                        <p className="text-gray-400">الرقم: {user.id} | الرتبة: {user.rank} | الدور: {user.role}</p>
                                    </div>
                                    {user.id !== currentUser.id && (
                                        <button onClick={() => deleteUser(user.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded">حذف</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
                            <h3 className="text-lg font-bold mb-4 text-white">إضافة مستخدم جديد</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input type="text" placeholder="الرقم الوظيفي" value={newUser.id}
                                    onChange={(e) => setNewUser({...newUser, id: e.target.value})}
                                    className="px-4 py-2 bg-slate-700 rounded-lg text-white" />
                                <input type="text" placeholder="كلمة المرور" value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    className="px-4 py-2 bg-slate-700 rounded-lg text-white" />
                                <input type="text" placeholder="الاسم الكامل" value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    className="px-4 py-2 bg-slate-700 rounded-lg text-white" />
                                <input type="text" placeholder="القسم" value={newUser.department}
                                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                                    className="px-4 py-2 bg-slate-700 rounded-lg text-white" />
                                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    className="px-4 py-2 bg-slate-700 rounded-lg text-white">
                                    <option value="جندي">جندي</option>
                                    <option value="ضابط">ضابط</option>
                                    <option value="قائد">قائد</option>
                                </select>
                                <select value={newUser.rank} onChange={(e) => setNewUser({...newUser, rank: e.target.value})}
                                    className="px-4 py-2 bg-slate-700 rounded-lg text-white">
                                    <option value="جندي">جندي</option>
                                    <option value="عريف">عريف</option>
                                    <option value="رقيب">رقيب</option>
                                    <option value="ملازم">ملازم</option>
                                    <option value="نقيب">نقيب</option>
                                    <option value="رائد">رائد</option>
                                    <option value="مقدم">مقدم</option>
                                    <option value="عقيد">عقيد</option>
                                    <option value="فريق أول">فريق أول</option>
                                </select>
                            </div>
                            <button onClick={addUser}
                                className="mt-4 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-bold">
                                إضافة مستخدم
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

ReactDOM.render(<PoliceSystem />, document.getElementB
