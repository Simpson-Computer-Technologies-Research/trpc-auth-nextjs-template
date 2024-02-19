import { Permission } from "@/types";

const config = {
  min: {
    password: 8,
    name: 4,
    email: 8,
  },
  max: {
    password: 32,
    name: 32,
    email: 64,
  },
  user: {
    image: "/images/default-profile.png",
    name: "User",
    permissions: [Permission.DEFAULT],
  },
};

export default config;
