import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { Password } from './password.util';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException('Email in use');
    }

    const newuser = new this.userModel({
      email: dto.email,
      password: dto.password,
    });
    await newuser.save();

    const newuserJwt = jwt.sign(
      { id: newuser.id, email: newuser.email },
      process.env.JWT_KEY!
    );

    return { newuser, newuserJwt };
  }

  async signin(dto: SigninDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (!existingUser) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      dto.password
    );
    if (!passwordsMatch) {
      throw new BadRequestException('Invalid Credentials');
    }

    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    return { existingUser, userJwt };
  }
}
