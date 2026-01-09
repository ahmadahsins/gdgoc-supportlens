import { Inject, Injectable } from '@nestjs/common';
import { firestore as FirebaseFirestore } from 'firebase-admin';
import { ICurrentUser } from 'src/common/interfaces/current-user.interface';

@Injectable()
export class AuthService {
  constructor(@Inject('FIRESTORE') private firestore: FirebaseFirestore.Firestore) {}
  
  async syncUser(user: ICurrentUser) {
    const userRef = this.firestore.collection('users').doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      const newUser = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        createdAt: new Date().toISOString(),
      };

      await userRef.set(newUser);
      return { status: 'synced', user: newUser };
    }
    
    return { status: 'synced', user: doc.data() };
  }
}
