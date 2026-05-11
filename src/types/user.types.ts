export type UserPayload = {
    id : number,
    email : string,
    password : string,
    userName : string,
    createdAt : Date
}


export interface Userresponse {
  id: number;
  email: string;
  userName: string;
  password: string;
  role : string;
}