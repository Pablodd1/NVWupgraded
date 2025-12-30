'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AgeGateProps {
    onVerified: () => void;
    showSMSOptIn?: boolean;
}

export default function AgeGate({ onVerified, showSMSOptIn = false }: AgeGateProps) {
    const router = useRouter();
    const [dateOfBirth, setDateOfBirth] = useState({
        month: '',
        day: '',
        year: ''
    });
    const [smsOptIn, setSmsOptIn] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const calculateAge = (dob: Date) => {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age;
    };

    const handleVerify = async () => {
        setError('');

        // Validate inputs
        if (!dateOfBirth.month || !dateOfBirth.day || !dateOfBirth.year) {
            setError('Please enter your complete date of birth');
            return;
        }

        // Create date object
        const dob = new Date(
            parseInt(dateOfBirth.year),
            parseInt(dateOfBirth.month) - 1,
            parseInt(dateOfBirth.day)
        );

        // Validate date
        if (isNaN(dob.getTime())) {
            setError('Please enter a valid date');
            return;
        }

        // Check if date is in the future
        if (dob > new Date()) {
            setError('Date of birth cannot be in the future');
            return;
        }

        // Calculate age
        const age = calculateAge(dob);

        // Check if 21+
        if (age < 21) {
            setError('You must be 21 years or older to access this site');
            return;
        }

        setLoading(true);

        try {
            // Save age verification to session
            sessionStorage.setItem('ageVerified', 'true');
            sessionStorage.setItem('ageVerifiedDate', new Date().toISOString());
            sessionStorage.setItem('dateOfBirth', dob.toISOString());
            sessionStorage.setItem('smsOptIn', smsOptIn.toString());

            // If user is logged in, also save to database
            try {
                await fetch('/api/user/verify-age', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dateOfBirth: dob.toISOString(),
                        smsOptIn: showSMSOptIn ? smsOptIn : false
                    })
                });
            } catch (err) {
                // Continue even if API call fails (user might not be logged in yet)
                console.log('Age verification saved to session only');
            }

            onVerified();
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
                {/* Logo/Branding */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-gray-900 mb-2">
                        Napa Valley Wineries
                    </h1>
                    <div className="w-16 h-1 bg-amber-600 mx-auto mb-4"></div>
                </div>

                {/* Age Verification Message */}
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🍷</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Age Verification Required
                    </h2>
                    <p className="text-gray-600 text-sm">
                        You must be 21 years or older to book wine tasting experiences.
                        Please verify your age to continue.
                    </p>
                </div>

                {/* Date of Birth Input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Date of Birth
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {/* Month */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Month</label>
                            <select
                                value={dateOfBirth.month}
                                onChange={(e) => setDateOfBirth({ ...dateOfBirth, month: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            >
                                <option value="">MM</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                        </div>

                        {/* Day */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Day</label>
                            <select
                                value={dateOfBirth.day}
                                onChange={(e) => setDateOfBirth({ ...dateOfBirth, day: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            >
                                <option value="">DD</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                    <option key={d} value={d}>{d.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Year</label>
                            <select
                                value={dateOfBirth.year}
                                onChange={(e) => setDateOfBirth({ ...dateOfBirth, year: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            >
                                <option value="">YYYY</option>
                                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SMS Opt-In (if enabled) */}
                {showSMSOptIn && (
                    <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <label className="flex items-start cursor-pointer">
                            <input
                                type="checkbox"
                                checked={smsOptIn}
                                onChange={(e) => setSmsOptIn(e.target.checked)}
                                className="mt-1 mr-3 h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                            />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900 mb-1">
                                    📱 Receive SMS Notifications (Optional)
                                </p>
                                <p className="text-gray-600 text-xs leading-relaxed">
                                    I confirm I am 21+ and consent to receive booking confirmations,
                                    reminders, and updates via SMS. Message and data rates may apply.
                                    Reply STOP to opt out anytime.
                                </p>
                            </div>
                        </label>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Verifying...' : 'Verify Age & Continue'}
                </button>

                {/* Legal Notice */}
                <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                    By continuing, you certify that you are 21 years of age or older and agree to our{' '}
                    <a href="/terms" className="text-amber-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</a>.
                </p>

                {/* Exit Option */}
                <button
                    onClick={() => router.push('https://www.responsibility.org/')}
                    className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                    I am under 21 - Exit Site
                </button>
            </div>
        </div>
    );
}
