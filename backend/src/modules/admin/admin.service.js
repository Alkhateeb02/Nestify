export class AdminService {
  constructor(adminRepository, aiService, notificationService) {
    this.adminRepo = adminRepository;
    this.aiService = aiService;
    this.notificationService = notificationService;
  }

  async getDashboardStats() {
    return await this.adminRepo.getDashboardStats();
  }

  async getAiPerformance() {
    return await this.aiService.getModelPerformance();
  }

  async getPendingProperties() {
    return await this.adminRepo.getPendingProperties();
  }

  async getAllReports() {
    return await this.adminRepo.getAllReports();
  }

  async banUser(userId) {
    const user = await this.adminRepo.banUser(userId);
    
    // Notify User? Usually we can't notify via socket if they are banned, but we can send an email
    if (this.notificationService) {
      await this.notificationService.notifyUser(userId, {
        title: 'Account Suspended',
        message: 'Your account has been suspended by an administrator.',
        type: 'account_ban',
        sendEmail: true
      });
    }
    
    return user;
  }

  async updateReportStatus(reportId, status) {
    return await this.adminRepo.updateReportStatus(reportId, status);
  }
}


