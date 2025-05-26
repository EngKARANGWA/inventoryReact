import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { useToast } from '../../components/ui/toast';
import { changePassword, getCurrentUser } from '../../services/authService';
import { Sidebar } from '../../components/ui/sidebar';
import { Header } from '../../components/ui/header';
import { User, Mail, Phone, MapPin, Shield, Edit2, Save, X, User2Icon } from 'lucide-react';

interface Profile {
  id: number;
  names: string;
  phoneNumber: string;
  address: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProfilePage: React.FC = () => {
  const profileId = 1; // Replace with actual user profile ID in production
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ names: '', phoneNumber: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const toast = useToast();
  const user = getCurrentUser();
  const email = user?.email || '';

  useEffect(() => {
    const fetchProfile = async () => {
      toast.info('Loading profile...');
      try {
        const data = await userService.getProfileById(profileId);
        setProfile(data);
        setForm({
          names: data.names || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
        });
        toast.success('Profile loaded');
      } catch {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [profileId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    if (profile) {
      setForm({
        names: profile.names || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
      });
    }
    setEditMode(false);
  };

  const handleSave = async () => {
    setSaving(true);
    toast.info('Saving profile...');
    try {
      const updated = await userService.updateProfile(profileId, form);
      setProfile(updated);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    toast.info('Changing password...');
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <User2Icon className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Profile Settings
              </h1>
              <p className="text-gray-600">Manage your account information and security settings</p>
            </div>

            {/* Profile Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                      <p className="text-sm text-gray-500">Update your personal details</p>
                    </div>
                  </div>
                  {!editMode && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <p className="text-gray-900">{email}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="names"
                        value={form.names}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.names}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <Shield className="w-4 h-4 mr-2" />
                      Account Status
                    </label>
                    <p className="text-gray-900">{profile.status}</p>
                  </div>
                </div>

                {editMode && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3 ml-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
                    <p className="text-sm text-gray-500">Update your password</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-500">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-500">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {passwordLoading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;