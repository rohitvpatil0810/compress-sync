import { RedisOptions } from "ioredis/built";

const redisUrl = new URL(
  process.env.REDIS_CONNECTION_URL || "redis://localhost:6379"
);

export const redisConfig: RedisOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username,
  password: redisUrl.password,
  tls: {},
};
