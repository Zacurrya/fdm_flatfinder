// -- DTOs -- 

export type registerDTO = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  officeLocation: string;
  phoneNumber: string;
};

export type loginDTO = {
  email: string;
  password: string;
};

export type resetPasswordDTO = {
  email: string;
};