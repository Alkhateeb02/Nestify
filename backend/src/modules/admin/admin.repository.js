import prisma from '../../config/prisma.js';

export class AdminRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalProperties = await this.prisma.property.count();
    const totalBookings = await this.prisma.booking.count();

    return {
      totalUsers,
      totalProperties,
      totalBookings,
      revenue: totalBookings * 100 // placeholder
    };
  }

  async getPendingProperties() {
    // Assuming verification_status is in Landlord or a 'status' field in Property
    // Looking at schema.prisma, Property doesn't have 'status', but Landlord has 'verification_status'
    // Diagram says 'WHERE status = "Pending"' on properties table
    // I'll use a placeholder since schema might need update, but follow diagram logic
    console.log('Prisma: Fetching pending properties');
    return await this.prisma.property.findMany({
      where: {
        landlord: {
          verification_status: 'pending'
        }
      },
      include: { landlord: { include: { user: true } } }
    });
  }

  async getAllReports() {
    return await this.prisma.report.findMany({
      include: {
        student: { include: { user: true } },
        target_user: true,
        property: true,
        unit: true,
        booking: true
      },
      orderBy: { report_date: 'desc' }
    });
  }

  async banUser(userId) {
    throw new Error('User banning is not supported in this database schema version');
  }

  async updateReportStatus(reportId, status) {
    return await this.prisma.report.update({
      where: { report_id: BigInt(reportId) },
      data: { status }
    });
  }
}

