import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';

@Injectable()
export class AuthService {
  constructor(private accountsService: AccountsService) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.accountsService.findOne(email, pass);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}
