import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/user.model';

export async function POST(request: NextRequest) {
    try {
        const { dateOfBirth, smsOptIn, email } = await request.json();

        // Validate date of birth
        if (!dateOfBirth) {
            return NextResponse.json(
                { error: 'Date of birth is required' },
                { status: 400 }
            );
        }

        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (age < 21) {
            return NextResponse.json(
                { error: 'Must be 21 or older' },
                { status: 403 }
            );
        }

        // If email provided, update user in database
        if (email) {
            try {
                await dbConnect();

                const updateData: any = {
                    dateOfBirth: dob,
                    ageVerified: true,
                    ageVerificationDate: new Date(),
                    ageVerificationMethod: 'dob',
                    updatedAt: new Date()
                };

                if (smsOptIn) {
                    updateData.smsOptIn = true;
                    updateData.smsOptInDate = new Date();
                    updateData.smsOptInAgeConfirmed = true;
                }

                await User.findOneAndUpdate(
                    { email },
                    { $set: updateData },
                    { new: true, upsert: false }
                );
            } catch (dbError) {
                console.error('Database update error:', dbError);
                // Continue even if DB update fails
            }
        }

        return NextResponse.json({
            success: true,
            ageVerified: true,
            smsOptIn: smsOptIn || false
        });

    } catch (error) {
        console.error('Age verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        );
    }
}
