import { Inject, Injectable } from '@nestjs/common';
import { firestore as FirebaseFirestore } from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(@Inject('FIRESTORE') private firestore: FirebaseFirestore.Firestore) {}
  
  async syncUser(decodedToken: DecodedIdToken) {
    const userRef = this.firestore.collection('users').doc(decodedToken.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      const newUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: 'agent',
        createdAt: new Date().toISOString(),
      };

      await userRef.set(newUser);
      return { status: 'synced', user: newUser };
    }
    
    return { status: 'synced', user: doc.data() };
  }
}
