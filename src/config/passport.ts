import { Strategy, ExtractJwt } from "passport-jwt";
import { PassportStatic } from "passport";
import { UserModel, IUser } from "../models";

let options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_AUTH_SECRET,
};

export const passportAuthenticate = (passport: PassportStatic) => {
  passport.use(
    new Strategy(options, async (jwt_payload, done) => {
      try {
        const user: IUser | null = await UserModel.findOne({
          email: jwt_payload.email,
        });
        if (user) {
          return done(null, user?._id);
        }
        return done(null, false);
      } catch (err) {
        console.log(err);
      }
    })
  );
};
