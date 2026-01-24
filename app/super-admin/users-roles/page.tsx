'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { AlertCircle, CheckCircle, Edit2, Trash2, Plus, X, Save, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string;
  branchId: string;
  branchName: string;
  roles: string[];
  status: 'active' | 'inactive';
  createdAt: any;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  pages: string[];
  createdAt: any;
}

interface Branch {
  id: string;
  name: string;
}

const AVAILABLE_PAGES = [
  'Dashboard',
  'Analytics',
  'Appointments',
  'Booking Calendar',
  'Services',
  'Products',
  'Clients',
  'Staff',
  'Feedback',
  'Categories',
  'Expenses',
  'Orders',
  'Membership',
  'Messages',
  'Settings',
  'Reports',
  'Custom Invoice',
  'Financial',
];

const AVAILABLE_PERMISSIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'export',
  'approve',
  'assign_roles',
];

const DEFAULT_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full access to all features and branches',
    permissions: AVAILABLE_PERMISSIONS,
    pages: AVAILABLE_PAGES,
    createdAt: null,
  },
  {
    id: 'branch_manager',
    name: 'Branch Manager',
    description: 'Full access to branch features',
    permissions: ['view', 'create', 'edit', 'delete', 'export', 'assign_roles'],
    pages: AVAILABLE_PAGES.filter(p => p !== 'Settings'),
    createdAt: null,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Limited access to daily operations',
    permissions: ['view', 'create', 'edit'],
    pages: ['Dashboard', 'Appointments', 'Clients', 'Orders'],
    createdAt: null,
  },
  {
    id: 'receptionist',
    name: 'Receptionist',
    description: 'Access to appointments and client management',
    permissions: ['view', 'create', 'edit'],
    pages: ['Dashboard', 'Appointments', 'Clients', 'Messages'],
    createdAt: null,
  },
];

