import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from 'src/accounts/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private accountsService: AccountsService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.accountsService.findOne(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    name: string,
    email: string,
    pass: string,
    role: string,
  ): Promise<any> {
    const account: CreateAccountDto = {
      name: name,
      email: email,
      password: pass,
      role: role,
    };

    const user = await this.accountsService.create(account);

    return user;
  }
}
