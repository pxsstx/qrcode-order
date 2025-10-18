export const hashPassword = async (password: string) => {
  return Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 4,
    timeCost: 3,
  });
};

export const verifyPassword = async (password: string, hash: string) => {
  return Bun.password.verify(password, hash);
};
