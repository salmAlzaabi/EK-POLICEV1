const { useState, useEffect } = React;

const Icon = ({ name, className = "" }) => {
    const icons = {
        shield: "🛡️", search: "🔍", plus: "➕", fileText: "📄", users: "👥",
        home: "🏠", logout: "🚪", userCog: "⚙️", star: "⭐", userPlus: "👤➕",
        bell: "🔔", megaphone: "📢"
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
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

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
        if (!hasPermission('add')) return alert('ليس لديك صلاحية');
        if (newCriminal.name && newCriminal.crime) {
            setCriminals([...criminals, {
                id: Date.now(), ...newCriminal, status: 'مطلوب',
                date: new Date().toISOString().split('T')[0]
            }]);
            setNewCriminal({ name: '', crime: '', danger: 'متوسط' });
            alert('تم إضافة المجرم بنجاح!');
        }
    };

    const deleteCriminal = (id) => {
        if (!hasPermission('delete')) return alert('ليس لديك صلاحية');
        setCriminals(criminals.filter(c => c.id !== id));
    };

    const addUser = () => {
        if (!hasPermission('manage_personnel')) return alert('ليس لديك صلاحية');
        if (!newUser.id || !newUser.password || !newUser.name || !newUser.department) return alert('الرجاء تعبئة جميع الحقول');
        if (users.find(u => u.id === newUser.id)) return alert('الرقم موجود مسبقاً!');
        setUsers([...users, newUser]);
        setMilitaryPersonnel([...militaryPersonnel, {
            id: Date.now(), name: newUser.name, rank: newUser.rank,
            empId: newUser.id, department: newUser.department, status: 'نشط'
        }]);
        setNewUser({ id: '', password: '', name: '', role: 'جندي', rank: 'جندي', department: '' });
        alert('تم إضافة المستخدم!');
    };

    const deleteUser = (userId) => {
        if (!hasPermission('manage_personnel')) return alert('ليس لديك صلاحية');
        if (userId === currentUser.id) return alert('لا يمكنك حذف حسابك!');
        setUsers(users.filter(u => u.id !== userId));
        setMilitaryPersonnel(militaryPersonnel.filter(m => m.empId !== userId));
        alert('تم الحذف');
    };

    const addReport = () => {
        const type = prompt('نوع البلاغ:');
        const location = prompt('الموقع:');
        const time = prompt('الوقت:');
        const date = prompt('التاريخ:');
        if (type && location && time && date) {
            setReports([...reports, { id: Date.now(), type, location, time, date, status: 'جديد' }]);
            alert('تم إضافة البلاغ!');
        }
    };

    const addAnnouncement = () => {
        if (!hasPermission('add')) return alert('ليس لديك صلاحية');
        if (!newAnnouncement.title || !newAnnouncement.content) return alert('الرجاء تعبئة الحقول');
        setAnnouncements([...announcements, {
            id: Date.now(), ...newAnnouncement, author: currentUser.name,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        }]);
        setNewAnnouncement({ title: '', content: '' });
        alert('تم النشر!');
    };

    const filteredCriminals = criminals.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.crime.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-2xl p-8 w-full max-w-md border border-blue-800/50">
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4 p-4 bg-blue-600 rounded-full">
                            <Icon name="shield" className="text-6xl" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">نظام وزارة الداخلية</h1>
                        <p className="text-blue-400/80 text-sm">Ministry of Interior System</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-blue-400 mb-2 text-right font-semibold">الرقم العسكري</label>
                            <input type="text" value={loginForm.id}
                                onChange={(e) => setLoginForm({...loginForm, id: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-800/50 rounded-lg text-right text-white"
                                placeholder="أدخل الرقم العسكري" />
                        </div>
                        <div>
                            <label className="block text-blue-400 mb-2 text-right font-semibold">كلمة المرور</label>
                            <input type="password" value={loginForm.password}
                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-800/50 rounded-lg text-right text-white"
                                placeholder="أدخل كلمة المرور" />
                        </div>
                        {loginError && <div className="bg-red-900/40 border border-red-600 text-red-400 px-4 py-3 rounded-lg text-right">{loginError}</div>}
                        <button onClick={handleLogin}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 font-bold text-lg">
                            دخول النظام
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <header className="bg-slate-900 text-white p-4 shadow-2xl border-b-2 border-blue-800/50">
                <div className="container mx-auto flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Icon name="shield" className="text-4xl" />
                        <div>
                            <h1 className="text-2xl font-bold">نظام وزارة الداخلية</h1>
                            <p className="text-xs text-blue-400">Ministry of Interior System</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right bg-slate-800 px-4 py-2 rounded border border-blue-800">
                            <p className="font-bold">{currentUser.name}</p>
                            <p className="text-xs text-blue-400">{currentUser.rank} - {currentUser.role}</p>
                        </div>
                        <button onClick={handleLogout}
                            className="bg-red-700 px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2">
                            <Icon name="logout" />
                            خروج
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    {[
                        {page: 'dashboard', icon: 'home', label: 'الرئيسية'},
                        {page: 'criminals', icon: 'users', label: 'المطلوبين'},
                        {page: 'reports', icon: 'fileText', label: 'البلاغات'},
                        {page: 'announcements', icon: 'megaphone', label: 'البيانات'},
                        {page: 'military', icon: 'userCog', label: 'الضباط'},
                    ].map(({page, icon, label}) => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 ${
                                currentPage === page ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 hover:bg-slate-700'
                            }`}>
                            <Icon name={icon} className="text-2xl" />
                            <span className="text-sm font-semibold">{label}</span>
                        </button>
                    ))}
                    {hasPermission('manage_personnel') && (
                        <button onClick={() => setCurrentPage('users')}
                            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 ${
                                currentPage === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 hover:bg-slate-700'
                            }`}>
                            <Icon name="userPlus" className="text-2xl" />
                            <span className="text-sm font-semibold">الحسابات</span>
                        </button>
                    )}
                </div>

                {currentPage === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-lg">
                            <div className="text-5xl font-bold">{criminals.length}</div>
                            <h3 className="text-xl">مجرمين مطلوبين</h3>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-lg">
                            <div className="text-5xl font-bold">{reports.length}</div>
                            <h3 className="text-xl">البلاغات</h3>
                        </div>
                        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-lg">
                            <div className="text-5xl font-bold">{militaryPersonnel.length}</div>
                            <h3 className="text-xl">العسكريين</h3>
                        </div>
                    </div>
                )}

                {currentPage === 'criminals' && (
                    <div className="space-y-4">
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <input type="text" placeholder="بحث..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white" />
                        </div>
                        {hasPermission('add') && (
                            <div className="bg-slate-800 p-6 rounded-lg">
                                <h3 className="text-xl font-bold text-white mb-4">إضافة مجرم</h3>
                                <div className="space-y-3">
                                    <input type="text" placeholder="الاسم" value={newCriminal.name}
                                        onChange={(e) => setNewCriminal({...newCriminal, name: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white" />
                                    <input type="text" placeholder="الجريمة" value={newCriminal.crime}
                                        onChange={(e) => setNewCriminal({...newCriminal, crime: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white" />
                                    <select value={newCriminal.danger}
                                        onChange={(e) => setNewCriminal({...newCriminal, danger: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white">
                                        <option value="منخفض">منخفض</option>
                                        <option value="متوسط">متوسط</option>
                                        <option value="عالي">عالي</option>
                                    </select>
                                    <button onClick={addCriminal}
                                        className="w-full bg-blue-600 py-2 rounded-lg text-white hover:bg-blue-700">
                                        إضافة
                                    </button>
                                </div>
                            </div>
                        )}
                        {filteredCriminals.map(criminal => (
                            <div key={criminal.id} className="bg-slate-800 p-6 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{criminal.name}</h3>
                                        <p className="text-gray-400">الجريمة: {criminal.crime}</p>
                                        <p className="text-gray-400">الخطورة: {criminal.danger}</p>
                                    </div>
                                    {hasPermission('delete') && (
                                        <button onClick={() => deleteCriminal(criminal.id)}
                                            className="bg-red-600 px-4 py-2 rounded text-white">حذف</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {currentPage === 'users' && hasPermission('manage_personnel') && (
                    <div className="bg-slate-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">المستخدمين</h2>
                        {users.map(user => (
                            <div key={user.id} className="bg-slate-700 p-4 rounded mb-3">
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="text-white font-bold">{user.name}</h3>
                                        <p className="text-gray-400 text-sm">{user.id} | {user.rank} | {user.role}</p>
                                    </div>
                                    {user.id !== currentUser.id && (
                                        <button onClick={() => deleteUser(user.id)}
                                            className="bg-red-600 px-3 py-1 rounded text-white text-sm">حذف</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="mt-6 p-4 bg-purple-900/20 rounded border border-purple-800">
                            <h3 className="text-white font-bold mb-3">إضافة مستخدم</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                <input type="text" placeholder="الرقم" value={newUser.id}
                                    onChange={(e) => setNewUser({...newUser, id: e.target.value})}
                                    className="px-3 py-2 bg-slate-700 rounded text-white" />
                                <input type="text" placeholder="كلمة المرور" value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    className="px-3 py-2 bg-slate-700 rounded text-white" />
                                <input type="text" placeholder="الاسم" value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    className="px-3 py-2 bg-slate-700 rounded text-white" />
                                <input type="text" placeholder="القسم" value={newUser.department}
                                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                                    className="px-3 py-2 bg-slate-700 rounded text-white" />
                                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    className="px-3 py-2 bg-slate-700 rounded text-white">
                                    <option value="جندي">جندي</option>
                                    <option value="ضابط">ضابط</option>
                                    <option value="قائد">قائد</option>
                                </select>
                                <select value={newUser.rank} onChange={(e) => setNewUser({...newUser, rank: e.target.value})}
                                    className="px-3 py-2 bg-slate-700 rounded text-white">
                                    <option value="جندي">جندي</option>
                                    <option value="رقيب">رقيب</option>
                                    <option value="ملازم">ملازم</option>
                                    <option value="نقيب">نقيب</option>
                                    <option value="عقيد">عقيد</option>
                                    <option value="فريق أول">فريق أول</option>
                                </select>
                            </div>
                            <button onClick={addUser}
                                className="mt-3 w-full bg-purple-600 py-2 rounded text-white">إضافة</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

ReactDOM.render(<PoliceSystem />, document.getElementById('root'));
