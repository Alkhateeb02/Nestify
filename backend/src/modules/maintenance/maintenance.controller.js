import { asyncHandler } from '../../utils/asyncHandler.js';

export class MaintenanceController {
  constructor(maintenanceService) {
    this.maintenanceService = maintenanceService;
  }

  submitTicket = asyncHandler(async (req, res, next) => {
    const result = await this.maintenanceService.submitTicket(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  });

  getStudentTickets = asyncHandler(async (req, res, next) => {
    const result = await this.maintenanceService.getStudentTickets(req.user.id);
    res.status(200).json({ success: true, data: result });
  });

  getLandlordTickets = asyncHandler(async (req, res, next) => {
    const result = await this.maintenanceService.getLandlordTickets(req.user.id);
    res.status(200).json({ success: true, data: result });
  });

  updateTicketStatus = asyncHandler(async (req, res, next) => {
    const result = await this.maintenanceService.updateTicketStatus(
      req.params.id,
      req.body.status,
      req.user.id,
      req.user.role
    );
    res.status(200).json({ success: true, data: result });
  });

  rateTicket = asyncHandler(async (req, res, next) => {
    const result = await this.maintenanceService.rateTicket(req.params.id, req.body, req.user.id);
    res.status(200).json({ success: true, data: result, message: 'Rating submitted successfully' });
  });
}
