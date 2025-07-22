import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/Theme';
import Snackbar from '../components/Snackbar';
import { getProfile, updateProfile, updatePassword } from '../services/api';
import Spinner from '../components/Spinner';
import { BiShow, BiHide, BiEdit, BiSolidBadgeCheck } from 'react-icons/bi';

const Profile = () => {
    const { colors } = useTheme();
    const [snack, setSnack] = useState({ message: "", type: "success" });
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                if (res.data.success) {
                    setProfileData(res.data.user_details);
                }
            } catch (error) {
                setSnack({ message: "Failed to fetch profile details.", type: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const [username, setUserName] = useState('');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (profileData) {
            setUserName(profileData.username);
            setName(profileData.name);
            setMobile(profileData.mobile);
            setEmail(profileData.email);
        }
    }, [profileData]);

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (profileData) {
            setName(profileData.name);
            setMobile(profileData.mobile);
            setEmail(profileData.email);
        }
    };

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleClearPasswordFields = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        const changes = {};
        if (name !== profileData.name) changes.name = name;
        if (mobile !== profileData.mobile) changes.mobile = mobile;
        if (email !== profileData.email) changes.email = email;

        if (Object.keys(changes).length === 0) {
            setSnack({ message: "No changes to update.", type: "info" });
            return;
        }

        setUpdateLoading(true);
        try {
            const res = await updateProfile(changes);
            if (res.data.success) {
                setSnack({ message: res.data.message, type: "success" });
                setProfileData(prev => ({ ...prev, ...changes }));
                setIsEditing(false);
            }
        } catch (error) {
            setSnack({ message: "Failed to update details.", type: "error" });
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setSnack({ message: "New passwords do not match.", type: "error" });
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await updatePassword({
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });
            if (res.data.success) {
                setSnack({ message: res.data.message, type: "success" });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setSnack({ message: res.data.message || "Failed to change password.", type: "error" });
            }
        } catch (error) {
            setSnack({ message: "Failed to change password.", type: "error" });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen" style={{ background: colors.background, color: colors.text }}>
            <Snackbar message={snack.message} type={snack.type} onClose={() => setSnack({ message: "", type: "success" })} />
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center">
                        <div className="relative w-32 h-32">
                            <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold mb-4" style={{ background: colors.primary, color: colors.white }}>
                                {profileData?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute top-1 right-1 flex items-center justify-center w-8 h-8 bg-white rounded-full">
                                <BiSolidBadgeCheck className="text-green-500" style={{ fontSize: '2rem' }} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold">{profileData?.name}</h2>
                        <p className="text-md" style={{ color: colors.textSecondary }}>{profileData?.email}</p>
                        <p className="text-sm mt-2 px-3 py-1 rounded-full" style={{ background: colors.primary, color: colors.white }}>{profileData?.role.replace('_', ' ').toUpperCase()}</p>
                    </div>

                    <div className="md:col-span-2 space-y-8">
                        <div className="p-6 rounded-lg" style={{ background: colors.card, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Basic Information</h3>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <BiEdit size={20} style={{ color: colors.primary }} />
                                    </button>
                                )}
                            </div>
                            <form onSubmit={handleUpdateDetails} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Username</label>
                                    {username}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        readOnly={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none ${!isEditing ? 'cursor-default bg-transparent border-transparent' : 'focus:ring-2'}`}
                                        style={{ background: isEditing ? colors.background : 'transparent', borderColor: isEditing ? colors.border : 'transparent', color: colors.text, '--ring-color': colors.primary }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Mobile</label>
                                    <input
                                        type="text"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        readOnly={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none ${!isEditing ? 'cursor-default bg-transparent border-transparent' : 'focus:ring-2'}`}
                                        style={{ background: isEditing ? colors.background : 'transparent', borderColor: isEditing ? colors.border : 'transparent', color: colors.text, '--ring-color': colors.primary }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        readOnly={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none ${!isEditing ? 'cursor-default bg-transparent border-transparent' : 'focus:ring-2'}`}
                                        style={{ background: isEditing ? colors.background : 'transparent', borderColor: isEditing ? colors.border : 'transparent', color: colors.text, '--ring-color': colors.primary }}
                                    />
                                </div>
                                {isEditing && (
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={handleCancelEdit} className="px-5 py-2 rounded-md font-semibold transition-colors" style={{ background: colors.background, color: colors.text }}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-5 py-2 rounded-md font-semibold text-white transition-transform transform hover:scale-105" style={{ background: colors.primary }} disabled={updateLoading}>
                                            {updateLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Change Password Form */}
                        <div className="p-6 rounded-lg" style={{ background: colors.card, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Current Password</label>
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                        style={{ background: colors.background, borderColor: colors.border, color: colors.text, '--ring-color': colors.primary }}
                                    />
                                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-11 right-0 px-3 flex items-center text-sm leading-5">
                                        {showCurrentPassword ? <BiHide /> : <BiShow />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>New Password</label>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                        style={{ background: colors.background, borderColor: colors.border, color: colors.text, '--ring-color': colors.primary }}
                                    />
                                     <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-11 right-0 px-3 flex items-center text-sm leading-5">
                                        {showNewPassword ? <BiHide /> : <BiShow />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Confirm New Password</label>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                        style={{ background: colors.background, borderColor: colors.border, color: colors.text, '--ring-color': colors.primary }}
                                    />
                                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-11 right-0 px-3 flex items-center text-sm leading-5">
                                        {showConfirmPassword ? <BiHide /> : <BiShow />}
                                    </button>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={handleClearPasswordFields} className="px-5 py-2 rounded-md font-semibold transition-colors" style={{ color: colors.text }}>
                                        Clear
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-md font-semibold text-white transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: colors.primary }}
                                        disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                    >
                                        {passwordLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 