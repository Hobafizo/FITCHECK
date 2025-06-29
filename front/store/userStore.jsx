import { create } from "zustand";

export const useUserStore = create((set) => ({
  Email: null,
  Password: null,
  FirstName: null,
  LastName: null,
  Result: null,
  UserID: null,
  verified: null,
  Gender: null,
  PhoneNum: null,
  BirthDate: null,
  setUser: ({
    Email,
    Password,
    FirstName,
    LastName,
    Result,
    UserID,
    verified,
    Gender,
    PhoneNum,
    BirthDate,
  }) => {
    set({
      Email,
      Password,
      FirstName,
      LastName,
      Result,
      UserID,
      verified,
      Gender,
      PhoneNum,
      BirthDate: BirthDate.slice(0, 10),
    });
  },
  verify: () => {
    set((state) => ({
      ...state,
      verified: true,
    }));
  },
  removeUser: () => {
    set({
      Email: null,
      FirstName: null,
      LastName: null,
      Result: null,
      UserID: null,
      verified: null,
      Gender: null,
      PhoneNum: null,
      BirthDate: null,
    });
  },
}));
