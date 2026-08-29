import { ApiError } from '../../utils/ApiError.js';
import prisma from '../../config/prisma.js';

export class MaintenanceService {
  constructor(maintenanceRepository, notificationService) {
    this.maintenanceRepo = maintenanceRepository;
    this.notificationService = notificationService;
  }

  async submitTicket(data, creatorId) {
    // Resolve student profile using student_id
    const student = await prisma.student.findUnique({
      where: { student_id: BigInt(creatorId) }
    });

    if (!student) throw new ApiError(404, 'Student profile not found');

    const newTicket = { 
      ...data, 
      creatorId: student.student_id.toString() 
    };

    const ticket = await this.maintenanceRepo.submitTicket(newTicket);

    // Send notifications
    if (this.notificationService) {
      try {
        const ticketWithUnit = await this.maintenanceRepo.getTicketById(ticket.ticketID);
        if (ticketWithUnit) {
          const propertyTitle = ticketWithUnit.propertyTitle || 'Property';
          const unitType = ticketWithUnit.unitType || 'Unit';

          // Notify student
          await this.notificationService.notifyUser(student.student_id.toString(), {
            title: 'Maintenance Request Submitted',
            message: `Your maintenance request for ${propertyTitle} (Unit: ${unitType}) has been submitted.`,
            type: 'maintenance_submitted'
          });

          // Notify landlord if landlordId is available
          if (ticketWithUnit.landlordId) {
            const landlord = await prisma.landlord.findUnique({
              where: { landlord_id: BigInt(ticketWithUnit.landlordId) }
            });
            if (landlord) {
              const landlordMsg = `New maintenance request submitted for ${propertyTitle} (Unit: ${unitType}).`;
              
              // Notify landlord
              await this.notificationService.notifyUser(landlord.landlord_id.toString(), {
                title: 'New Maintenance Request',
                message: landlordMsg,
                type: 'maintenance_request'
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to send maintenance creation notifications:', err);
      }
    }

    return ticket;
  }

  async getStudentTickets(studentId) {
    return await this.maintenanceRepo.getTicketsByStudentId(studentId);
  }

  async getLandlordTickets(landlordId) {
    return await this.maintenanceRepo.getTicketsByLandlordId(landlordId);
  }

  async updateTicketStatus(id, status, userId, userRole) {
    const ticket = await this.maintenanceRepo.getTicketById(id);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    if (userRole === 'student') {
      throw new ApiError(403, 'Students cannot update ticket status');
    }

    const updatedTicket = await this.maintenanceRepo.updateTicketStatus(id, status);

    // Send notifications of status changes
    if (this.notificationService) {
      try {
        const student = await prisma.student.findUnique({
          where: { student_id: BigInt(ticket.creatorId) }
        });
        if (student) {
          const propertyTitle = ticket.propertyTitle || 'Property';
          let title = 'Maintenance Ticket Updated';
          let message = `Your maintenance ticket for ${propertyTitle} has been updated to: ${status}.`;

          if (status === 'processing') {
            title = 'Maintenance Request Accepted';
            message = `Your maintenance request for ${propertyTitle} has been accepted and is now processing.`;
          } else if (status === 'done' || status === 'completed') {
            title = 'Maintenance Request Completed';
            message = `Your maintenance request for ${propertyTitle} has been marked as completed.`;
          } else if (status === 'rejected') {
            title = 'Maintenance Request Rejected';
            message = `Your maintenance request for ${propertyTitle} has been rejected.`;
          }

          // Notify student
          await this.notificationService.notifyUser(student.student_id.toString(), {
            title,
            message,
            type: `maintenance_${status}`
          });
        }
      } catch (err) {
        console.error('Failed to send maintenance status notification:', err);
      }
    }

    return updatedTicket;
  }

  async rateTicket(id, data, userId) {
    const ticket = await this.maintenanceRepo.getTicketById(id);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    // Resolve student profile of the current user
    const student = await prisma.student.findUnique({
      where: { student_id: BigInt(userId) }
    });
    const studentId = student ? student.student_id.toString() : userId.toString();

    if (ticket.creatorId !== studentId) {
      throw new ApiError(403, 'You can only rate your own tickets');
    }

    return await this.maintenanceRepo.rateTicket(id, data);
  }
}
