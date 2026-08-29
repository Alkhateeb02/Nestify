import prisma from '../../config/prisma.js';
import { MaintenanceTicket } from '../../domain/entities/MaintenanceTicket.js';

export class MaintenanceRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async submitTicket(ticketData) {
    const { creatorId, unitId, issueDescription } = ticketData;

    // We assume creatorId is the student_id
    const ticket = await this.prisma.maintenanceTicket.create({
      data: {
        student_id: BigInt(creatorId),
        unit_id: BigInt(unitId),
        issue_description: issueDescription,
        status: 'pending',
      }
    });

    return this._mapToDomain(ticket);
  }

  async updateTicketStatus(id, status) {
    const ticket = await this.prisma.maintenanceTicket.update({
      where: { ticket_id: BigInt(id) },
      data: { status }
    });

    return this._mapToDomain(ticket);
  }

  async assignTechnician(id, technicianName) {
    // Step: Assign Technician/Worker (Diagram 4.0.31)
    const ticket = await this.prisma.maintenanceTicket.update({
      where: { ticket_id: BigInt(id) },
      data: { 
        status: 'Technician Assigned',
        // In a real DB we'd have a technician field or use comments/logs
        issue_description: {
          append: `\n[Assigned to: ${technicianName}]`
        }
      }
    });

    return this._mapToDomain(ticket);
  }

  async getTicketById(id) {
    const ticket = await this.prisma.maintenanceTicket.findUnique({
      where: { ticket_id: BigInt(id) },
      include: {
        unit: {
          include: {
            property: true
          }
        }
      }
    });

    if (!ticket) return null;
    const domainTicket = this._mapToDomain(ticket);
    domainTicket.propertyTitle = ticket.unit?.property?.title || 'Unknown Property';
    domainTicket.propertyId = ticket.unit?.property_id?.toString();
    domainTicket.unitType = ticket.unit?.type || 'Unknown Unit';
    domainTicket.landlordId = ticket.unit?.property?.landlord_id?.toString();
    return domainTicket;
  }

  async rateTicket(id, ratingData) {
    const { rating, comment } = ratingData;
    const ticket = await this.prisma.maintenanceTicket.findUnique({
      where: { ticket_id: BigInt(id) },
      include: { unit: { include: { property: true } } }
    });

    if (!ticket) return null;

    // Step: Store the review in the database (Diagram 4.0.13)
    const review = await this.prisma.review.create({
      data: {
        student_id: ticket.student_id,
        property_id: ticket.unit.property_id,
        rating_value: parseInt(rating),
        comment: comment || 'Maintenance Review'
      }
    });

    // Step: Update the property's overall rating (Diagram 4.0.13)
    const allReviews = await this.prisma.review.findMany({
      where: { property_id: ticket.unit.property_id }
    });
    
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating_value, 0) / allReviews.length;

    await this.prisma.landlord.update({
      where: { landlord_id: ticket.unit.property.landlord_id },
      data: { rating: avgRating }
    });

    // Close the ticket permanently (Diagram 4.0.13)
    await this.prisma.maintenanceTicket.update({
      where: { ticket_id: BigInt(id) },
      data: { status: 'Closed' }
    });

    return this._mapToDomain(ticket);
  }


  async getTicketsByStudentId(studentId) {
    const tickets = await this.prisma.maintenanceTicket.findMany({
      where: { student_id: BigInt(studentId) },
      include: {
        unit: {
          include: {
            property: true
          }
        }
      },
      orderBy: { ticket_date: 'desc' }
    });
    return tickets.map(t => {
      const domainTicket = this._mapToDomain(t);
      domainTicket.propertyTitle = t.unit?.property?.title || 'Unknown Property';
      domainTicket.propertyId = t.unit?.property_id?.toString();
      domainTicket.unitType = t.unit?.type || 'Unknown Unit';
      return domainTicket;
    });
  }

  async getTicketsByLandlordId(landlordId) {
    const tickets = await this.prisma.maintenanceTicket.findMany({
      where: {
        unit: {
          property: {
            landlord_id: BigInt(landlordId)
          }
        }
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        unit: {
          include: {
            property: true
          }
        }
      },
      orderBy: { ticket_date: 'desc' }
    });
    return tickets.map(t => {
      const domainTicket = this._mapToDomain(t);
      domainTicket.studentName = t.student?.user?.name || 'A Student';
      domainTicket.studentPhone = t.student?.user?.phone_number || '';
      domainTicket.propertyTitle = t.unit?.property?.title || 'Unknown Property';
      domainTicket.propertyId = t.unit?.property_id?.toString();
      domainTicket.unitType = t.unit?.type || 'Unknown Unit';
      return domainTicket;
    });
  }

  _mapToDomain(record) {
    const ticket = new MaintenanceTicket({
      ticketID: record.ticket_id.toString(),
      issueDescription: record.issue_description,
      date: record.ticket_date,
      status: record.status
    });
    ticket.id = ticket.ticketID;
    ticket.creatorId = record.student_id ? record.student_id.toString() : null;
    ticket.unitId = record.unit_id ? record.unit_id.toString() : null;
    return ticket;
  }
}
