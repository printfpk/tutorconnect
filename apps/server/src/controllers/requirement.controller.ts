import { Request, Response, NextFunction } from 'express';
import { requirementService, flashService } from '../services/requirement.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { AppError } from '../services/auth.service.js';

/* ═══════════════════════════════════════
   REQUIREMENTS
═══════════════════════════════════════ */
export const requirementController = {
  /**
   * POST /api/v1/requirements
   * Create a new requirement (parent / student)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const requirement = await requirementService.create(req.userId!, req.body);
      sendSuccess(res, { requirement }, 201);
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/requirements/discover
   * Pincode-based discovery for tutors (no GPS needed)
   * Returns all OPEN requirements whose location.pincode matches the tutor's pincode,
   * plus a fallback of all open requirements if none match by pincode.
   */
  async discover(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorPincode = req.user?.pincode;
      const { subject, teachingMode, tutorType } = req.query;

      // Build base query: only open requirements
      const baseQuery: any = { status: 'open_for_offers' };
      if (subject) baseQuery.subject = new RegExp(subject as string, 'i');
      if (teachingMode) baseQuery.teachingMode = teachingMode;
      if (tutorType) baseQuery.budgetType = tutorType;

      let requirements = [];

      if (tutorPincode) {
        // Primary: match by pincode stored in requirement's location OR in postedBy user's pincode
        const { Requirement } = await import('../models/Requirement.js');
        const { User } = await import('../models/User.js');

        // Get all parents/students in same pincode
        const usersInPincode = await User.find({ pincode: tutorPincode }).select('_id').lean();
        const userIds = usersInPincode.map(u => u._id);

        // Fetch requirements posted by those users OR whose location.pincode matches
        requirements = await Requirement.find({
          ...baseQuery,
          $or: [
            { postedBy: { $in: userIds } },
            { 'location.pincode': tutorPincode },
          ],
        })
          .populate('postedBy', 'firstName lastName avatar pincode')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        // If nothing found, broaden to all open requirements (no pincode restriction)
        if (requirements.length === 0) {
          requirements = await Requirement.find(baseQuery)
            .populate('postedBy', 'firstName lastName avatar pincode')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        }
      } else {
        // No pincode on tutor account — return all open requirements
        const { Requirement } = await import('../models/Requirement.js');
        requirements = await Requirement.find(baseQuery)
          .populate('postedBy', 'firstName lastName avatar pincode')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      }

      sendSuccess(res, { requirements, count: requirements.length });
    } catch (err) { next(err); }
  },


  async getNearby(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        throw new AppError('lat and lng query params are required', 400, 'MISSING_LOCATION');
      }

      const radius = parseFloat(req.query.radius as string) || 10;
      const filters = {
        subject: req.query.subject as string | undefined,
        teachingMode: req.query.teachingMode as string | undefined,
      };

      const requirements = await requirementService.getNearby(lat, lng, radius, filters);
      sendSuccess(res, { requirements, count: requirements.length });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/requirements/mine
   * Get all requirements posted by the logged-in user
   */
  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const requirements = await requirementService.getByUser(req.userId!);
      sendSuccess(res, { requirements });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/requirements/:id
   * Get a single requirement
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const requirement = await requirementService.getById(req.params.id);
      sendSuccess(res, { requirement });
    } catch (err) { next(err); }
  },

  /**
   * PUT /api/v1/requirements/:id
   * Update a requirement (owner only)
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const requirement = await requirementService.update(req.params.id, req.userId!, req.body);
      sendSuccess(res, { requirement });
    } catch (err) { next(err); }
  },

  /**
   * DELETE /api/v1/requirements/:id
   * Cancel / close a requirement
   */
  async close(req: Request, res: Response, next: NextFunction) {
    try {
      await requirementService.close(req.params.id, req.userId!);
      sendSuccess(res, { message: 'Requirement closed' });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/v1/requirements/:id/offer
   * Tutor sends an offer on a requirement
   */
  async sendOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await requirementService.sendOffer(req.params.id, req.userId!, req.body);
      sendSuccess(res, { offer }, 201);
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/requirements/:id/offers
   * Owner gets all offers for their requirement
   */
  async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await requirementService.getOffers(req.params.id, req.userId!);
      sendSuccess(res, { offers });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/requirements/offers/mine
   * Tutor gets all offers they have sent
   */
  async getMyOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await requirementService.getTutorOffers(req.userId!);
      sendSuccess(res, { offers });
    } catch (err) { next(err); }
  },
};

/* ═══════════════════════════════════════
   FLASH REQUESTS
═══════════════════════════════════════ */
export const flashController = {
  /**
   * POST /api/v1/flash
   * Create a flash request
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const flash = await flashService.create(req.userId!, req.body);
      sendSuccess(res, { flash }, 201);
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/flash/nearby?lat=&lng=&radius=
   * Tutors see nearby active flash requests
   */
  async getNearby(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        throw new AppError('lat and lng query params are required', 400, 'MISSING_LOCATION');
      }

      const radius = parseFloat(req.query.radius as string) || 5;
      const flashes = await flashService.getNearby(lat, lng, radius);
      sendSuccess(res, { flashes, count: flashes.length });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/flash/mine
   * Get flash requests posted by the logged-in user
   */
  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const flashes = await flashService.getByUser(req.userId!);
      sendSuccess(res, { flashes });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/flash/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const flash = await flashService.getById(req.params.id);
      sendSuccess(res, { flash });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/v1/flash/:id/respond
   * Tutor responds to a flash request
   */
  async respond(req: Request, res: Response, next: NextFunction) {
    try {
      await flashService.respond(req.params.id, req.userId!);
      sendSuccess(res, { message: 'Response recorded. The student will be notified.' });
    } catch (err) { next(err); }
  },
};
