import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';


export class PropertyController {
  constructor(propertyService) {
    this.propertyService = propertyService;
  }

  createListing = asyncHandler(async (req, res, next) => {
    const result = await this.propertyService.createListing(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  });

  updateListing = asyncHandler(async (req, res, next) => {
    const result = await this.propertyService.updateListing(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: result });
  });

  getListings = asyncHandler(async (req, res, next) => {
    const result = await this.propertyService.getListings(req.query);
    
    // Step: Return 404 if no matches found (as per Diagram 4.0.15)
    if (!result || result.length === 0) {
      throw new ApiError(404, 'No results match your criteria');
    }

    res.status(200).json({ success: true, count: result.length, data: result });
  });


  getListingById = asyncHandler(async (req, res, next) => {
    const result = await this.propertyService.getListingById(req.params.id, req.user?.id, req.ip);
    res.status(200).json({ success: true, data: result });
  });


  approveListing = asyncHandler(async (req, res, next) => {
    const result = await this.propertyService.approveListing(req.params.id);
    res.status(200).json({ success: true, data: result, message: 'Listing approved successfully' });
  });

  getPropertySchedule = asyncHandler(async (req, res, next) => {
    const result = await this.propertyService.getPropertySchedule(req.params.id);
    res.status(200).json({ success: true, data: result });
  });

  getMyStats = asyncHandler(async (req, res) => {
    const result = await this.propertyService.getLandlordStats(req.user.id);
    res.status(200).json({ success: true, data: result });
  });

  deleteListing = asyncHandler(async (req, res, next) => {
    const result = await this.propertyService.deleteListing(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: result, message: 'Listing deleted successfully' });
  });
}

