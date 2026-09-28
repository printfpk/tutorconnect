import { Request, Response } from 'express';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Get tutors (optionally filtered by pincode/nearby)
export const getTutors = async (req: Request, res: Response): Promise<void> => {
    try {
      const userPincode = req.user?.pincode;

      let query: any = { role: 'tutor', status: 'active' };

      // If user is authenticated and has a pincode, prioritize matching pincode
      if (userPincode) {
        query.pincode = userPincode;
      }

      // We might want to allow filtering by subject/mode later, 
      // but for now, we just return tutors in the same pincode
      const tutors = await User.find(query)
        .select('-password -__v -refreshToken -resetPasswordOtp -resetPasswordExpires')
        .sort({ rating: -1, createdAt: -1 })
        .limit(20)
        .lean();

      // Mock data like subjects, pricing, rating aren't fully in the User schema yet,
      // so we add some default placeholder stats for UI presentation if missing
      const enrichedTutors = tutors.map(tutor => ({
        ...tutor,
        subject: 'Various Subjects', 
        subjects: ['Mathematics', 'Science', 'English'],
        teachingMode: ['online', 'offline'],
        rating: 4.5,
        reviews: 12,
        price: 500
      }));

      sendSuccess(res, { tutors: enrichedTutors });
    } catch (error) {
      console.error('Error fetching tutors:', error);
      sendError(res, 'FETCH_TUTORS_ERROR', 'Failed to fetch tutors', 500);
    }
  }

