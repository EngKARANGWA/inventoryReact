import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { X } from 'lucide-react';
import { useToast } from '../../components/ui/toast';
import { changePassword } from '../../services/authService';
import { getCurrentUser } from '../../services/authService';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-8 py-6">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={() => window.history.back()}>
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Section Title */}
        <div className="px-8 pt-6 pb-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900 min-h-[40px] flex items-center">{email}</p>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="names"
                  value={form.names}
                  onChange={handleChange}
                  className="block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 min-h-[40px] flex items-center">{profile.names}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
              {editMode ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 min-h-[40px] flex items-center">{profile.phoneNumber || 'Not provided'}</p>
              )}
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
              {editMode ? (
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 min-h-[40px] flex items-center">{profile.address || 'Not provided'}</p>
              )}
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <p className="text-gray-900 min-h-[40px] flex items-center">{profile.status}</p>
            </div>
          </form>
          {/* Change Password Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Change Password</h3>
            {!showPasswordForm ? (
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold"
                onClick={() => setShowPasswordForm(true)}
                type="button"
              >
                Change Password
              </button>
            ) : (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4" onSubmit={handlePasswordSubmit}>
                <div className="flex flex-col md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-500 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2 md:col-span-2 mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold"
                    onClick={() => setShowPasswordForm(false)}
                    disabled={passwordLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          {/* Actions */}
          <div className="flex gap-2 mt-8">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold"
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 