export class MaintenanceTicket {
  static STAGES = {
    SUBMITTED: 'Submitted',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CLOSED: 'Closed'
  };

  constructor({ ticketID, issueDescription, date, status, technician }) {
    this.ticketID = ticketID;
    this.issueDescription = issueDescription;
    this.date = date || new Date();
    this.status = status || MaintenanceTicket.STAGES.SUBMITTED;
    this.technician = technician || null;
  }

  // Activity Diagram 4.0.31: Assign Technician/Worker
  assignTechnician(name) {
    if (this.status !== MaintenanceTicket.STAGES.SUBMITTED) {
      throw new Error('Can only assign technician to newly submitted tickets');
    }
    this.technician = name;
    this.status = MaintenanceTicket.STAGES.ASSIGNED;
  }

  startWork() {
    if (!this.technician) throw new Error('Cannot start work without an assigned technician');
    this.status = MaintenanceTicket.STAGES.IN_PROGRESS;
  }

  // Activity Diagram 4.0.31: Mark Issue as Resolved
  resolve() {
    if (this.status !== MaintenanceTicket.STAGES.IN_PROGRESS) {
      throw new Error('Ticket must be In Progress to be resolved');
    }
    this.status = MaintenanceTicket.STAGES.COMPLETED;
  }

  close() {
    this.status = MaintenanceTicket.STAGES.CLOSED;
  }

  get progressPercentage() {
    const stages = Object.values(MaintenanceTicket.STAGES);
    const currentIndex = stages.indexOf(this.status);
    if (currentIndex === -1) return 0;
    return (currentIndex / (stages.length - 1)) * 100;
  }
}