export default function UsersRolesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: [],
    pages: [],
  });
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesRef = collection(db, 'branches');
        const snapshot = await getDocs(branchesRef);
        const branchesData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Branch',
        }));
        setBranches(branchesData);
        if (branchesData.length > 0) {
          setSelectedBranch(branchesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setMessage({ type: 'error', text: 'Failed to load branches' });
      }
    };
    fetchBranches();
  }, []);

  // Fetch users for selected branch
  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedBranch) return;
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('branchId', '==', selectedBranch));
        const snapshot = await getDocs(q);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
          roles: doc.data().roles || [],
        })) as User[];
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setMessage({ type: 'error', text: 'Failed to load users' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [selectedBranch]);

  // Fetch custom roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesRef = collection(db, 'roles');
        const snapshot = await getDocs(rolesRef);
        const customRoles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
        })) as Role[];
        setRoles([...DEFAULT_ROLES, ...customRoles]);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setSelectedRoles(user.roles);
    setShowEditModal(true);
  };

  const handleSaveUserRoles = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        roles: selectedRoles,
        updatedAt: Timestamp.now(),
      });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, roles: selectedRoles } : u));
      setMessage({ type: 'success', text: `Roles updated for ${editingUser.name}` });
      setShowEditModal(false);
      setEditingUser(null);
      setSelectedRoles([]);
    } catch (error) {
      console.error('Error updating roles:', error);
      setMessage({ type: 'error', text: 'Failed to update user roles' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
      setMessage({ type: 'success', text: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name || newRole.permissions?.length === 0 || newRole.pages?.length === 0) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }
    setSaving(true);
    try {
      const roleId = newRole.name.toLowerCase().replace(/\s+/g, '_');
      const rolesRef = doc(db, 'roles', roleId);
      await setDoc(rolesRef, {
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        pages: newRole.pages,
        createdAt: Timestamp.now(),
      });
      const newRoleData: Role = {
        id: roleId,
        name: newRole.name || '',
        description: newRole.description || '',
        permissions: newRole.permissions || [],
        pages: newRole.pages || [],
        createdAt: Timestamp.now(),
      };
      setRoles([...roles, newRoleData]);
      setMessage({ type: 'success', text: 'Role created successfully' });
      setShowRoleModal(false);
      setNewRole({ name: '', description: '', permissions: [], pages: [] });
    } catch (error) {
      console.error('Error creating role:', error);
      setMessage({ type: 'error', text: 'Failed to create role' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (DEFAULT_ROLES.some(r => r.id === roleId)) {
      setMessage({ type: 'error', text: 'Cannot delete default roles' });
      return;
    }
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await deleteDoc(doc(db, 'roles', roleId));
      setRoles(roles.filter(r => r.id !== roleId));
      setMessage({ type: 'success', text: 'Role deleted successfully' });
    } catch (error) {
      console.error('Error deleting role:', error);
      setMessage({ type: 'error', text: 'Failed to delete role' });
    }
  };

  const getRoleColor = (roleId: string) => {
    const colorMap: Record<string, string> = {
      super_admin: 'bg-red-500',
      branch_manager: 'bg-blue-500',
      staff: 'bg-green-500',
      receptionist: 'bg-purple-500',
    };
    return colorMap[roleId] || 'bg-gray-500';
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Role Management</h1>
            <p className="text-gray-500 mt-1">Manage user roles and permissions across all branches</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.email && <span className="text-sm text-gray-600">{user.email}</span>}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert className={cn('m-4', message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')}>
          <AlertCircle className={cn('h-4 w-4', message.type === 'success' ? 'text-green-600' : 'text-red-600')} />
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Role Assignments</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Branch Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Branch</CardTitle>
                <CardDescription>Choose a branch to view and manage its user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch-select">Branch</Label>
                    <select
                      id="branch-select"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                    >
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm text-gray-600">
                      <strong>{users.length}</strong> users in this branch
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage roles for each user in the selected branch</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No users found in this branch
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Name</th>
                          <th className="px-4 py-3 text-left font-semibold">Email</th>
                          <th className="px-4 py-3 text-left font-semibold">Roles</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-center font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{user.name}</td>
                            <td className="px-4 py-3 text-gray-600">{user.email}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {user.roles.length === 0 ? (
                                  <span className="text-gray-400 text-xs">No roles assigned</span>
                                ) : (
                                  user.roles.map(roleId => {
                                    const role = roles.find(r => r.id === roleId);
                                    return (
                                      <Badge key={roleId} className={cn('text-white', getRoleColor(roleId))}>
                                        {role?.name || roleId}
                                      </Badge>
                                    );
                                  })
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Role Definitions</h2>
                <p className="text-gray-600 mt-1">Create and manage custom roles with specific permissions and page access</p>
              </div>
              <Button onClick={() => setShowRoleModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map(role => (
                <Card key={role.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className={cn('w-3 h-3 rounded-full', getRoleColor(role.id))}></div>
                          {role.name}
                        </CardTitle>
                        <CardDescription className="mt-1">{role.description}</CardDescription>
                      </div>
                      {!DEFAULT_ROLES.some(r => r.id === role.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Permissions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {role.permissions.map(perm => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Page Access ({role.pages.length})</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {role.pages.slice(0, 5).map(page => (
                          <Badge key={page} variant="outline" className="text-xs">
                            {page}
                          </Badge>
                        ))}
                        {role.pages.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.pages.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Roles Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Assign Roles to {editingUser.name}</CardTitle>
              <CardDescription>{editingUser.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-4 block">Select Roles</Label>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {roles.map(role => (
                    <label key={role.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, role.id]);
                          } else {
                            setSelectedRoles(selectedRoles.filter(r => r !== role.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-gray-600">{role.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUserRoles} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Roles
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Create Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
              <CardDescription>Define a custom role with specific permissions and page access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  value={newRole.name || ''}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Manager, Supervisor"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="role-desc">Description</Label>
                <Input
                  id="role-desc"
                  value={newRole.description || ''}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Role description"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-base font-semibold mb-3 block">Permissions *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(newRole.permissions || []).includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRole({
                              ...newRole,
                              permissions: [...(newRole.permissions || []), perm],
                            });
                          } else {
                            setNewRole({
                              ...newRole,
                              permissions: (newRole.permissions || []).filter(p => p !== perm),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-base font-semibold mb-3 block">Page Access *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PAGES.map(page => (
                    <label key={page} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(newRole.pages || []).includes(page)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRole({
                              ...newRole,
                              pages: [...(newRole.pages || []), page],
                            });
                          } else {
                            setNewRole({
                              ...newRole,
                              pages: (newRole.pages || []).filter(p => p !== page),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{page}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Role
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
