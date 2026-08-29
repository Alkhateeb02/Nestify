import { asyncHandler } from '../../utils/asyncHandler.js';

export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  getDashboardStats = asyncHandler(async (req, res, next) => {
    const stats = await this.adminService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  });

  getAiPerformance = asyncHandler(async (req, res, next) => {
    const stats = await this.adminService.getAiPerformance();
    res.status(200).json({ success: true, data: stats });
  });

  getPendingProperties = asyncHandler(async (req, res, next) => {
    const result = await this.adminService.getPendingProperties();
    res.status(200).json({ success: true, count: result.length, data: result });
  });

  getReports = asyncHandler(async (req, res) => {
    const result = await this.adminService.getAllReports();
    res.status(200).json({ success: true, data: result });
  });

  banUser = asyncHandler(async (req, res) => {
    const result = await this.adminService.banUser(req.params.userId);
    res.status(200).json({ success: true, message: 'User banned successfully', data: result });
  });

  updateReportStatus = asyncHandler(async (req, res) => {
    const result = await this.adminService.updateReportStatus(req.params.reportId, req.body.status);
    res.status(200).json({ success: true, message: 'Report status updated', data: result });
  });
}



