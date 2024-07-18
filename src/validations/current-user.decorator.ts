import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from 'src/interfaces';

export const CurrentUser = createParamDecorator(
  (_: string, ctx: ExecutionContext): JwtPayload | Partial<JwtPayload> => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
