
import React, { useState, useEffect } from 'react';
import { Shield, Search, Plus, FileText, Users, AlertTriangle, Home, LogOut, UserCog, Star, UserPlus, Bell, Megaphone } from 'lucide-react';

const PoliceSystem = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const [users, setUsers] = useState([]);
  const [criminals, setCriminals] = useState([]);
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [militaryPersonnel, setMilitaryPersonnel] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [newCriminal, setNewCriminal] = useState({ name: '', crime: '', danger: 'متوسط' });
  const [newPersonnel, setNewPersonnel] = useState({ name: '', rank: 'جندي', empId: '', department: '' });
  const [newUser, setNewUser] = useState({ id: '', password: '', name: '', role: 'جندي', rank: 'جندي', department: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [newReport, setNewReport] = useState({ type: '', location: '', time: '', date: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false);

  // Load data from storage on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load users
      const usersResult = await window.storage.get('police_users');
      if (usersResult && usersResult.value) {
        setUsers(JSON.parse(usersResult.value));
      } else {
        // Initialize with default admin user
        const defaultUsers = [{
          id: '1001',
          password: 'commander',
          name: 'عبدالله محمد',
          role: 'قائد',
          rank: 'فريق أول',
          department: 'القيادة العامة'
        }];
        setUsers(defaultUsers);
        await window.storage.set('police_users', JSON.stringify(defaultUsers));
      }

      // Load criminals
      const criminalsResult = await window.storage.get('police_criminals');
      if (criminalsResult && criminalsResult.value) {
        setCriminals(JSON.parse(criminalsResult.value));
      }

      // Load reports
      const reportsResult = await window.storage.get('police_reports');
      if (reportsResult && reportsResult.value) {
        setReports(JSON.parse(reportsResult.value));
      }

      // Load announcements
      const announcementsResult = await window.storage.get('police_announcements');
      if (announcementsResult && announcementsResult.value) {
        setAnnouncements(JSON.parse(announcementsResult.value));
      }

      // Load military personnel
      const militaryResult = await window.storage.get('police_military');
      if (militaryResult && militaryResult.value) {
        setMilitaryPersonnel(JSON.parse(militaryResult.value));
      } else {
        // Initialize with default commander
        const defaultMilitary = [{
          id: 1,
          name: 'عبدالله محمد',
          rank: 'فريق أول',
          empId: '1001',
          department: 'القيادة العامة',
          status: 'نشط'
        }];
        setMilitaryPersonnel(defaultMilitary);
        await window.storage.set('police_military', JSON.stringify(defaultMilitary));
      }
    } catch (error) {
      console.log('تحذير: تعذر تحميل البيانات، سيتم استخدام البيانات الافتراضية');
    }
  };

  // Save users to storage
  useEffect(() => {
    if (users.length > 0) {
      window.storage.set('police_users', JSON.stringify(users)).catch(e => console.log('خطأ في الحفظ'));
    }
  }, [users]);

  // Save criminals to storage
  useEffect(() => {
    window.storage.set('police_criminals', JSON.stringify(criminals)).catch(e => console.log('خطأ في الحفظ'));
  }, [criminals]);

  // Save reports to storage
  useEffect(() => {
    window.storage.set('police_reports', JSON.stringify(reports)).catch(e => console.log('خطأ في الحفظ'));
  }, [reports]);

  // Save announcements to storage
  useEffect(() => {
    window.storage.set('police_announcements', JSON.stringify(announcements)).catch(e => console.log('خطأ في الحفظ'));
  }, [announcements]);

  // Save military to storage
  useEffect(() => {
    if (militaryPersonnel.length > 0) {
      window.storage.set('police_military', JSON.stringify(militaryPersonnel)).catch(e => console.log('خطأ في الحفظ'));
    }
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-2xl p-8 w-full max-w-md border border-blue-800/50 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
          
          <div className="text-center mb-8">
            <div className="inline-block mb-4 relative">
              <img 
                src="https://cdn.discordapp.com/attachments/1382852151063347210/1463017745686728819/LSPD.webp?ex=69704cf4&is=696efb74&hm=93c8eec0a83fb1930228cfbd8a1634fbf76fa72d02d2864feac4bfac92b9f6f7" 
                alt="Ministry Logo" 
                className="w-32 h-32 mx-auto object-contain relative z-10"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div className="p-4 bg-blue-600 rounded-full hidden">
                <Shield className="w-12 h-12 text-white mx-auto" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
      
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-2xl border-b-2 border-blue-800/50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.discordapp.com/attachments/1382852151063347210/1463017745686728819/LSPD.webp?ex=69704cf4&is=696efb74&hm=93c8eec0a83fb1930228cfbd8a1634fbf76fa72d02d2864feac4bfac92b9f6f7" 
              alt="Ministry Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <Shield className="w-8 h-8 hidden" />
            <div>
              <h1 className="text-2xl font-bold text-white">نظام وزارة الداخلية</h1>
              <p className="text-xs text-blue-400/70">Ministry of Interior System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell 
                className="w-6 h-6 cursor-pointer hover:text-blue-400 transition" 
                onClick={toggleNotifications}
              />
              {notificationCount > 0 && !hasSeenNotifications && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
              
              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 bg-slate-800 border border-blue-800/50 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-blue-800/50 bg-slate-900">
                    <h3 className="font-bold text-lg text-blue-400">الإشعارات</h3>
                  </div>
                  <div className="p-4">
                    {notificationCount === 0 ? (
                      <p className="text-gray-400 text-center py-4">لا توجد إشعارات</p>
                    ) : (
                      <div className="space-y-3">
                        {reports.filter(r => r.status === 'جديد').map(report => (
                          <div key={`report-${report.id}`} className="p-3 bg-red-900/20 border-r-4 border-red-500 rounded hover:bg-red-900/30 transition cursor-pointer" onClick={() => {setCurrentPage('reports'); setShowNotifications(false);}}>
                            <p className="font-semibold text-red-400">🚨 بلاغ جديد</p>
                            <p className="text-sm text-gray-300">{report.type} - {report.location}</p>
                            <p className="text-xs text-gray-500">{report.date} {report.time}</p>
                          </div>
                        ))}
                        {criminals.filter(c => c.status === 'مطلوب').map(criminal => (
                          <div key={`criminal-${criminal.id}`} className="p-3 bg-blue-900/20 border-r-4 border-blue-500 rounded hover:bg-blue-900/30 transition cursor-pointer" onClick={() => {setCurrentPage('criminals'); setShowNotifications(false);}}>
                            <p className="font-semibold text-blue-400">⚠️ مطلوب</p>
                            <p className="text-sm text-gray-300">{criminal.name} - {criminal.crime}</p>
                            <p className="text-xs text-gray-500">خطورة: {criminal.danger}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-10 w-px bg-blue-800/30"></div>
            
            <div className="text-right bg-slate-800/50 px-4 py-2 rounded border border-blue-800/30">
              <p className="font-bold text-white">{currentUser.name}</p>
              <p className="text-xs text-blue-400/70 flex items-center gap-1 justify-end">
                <Star className="w-3 h-3" />
                {currentUser.rank} - {currentUser.role}
              </p>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
              currentPage === 'dashboard' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' 
                : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="font-semibold text-sm">الرئيسية</span>
          </button>

          <button
            onClick={() => setCurrentPage('criminals')}
            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
              currentPage === 'criminals' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' 
                : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="font-semibold text-sm">المطلوبين</span>
          </button>

          <button
            onClick={() => setCurrentPage('reports')}
            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border relative ${
              currentPage === 'reports' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' 
                : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
            }`}
          >
            <FileText className="w-6 h-6" />
            <span className="font-semibold text-sm">البلاغات</span>
            {reports.filter(r => r.status === 'جديد').length > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {reports.filter(r => r.status === 'جديد').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentPage('announcements')}
            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
              currentPage === 'announcements' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' 
                : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
            }`}
          >
            <Megaphone className="w-6 h-6" />
            <span className="font-semibold text-sm">البيانات</span>
          </button>

          <button
            onClick={() => setCurrentPage('military')}
            className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
              currentPage === 'military' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' 
                : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
            }`}
          >
            <UserCog className="w-6 h-6" />
            <span className="font-semibold text-sm">الضباط</span>
          </button>

          {hasPermission('manage_personnel') && (
            <button
              onClick={() => setCurrentPage('users')}
              className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
                currentPage === 'users' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' 
                  : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
              }`}
            >
              <UserPlus className="w-6 h-6" />
              <span className="font-semibold text-sm">الحسابات</span>
            </button>
          )}

          {hasPermission('add') && (
            <button
              onClick={() => setCurrentPage('add')}
              className={`p-4 rounded-lg shadow-lg flex flex-col items-center gap-2 transition border ${
                currentPage === 'add' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500' 
                  : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border-blue-800/30'
              }`}
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold text-sm">إضافة</span>
            </button>
          )}
        </div>

        {currentPage === 'dashboard' && (
          <div className="space-y-6">
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

            {reports.length > 0 && (
              <div className="bg-slate-800 p-6 rounded-lg border border-blue-800/30">
                <h3 className="text-xl font-bold mb-4 text-white">آخر البلاغات</h3>
                <div className="space-y-3">
                  {reports.slice(0, 3).map(report => (
                    <div key={report.id} className="border-r-4 border-red-500 bg-slate-700/50 p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white">{report.type}</h4>
                          <p className="text-sm text-gray-400">{report.location}</p>
                        </div>
                        <span className="text-sm bg-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full font-semibold">
                          {report.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'criminals' && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-blue-800/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="بحث عن مجرم أو جريمة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-blue-800/30 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  بحث
                </button>
              </div>
            </div>

            {filteredCriminals.length === 0 ? (
              <div className="bg-slate-800 p-12 rounded-lg text-center border border-blue-800/30">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">لا توجد سجلات</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCriminals.map(criminal => (
                  <div key={criminal.id} className="bg-slate-800 p-6 rounded-lg border border-blue-800/30 hover:border-blue-600/50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white">{criminal.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            criminal.status === 'مطلوب' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'
                          }`}>
                            {criminal.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            criminal.danger === 'عالي' ? 'bg-red-900/50 text-red-400' :
                            criminal.danger === 'متوسط' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-blue-900/50 text-blue-400'
                          }`}>
                            {criminal.danger}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-1"><span className="font-semibold">الجريمة:</span> {criminal.crime}</p>
                        <p className="text-gray-500 text-sm">التاريخ: {criminal.date}</p>
                      </div>
                      {hasPermission('delete') && (
                        <button 
                          onClick={() => deleteCriminal(criminal.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'reports' && (
          <div className="grid gap-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-blue-800/30 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">البلاغات</h2>
              <button
                onClick={addReport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة بلاغ
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="bg-slate-800 p-12 rounded-lg text-center border border-blue-800/30">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">لا توجد بلاغات حالياً</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report.id} className="bg-slate-800 p-6 rounded-lg border border-blue-800/30 hover:border-blue-600/50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{report.type}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        report.status === 'جديد' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {report.status}
                      </span>
                      {hasPermission('delete') && (
                        <button 
                          onClick={() => deleteReport(report.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-gray-400">
                    <p><span className="font-semibold">الموقع:</span> {report.location}</p>
                    <p><span className="font-semibold">الوقت:</span> {report.time} - {report.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {currentPage === 'announcements' && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-6 rounded-lg border border-blue-800/30">
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <Megaphone className="w-7 h-7" />
                البيانات الرسمية
              </h2>
              
              <div className="grid gap-4 mb-6">
                {announcements.map(ann => (
                  <div key={ann.id} className="border-r-4 border-green-600 bg-slate-700/50 p-5 rounded-lg hover:bg-slate-700 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{ann.title}</h3>
                        <p className="text-gray-300 mb-3 leading-relaxed">{ann.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            {ann.author}
                          </span>
                          <span>{ann.date} - {ann.time}</span>
                        </div>
                      </div>
                      {hasPermission('delete') && (
                        <button 
                          onClick={() => deleteAnnouncement(ann.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {hasPermission('add') && (
                <div className="p-6 bg-green-900/20 rounded-lg border-2 border-green-800/50">
                  <h3 className="text-lg font-bold mb-4 text-white">نشر بيان رسمي جديد</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="عنوان البيان"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                    />
                    <textarea
                      placeholder="محتوى البيان الرسمي..."
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 resize-none text-white"
                    />
                    <button
                      onClick={addAnnouncement}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Megaphone className="w-5 h-5" />
                      نشر البيان
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'military' && (
          <div className="bg-slate-800 p-6 rounded-lg border border-blue-800/30">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
              <UserCog className="w-7 h-7" />
              قائمة الضباط والرتب
            </h2>
            
            <div className="grid gap-4">
              {militaryPersonnel.map(person => (
                <div key={person.id} className="border-r-4 border-blue-600 bg-slate-700/50 p-5 rounded-lg hover:bg-slate-700 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{person.name}</h3>
                        <span className="px-4 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 text-white flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {person.rank}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          person.status === 'نشط' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {person.status}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-1"><span className="font-semibold">الرقم الوظيفي:</span> {person.empId}</p>
                      <p className="text-gray-400"><span className="font-semibold">القسم:</span> {person.department}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'users' && hasPermission('manage_personnel') && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-6 rounded-lg border border-blue-800/30">
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <UserPlus className="w-7 h-7" />
                إدارة المستخدمين والحسابات
              </h2>
              
              <div className="grid gap-4 mb-6">
                {users.map(user => (
                  <div key={user.id} className="border-r-4 border-purple-600 bg-slate-700/50 p-5 rounded-lg hover:bg-slate-700 transition">
                    {editingUser?.id === user.id ? (
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-white mb-3">تعديل المستخدم</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editingUser.id}
                            onChange={(e) => setEditingUser({...editingUser, id: e.target.value})}
                            className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                            placeholder="الرقم الوظيفي"
                          />
                          <input
                            type="text"
                            value={editingUser.password}
                            onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                            className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                            placeholder="كلمة المرور"
                          />
                          <input
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                            className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                            placeholder="الاسم"
                          />
                          <input
                            type="text"
                            value={editingUser.department}
                            onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                            className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                            placeholder="القسم"
                          />
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                            className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                          >
                            <option value="جندي">جندي (مشاهدة فقط)</option>
                            <option value="ضابط">ضابط (إضافة وتعديل)</option>
                            <option value="قائد">قائد (كل الصلاحيات)</option>
                          </select>
                          <select
                            value={editingUser.rank}
                            onChange={(e) => setEditingUser({...editingUser, rank: e.target.value})}
                            className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                          >
                            <option value="جندي">جندي</option>
                            <option value="جندي أول">جندي أول</option>
                            <option value="عريف">عريف</option>
                            <option value="رقيب">رقيب</option>
                            <option value="رقيب أول">رقيب أول</option>
                            <option value="ملازم">ملازم</option>
                            <option value="ملازم أول">ملازم أول</option>
                            <option value="نقيب">نقيب</option>
                            <option value="رائد">رائد</option>
                            <option value="مقدم">مقدم</option>
                            <option value="عقيد">عقيد</option>
                            <option value="عميد">عميد</option>
                            <option value="لواء">لواء</option>
                            <option value="فريق">فريق</option>
                            <option value="فريق أول">فريق أول</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={updateUser}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            حفظ التعديلات
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-white">{user.name}</h3>
                            <span className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                              user.role === 'قائد' ? 'bg-red-900/50 text-red-400' :
                              user.role === 'ضابط' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-green-900/50 text-green-400'
                            }`}>
                              <Shield className="w-4 h-4" />
                              {user.role}
                            </span>
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-900/50 text-blue-400">
                              <Star className="w-4 h-4 inline" /> {user.rank}
                            </span>
                          </div>
                          <p className="text-gray-400 mb-1"><span className="font-semibold">الرقم الوظيفي:</span> {user.id}</p>
                          <p className="text-gray-400 mb-1"><span className="font-semibold">كلمة المرور:</span> {user.password}</p>
                          <p className="text-gray-400"><span className="font-semibold">القسم:</span> {user.department}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingUser({...user})}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            تعديل
                          </button>
                          {user.id !== currentUser.id && (
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 bg-purple-900/20 rounded-lg border-2 border-purple-800/50">
                <h3 className="text-lg font-bold mb-4 text-white">إضافة مستخدم جديد</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="الرقم الوظيفي"
                    value={newUser.id}
                    onChange={(e) => setNewUser({...newUser, id: e.target.value})}
                    className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                  />
                  <input
                    type="text"
                    placeholder="كلمة المرور"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                  />
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                  />
                  <input
                    type="text"
                    placeholder="القسم (مثال: شؤون، عمليات، أمن)"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="جندي">جندي (مشاهدة فقط)</option>
                    <option value="ضابط">ضابط (إضافة وتعديل)</option>
                    <option value="قائد">قائد (كل الصلاحيات)</option>
                  </select>
                  <select
                    value={newUser.rank}
                    onChange={(e) => setNewUser({...newUser, rank: e.target.value})}
                    className="px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="جندي">جندي</option>
                    <option value="جندي أول">جندي أول</option>
                    <option value="عريف">عريف</option>
                    <option value="رقيب">رقيب</option>
                    <option value="رقيب أول">رقيب أول</option>
                    <option value="ملازم">ملازم</option>
                    <option value="ملازم أول">ملازم أول</option>
                    <option value="نقيب">نقيب</option>
                    <option value="رائد">رائد</option>
                    <option value="مقدم">مقدم</option>
                    <option value="عقيد">عقيد</option>
                    <option value="عميد">عميد</option>
                    <option value="لواء">لواء</option>
                    <option value="فريق">فريق</option>
                    <option value="فريق أول">فريق أول</option>
                  </select>
                </div>
                <button
                  onClick={addUser}
                  className="mt-4 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  إضافة مستخدم جديد
                </button>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'add' && hasPermission('add') && (
          <div className="bg-slate-800 p-6 rounded-lg border border-blue-800/30 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">إضافة مجرم جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-400 mb-2 font-semibold">الاسم الكامل</label>
                <input
                  type="text"
                  value={newCriminal.name}
                  onChange={(e) => setNewCriminal({...newCriminal, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="أدخل اسم المجرم"
                />
              </div>

              <div>
                <label className="block text-blue-400 mb-2 font-semibold">نوع الجريمة</label>
                <input
                  type="text"
                  value={newCriminal.crime}
                  onChange={(e) => setNewCriminal({...newCriminal, crime: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="مثال: سرقة، احتيال، تزوير"
                />
              </div>

              <div>
                <label className="block text-blue-400 mb-2 font-semibold">مستوى الخطورة</label>
                <select
                  value={newCriminal.danger}
                  onChange={(e) => setNewCriminal({...newCriminal, danger: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="منخفض">منخفض</option>
                  <option value="متوسط">متوسط</option>
                  <option value="عالي">عالي</option>
                </select>
              </div>

              <button
                onClick={addCriminal}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold text-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6" />
                إضافة للنظام
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceSystem;
