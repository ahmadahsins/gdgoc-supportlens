import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import * as admin from 'firebase-admin';
import { firestore as FirebaseFirestore } from 'firebase-admin';
import { ICurrentUser } from 'src/common/interfaces/current-user.interface';

@Injectable()
export class TicketsService {
  constructor(@Inject('FIRESTORE') private firestore: FirebaseFirestore.Firestore) { }
  
  async findAll(status?: string) {
    let query: FirebaseFirestore.Query = this.firestore.collection('tickets');
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findOne(id: string) {
    const doc = await this.firestore.collection('tickets').doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Ticket dengan ID ${id} tidak ditemukan`);
    }

    return {
      id: doc.id,
      ...doc.data(),
    }
  }

  async reply(id: string, replyDto: ReplyTicketDto, user: ICurrentUser) {
    const ticketRef = this.firestore.collection('tickets').doc(id);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      throw new NotFoundException('Ticket tidak ditemukan');
    }

    const newMessage = {
      sender: 'agent',
      message: replyDto.message,
      time: new Date().toISOString(),
      agentEmail: user.email,
      agentRole: user.role,
    }

    const updateData: any = {
      messages: admin.firestore.FieldValue.arrayUnion(newMessage)
    }

    if (replyDto.closeTicket) {
      updateData.status = 'CLOSED'
    }

    await ticketRef.update(updateData);
    
    return { success: true };
  } 
}
