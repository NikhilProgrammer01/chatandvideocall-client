import "stream-chat";
import type { DefaultChannelData } from "stream-chat-react";

declare module "stream-chat" {
  // By extending the default, you automatically get fields like 'name', 'image', etc.
  // You can add other custom fields here if needed in the future.
  interface CustomChannelData extends DefaultChannelData {}
}