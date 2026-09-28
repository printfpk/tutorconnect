import { Requirement, IRequirement } from '../models/Requirement.js';
import { FlashRequest, IFlashRequest } from '../models/FlashRequest.js';
import { Offer } from '../models/Offer.js';
import { REQUIREMENT_STATUS, FLASH_STATUS, OFFER_STATUS, GEO } from '../config/constants.js';
import { AppError } from './auth.service.js';
import { logger } from '../utils/logger.js';

/* ─────────── Requirements ─────────── */

export const requirementService = {
  /**
   * Create a new requirement (parent / student)
   */
  async create(userId: string, data: any): Promise<IRequirement> {
    const req = await Requirement.create({ ...data, postedBy: userId });
    logger.info(`Requirement created: ${req._id} by ${userId}`);
    return req;
  },

  /**
   * Get all requirements near a lat/lng (for tutors to browse)
   * Returns requirements within radiusKm sorted by distance
   */
  async getNearby(
    lat: number,
    lng: number,
    radiusKm: number = GEO.DEFAULT_RADIUS_KM,
    filters: { subject?: string; teachingMode?: string } = {}
  ) {
    const radiusMeters = radiusKm * 1000;

    const query: any = {
      status: REQUIREMENT_STATUS.OPEN,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusMeters,
        },
      },
    };

    if (filters.subject) query.subject = new RegExp(filters.subject, 'i');
    if (filters.teachingMode) query.teachingMode = filters.teachingMode;

    const results = await Requirement.find(query)
      .populate('postedBy', 'firstName lastName avatar pincode')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return results;
  },

  /**
   * Get all requirements posted by a specific user
   */
  async getByUser(userId: string) {
    return Requirement.find({ postedBy: userId })
      .populate('postedBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .lean();
  },

  /**
   * Get a single requirement by ID
   */
  async getById(id: string) {
    const req = await Requirement.findById(id)
      .populate('postedBy', 'firstName lastName avatar pincode phone');
    if (!req) throw new AppError('Requirement not found', 404, 'NOT_FOUND');
    return req;
  },

  /**
   * Update a requirement (owner only)
   */
  async update(id: string, userId: string, data: any): Promise<IRequirement> {
    const req = await Requirement.findOneAndUpdate(
      { _id: id, postedBy: userId },
      data,
      { new: true, runValidators: true }
    );
    if (!req) throw new AppError('Requirement not found or not authorized', 404, 'NOT_FOUND');
    return req;
  },

  /**
   * Close / cancel a requirement
   */
  async close(id: string, userId: string): Promise<void> {
    const req = await Requirement.findOneAndUpdate(
      { _id: id, postedBy: userId },
      { status: REQUIREMENT_STATUS.CANCELLED }
    );
    if (!req) throw new AppError('Requirement not found or not authorized', 404, 'NOT_FOUND');
  },

  /**
   * Tutor sends an offer on a requirement
   */
  async sendOffer(requirementId: string, tutorId: string, data: { proposedRate: number; message?: string }) {
    // Check requirement exists and is open
    const req = await Requirement.findById(requirementId);
    if (!req) throw new AppError('Requirement not found', 404, 'NOT_FOUND');
    if (req.status !== REQUIREMENT_STATUS.OPEN && req.status !== REQUIREMENT_STATUS.OFFERS_RECEIVED) {
      throw new AppError('This requirement is no longer accepting offers', 400, 'CLOSED');
    }

    // Check not already submitted
    const existing = await Offer.findOne({ requirement: requirementId, tutor: tutorId });
    if (existing) throw new AppError('You have already sent an offer for this requirement', 409, 'DUPLICATE_OFFER');

    // Create offer
    const offer = await Offer.create({
      requirement: requirementId,
      tutor: tutorId,
      proposedRate: data.proposedRate,
      message: data.message,
    });

    // Update requirement counts
    await Requirement.findByIdAndUpdate(requirementId, {
      $addToSet: { interestedTutors: tutorId },
      $inc: { offersReceived: 1 },
      status: REQUIREMENT_STATUS.OFFERS_RECEIVED,
    });

    logger.info(`Offer sent: ${offer._id} by tutor ${tutorId} on requirement ${requirementId}`);
    return offer;
  },

  /**
   * Get all offers for a specific requirement (for the poster)
   */
  async getOffers(requirementId: string, userId: string) {
    const req = await Requirement.findById(requirementId);
    if (!req) throw new AppError('Requirement not found', 404, 'NOT_FOUND');
    if (req.postedBy.toString() !== userId) throw new AppError('Not authorized', 403, 'FORBIDDEN');

    return Offer.find({ requirement: requirementId })
      .populate('tutor', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .lean();
  },

  /**
   * Get all offers sent by a tutor
   */
  async getTutorOffers(tutorId: string) {
    return Offer.find({ tutor: tutorId })
      .populate('requirement', 'subject className budgetMin budgetMax teachingMode status')
      .sort({ createdAt: -1 })
      .lean();
  },
};

/* ─────────── Flash Requests ─────────── */

export const flashService = {
  /**
   * Create a flash request (urgent session now)
   */
  async create(userId: string, data: any): Promise<IFlashRequest> {
    const startsAt = data.startsAt ? new Date(data.startsAt) : new Date(Date.now() + 30 * 60 * 1000); // default 30 min
    const expiresAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // expires 1hr after start time

    const flash = await FlashRequest.create({
      ...data,
      postedBy: userId,
      startsAt,
      expiresAt,
      status: FLASH_STATUS.SEARCHING,
    });

    logger.info(`Flash request created: ${flash._id} by ${userId}`);
    return flash;
  },

  /**
   * Get active flash requests near a location (for tutors)
   */
  async getNearby(lat: number, lng: number, radiusKm: number = 5) {
    const radiusMeters = radiusKm * 1000;

    return FlashRequest.find({
      status: { $in: [FLASH_STATUS.SEARCHING, FLASH_STATUS.TUTORS_NOTIFIED] },
      expiresAt: { $gt: new Date() },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusMeters,
        },
      },
    })
      .populate('postedBy', 'firstName lastName avatar')
      .sort({ startsAt: 1 })
      .limit(20)
      .lean();
  },

  /**
   * Get a single flash request by ID
   */
  async getById(id: string) {
    const flash = await FlashRequest.findById(id)
      .populate('postedBy', 'firstName lastName avatar phone');
    if (!flash) throw new AppError('Flash request not found', 404, 'NOT_FOUND');
    return flash;
  },

  /**
   * Tutor responds to a flash request
   */
  async respond(flashId: string, tutorId: string): Promise<void> {
    const flash = await FlashRequest.findById(flashId);
    if (!flash) throw new AppError('Flash request not found', 404, 'NOT_FOUND');
    if (flash.expiresAt < new Date()) throw new AppError('This flash request has expired', 400, 'EXPIRED');

    await FlashRequest.findByIdAndUpdate(flashId, {
      $addToSet: { respondedTutors: tutorId },
      status: FLASH_STATUS.TUTOR_RESPONDED,
    });

    logger.info(`Tutor ${tutorId} responded to flash ${flashId}`);
  },

  /**
   * Get flash requests posted by a user
   */
  async getByUser(userId: string) {
    return FlashRequest.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .lean();
  },
};
