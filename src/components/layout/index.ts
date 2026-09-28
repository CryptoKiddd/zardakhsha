// Client-safe layout pieces only. The Header is a Server Component that reads the cart,
// so it is NOT re-exported here (a client component importing this barrel would pull
// Mongoose into the browser bundle). Import it from "@/components/layout/Header/Header".
export { AnnouncementBar } from "./AnnouncementBar/AnnouncementBar";
export { Footer } from "./Footer/Footer";
export { Logo } from "./Logo/Logo";
export { StickyActionBar, WithActionBar } from "./StickyActionBar/StickyActionBar";
