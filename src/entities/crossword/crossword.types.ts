export interface ChannelItem {
  sup_no: string;
  word: string;
  target_code: string;
  sense: Sense;
  pos: string;
}

export interface Sense {
  definition: string;
  link: string;
  type: string;
}

export interface Channel {
  total: number;
  num: number;
  title: string;
  start: number;
  description: string;
  item: ChannelItem[];
  link: string;
  lastbuilddate: string;
}
