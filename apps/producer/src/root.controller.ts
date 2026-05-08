import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  @Redirect('/api', 302)
  redirectToSwagger(): void {}
}
