// this is similar to rust mod.rs
// a tunnel to expose the implemetations

export { default as userRoutes } from './user.routes';
export * from './user.types';
export { userService } from './user.service';