import jwtDecode from 'jwt-decode';

interface IJwt {
  access: string,
  refresh: string
}


interface JwtPayload {
  exp: number,
  username: string,
  token_type: string,
  user_id: number
}

export default class Jwt {
  constructor(token: string) {
    this.encoded = JSON.parse(token);

    this.decoded = {
      access: jwtDecode(this.encoded.access),
      refresh: jwtDecode(this.encoded.refresh),
    };
  }

  public encoded: IJwt;
  public decoded: {
    access: JwtPayload,
    refresh: JwtPayload
  };
}
