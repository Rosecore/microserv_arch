import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserGuard, UserPayload } from '../common/guards/current-user.guard';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('api/users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Req() req: Request, @Res() res: Response) {
    const { newuser, newuserJwt } = await this.authService.signup(dto);
    req.session = { jwt: newuserJwt };
    res.status(201).send(newuser);
  }

  @Post('signin')
  async signin(@Body() dto: SigninDto, @Req() req: Request, @Res() res: Response) {
    const { existingUser, userJwt } = await this.authService.signin(dto);
    req.session = { jwt: userJwt };
    res.status(200).send(existingUser);
  }

  @Post('signout')
  signout(@Req() req: Request, @Res() res: Response) {
    req.session = null;
    res.status(200).send({});
  }

  @Get('currentuser')
  @UseGuards(CurrentUserGuard)
  currentUser(@CurrentUser() user: UserPayload | undefined) {
    return { currentUser: user || null };
  }
}
