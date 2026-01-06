import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUser } from '../interfaces/current-user.interface';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);