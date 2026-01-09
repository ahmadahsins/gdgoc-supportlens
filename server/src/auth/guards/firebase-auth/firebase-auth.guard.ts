import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  UnauthorizedException, 
  Inject 
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject('FIRESTORE') private firestore: firestore.Firestore
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      const userSnapshot = await this.firestore
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      const userRole = userSnapshot.exists 
        ? userSnapshot.data()?.role 
        : 'agent';

      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userRole,
      };

      return true;
    } catch (error) {
      console.error('Auth Error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}